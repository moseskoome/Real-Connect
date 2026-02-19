import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, uploadAPI, UPLOADS_BASE } from '../api/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await uploadAPI.media([file]);
      const photoUrl = data.urls[0];
      await usersAPI.updateProfile({ photo: photoUrl });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      await usersAPI.updateProfile({ name, bio });
      await refreshUser();
      setSuccess('Profile updated');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const photoUrl = user?.photo
    ? (user.photo.startsWith('http') ? user.photo : `${UPLOADS_BASE}${user.photo}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`;

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="profile-card">
          <h1>Your Profile</h1>
          <div className="profile-photo-wrap">
            <img src={photoUrl} alt="" />
            <label className="btn-change-photo">
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              Change photo
            </label>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
            {success && <p className="success-msg">{success}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
