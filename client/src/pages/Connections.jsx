import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, UPLOADS_BASE } from '../api/api';
import Navbar from '../components/Navbar';

export default function Connections() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data } = await usersAPI.search(search);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetId) => {
    try {
      await usersAPI.connect(targetId);
      setResults((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, isConnected: true } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async (targetId) => {
    try {
      await usersAPI.disconnect(targetId);
      setResults((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, isConnected: false } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const connections = user?.connections || [];

  return (
    <>
      <Navbar />
      <main className="connections-page">
        <div className="search-section">
          <h2>Find people</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>Search</button>
          </div>
        </div>
        <div className="connections-grid">
          <section>
            <h3>Your connections ({connections.length})</h3>
            {connections.length === 0 ? (
              <p>No connections yet. Search for people above.</p>
            ) : (
              <div className="user-cards">
                {connections.map((u) => (
                  <Link key={u._id} to={`/user/${u._id}`} className="user-card">
                    <img
                      src={
                        u.photo
                          ? (u.photo.startsWith('http') ? u.photo : `${UPLOADS_BASE}${u.photo}`)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`
                      }
                      alt=""
                    />
                    <span>{u.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section>
            <h3>Search results</h3>
            {results.length === 0 && !loading ? (
              <p>Search by name or phone to find people.</p>
            ) : (
              <div className="user-cards">
                {results.map((u) => (
                  <div key={u._id} className="user-card">
                    <Link to={`/user/${u._id}`}>
                      <img
                        src={
                          u.photo
                            ? (u.photo.startsWith('http') ? u.photo : `${UPLOADS_BASE}${u.photo}`)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`
                        }
                        alt=""
                      />
                      <span>{u.name}</span>
                    </Link>
                    <button
                      className={u.isConnected ? 'btn-disconnect' : 'btn-connect'}
                      onClick={() =>
                        u.isConnected ? handleDisconnect(u._id) : handleConnect(u._id)
                      }
                    >
                      {u.isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
