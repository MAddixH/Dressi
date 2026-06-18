import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bookmark,
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  Heart,
  ImagePlus,
  Layers3,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  PackagePlus,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import { getCreatorCloset, getCreatorPosts } from '../data/creatorData.js';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function money(value) {
  return currency.format(value);
}

function compact(value) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function CreatorAvatar({ creator, size = 'medium' }) {
  return (
    <span className={`creator-avatar ${size}`}>
      <img src={creator.avatar} alt={creator.displayName} />
      {creator.verified && <BadgeCheck size={15} fill="currentColor" />}
    </span>
  );
}

function MediaBadge({ type }) {
  if (type === 'video') return <span className="media-badge"><Play size={13} fill="currentColor" /> Video</span>;
  if (type === 'carousel') return <span className="media-badge"><Layers3 size={13} /> Carousel</span>;
  return <span className="media-badge"><Camera size={13} /> Photo</span>;
}

export function CreatorFeedCard({
  post,
  creator,
  isFollowed,
  isSaved,
  onToggleFollow,
  onToggleSave,
  onOpenCreator,
  onOpenPost,
  onShop,
}) {
  return (
    <article className="creator-feed-card">
      <header>
        <button className="creator-identity" onClick={() => onOpenCreator(creator.username)} type="button">
          <CreatorAvatar creator={creator} size="small" />
          <span>
            <strong>@{creator.username}</strong>
            <small>{post.createdAt} / {post.occasion}</small>
          </span>
        </button>
        <button className={isFollowed ? 'follow-button following' : 'follow-button'} onClick={() => onToggleFollow(creator.username)} type="button">
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      </header>
      <button className="creator-media" onClick={() => onOpenPost(post.id)} type="button">
        <img src={post.image} alt={post.title} />
        <MediaBadge type={post.mediaType} />
        {post.mediaType === 'video' && <span className="play-button"><Play size={24} fill="currentColor" /></span>}
        <span className="creator-media-copy">
          <small>{post.tags.slice(0, 2).join(' / ')}</small>
          <strong>{post.title}</strong>
        </span>
      </button>
      <div className="creator-card-content">
        <div className="social-actions">
          <span><Heart size={18} /> {compact(post.likes)}</span>
          <span><Bookmark size={18} /> {compact(post.saves)}</span>
          <span><MessageCircle size={18} /> {compact(post.comments)}</span>
          <button className={isSaved ? 'saved' : ''} onClick={() => onToggleSave(post.id)} aria-label="Save fit check" type="button">
            <Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p><strong>@{creator.username}</strong> {post.caption}</p>
        <div className="tag-row creator-tags">
          {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <button className="primary-button full" onClick={() => onShop(post.id)} type="button">
          <ShoppingBag size={17} /> Shop This Fit / {post.products.length} items
        </button>
      </div>
    </article>
  );
}

export function CreatorDiscovery({ creators, posts, followed, onToggleFollow, onOpenCreator, onOpenPost }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Trending');
  const categories = ['Trending', 'New', 'Most Saved', 'Most Purchased'];
  const filtered = creators.filter((creator) => {
    const haystack = [creator.username, creator.displayName, ...creator.tags].join(' ').toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'Trending' ? true : creator.status === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <section className="page-stack creator-discovery">
      <label className="search-bar">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators, styles, categories..." />
      </label>
      <div className="tabs horizontal-scroll">
        {categories.map((item) => (
          <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item} type="button">{item}</button>
        ))}
      </div>
      <section>
        <div className="section-heading">
          <div><p className="eyebrow">Creator discovery</p><h2>Style worth following</h2></div>
          <span>{filtered.length} creators</span>
        </div>
        <div className="creator-list">
          {filtered.map((creator) => {
            const latestPost = posts.find((post) => post.creatorUsername === creator.username);
            return (
              <article className="creator-discovery-card" key={creator.id}>
                <button className="creator-cover" onClick={() => onOpenCreator(creator.username)} type="button">
                  <img src={latestPost?.image ?? creator.cover} alt={`${creator.displayName} style`} />
                  <span>{creator.status}</span>
                </button>
                <div className="creator-discovery-info">
                  <button className="creator-identity" onClick={() => onOpenCreator(creator.username)} type="button">
                    <CreatorAvatar creator={creator} size="medium" />
                    <span><strong>@{creator.username}</strong><small>{compact(creator.followers)} followers</small></span>
                  </button>
                  <p>{creator.tags.join(' / ')}</p>
                  <div className="creator-discovery-actions">
                    <button className={followed.includes(creator.username) ? 'follow-button following' : 'follow-button'} onClick={() => onToggleFollow(creator.username)} type="button">
                      {followed.includes(creator.username) ? <Check size={15} /> : <UserPlus size={15} />}
                      {followed.includes(creator.username) ? 'Following' : 'Follow'}
                    </button>
                    {latestPost && <button className="icon-button" onClick={() => onOpenPost(latestPost.id)} aria-label="Open latest fit check" type="button"><Play size={17} /></button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export function CreatorProfile({ creator, posts, followed, onToggleFollow, onOpenPost, onOpenCloset, onShop }) {
  const [tab, setTab] = useState('Outfits');
  const [notice, setNotice] = useState('');
  const tabs = ['Outfits', 'Videos', 'Closet', 'Collections'];
  const visiblePosts = tab === 'Videos' ? posts.filter((post) => post.mediaType === 'video') : posts;

  if (tab === 'Closet') {
    return <CreatorCloset creator={creator} posts={posts} onShopItem={() => onOpenCloset(creator.username)} embedded />;
  }

  return (
    <section className="creator-profile-page">
      <div className="creator-profile-hero">
        <img src={creator.cover} alt={`${creator.displayName} cover`} />
      </div>
      <section className="creator-profile-body">
        <div className="profile-avatar-row">
          <CreatorAvatar creator={creator} size="large" />
          <div className="profile-actions">
            <button className={followed ? 'primary-button following' : 'primary-button'} onClick={() => onToggleFollow(creator.username)} type="button">
              {followed ? 'Following' : 'Follow'}
            </button>
            <button className="secondary-button" onClick={() => setNotice('Messaging is coming in a future phase.')} type="button">Message</button>
          </div>
        </div>
        <div className="creator-bio">
          <h1>@{creator.username} {creator.verified && <BadgeCheck size={19} fill="currentColor" />}</h1>
          <p>{creator.bio}</p>
          <span><MapPin size={14} /> {creator.location}</span>
          <div className="tag-row creator-tags">{creator.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
        {notice && <div className="inline-notice"><MessageCircle size={16} /> {notice}</div>}
        <div className="creator-stats">
          <span><strong>{compact(creator.followers)}</strong><small>Followers</small></span>
          <span><strong>{compact(creator.following)}</strong><small>Following</small></span>
          <span><strong>{creator.outfitPosts}</strong><small>Outfits</small></span>
          <span><strong>{compact(creator.likes)}</strong><small>Likes</small></span>
          <span><strong>{compact(creator.saves)}</strong><small>Saves</small></span>
        </div>
        <button className="secondary-button full closet-cta" onClick={() => onOpenCloset(creator.username)} type="button">
          <ShoppingBag size={17} /> Shop @{creator.username}'s Closet <ChevronRight size={17} />
        </button>
      </section>
      <div className="creator-profile-tabs">
        {tabs.map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item} type="button">{item}</button>)}
      </div>
      {tab === 'Collections' ? (
        <div className="creator-collections">
          {['Timeless Layers', 'City Weekends', 'Spring Tailoring'].map((name, index) => (
            <button type="button" key={name} onClick={() => setTab('Outfits')}><img src={posts[index % Math.max(posts.length, 1)]?.image ?? creator.cover} alt="" /><span><strong>{name}</strong><small>{index + 2} saved fits</small></span></button>
          ))}
        </div>
      ) : (
        <div className="creator-post-grid">
          {visiblePosts.map((post) => (
            <button onClick={() => onOpenPost(post.id)} key={post.id} type="button">
              <img src={post.image} alt={post.title} />
              <MediaBadge type={post.mediaType} />
              <span><Heart size={13} fill="currentColor" /> {compact(post.likes)}</span>
              <i onClick={(event) => { event.stopPropagation(); onShop(post.id); }}><ShoppingBag size={15} /></i>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function FitCheckDetail({ post, creator, isSaved, isFollowed, onToggleSave, onToggleFollow, onOpenCreator, onShop, onRecreate }) {
  return (
    <article className="fit-check-detail">
      <section className="fit-check-media">
        {post.videoUrl ? (
          <video src={post.videoUrl} poster={post.image} controls playsInline aria-label={post.title} />
        ) : (
          <img src={post.image} alt={post.title} />
        )}
        {post.mediaType === 'video' && !post.videoUrl && <span className="play-button detail-play"><Play size={28} fill="currentColor" /></span>}
        <MediaBadge type={post.mediaType} />
      </section>
      <section className="fit-check-body">
        <div className="fit-check-creator">
          <button className="creator-identity" onClick={() => onOpenCreator(creator.username)} type="button">
            <CreatorAvatar creator={creator} size="medium" />
            <span><strong>@{creator.username}</strong><small>{creator.tags.slice(0, 2).join(' / ')}</small></span>
          </button>
          <button className={isFollowed ? 'follow-button following' : 'follow-button'} onClick={() => onToggleFollow(creator.username)} type="button">{isFollowed ? 'Following' : 'Follow'}</button>
        </div>
        <div>
          <p className="eyebrow">{post.season} fit check</p>
          <h1>{post.title}</h1>
          <p className="detail-description">{post.caption}</p>
        </div>
        <div className="fit-meta-grid">
          <span><small>Occasion</small><strong>{post.occasion}</strong></span>
          <span><small>Season</small><strong>{post.season}</strong></span>
          <span><small>Style</small><strong>{post.tags[0]}</strong></span>
          <span><small>Category</small><strong>{post.genderCategory}</strong></span>
        </div>
        <div className="social-actions detail-social">
          <span><Heart size={18} /> {compact(post.likes)}</span>
          <span><Bookmark size={18} /> {compact(post.saves)}</span>
          <span><MessageCircle size={18} /> {compact(post.comments)}</span>
          <button className={isSaved ? 'saved' : ''} onClick={() => onToggleSave(post.id)} type="button"><Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} /></button>
        </div>
        <TaggedProductPreview products={post.products} />
        <div className="stacked-actions">
          <button className="primary-button full" onClick={() => onShop(post.id)} type="button"><ShoppingBag size={17} /> Shop This Fit</button>
          <button className="secondary-button full" onClick={() => onRecreate(post.id)} type="button"><Sparkles size={17} /> Recreate This Fit</button>
        </div>
      </section>
    </article>
  );
}

function TaggedProductPreview({ products }) {
  return (
    <section className="tagged-preview">
      <div className="section-heading"><div><p className="eyebrow">Tagged clothing</p><h2>{products.length} pieces in this fit</h2></div></div>
      <div className="product-strip creator-product-strip">
        {products.map((item) => <img src={item.image} alt={item.name} key={item.id} />)}
      </div>
    </section>
  );
}

export function ShopThisFit({ post, creator, isSaved, onToggleSave, onAddAll, onRecreate }) {
  const total = post.products.reduce((sum, item) => sum + item.price, 0);
  return (
    <section className="page-stack shop-fit-page">
      <section className="compact-outfit-summary creator-shop-summary">
        <img src={post.image} alt={post.title} />
        <div><p className="eyebrow">Shop @{creator.username}'s fit</p><h2>{post.title}</h2><p>{post.products.length} tagged products</p></div>
      </section>
      <div className="tagged-product-list">
        {post.products.map((item, index) => (
          <article className="tagged-product-row" key={item.id}>
            <span className="product-index">{String(index + 1).padStart(2, '0')}</span>
            <img src={item.image} alt={`${item.brand} ${item.name}`} />
            <div><small>{item.category}</small><h3>{item.brand}</h3><p>{item.name}</p><span>{item.retailer} / {item.availability}</span></div>
            <strong>{money(item.price)}</strong>
          </article>
        ))}
      </div>
      <section className="fit-total"><span>Total look</span><strong>{money(total)}</strong></section>
      <div className="stacked-actions">
        <button className="primary-button full" onClick={() => onAddAll(post.products, post.id)} type="button"><PackagePlus size={18} /> Add All to Bag</button>
        <button className="secondary-button full" onClick={() => onToggleSave(post.id)} type="button"><Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Fit Saved' : 'Save Fit'}</button>
        <button className="text-button recreate-link" onClick={() => onRecreate(post.id)} type="button"><Sparkles size={16} /> Compare recreated versions</button>
      </div>
    </section>
  );
}

const replacementBrands = {
  exact: [],
  similar: ['COS', 'Arket', 'Vagabond', 'Seiko', 'Le Specs'],
  affordable: ['Uniqlo', 'Zara', 'ASOS', 'Timex', 'Mango'],
};

export function RecreateThisFit({ post, creator, onAddAll }) {
  const [version, setVersion] = useState('exact');
  const versions = [
    ['exact', 'Exact Fit'],
    ['similar', 'Similar'],
    ['affordable', 'Affordable'],
  ];
  const recreatedProducts = useMemo(() => post.products.map((item, index) => {
    if (version === 'exact') return item;
    const multiplier = version === 'similar' ? 0.72 : 0.38;
    return {
      ...item,
      id: `${version}-${item.id}`,
      brand: replacementBrands[version][index % replacementBrands[version].length],
      name: version === 'similar' ? `Alternative ${item.category}` : `Essential ${item.category}`,
      price: Math.round(item.price * multiplier),
      retailer: replacementBrands[version][index % replacementBrands[version].length],
    };
  }), [post, version]);
  const originalTotal = post.products.reduce((sum, item) => sum + item.price, 0);
  const total = recreatedProducts.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="page-stack recreate-page">
      <section className="recreate-hero">
        <img src={post.image} alt={post.title} />
        <div><p className="eyebrow">Recreate @{creator.username}</p><h1>{post.title}</h1><p>Keep the silhouette. Choose the price point.</p></div>
      </section>
      <div className="segmented recreate-tabs">
        {versions.map(([id, label]) => <button className={version === id ? 'active' : ''} onClick={() => setVersion(id)} key={id} type="button">{label}</button>)}
      </div>
      <section className="price-comparison">
        <span><small>Original</small><strong>{money(originalTotal)}</strong></span>
        <ChevronRight size={18} />
        <span><small>{versions.find(([id]) => id === version)[1]}</small><strong>{money(total)}</strong></span>
        {total < originalTotal && <i>Save {money(originalTotal - total)}</i>}
      </section>
      <div className="recreate-products">
        {recreatedProducts.map((item, index) => (
          <article key={item.id}>
            <img src={item.image} alt={item.name} />
            <div><small>{item.category}</small><h3>{item.brand}</h3><p>{item.name}</p><span>{version === 'exact' ? 'Original tagged item' : `Matches the original ${post.products[index].category.toLowerCase()} shape and tone`}</span></div>
            <strong>{money(item.price)}</strong>
          </article>
        ))}
      </div>
      <button className="primary-button full sticky-cta" onClick={() => onAddAll(recreatedProducts, `${post.id}-${version}`)} type="button"><ShoppingBag size={18} /> Add {versions.find(([id]) => id === version)[1]} / {money(total)}</button>
    </section>
  );
}

export function CreatorCloset({ creator, posts, onShopItem, embedded = false }) {
  const [category, setCategory] = useState('All');
  const products = useMemo(() => getCreatorCloset(creator.username, posts), [creator.username, posts]);
  const categories = ['All', 'Tops', 'Pants', 'Shoes', 'Accessories', 'Watches', 'Outerwear'];
  const filtered = products.filter((item) => category === 'All' || item.category === category || `${item.category}s` === category);

  return (
    <section className={embedded ? 'creator-closet embedded' : 'page-stack creator-closet'}>
      {!embedded && <section className="closet-owner"><CreatorAvatar creator={creator} size="large" /><div><p className="eyebrow">Creator closet</p><h1>@{creator.username}</h1><p>Everything {creator.displayName.split(' ')[0]} wears, organized in one place.</p></div></section>}
      <div className="chip-row horizontal-scroll closet-categories">
        {categories.map((item) => <button className={category === item ? 'chip active' : 'chip'} onClick={() => setCategory(item)} key={item} type="button">{item}</button>)}
      </div>
      <div className="closet-grid">
        {filtered.map((item) => (
          <article key={item.id}>
            <img src={item.image} alt={item.name} />
            <div><small>{item.brand}</small><h3>{item.name}</h3><strong>{money(item.price)}</strong></div>
            <button className="icon-button" onClick={() => onShopItem(item)} aria-label={`Shop ${item.name}`} type="button"><ShoppingBag size={17} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

const blankProduct = () => ({ id: `tag-${Date.now()}-${Math.random()}`, category: 'Top', brand: '', name: '', price: '', retailer: '', affiliateUrl: '', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', sizes: ['XS', 'S', 'M', 'L', 'XL'], color: 'As shown', availability: 'In stock' });

export function CreatorUpload({ creator, accountType, isPublishing = false, onUpgrade, onPublish, onCancel }) {
  const [mediaType, setMediaType] = useState('photo');
  const [preview, setPreview] = useState(creator.cover);
  const [previewKind, setPreviewKind] = useState('image');
  const [gallery, setGallery] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('Everyday');
  const [season, setSeason] = useState('All season');
  const [tags, setTags] = useState(['Minimalist']);
  const [products, setProducts] = useState([blankProduct()]);
  const [error, setError] = useState('');
  const styleTags = ['Old Money', 'Streetwear', 'Minimalist', 'Business Casual', 'Vacation', 'Date Night'];

  if (accountType !== 'creator') {
    return (
      <section className="creator-gate">
        <span><Sparkles size={28} /></span>
        <p className="eyebrow">Creator accounts</p>
        <h1>Share your fit. Build your closet.</h1>
        <p>Upgrade your existing Dressi account to publish fit checks, tag every item, and grow an audience.</p>
        <ul><li><Check size={16} /> Publish photo, video, and carousel posts</li><li><Check size={16} /> Tag shoppable products</li><li><Check size={16} /> Build a public creator profile and closet</li></ul>
        <button className="primary-button full" onClick={onUpgrade} type="button">Switch to Creator Account</button>
      </section>
    );
  }

  function updateProduct(id, changes) {
    setProducts((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function submit() {
    const validProducts = products.filter((item) => item.brand && item.name && Number(item.price));
    if (!title.trim() || !caption.trim() || !validProducts.length) {
      setError('Add a title, caption, and at least one complete tagged product.');
      return;
    }
    onPublish({
      id: `${creator.username}-${Date.now()}`,
      creatorUsername: creator.username,
      title: title.trim(),
      caption: caption.trim(),
      mediaType,
      image: previewKind === 'video' ? creator.cover : preview,
      videoUrl: previewKind === 'video' ? preview : null,
      gallery: gallery.length ? gallery : [preview],
      tags,
      occasion,
      season,
      genderCategory: 'Unisex',
      likes: 0,
      saves: 0,
      comments: 0,
      createdAt: 'now',
      products: validProducts.map((item) => ({ ...item, price: Number(item.price), retailer: item.retailer || item.brand })),
    }, mediaFiles);
  }

  return (
    <section className="page-stack creator-upload-page">
      <section className="upload-intro"><p className="eyebrow">New fit check</p><h1>Share what you're wearing.</h1><p>Upload your look, add the story, then tag every shoppable piece.</p></section>
      <section className="upload-media-panel">
        <div className="segmented">
          {[['photo', Camera], ['video', Video], ['carousel', Layers3]].map(([id, Icon]) => <button className={mediaType === id ? 'active' : ''} onClick={() => setMediaType(id)} key={id} type="button"><Icon size={15} /> {id}</button>)}
        </div>
        <label className="upload-dropzone">
          {previewKind === 'video' ? (
            <video src={preview} controls playsInline aria-label="Fit check video preview" />
          ) : (
            <img src={preview} alt="Fit check preview" />
          )}
          <span><ImagePlus size={20} /> Replace media</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple={mediaType === 'carousel'}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (!files.length) return;
              const urls = files.map((file) => URL.createObjectURL(file));
              const firstIsVideo = files[0].type.startsWith('video/');
              setPreview(urls[0]);
              setPreviewKind(firstIsVideo ? 'video' : 'image');
              setGallery(urls);
              setMediaFiles(files);
              if (firstIsVideo) setMediaType('video');
              if (files.length > 1) setMediaType('carousel');
            }}
          />
        </label>
      </section>
      <section className="upload-form-section">
        <h2>Post details</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Spring layers in the city" /></label>
        <label>Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Tell people about the look..." rows="4" /></label>
        <div className="two-col"><label>Occasion<select value={occasion} onChange={(event) => setOccasion(event.target.value)}>{['Everyday', 'Work', 'Date Night', 'Vacation', 'Going Out', 'Event'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Season<select value={season} onChange={(event) => setSeason(event.target.value)}>{['All season', 'Spring', 'Summer', 'Fall', 'Winter'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div><span className="field-label">Style tags</span><div className="chip-row upload-tags">{styleTags.map((tag) => <button className={tags.includes(tag) ? 'chip active' : 'chip'} onClick={() => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} key={tag} type="button">{tag}</button>)}</div></div>
      </section>
      <section className="upload-form-section tagged-products-editor">
        <div className="section-heading"><div><p className="eyebrow">Tagged products</p><h2>Make the fit shoppable</h2></div><button className="icon-button" onClick={() => setProducts((current) => [...current, blankProduct()])} aria-label="Add product" type="button"><Plus size={18} /></button></div>
        {products.map((item, index) => (
          <article key={item.id}>
            <div className="tag-editor-heading"><strong>Item {index + 1}</strong><button onClick={() => setProducts((current) => current.filter((product) => product.id !== item.id))} aria-label="Remove tagged product" type="button"><Trash2 size={16} /></button></div>
            <div className="two-col"><label>Category<select value={item.category} onChange={(event) => updateProduct(item.id, { category: event.target.value })}>{['Top', 'Pants', 'Shoes', 'Accessories', 'Watches', 'Outerwear'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Price<input type="number" min="0" value={item.price} onChange={(event) => updateProduct(item.id, { price: event.target.value })} placeholder="128" /></label></div>
            <label>Brand<input value={item.brand} onChange={(event) => updateProduct(item.id, { brand: event.target.value })} placeholder="Ralph Lauren" /></label>
            <label>Product name<input value={item.name} onChange={(event) => updateProduct(item.id, { name: event.target.value })} placeholder="Pima Cotton Sweater" /></label>
            <div className="two-col"><label>Retailer<input value={item.retailer} onChange={(event) => updateProduct(item.id, { retailer: event.target.value })} placeholder="Retailer" /></label><label>Product link<input value={item.affiliateUrl} onChange={(event) => updateProduct(item.id, { affiliateUrl: event.target.value })} placeholder="https://" /></label></div>
          </article>
        ))}
      </section>
      {error && <div className="inline-notice error">{error}</div>}
      <div className="stacked-actions"><button className="primary-button full" onClick={submit} type="button" disabled={isPublishing}><Upload size={18} /> {isPublishing ? 'Publishing...' : 'Publish Fit Check'}</button><button className="secondary-button full" onClick={onCancel} type="button" disabled={isPublishing}>Save draft and exit</button></div>
    </section>
  );
}

export function AccountProfile({ accountType, creator, followedCount, onUpgrade, onOpenCreator, onUpload, onDiscover, onSignOut, isAuthenticated = true, onAuthenticate }) {
  if (!isAuthenticated) {
    return (
      <section className="guest-account">
        <span><LogIn size={27} /></span>
        <p className="eyebrow">Your Dressi profile</p>
        <h1>Save your style across every device.</h1>
        <p>Create an account to follow creators, save outfits, upload fit checks, and build your closet.</p>
        <button className="primary-button full" onClick={onAuthenticate} type="button">Create account or log in</button>
      </section>
    );
  }

  return (
    <section className="page-stack account-profile">
      <section className="account-hero">
        <CreatorAvatar creator={creator} size="large" />
        <div><p className="eyebrow">{accountType === 'creator' ? 'Creator account' : 'Shopper account'}</p><h1>{creator.displayName}</h1><p>@{creator.username}</p></div>
      </section>
      <div className="account-summary"><span><strong>{followedCount}</strong><small>Following</small></span><span><strong>2</strong><small>Saved fits</small></span><span><strong>{accountType === 'creator' ? creator.outfitPosts : 0}</strong><small>Posts</small></span></div>
      {accountType === 'creator' ? (
        <section className="profile-command-list">
          <button onClick={() => onOpenCreator(creator.username)} type="button"><Users size={19} /><span><strong>View creator profile</strong><small>See your public profile and posts</small></span><ChevronRight size={18} /></button>
          <button onClick={onUpload} type="button"><Upload size={19} /><span><strong>Upload fit check</strong><small>Share a photo, video, or carousel</small></span><ChevronRight size={18} /></button>
          <button onClick={onDiscover} type="button"><Search size={19} /><span><strong>Discover creators</strong><small>Find style communities to follow</small></span><ChevronRight size={18} /></button>
        </section>
      ) : (
        <section className="upgrade-panel"><Sparkles size={24} /><h2>Become a Dressi creator</h2><p>Publish fit checks, tag your clothes, and build an audience around the looks you already wear.</p><button className="primary-button full" onClick={onUpgrade} type="button">Upgrade to Creator</button></section>
      )}
      <section className="profile-command-list">
        <button onClick={onDiscover} type="button"><UserPlus size={19} /><span><strong>Find creators</strong><small>Personalize your following feed</small></span><ChevronRight size={18} /></button>
        <button type="button"><ExternalLink size={19} /><span><strong>Connected social profiles</strong><small>{creator.socialLinks.instagram || 'No social profiles connected'}</small></span><ChevronRight size={18} /></button>
        {onSignOut && <button onClick={onSignOut} type="button"><LogOut size={19} /><span><strong>Log out</strong><small>Sign out of this Dressi account</small></span><ChevronRight size={18} /></button>}
      </section>
    </section>
  );
}
