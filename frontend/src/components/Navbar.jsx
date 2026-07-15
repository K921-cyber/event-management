import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="navbar">
      <Link to="/" className="brand">
        EventFlow
      </Link>
      <nav>
        <Link to="/">Browse</Link>
        {user && (
          <>
            <Link to="/my-tickets" className="hide-mobile">My Tickets</Link>
            {['organizer', 'admin'].includes(user.role) && (
              <>
                <Link to="/organizer">Dashboard</Link>
                <Link to="/organizer/checkin">Check-in</Link>
              </>
            )}
          </>
        )}
        {!user ? (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="nav-btn-primary">Sign up</Link>
          </>
        ) : (
          <>
            <span className="badge">{user.role}</span>
            <button className="link" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
