import { requireSupabase, supabase } from '../lib/supabase.js';

const FALLBACK_MEDIA = '/assets/old-money-fit.png';

function assertResult(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

function safeUsername(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);
}

function uniqueUsername(value) {
  const base = safeUsername(value) || 'dressicreator';
  return `${base}_${Math.random().toString(36).slice(2, 6)}`;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const client = requireSupabase();
  return client.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function signUp({ name, username, email, password, accountType }) {
  const client = requireSupabase();
  const creatorUsername = accountType === 'creator'
    ? (safeUsername(username) || uniqueUsername(email.split('@')[0]))
    : null;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        account_type: accountType,
        username: creatorUsername,
      },
    },
  });
  if (error) throw error;
  return { ...data, creatorUsername };
}

export async function signIn({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getAccount(userId) {
  const client = requireSupabase();
  const profile = assertResult(
    await client.from('profiles').select('*').eq('id', userId).single(),
    'Load profile',
  );
  const creatorResult = await client
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (creatorResult.error) throw new Error(`Load creator profile: ${creatorResult.error.message}`);
  return { profile, creator: creatorResult.data };
}

export async function upgradeAccountToCreator(userId, profile = {}) {
  const client = requireSupabase();
  assertResult(
    await client.from('profiles').update({ account_type: 'creator', updated_at: new Date().toISOString() }).eq('id', userId),
    'Upgrade account',
  );
  const account = await getAccount(userId);
  if (account.creator) return account.creator;
  const username = uniqueUsername(profile.username || account.profile.display_name || 'creator');
  return assertResult(
    await client.from('creator_profiles').insert({
      user_id: userId,
      username,
      bio: profile.bio || 'Sharing useful outfits and the pieces behind them.',
      location: profile.location || null,
      style_categories: profile.styleCategories || [],
      social_links: profile.socialLinks || {},
      cover_url: profile.coverUrl || null,
    }).select().single(),
    'Create creator profile',
  );
}

export async function loadCreatorPlatform(userId = null) {
  const client = requireSupabase();
  const [creatorResult, profileResult, postResult, mediaResult, productLinkResult, productResult, followResult, saveResult, outfitSaveResult] = await Promise.all([
    client.from('creator_profiles').select('*').order('created_at', { ascending: false }),
    client.from('profiles').select('id, display_name, avatar_url, account_type'),
    client.from('creator_posts').select('*').eq('status', 'published').order('created_at', { ascending: false }),
    client.from('creator_post_media').select('*').order('sort_order'),
    client.from('creator_post_products').select('*').order('sort_order'),
    client.from('products').select('*'),
    client.from('creator_follows').select('follower_id, creator_id'),
    client.from('saved_creator_posts').select('user_id, post_id'),
    userId
      ? client.from('saved_outfit_references').select('user_id, outfit_key').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const creatorRows = assertResult(creatorResult, 'Load creators') ?? [];
  const profileRows = assertResult(profileResult, 'Load public profiles') ?? [];
  const postRows = assertResult(postResult, 'Load posts') ?? [];
  const mediaRows = assertResult(mediaResult, 'Load post media') ?? [];
  const productLinks = assertResult(productLinkResult, 'Load product tags') ?? [];
  const productRows = assertResult(productResult, 'Load products') ?? [];
  const followRows = assertResult(followResult, 'Load follows') ?? [];
  const saveRows = assertResult(saveResult, 'Load saves') ?? [];
  const outfitSaveRows = assertResult(outfitSaveResult, 'Load saved outfits') ?? [];

  const profilesById = new Map(profileRows.map((row) => [row.id, row]));
  const productsById = new Map(productRows.map((row) => [row.id, row]));
  const creatorById = new Map(creatorRows.map((row) => [row.id, row]));
  const followCounts = followRows.reduce((counts, row) => counts.set(row.creator_id, (counts.get(row.creator_id) || 0) + 1), new Map());
  const saveCounts = saveRows.reduce((counts, row) => counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1), new Map());
  const postCounts = postRows.reduce((counts, row) => counts.set(row.creator_id, (counts.get(row.creator_id) || 0) + 1), new Map());

  const creators = creatorRows.map((row) => {
    const profile = profilesById.get(row.user_id) ?? {};
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: profile.display_name || row.username,
      avatar: profile.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.display_name || row.username)}`,
      cover: row.cover_url || FALLBACK_MEDIA,
      bio: row.bio || '',
      location: row.location || '',
      tags: row.style_categories || [],
      socialLinks: row.social_links || {},
      followers: followCounts.get(row.id) || 0,
      following: 0,
      outfitPosts: postCounts.get(row.id) || 0,
      likes: 0,
      saves: postRows.filter((post) => post.creator_id === row.id).reduce((sum, post) => sum + (saveCounts.get(post.id) || 0), 0),
      status: 'New',
      verified: row.is_verified,
    };
  });

  const productsForPost = (postId) => productLinks
    .filter((link) => link.post_id === postId)
    .map((link) => productsById.get(link.product_id))
    .filter(Boolean)
    .map((row) => ({
      id: row.id,
      category: row.category,
      brand: row.brand,
      name: row.product_name,
      price: Number(row.price),
      image: row.image_url || FALLBACK_MEDIA,
      retailer: row.retailer,
      color: row.color || 'As shown',
      availability: row.inventory_status === 'in_stock' ? 'In stock' : row.inventory_status,
      sizes: row.sizes_available?.length ? row.sizes_available : ['One size'],
      affiliateUrl: row.product_url,
    }));

  const posts = postRows.map((row) => {
    const creator = creatorById.get(row.creator_id);
    const media = mediaRows.filter((item) => item.post_id === row.id);
    const video = media.find((item) => item.media_type === 'video');
    const image = media.find((item) => item.media_type === 'image');
    return {
      id: row.id,
      creatorId: row.creator_id,
      creatorUsername: creator?.username || 'creator',
      title: row.title,
      caption: row.caption,
      mediaType: row.media_type,
      image: image?.media_url || creator?.cover_url || FALLBACK_MEDIA,
      videoUrl: video?.media_url || null,
      gallery: media.map((item) => item.media_url),
      tags: row.style_tags || [],
      occasion: row.occasion || 'Everyday',
      season: row.season || 'All season',
      genderCategory: row.gender_category || 'Unisex',
      likes: 0,
      saves: saveCounts.get(row.id) || 0,
      comments: 0,
      createdAt: new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      products: productsForPost(row.id),
    };
  });

  return {
    creators,
    posts,
    followedUsernames: userId
      ? followRows.filter((row) => row.follower_id === userId).map((row) => creatorById.get(row.creator_id)?.username).filter(Boolean)
      : [],
    savedPostIds: userId ? saveRows.filter((row) => row.user_id === userId).map((row) => row.post_id) : [],
    savedOutfitIds: outfitSaveRows.map((row) => row.outfit_key),
  };
}

export async function setCreatorFollow({ userId, creatorId, following }) {
  if (!isUuid(creatorId)) return;
  const client = requireSupabase();
  const result = following
    ? await client.from('creator_follows').insert({ follower_id: userId, creator_id: creatorId })
    : await client.from('creator_follows').delete().eq('follower_id', userId).eq('creator_id', creatorId);
  assertResult(result, following ? 'Follow creator' : 'Unfollow creator');
}

export async function setPostSaved({ userId, postId, saved }) {
  if (!isUuid(postId)) return;
  const client = requireSupabase();
  const result = saved
    ? await client.from('saved_creator_posts').insert({ user_id: userId, post_id: postId })
    : await client.from('saved_creator_posts').delete().eq('user_id', userId).eq('post_id', postId);
  assertResult(result, saved ? 'Save fit check' : 'Remove saved fit check');
}

export async function setOutfitSaved({ userId, outfitId, saved }) {
  const client = requireSupabase();
  const result = saved
    ? await client.from('saved_outfit_references').insert({ user_id: userId, outfit_key: outfitId })
    : await client.from('saved_outfit_references').delete().eq('user_id', userId).eq('outfit_key', outfitId);
  assertResult(result, saved ? 'Save outfit' : 'Remove saved outfit');
}

function cleanFileName(fileName) {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
}

async function uploadMediaFiles(userId, files) {
  const client = requireSupabase();
  return Promise.all(files.map(async (file, index) => {
    const path = `${userId}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
    const upload = await client.storage.from('creator-media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
    if (upload.error) throw new Error(`Upload media: ${upload.error.message}`);
    const { data } = client.storage.from('creator-media').getPublicUrl(path);
    return {
      media_url: data.publicUrl,
      media_type: file.type.startsWith('video/') ? 'video' : 'image',
      sort_order: index,
      alt_text: file.name,
    };
  }));
}

export async function publishCreatorPost({ userId, post, mediaFiles }) {
  const client = requireSupabase();
  const account = await getAccount(userId);
  if (!account.creator) throw new Error('Upgrade to a creator account before publishing.');

  const insertedPost = assertResult(
    await client.from('creator_posts').insert({
      creator_id: account.creator.id,
      title: post.title,
      caption: post.caption,
      media_type: post.mediaType,
      style_tags: post.tags,
      occasion: post.occasion,
      season: post.season,
      gender_category: post.genderCategory,
      status: 'published',
    }).select().single(),
    'Publish fit check',
  );

  const uploadedMedia = mediaFiles?.length
    ? await uploadMediaFiles(userId, mediaFiles)
    : [{ media_url: post.image, media_type: post.videoUrl ? 'video' : 'image', sort_order: 0, alt_text: post.title }];
  assertResult(
    await client.from('creator_post_media').insert(uploadedMedia.map((item) => ({ ...item, post_id: insertedPost.id }))),
    'Save post media',
  );

  if (post.products.length) {
    const insertedProducts = assertResult(
      await client.from('products').insert(post.products.map((item) => ({
        created_by: userId,
        brand: item.brand,
        product_name: item.name,
        category: item.category,
        color: item.color || 'As shown',
        price: Number(item.price),
        image_url: item.image || null,
        retailer: item.retailer || item.brand,
        product_url: item.affiliateUrl || null,
        inventory_status: 'in_stock',
        sizes_available: item.sizes || ['One size'],
      }))).select(),
      'Save tagged products',
    );
    assertResult(
      await client.from('creator_post_products').insert(insertedProducts.map((item, index) => ({
        post_id: insertedPost.id,
        product_id: item.id,
        category: item.category,
        sort_order: index,
      }))),
      'Link tagged products',
    );
    assertResult(
      await client.from('creator_closet_items').upsert(insertedProducts.map((item) => ({
        creator_id: account.creator.id,
        product_id: item.id,
      })), { onConflict: 'creator_id,product_id' }),
      'Update creator closet',
    );
  }
  return insertedPost;
}

export { isUuid, supabase };
