import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, postsAPI, UPLOADS_BASE } from '../api/api';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await usersAPI.getUser(id);
        setProfile(data);
        const postsRes = await postsAPI.getByUser(id);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleConnect = async () => {
    try {
      await usersAPI.connect(id);
      setProfile((p) => ({ ...p, isConnected: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await usersAPI.disconnect(id);
      setProfile((p) => ({ ...p, isConnected: false }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <main className="profile-page"><p>Loading...</p></main>
      </>
    );
  }

  const photoUrl = profile.photo
    ? (profile.photo.startsWith('http') ? profile.photo : `${UPLOADS_BASE}${profile.photo}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`;

  const isOwnProfile = user?.id === id;

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="profile-card user-profile-card">
          <img src={photoUrl} alt="" className="profile-photo-large" />
          <h1>{profile.name}</h1>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          {!isOwnProfile && (
            <button
              className={profile.isConnected ? 'btn-disconnect' : 'btn-connect'}
              onClick={profile.isConnected ? handleDisconnect : handleConnect}
            >
              {profile.isConnected ? 'Disconnect' : 'Connect'}
            </button>
          )}
          {isOwnProfile && (
            <Link to="/profile" className="btn-edit">Edit profile</Link>
          )}
        </div>
        <section className="user-posts">
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={(updated) => {
                  if (updated) {
                    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
                  } else {
                    setPosts((prev) => prev.filter((p) => p._id !== post._id));
                  }
                }}
              />
            ))
          )}
        </section>
      </main>
    </>
  );
}
