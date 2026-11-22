import { useEffect, useMemo, useState } from 'react';
import { ArrowBigDown, ArrowBigUp, ArrowLeft, Bell, Bookmark, ChevronDown, Flame, ImagePlus, Menu, MessageCircle, MoreHorizontal, Plus, Search, Send, Sparkles, X } from 'lucide-react';
import { deleteLocalMedia, getLocalMedia, saveLocalMedia } from './mediaStore';

const starterPosts = [
  { id: 'p1', title: 'What’s your favorite Clippers moment of all time?', body: 'There have been so many memorable moments over the years. Which one do you still think about, and what made it special?', image: '', createdAt: Date.now() - 1000 * 60 * 32, votes: 42, comments: [{ id: 'c1', text: 'The first playoff win at Intuit Dome was an incredible atmosphere.', createdAt: Date.now() - 1000 * 60 * 12 }], author: 'ClipperFan23', flair: 'Clippers History' },
  { id: 'p2', title: 'What do you want to see from the team in the next stretch?', body: 'What should the Clippers focus on most right now: defense, rebounding, ball movement, or something else?', image: '', createdAt: Date.now() - 1000 * 60 * 60 * 5, votes: 28, comments: [{ id: 'c2', text: 'More consistent defense and limiting turnovers would be huge.', createdAt: Date.now() - 1000 * 60 * 60 }], author: 'BoardManGetsPaid', flair: 'Discussion' },
  { id: 'p3', title: 'Who is your all-time favorite Clipper?', body: 'Pick one player and tell us why they stand out to you.', image: '', createdAt: Date.now() - 1000 * 60 * 60 * 27, votes: 19, comments: [], author: 'clipperfaithful', flair: 'Question' },
];

function readPosts() {
  try {
    const saved = localStorage.getItem('clipper-talk-posts');
    return saved ? JSON.parse(saved) : starterPosts;
  } catch { return starterPosts; }
}

