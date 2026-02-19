import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/feed" className="navbar-brand">RealConnect</Link>
      <div className="navbar-links">
        <Link to="/feed">Feed</Link>
        <Link to="/connections">Connections</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} className="btn-logout">Log out</button>
      </div>
    </nav>
  );
}
