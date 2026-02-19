import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, UPLOADS_BASE } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isAuthor = user?.id === post.author?._id || user?.id === post.author;
  const fullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = UPLOADS_BASE || window.location.origin;
    return `${base}${path}`;
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const { data } = await postsAPI.comment(post._id, commentText);
      onUpdate?.(data);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data } = await postsAPI.share(post._id);
      onUpdate?.(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(post._id);
      onUpdate?.();
    } catch (err) {
      console.error(err);
    }
  };

  const author = post.author;
  const content = post.content || {};
  const comments = post.comments || [];
  const sharedByMe = post.shares?.some((s) => (s.user?._id || s.user) === user?.id);

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/user/${author?._id || author}`} className="post-author">
          <img
            src={fullUrl(author?.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || '?')}`}
            alt=""
          />
          <span>{author?.name || 'Unknown'}</span>
        </Link>
        {isAuthor && (
          <button className="btn-delete-post" onClick={handleDelete}>Delete</button>
        )}
      </div>
      {content.text && <p className="post-text">{content.text}</p>}
      <div className="post-media">
        {content.images?.map((url, i) => (
          <img key={i} src={fullUrl(url)} alt="" />
        ))}
        {content.videos?.map((url, i) => (
          <video key={i} src={fullUrl(url)} controls />
        ))}
      </div>
      <div className="post-actions">
        <button
          className={sharedByMe ? 'active' : ''}
          onClick={handleShare}
          disabled={loading}
        >
          ↗ Share {post.shareCount > 0 && `(${post.shareCount})`}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 Comment {post.commentCount > 0 && `(${post.commentCount})`}
        </button>
      </div>
      {showComments && (
        <div className="post-comments">
          <form onSubmit={handleComment}>
            <input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={loading}>Post</button>
          </form>
          <ul>
            {comments.map((c, i) => (
              <li key={i}>
                <Link to={`/user/${c.user?._id || c.user}`}>
                  {c.user?.name || 'User'}
                </Link>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
