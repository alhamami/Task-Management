import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">
          Task Manager
        </Link>
        
        {user && (
          <nav className="nav-links">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>
              Tasks
            </Link>
          </nav>
        )}
        
        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <span className="username">Welcome, {user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                Login
              </Link>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 