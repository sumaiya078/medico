import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'patient':
        return <Link to="/patient">Patient Dashboard</Link>;
      case 'doctor':
        return <Link to="/doctor">Doctor Dashboard</Link>;
      case 'admin':
        return <Link to="/admin">Admin Dashboard</Link>;
      default:
        return null;
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">HealthCare Booking</Link>
        </div>
        
        <nav className="main-nav">
          {isAuthenticated ? (
            <div className="auth-links">
              {getDashboardLink()}
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;