import { useState, useEffect } from 'react';
import { postsAPI } from '../api/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data } = await postsAPI.getAll();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Navbar />
      <main className="feed-page">
        <CreatePost onPostCreated={fetchPosts} />
        <div className="posts-list">
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="empty-state">No posts yet. Share something or connect with more people!</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={(updated) => {
                if (typeof updated === 'function') return;
                if (updated) {
                  setPosts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
                } else {
                  setPosts((prev) => prev.filter((p) => p._id !== post._id));
                }
              }} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
