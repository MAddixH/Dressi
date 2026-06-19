import React, { useEffect, useMemo, useState } from 'react';
import {
  BookmarkPlus,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Plus,
  Reply,
  Save,
  Trash2,
  Users,
} from 'lucide-react';

function relativeTime(value) {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(elapsed / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function CommentCard({ item, replies, currentUserId, isCreatorOwner, onReply, onLike, onPin, onDelete }) {
  const canDelete = currentUserId === item.userId || isCreatorOwner;
  return (
    <article className={item.pinned ? 'comment-card pinned' : 'comment-card'}>
      <img src={item.authorAvatar} alt={item.authorName} />
      <div>
        <header>
          <strong>{item.authorName}</strong>
          {item.pinned && <span><Pin size={11} fill="currentColor" /> Pinned</span>}
          <small>{relativeTime(item.createdAt)}</small>
        </header>
        <p>{item.comment}</p>
        <footer>
          <button className={item.likedByMe ? 'liked' : ''} onClick={() => onLike(item)} type="button"><Heart size={13} fill={item.likedByMe ? 'currentColor' : 'none'} /> {item.likes || 'Like'}</button>
          <button onClick={() => onReply(item)} type="button"><Reply size={13} /> Reply</button>
          {isCreatorOwner && <button onClick={() => onPin(item)} type="button"><Pin size={13} /> {item.pinned ? 'Unpin' : 'Pin'}</button>}
          {canDelete && <button onClick={() => onDelete(item.id)} type="button" aria-label="Delete comment"><Trash2 size={13} /></button>}
        </footer>
        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map((reply) => <CommentCard item={reply} replies={[]} currentUserId={currentUserId} isCreatorOwner={isCreatorOwner} onReply={onReply} onLike={onLike} onPin={onPin} onDelete={onDelete} key={reply.id} />)}
          </div>
        )}
      </div>
    </article>
  );
}

export function CommentsSection({ comments, loading, currentUserId, isCreatorOwner, onRequireAuth, onSubmit, onLike, onPin, onDelete }) {
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const rootComments = useMemo(() => comments
    .filter((item) => !item.parentId)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt)), [comments]);

  async function submit(event) {
    event.preventDefault();
    if (!currentUserId) {
      onRequireAuth();
      return;
    }
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(draft.trim(), replyTo?.id ?? null);
      setDraft('');
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comments-section">
      <div className="section-heading">
        <div><p className="eyebrow">Conversation</p><h2>{comments.length} comments</h2></div>
        <MessageCircle size={20} />
      </div>
      {replyTo && <div className="replying-to"><span>Replying to {replyTo.authorName}</span><button onClick={() => setReplyTo(null)} type="button">Cancel</button></div>}
      <form className="comment-composer" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={currentUserId ? 'Add to the conversation…' : 'Log in to comment'} maxLength={2000} />
        <button type="submit" disabled={submitting || !draft.trim()}>{submitting ? 'Posting…' : 'Post'}</button>
      </form>
      <div className="comment-thread">
        {loading && <p className="engagement-empty">Loading comments…</p>}
        {!loading && !rootComments.length && <p className="engagement-empty">Start the conversation about this fit.</p>}
        {rootComments.map((item) => (
          <CommentCard
            item={item}
            replies={comments.filter((reply) => reply.parentId === item.id)}
            currentUserId={currentUserId}
            isCreatorOwner={isCreatorOwner}
            onReply={(comment) => { setReplyTo(comment); setDraft(`@${comment.authorName.split(' ')[0]} `); }}
            onLike={onLike}
            onPin={onPin}
            onDelete={onDelete}
            key={item.id}
          />
        ))}
      </div>
    </section>
  );
}

export function CreatorCollectionShowcase({ collections, posts, canFollow, onRequireAuth, onFollow, onOpenPost }) {
  return (
    <div className="live-collection-grid">
      {!collections.length && <p className="engagement-empty">This creator has not published a collection yet.</p>}
      {collections.map((collection) => {
        const collectionPosts = collection.postIds.map((postId) => posts.find((post) => post.id === postId)).filter(Boolean);
        const firstPost = collectionPosts[0];
        return (
          <article key={collection.id}>
            <button className="collection-cover" onClick={() => firstPost && onOpenPost(firstPost.id)} type="button">
              <img src={collection.cover || firstPost?.image || '/assets/old-money-fit.png'} alt={collection.name} />
              <span><strong>{collection.name}</strong><small>{collectionPosts.length} fits</small></span>
            </button>
            <button className={collection.followed ? 'collection-follow following' : 'collection-follow'} onClick={() => canFollow ? onFollow(collection) : onRequireAuth()} type="button">
              {collection.followed ? <Check size={13} /> : <BookmarkPlus size={13} />}{collection.followed ? 'Following' : 'Follow'} · {collection.followers}
            </button>
          </article>
        );
      })}
    </div>
  );
}

function CollectionEditor({ collection, posts, onSave, onDelete, busy }) {
  const [name, setName] = useState(collection.name);
  const [postIds, setPostIds] = useState(collection.postIds);
  useEffect(() => {
    setName(collection.name);
    setPostIds(collection.postIds);
  }, [collection]);
  const selectedPosts = posts.filter((post) => postIds.includes(post.id));
  const cover = selectedPosts[0]?.image || collection.cover || '/assets/old-money-fit.png';

  return (
    <article className="collection-editor-card">
      <div className="collection-editor-heading">
        <img src={cover} alt="" />
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} /></label>
        <button onClick={() => onDelete(collection.id)} type="button" aria-label={`Delete ${collection.name}`}><Trash2 size={16} /></button>
      </div>
      <div className="collection-post-picker">
        {posts.map((post) => {
          const selected = postIds.includes(post.id);
          return (
            <button className={selected ? 'selected' : ''} onClick={() => setPostIds((current) => selected ? current.filter((id) => id !== post.id) : [...current, post.id])} type="button" key={post.id}>
              <img src={post.image} alt={post.title} /><span>{post.title}</span>{selected && <i><Check size={12} /></i>}
            </button>
          );
        })}
      </div>
      <button className="primary-button full" onClick={() => onSave({ ...collection, name, postIds, cover })} disabled={busy || !name.trim()} type="button"><Save size={16} /> Save collection</button>
    </article>
  );
}

export function CreatorCollectionsManager({ collections, posts, busy, error = '', onCreate, onSave, onDelete }) {
  const [name, setName] = useState('');
  async function create(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim(), posts[0]?.image ?? null);
    setName('');
  }

  return (
    <section className="creator-collections-manager page-stack">
      <section className="collections-manager-hero">
        <Users size={25} />
        <p className="eyebrow">Creator collections</p>
        <h1>Turn your best fits into a destination.</h1>
        <p>Group posts by season, occasion, or aesthetic. Followers are notified when a collection grows.</p>
      </section>
      {error && <div className="inline-notice error">{error}</div>}
      <form className="new-collection-form" onSubmit={create}>
        <label>New collection<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Summer Fits" maxLength={80} /></label>
        <button type="submit" disabled={busy || Boolean(error) || !name.trim()}><Plus size={17} /> Create</button>
      </form>
      <div className="collection-manager-list">
        {!collections.length && <div className="engagement-empty collection-empty"><MoreHorizontal size={22} /><strong>No collections yet</strong><span>Create one above, then choose the fits it should contain.</span></div>}
        {collections.map((collection) => <CollectionEditor collection={collection} posts={posts} onSave={onSave} onDelete={onDelete} busy={busy} key={collection.id} />)}
      </div>
    </section>
  );
}