function timeAgo(time) {
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function App() {
  const [posts, setPosts] = useState(readPosts);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: '', body: '', image: '', flair: 'Discussion', mediaId: '', mediaType: '' });
  const [upload, setUpload] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => { try { return JSON.parse(localStorage.getItem('clipper-talk-notifications') || '[]'); } catch { return []; } });
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('clipper-talk-name') || 'You');
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { localStorage.setItem('clipper-talk-posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('clipper-talk-notifications', JSON.stringify(notifications)); }, [notifications]);
  const selected = posts.find((post) => post.id === selectedId);
  const visiblePosts = useMemo(() => {
    const matching = posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));
    return [...matching].sort((a, b) => sort === 'popular' ? b.votes - a.votes : b.createdAt - a.createdAt);
  }, [posts, query, sort]);

  function openComposer(post = null) {
    setEditing(post?.id ?? null);
    setDraft(post ? { title: post.title, body: post.body, image: post.image || '', flair: post.flair, mediaId: post.mediaId || '', mediaType: post.mediaType || '' } : { title: '', body: '', image: '', flair: 'Discussion', mediaId: '', mediaType: '' });
    setUpload(null); setUploadError(''); setImageError(false);
    setModal(true);
  }

  async function savePost(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    let mediaId = draft.mediaId;
    let mediaType = draft.mediaType;
    if (upload) {
      try { mediaId = await saveLocalMedia(upload); mediaType = upload.type.startsWith('video/') ? 'video' : 'image'; }
      catch { setUploadError('This browser could not save the selected file. Try a smaller file or use an image URL.'); return; }
    }
    const savedDraft = { ...draft, mediaId, mediaType, title };
    if (editing) {
      const oldPost = posts.find((post) => post.id === editing);
      if (oldPost?.mediaId && oldPost.mediaId !== mediaId) deleteLocalMedia(oldPost.mediaId).catch(() => {});
      setPosts((current) => current.map((post) => post.id === editing ? { ...post, ...savedDraft } : post));
      setNotice('Your post was updated.');
    } else {
      const post = { ...savedDraft, id: crypto.randomUUID(), createdAt: Date.now(), votes: 0, comments: [], author: 'you' };
      setPosts((current) => [post, ...current]);
      setSelectedId(post.id);
      setNotice('Your post is live.');
    }
    setModal(false);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function addComment(event) {
    event.preventDefault();
    const text = comment.trim();
    if (!text || !selected) return;
    const newComment = { id: crypto.randomUUID(), text, createdAt: Date.now(), author: 'you', replies: [] };
    setPosts((current) => current.map((post) => {
      if (post.id !== selected.id) return post;
      if (replyingTo) {
        return { ...post, comments: post.comments.map((item) => item.id === replyingTo ? { ...item, replies: [...(item.replies || []), newComment] } : item) };
      }
      return { ...post, comments: [...post.comments, newComment] };
    }));
    setComment('');
    setReplyingTo(null);
    if (selected.author === 'you') setNotifications((items) => [{ id: crypto.randomUUID(), text: 'Someone replied to your post.', createdAt: Date.now(), read: false }, ...items]);
  }

  function chooseUpload(event) {
    const file = event.target.files?.[0]; setUploadError('');
    if (!file) return;
    if (!(file.type.startsWith('image/') || ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type))) { setUploadError('Choose an image or an MP4, WebM, or MOV video.'); event.target.value = ''; return; }
    if (file.size > 50 * 1024 * 1024) { setUploadError('Files must be 50 MB or smaller.'); event.target.value = ''; return; }
    setUpload(file); setDraft((value) => ({ ...value, image: '', mediaId: '', mediaType: '' })); setImageError(false);
  }

  function beginReply(commentId) {
    setReplyingTo(commentId);
    setComment('');
    requestAnimationFrame(() => document.getElementById('comment-input')?.focus());
  }

  function editComment(commentId, value) {
    const text = value.trim();
    if (!text || !selected) return false;
    setPosts((current) => current.map((post) => {
      if (post.id !== selected.id) return post;
      return { ...post, comments: post.comments.map((item) => {
        if (item.id === commentId) return { ...item, text };
        return { ...item, replies: (item.replies || []).map((reply) => reply.id === commentId ? { ...reply, text } : reply) };
      }) };
    }));
    return true;
  }

  function removePost(id) {
    if (!window.confirm('Delete this post? This can’t be undone.')) return;
    const deleted = posts.find((post) => post.id === id);
    if (deleted?.mediaId) deleteLocalMedia(deleted.mediaId).catch(() => {});
    setPosts((current) => current.filter((post) => post.id !== id));
    setSelectedId(null);
    setNotice('Post deleted.');
    window.setTimeout(() => setNotice(''), 2600);
  }

  function vote(id, amount) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, votes: post.votes + amount } : post));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="icon-button mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
          <button className="brand" onClick={() => setSelectedId(null)} aria-label="Clipper Talk home"><img className="brand-logo" src="/clipper-logo.png" alt="" /><span>clipper talk</span></button>
          <div className="search-wrap"><Search size={18} /><input aria-label="Search posts by title" placeholder="Search conversations" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedId(null); }} /><kbd>⌘ K</kbd></div>
          <div className="top-actions"><div className="popover-anchor"><button className="icon-button notification" aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setAccountOpen(false); }}><Bell size={19} />{notifications.some((item) => !item.read) && <i />}</button>{notificationsOpen && <div className="top-popover"><strong>Notifications</strong><p className="popover-note">Local demo notifications from activity in this browser.</p>{notifications.length ? notifications.slice(0, 5).map((item) => <p className="notification-item" key={item.id}>{item.text}</p>) : <p className="popover-note">You’re all caught up.</p>}<button className="text-action" onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}>Mark all read</button><button className="text-action" onClick={() => setNotifications([{ id: crypto.randomUUID(), text: 'This is a sample notification.', createdAt: Date.now(), read: false }, ...notifications])}>Add sample notification</button></div>}</div><div className="popover-anchor"><button className="avatar" aria-label="Your profile" onClick={() => { setAccountOpen(!accountOpen); setNotificationsOpen(false); }}>{(displayName.trim()[0] || 'Y').toUpperCase()}</button>{accountOpen && <div className="top-popover account-popover"><strong>Account</strong><p className="popover-note">Local demo profile · saved in this browser</p><button className="text-action" onClick={() => { setSelectedId('account'); setAccountOpen(false); }}>View profile</button><button className="text-action" onClick={() => { setSelectedId(null); setAccountOpen(false); }}>Back to home</button></div>}</div><button className="mobile-search icon-button" aria-label="Search"><Search size={19} /></button></div>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="side-label">YOUR SPACE</div>
          <button className={`nav-link ${!selectedId ? 'active' : ''}`} onClick={() => setSelectedId(null)}><span className="nav-glyph">◉</span> Home</button>
          <button className="nav-link" onClick={() => setSort('popular')}><Flame size={18} /> Popular</button>
          <div className="side-divider" />
          <div className="side-heading"><span>YOUR COMMUNITY</span><button aria-label="Create a community"><Plus size={16} /></button></div>
          <button className="community-link"><span className="community-icon"><img src="/clipper-logo.png" alt="" /></span><span>r/ClipperTalk</span></button>
          <div className="sidebar-card"><div className="mini-sparkle"><Sparkles size={16} /></div><strong>Clipper fans, this is your court.</strong><p>Talk game nights, team history, and everything Clippers basketball.</p><button onClick={() => openComposer()}>Create a post <ArrowLeft size={14} /></button></div>
          <div className="sidebar-footer">About · Guidelines · Privacy<br />© 2026 Clipper Talk</div>
        </aside>

        <main className="main-content">
          {selectedId === 'account' ? <section className="account-page"><span className="eyebrow muted-eyebrow">YOUR ACCOUNT</span><h1>Your profile</h1><p className="popover-note">This is a local demo profile. Sign-in and shared accounts need a backend.</p><label className="field-label">Display name<input value={displayName} onChange={(event) => { setDisplayName(event.target.value); localStorage.setItem('clipper-talk-name', event.target.value); }} /></label><h2>Your posts</h2>{posts.filter((post) => post.author === 'you').map((post) => <div className="account-post" key={post.id}><button className="feed-title" onClick={() => setSelectedId(post.id)}>{post.title}</button><button className="text-action" onClick={() => openComposer(post)}>Edit</button><button className="text-action danger" onClick={() => removePost(post.id)}>Delete</button></div>)}{!posts.some((post) => post.author === 'you') && <p>You haven’t posted yet.</p>}</section> : selected ? (
            <>
              <button className="back-link" onClick={() => setSelectedId(null)}><ArrowLeft size={16} /> Back to home</button>
              <article className="detail-card">
                <div className="post-meta"><span className="community-dot"><img src="/clipper-logo.png" alt="" /></span><b>r/ClipperTalk</b><span>·</span><span>u/{selected.author === 'you' ? (displayName || 'You') : selected.author}</span><span>·</span><span>{timeAgo(selected.createdAt)}</span><button className="more-button" aria-label="More options"><MoreHorizontal size={20} /></button></div>
                <span className="flair">{selected.flair}</span>
                <h1>{selected.title}</h1>
                {selected.body && <p className="detail-body">{selected.body}</p>}
                {(selected.image || selected.mediaId) && <AttachedMedia post={selected} />}
                <div className="post-toolbar detail-toolbar"><VoteControl votes={selected.votes} onVote={(amount) => vote(selected.id, amount)} /><button className="toolbar-pill"><MessageCircle size={17} /> {selected.comments.length} comments</button><button className="toolbar-pill save"><Bookmark size={16} /> Save</button><span className="toolbar-spacer" />{selected.author === 'you' && <><button className="text-action" onClick={() => openComposer(selected)}>Edit</button><button className="text-action danger" onClick={() => removePost(selected.id)}>Delete</button></>}</div>
              </article>
              <section className="comments-section"><div className="section-title"><h2>Comments</h2><span>{selected.comments.length}</span></div><form className="comment-box" onSubmit={addComment}><div className="avatar small-avatar">Y</div><div className="comment-input-wrap">{replyingTo && <div className="replying-indicator">Replying to a comment <button type="button" onClick={() => { setReplyingTo(null); setComment(''); }}>Cancel</button></div>}<textarea id="comment-input" placeholder={replyingTo ? 'Write your reply…' : 'Add to the conversation…'} rows="2" value={comment} onChange={(event) => setComment(event.target.value)} /><div className="comment-submit-row"><span>Be kind. Keep it thoughtful.</span><button className="send-button" disabled={!comment.trim()}><Send size={15} /> {replyingTo ? 'Reply' : 'Comment'}</button></div></div></form>
                {selected.comments.length ? <div className="comment-list">{[...selected.comments].reverse().map((item) => <div className="comment-item" key={item.id}><CommentEntry item={item} onSave={editComment} onReply={beginReply} />{item.replies?.length > 0 && <div className="comment-replies">{item.replies.map((reply) => <div className="reply-item" key={reply.id}><CommentEntry item={reply} isReply onSave={editComment} onReply={beginReply} /></div>)}</div>}</div>)}</div> : <div className="empty-comments"><MessageCircle size={20} /><strongNoComments /></div>}
              </section>
            </>
          ) : (
            <>
              <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow"><Sparkles size={13} /> THE CLIPPERS COMMUNITY</span><h1>Clipper fans.<br /><em>One court.</em></h1><p>Talk game nights, team history, and everything Clippers basketball.</p><button className="primary-button" onClick={() => openComposer()}><Plus size={17} /> Start a conversation</button></div></section>
              <div className="feed-header"><div><span className="eyebrow muted-eyebrow">CLIPPER TALK</span><h2>{query ? 'Search results' : 'Community posts'}</h2></div><label className="sort-select"><span>{sort === 'new' ? 'Newest' : 'Most popular'}</span><ChevronDown size={16} /><select aria-label="Sort posts" value={sort} onChange={(event) => setSort(event.target.value)}><option value="new">Newest</option><option value="popular">Most popular</option></select></label></div>
              <div className="feed-list">{visiblePosts.map((post, index) => <article className="feed-card" key={post.id} style={{ '--delay': `${index * 55}ms` }}><div className="feed-card-main"><div className="post-meta"><span>Posted {timeAgo(post.createdAt)}</span></div><button className="feed-title" onClick={() => setSelectedId(post.id)}>{post.title}</button>{post.author === 'you' && <button className="text-action feed-edit" onClick={() => openComposer(post)}>Edit</button>}</div><div className="feed-vote"><button aria-label="Upvote" onClick={() => vote(post.id, 1)}><ArrowBigUp size={21} /></button><b>{post.votes}</b></div></article>)}
                {!visiblePosts.length && <div className="empty-feed"><div className="empty-icon"><Search size={22} /></div><h3>No conversations found</h3><p>Try another search, or start a new conversation.</p><button className="primary-button" onClick={() => openComposer()}><Plus size={16} /> Create a post</button></div>}
              </div>
            </>
          )}
        </main>
        <aside className="right-rail"><div className="community-panel"><div className="panel-cover"><div className="cover-spark">✦</div></div><div className="panel-content"><div className="panel-icon"><img src="/clipper-logo.png" alt="" /></div><h3>r/ClipperTalk</h3><p>A fan community for Clippers basketball. Bring your takes, questions, and favorite team memories.</p><div className="community-stats"><div><b>{posts.length + 128}</b><span>members</span></div><div><b>24</b><span>here now</span></div></div><button className="join-button">Joined <span>✓</span></button></div></div><div className="rail-card"><div className="rail-card-title"><span>COMMUNITY NOTES</span><MoreHorizontal size={18} /></div><p><span className="note-icon">✦</span> Debate the game, respect the fans.</p><div className="note-divider" /><p><span className="note-icon">♡</span> Keep it welcoming for every Clipper fan.</p><button className="guidelines-link">Read our guidelines <ArrowLeft size={14} /></button></div><div className="rail-footer">Content Policy &nbsp; Terms &nbsp; Help<br />Clipper Talk community forum</div></aside>
      </div>
      {notice && <div className="toast"><span>✓</span>{notice}</div>}
      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><form className="composer-modal" onSubmit={savePost}><div className="modal-top"><div><span className="eyebrow muted-eyebrow">R/CLIPPERTALK</span><h2>{editing ? 'Edit your post' : 'Start a conversation'}</h2></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Close"><X size={20} /></button></div><label className="field-label">Title <span>Required</span><input autoFocus maxLength="140" placeholder="What’s on your mind about the Clippers?" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label><label className="field-label">Your thoughts <span>Optional</span><textarea rows="5" placeholder="Share your take, ask a question, or talk about the game…" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></label><label className="field-label">Image URL <span>Optional · direct image link</span><div className="input-with-icon"><ImagePlus size={17} /><input type="url" placeholder="https://example.com/photo.jpg" value={draft.image} onChange={(event) => { setDraft({ ...draft, image: event.target.value, mediaId: '', mediaType: '' }); setUpload(null); setImageError(false); }} /></div></label>{draft.image && <div className="url-preview"><img src={draft.image} alt="Image URL preview" onError={() => setImageError(true)} onLoad={() => setImageError(false)} />{imageError && <span>Couldn’t load this URL as an image. Use a direct .jpg/.png/.webp image link, or upload a file below.</span>}</div>}<label className="field-label">Or upload a photo/video <span>50 MB max · this browser only</span><input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={chooseUpload} />{upload && <span className="upload-name">Selected: {upload.name}</span>}</label>{uploadError && <p className="upload-error">{uploadError}</p>}<p className="popover-note">Uploaded media is saved on this device. Other people won’t see it until a shared backend/storage service is connected.</p><label className="field-label">Topic tag<select value={draft.flair} onChange={(event) => setDraft({ ...draft, flair: event.target.value })}><option>Discussion</option><option>Question</option><option>Game Talk</option><option>Clippers History</option><option>News</option></select></label><div className="modal-actions"><span>Your post will appear in the community feed.</span><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" disabled={!draft.title.trim()}>{editing ? 'Save changes' : 'Publish post'}</button></div></form></div>}
    </div>
  );
}

