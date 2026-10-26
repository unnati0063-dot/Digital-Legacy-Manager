import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.slice(0, 5));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  return (
    <nav className="app-navbar">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="search-box">
        <i className="bi bi-search search-icon"></i>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Global vault search (documents, family, assets, contacts)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification bell */}
        <div className="position-relative">
          <button
            className="btn btn-light rounded-circle position-relative p-2"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <i className="bi bi-bell text-secondary fs-6"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div
              className="card-modern position-absolute end-0 mt-2 shadow-lg"
              style={{ width: '320px', zIndex: 1050 }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light rounded-top">
                <span className="fw-bold small text-dark">Notifications</span>
                <Link
                  to="/notifications"
                  className="small text-primary text-decoration-none"
                  onClick={() => setShowNotifications(false)}
                >
                  View All
                </Link>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No notifications</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 px-3 border-bottom small ${
                        item.status === 'UNREAD' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="fw-semibold text-dark">{item.title}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
                        {item.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile link */}
        <Link
          to="/profile"
          className="text-decoration-none d-flex align-items-center gap-2 p-1 px-2 rounded-3 hover-bg"
        >
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="fw-semibold small text-dark d-none d-md-inline">
            {user?.fullName || 'User Profile'}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
