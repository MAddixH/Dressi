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

function isMissingPhase3Relation(error, relation) {
  const detail = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return detail.includes(relation.toLowerCase())
    && (detail.includes('schema cache') || detail.includes('does not exist') || detail.includes('pgrst205') || detail.includes('42p01'));
}

function getAnalyticsSessionKey() {
  const storageKey = 'dressi-analytics-session';
  let value = window.sessionStorage.getItem(storageKey);
  if (!value) {
    value = crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, value);
  }
  return value;
}

function getAnalyticsVisitorKey() {
  const storageKey = 'dressi-analytics-visitor';
  let value = window.localStorage.getItem(storageKey);
  if (!value) {
    value = crypto.randomUUID();
    window.localStorage.setItem(storageKey, value);
  }
  return value;
}

function recentlyTracked(key, cooldownMs = 30000) {
  const storageKey = `dressi-event-${key}`;
  const lastTracked = Number(window.sessionStorage.getItem(storageKey) ?? 0);
  if (Date.now() - lastTracked < cooldownMs) return true;
  window.sessionStorage.setItem(storageKey, String(Date.now()));
  return false;
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

export async function updateCreatorProfile({ userId, creatorId, fields, avatarFile = null }) {
  const client = requireSupabase();
  let avatarUrl = fields.avatarUrl || null;
  if (avatarFile) {
    const [uploadedAvatar] = await uploadMediaFiles(userId, [avatarFile]);
    avatarUrl = uploadedAvatar.media_url;
  }

  assertResult(
    await client.from('profiles').update({
      display_name: fields.displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', userId),
    'Update account profile',
  );

  return assertResult(
    await client.from('creator_profiles').update({
      username: safeUsername(fields.username),
      display_name: fields.displayName,
      avatar_url: avatarUrl,
      bio: fields.bio,
      location: fields.location || null,
      style_categories: fields.styleCategories,
      social_links: fields.socialLinks,
      updated_at: new Date().toISOString(),
    }).eq('id', creatorId).eq('user_id', userId).select().single(),
    'Update creator profile',
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
    userId
      ? client.from('saved_creator_posts').select('user_id, post_id').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
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

  // Phase 3 engagement reads are optional during rollout. Missing new tables or
  // RPCs must never prevent authentication and the core account from loading.
  const [engagementResult, postLikeResult, outfitLikeResult, commentResult] = await Promise.all([
    client.rpc('get_creator_post_engagement'),
    userId
      ? client.from('creator_post_likes').select('user_id, post_id').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
    userId
      ? client.from('liked_outfit_references').select('user_id, outfit_key').eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
    client.from('comments').select('post_id'),
  ]);
  const engagementRows = engagementResult.error ? [] : (engagementResult.data ?? []);
  const postLikeRows = postLikeResult.error ? [] : (postLikeResult.data ?? []);
  const outfitLikeRows = outfitLikeResult.error ? [] : (outfitLikeResult.data ?? []);
  const commentRows = commentResult.error ? [] : (commentResult.data ?? []);

  const profilesById = new Map(profileRows.map((row) => [row.id, row]));
  const productsById = new Map(productRows.map((row) => [row.id, row]));
  const creatorById = new Map(creatorRows.map((row) => [row.id, row]));
  const followCounts = followRows.reduce((counts, row) => counts.set(row.creator_id, (counts.get(row.creator_id) || 0) + 1), new Map());
  const engagementByPost = new Map(engagementRows.map((row) => [row.post_id, row]));
  const saveCounts = new Map(postRows.map((row) => [row.id, Number(engagementByPost.get(row.id)?.saves ?? saveRows.filter((item) => item.post_id === row.id).length)]));
  const likeCounts = new Map(postRows.map((row) => [row.id, Number(engagementByPost.get(row.id)?.likes ?? postLikeRows.filter((item) => item.post_id === row.id).length)]));
  const commentCounts = commentRows.reduce((counts, row) => counts.set(row.post_id, (counts.get(row.post_id) || 0) + 1), new Map());
  engagementRows.forEach((row) => commentCounts.set(row.post_id, Number(row.comments ?? 0)));
  const postCounts = postRows.reduce((counts, row) => counts.set(row.creator_id, (counts.get(row.creator_id) || 0) + 1), new Map());

  const creators = creatorRows.map((row) => {
    const profile = profilesById.get(row.user_id) ?? {};
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: profile.display_name || row.display_name || row.username,
      avatar: profile.avatar_url || row.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.display_name || row.display_name || row.username)}`,
      cover: row.cover_url || FALLBACK_MEDIA,
      bio: row.bio || '',
      location: row.location || '',
      tags: row.style_categories || [],
      socialLinks: row.social_links || {},
      followers: followCounts.get(row.id) || 0,
      following: 0,
      outfitPosts: postCounts.get(row.id) || 0,
      likes: postRows.filter((post) => post.creator_id === row.id).reduce((sum, post) => sum + (likeCounts.get(post.id) || 0), 0),
      saves: postRows.filter((post) => post.creator_id === row.id).reduce((sum, post) => sum + (saveCounts.get(post.id) || 0), 0),
      purchases: 0,
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
      likes: likeCounts.get(row.id) || 0,
      saves: saveCounts.get(row.id) || 0,
      comments: commentCounts.get(row.id) || 0,
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
    likedPostIds: userId ? postLikeRows.filter((row) => row.user_id === userId).map((row) => row.post_id) : [],
    likedOutfitIds: outfitLikeRows.map((row) => row.outfit_key),
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

export async function setPostLiked({ userId, postId, liked }) {
  if (!isUuid(postId)) return;
  const client = requireSupabase();
  const result = liked
    ? await client.from('creator_post_likes').insert({ user_id: userId, post_id: postId })
    : await client.from('creator_post_likes').delete().eq('user_id', userId).eq('post_id', postId);
  if (result.error && isMissingPhase3Relation(result.error, 'creator_post_likes')) return false;
  assertResult(result, liked ? 'Like fit check' : 'Unlike fit check');
  return true;
}

export async function setOutfitSaved({ userId, outfitId, saved }) {
  const client = requireSupabase();
  const result = saved
    ? await client.from('saved_outfit_references').insert({ user_id: userId, outfit_key: outfitId })
    : await client.from('saved_outfit_references').delete().eq('user_id', userId).eq('outfit_key', outfitId);
  assertResult(result, saved ? 'Save outfit' : 'Remove saved outfit');
}

export async function setOutfitLiked({ userId, outfitId, liked }) {
  const client = requireSupabase();
  const result = liked
    ? await client.from('liked_outfit_references').insert({ user_id: userId, outfit_key: outfitId })
    : await client.from('liked_outfit_references').delete().eq('user_id', userId).eq('outfit_key', outfitId);
  if (result.error && isMissingPhase3Relation(result.error, 'liked_outfit_references')) return false;
  assertResult(result, liked ? 'Like outfit' : 'Unlike outfit');
  return true;
}

export async function trackCreatorEvent({ creatorId, eventType, userId = null, postId = null, productId = null, value = 0 }) {
  if (!isUuid(creatorId)) return false;
  const fingerprint = [eventType, creatorId, postId ?? '', productId ?? ''].join(':');
  if (['profile_view', 'post_view', 'product_click'].includes(eventType) && recentlyTracked(fingerprint)) return false;
  const client = requireSupabase();
  const payload = {
    creator_id: creatorId,
    viewer_id: isUuid(userId) ? userId : null,
    post_id: isUuid(postId) ? postId : null,
    product_id: isUuid(productId) ? productId : null,
    event_type: eventType,
    session_key: getAnalyticsSessionKey(),
  };
  if (eventType === 'purchase') payload.event_value = Number(value) || 0;
  const result = await client.from('creator_events').insert(payload);
  if (result.error) {
    console.warn(`Track ${eventType}: ${result.error.message}`);
    return false;
  }
  return true;
}

export async function trackPlatformEvent({ eventType, userId = null, route = null, entityId = null, style = null, metadata = {} }) {
  const fingerprint = [eventType, route ?? '', entityId ?? '', style ?? ''].join(':');
  const cooldown = eventType === 'search' ? 1500 : 30000;
  if (recentlyTracked(`platform:${fingerprint}`, cooldown)) return false;
  const client = requireSupabase();
  const result = await client.rpc('track_platform_event', {
    p_session_key: getAnalyticsSessionKey(),
    p_visitor_key: getAnalyticsVisitorKey(),
    p_event_type: eventType,
    p_user_id: isUuid(userId) ? userId : null,
    p_route: route,
    p_entity_id: entityId == null ? null : String(entityId),
    p_style: style?.trim() || null,
    p_metadata: metadata,
  });
  if (result.error) {
    console.warn(`Track platform ${eventType}: ${result.error.message}`);
    return false;
  }
  return true;
}

export async function loadPlatformAnalytics({ startDate = null, endDate = null } = {}) {
  const client = requireSupabase();
  const result = await client.rpc('get_platform_analytics', {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  return assertResult(result, 'Load platform analytics');
}

export async function loadCreatorInsights({ creatorId, userId = null }) {
  if (!isUuid(creatorId)) {
    return { events: [], followers: [], notifications: [] };
  }
  const client = requireSupabase();
  const [eventResult, followerResult, notificationResult] = await Promise.all([
    client.from('creator_events').select('id, event_type, post_id, product_id, event_value, created_at').eq('creator_id', creatorId).order('created_at'),
    client.from('creator_follows').select('follower_id, created_at').eq('creator_id', creatorId).order('created_at'),
    isUuid(userId)
      ? client.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(25)
      : Promise.resolve({ data: [], error: null }),
  ]);
  return {
    events: assertResult(eventResult, 'Load creator events') ?? [],
    followers: assertResult(followerResult, 'Load follower growth') ?? [],
    notifications: assertResult(notificationResult, 'Load creator notifications') ?? [],
  };
}

export async function loadNotifications(userId) {
  if (!isUuid(userId)) return [];
  const client = requireSupabase();
  return assertResult(
    await client.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    'Load notifications',
  ) ?? [];
}

export async function markNotificationsRead({ userId, notificationId = null }) {
  const client = requireSupabase();
  let query = client.from('notifications').update({ read: true }).eq('user_id', userId);
  if (notificationId) query = query.eq('id', notificationId);
  assertResult(await query, 'Mark notifications read');
}

export async function loadComments({ postId, userId = null }) {
  if (!isUuid(postId)) return [];
  const client = requireSupabase();
  const commentRows = assertResult(
    await client.from('comments').select('*').eq('post_id', postId).order('created_at'),
    'Load comments',
  ) ?? [];
  if (!commentRows.length) return [];
  const profileIds = [...new Set(commentRows.map((row) => row.user_id))];
  const commentIds = commentRows.map((row) => row.id);
  const [profileResult, likeResult] = await Promise.all([
    client.from('profiles').select('id, display_name, avatar_url').in('id', profileIds),
    client.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds),
  ]);
  const profiles = new Map((assertResult(profileResult, 'Load comment authors') ?? []).map((row) => [row.id, row]));
  const likes = assertResult(likeResult, 'Load comment likes') ?? [];
  return commentRows.map((row) => {
    const profile = profiles.get(row.user_id) ?? {};
    const commentLikes = likes.filter((item) => item.comment_id === row.id);
    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      parentId: row.parent_comment_id,
      comment: row.comment,
      pinned: row.is_pinned,
      createdAt: row.created_at,
      authorName: profile.display_name || 'Dressi member',
      authorAvatar: profile.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.display_name || 'Dressi member')}`,
      likes: commentLikes.length,
      likedByMe: isUuid(userId) && commentLikes.some((item) => item.user_id === userId),
    };
  });
}

export async function createComment({ postId, userId, comment, parentId = null }) {
  if (!isUuid(postId) || !isUuid(userId)) throw new Error('Log in to comment on this fit.');
  const client = requireSupabase();
  return assertResult(
    await client.from('comments').insert({
      post_id: postId,
      user_id: userId,
      parent_comment_id: isUuid(parentId) ? parentId : null,
      comment: comment.trim(),
    }).select().single(),
    'Post comment',
  );
}

export async function setCommentLiked({ commentId, userId, liked }) {
  const client = requireSupabase();
  const result = liked
    ? await client.from('comment_likes').insert({ comment_id: commentId, user_id: userId })
    : await client.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
  assertResult(result, liked ? 'Like comment' : 'Unlike comment');
}

export async function setCommentPinned({ commentId, pinned }) {
  const client = requireSupabase();
  assertResult(await client.from('comments').update({ is_pinned: pinned }).eq('id', commentId), pinned ? 'Pin comment' : 'Unpin comment');
}

export async function deleteComment(commentId) {
  const client = requireSupabase();
  assertResult(await client.from('comments').delete().eq('id', commentId), 'Delete comment');
}

export async function loadCreatorCollections({ creatorId, userId = null }) {
  if (!isUuid(creatorId)) return [];
  const client = requireSupabase();
  const collectionRows = assertResult(
    await client.from('creator_collections').select('*').eq('creator_id', creatorId).order('created_at', { ascending: false }),
    'Load creator collections',
  ) ?? [];
  if (!collectionRows.length) {
    assertResult(await client.from('creator_collection_follows').select('collection_id').limit(1), 'Load collection follows');
    return [];
  }
  const collectionIds = collectionRows.map((row) => row.id);
  const [postResult, followResult] = await Promise.all([
    client.from('creator_collection_posts').select('collection_id, post_id, sort_order').in('collection_id', collectionIds).order('sort_order'),
    client.from('creator_collection_follows').select('collection_id, user_id').in('collection_id', collectionIds),
  ]);
  const postLinks = assertResult(postResult, 'Load collection posts') ?? [];
  const follows = assertResult(followResult, 'Load collection follows') ?? [];
  return collectionRows.map((row) => ({
    id: row.id,
    creatorId: row.creator_id,
    name: row.name,
    cover: row.cover_url,
    postIds: postLinks.filter((item) => item.collection_id === row.id).map((item) => item.post_id),
    followers: follows.filter((item) => item.collection_id === row.id).length,
    followed: isUuid(userId) && follows.some((item) => item.collection_id === row.id && item.user_id === userId),
  }));
}

export async function createCreatorCollection({ creatorId, name, coverUrl = null }) {
  const client = requireSupabase();
  return assertResult(
    await client.from('creator_collections').insert({ creator_id: creatorId, name: name.trim(), cover_url: coverUrl }).select().single(),
    'Create collection',
  );
}

export async function updateCreatorCollection({ collectionId, name, coverUrl = null, postIds = [] }) {
  const client = requireSupabase();
  assertResult(
    await client.from('creator_collections').update({ name: name.trim(), cover_url: coverUrl }).eq('id', collectionId),
    'Update collection',
  );
  assertResult(await client.from('creator_collection_posts').delete().eq('collection_id', collectionId), 'Reset collection posts');
  const validPostIds = postIds.filter(isUuid);
  if (validPostIds.length) {
    assertResult(
      await client.from('creator_collection_posts').insert(validPostIds.map((postId, index) => ({ collection_id: collectionId, post_id: postId, sort_order: index }))),
      'Save collection posts',
    );
  }
}

export async function deleteCreatorCollection(collectionId) {
  const client = requireSupabase();
  assertResult(await client.from('creator_collections').delete().eq('id', collectionId), 'Delete collection');
}

export async function setCollectionFollow({ collectionId, userId, following }) {
  const client = requireSupabase();
  const result = following
    ? await client.from('creator_collection_follows').insert({ collection_id: collectionId, user_id: userId })
    : await client.from('creator_collection_follows').delete().eq('collection_id', collectionId).eq('user_id', userId);
  assertResult(result, following ? 'Follow collection' : 'Unfollow collection');
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