function VoteControl({ votes, onVote }) {
  return <div className="vote-control"><button aria-label="Upvote" onClick={() => onVote(1)}><ArrowBigUp size={20} /></button><b>{votes}</b><button aria-label="Downvote" onClick={() => onVote(-1)}><ArrowBigDown size={20} /></button></div>;
}

function CommentEntry({ item, isReply = false, onSave, onReply }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.text);
  useEffect(() => setValue(item.text), [item.text]);
  function submitEdit(event) {
    event.preventDefault();
    if (onSave(item.id, value)) setEditing(false);
  }
  return <div className={isReply ? 'reply-content' : 'comment-content'}>
    <div className="comment-author">{item.author || 'community member'} <span>· {timeAgo(item.createdAt)}</span></div>
    {editing ? <form className="comment-edit-form" onSubmit={submitEdit}><textarea aria-label="Edit comment" rows="3" value={value} onChange={(event) => setValue(event.target.value)} autoFocus /><div><button type="button" className="text-action" onClick={() => { setValue(item.text); setEditing(false); }}>Cancel</button><button className="text-action" disabled={!value.trim()}>Save edit</button></div></form> : <p>{item.text}</p>}
    {!editing && <div className="comment-controls">{!isReply && <button type="button" onClick={() => onReply(item.id)}><MessageCircle size={14} /> Reply</button>}{item.author === 'you' && <button type="button" onClick={() => setEditing(true)}>Edit</button>}</div>}
  </div>;
}

function AttachedMedia({ post }) {
  const [fileUrl, setFileUrl] = useState('');
  useEffect(() => { let active = true; let url = ''; if (post.mediaId) getLocalMedia(post.mediaId).then((file) => { if (file && active) { url = URL.createObjectURL(file); setFileUrl(url); } }).catch(() => {}); return () => { active = false; if (url) URL.revokeObjectURL(url); }; }, [post.mediaId]);
  const src = fileUrl || post.image;
  if (!src) return null;
  if (post.mediaType === 'video' && fileUrl) return <video className="post-image" src={src} controls preload="metadata" />;
  return <img className="post-image" src={src} alt="Attached to this post" onError={(event) => { event.currentTarget.style.display = 'none'; }} />;
}

function StrongNoComments() {
  return <><strong>Start the conversation</strong><p>Be the first to share a thought.</p></>;
}
