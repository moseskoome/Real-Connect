import { useState } from 'react';
import { postsAPI, uploadAPI } from '../api/api';

export default function CreatePost({ onPostCreated }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (type === 'image') setImages((p) => [...p, ...files]);
    else setVideos((p) => [...p, ...files]);
  };

  const removeFile = (type, idx) => {
    if (type === 'image') setImages((p) => p.filter((_, i) => i !== idx));
    else setVideos((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0 && videos.length === 0) return;
    setLoading(true);
    setError('');
    try {
      let imageUrls = [];
      let videoUrls = [];
      const allFiles = [...images, ...videos];
      if (allFiles.length > 0) {
        const { data } = await uploadAPI.media(allFiles);
        const urls = data.urls;
        imageUrls = urls.slice(0, images.length);
        videoUrls = urls.slice(images.length);
      }
      await postsAPI.create({
        text: text.trim(),
        images: imageUrls,
        videos: videoUrls,
      });
      setText('');
      setImages([]);
      setVideos([]);
      onPostCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share something with your connections..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div className="create-post-media">
          {images.map((f, i) => (
            <span key={i} className="media-preview">
              <img src={URL.createObjectURL(f)} alt="" />
              <button type="button" onClick={() => removeFile('image', i)}>x</button>
            </span>
          ))}
          {videos.map((f, i) => (
            <span key={i} className="media-preview">
              <span>Video: {f.name}</span>
              <button type="button" onClick={() => removeFile('video', i)}>x</button>
            </span>
          ))}
        </div>
        <div className="create-post-actions">
          <label className="btn-attach">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'image')}
              hidden
            />
            Images
          </label>
          <label className="btn-attach">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleFileChange(e, 'video')}
              hidden
            />
            Videos
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
