import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar shadow-sm">
      <div className="sidebar-header">
        <div className="brand-icon">
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <div>
          <div className="brand-title">Legacy Manager</div>
          <div className="brand-subtitle">Digital Vault</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2"></i>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section-title">Personal & Family</div>

        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-badge"></i>
          <span>My Profile</span>
        </NavLink>

        <NavLink to="/family-members" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people"></i>
          <span>Family Members</span>
        </NavLink>

        <div className="nav-section-title">Documents Vault</div>

        <NavLink to="/government-documents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-file-earmark-person"></i>
          <span>Govt Documents</span>
        </NavLink>

        <NavLink to="/personal-documents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-folder2-open"></i>
          <span>Personal Documents</span>
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-search"></i>
          <span>Document Search</span>
        </NavLink>

        <div className="nav-section-title">Assets & Wealth</div>

        <NavLink to="/assets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-houses"></i>
          <span>Assets & Property</span>
        </NavLink>

        <NavLink to="/financial" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bank"></i>
          <span>Financial Accounts</span>
        </NavLink>

        <NavLink to="/insurance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-shield-check"></i>
          <span>Insurance Policies</span>
        </NavLink>

        <div className="nav-section-title">Emergency & Directives</div>

        <NavLink to="/medical" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-heart-pulse"></i>
          <span>Medical & Emergency</span>
        </NavLink>

        <NavLink to="/digital-accounts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-key"></i>
          <span>Digital Accounts</span>
        </NavLink>

        <NavLink to="/contacts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-lines-fill"></i>
          <span>Important Contacts</span>
        </NavLink>

        <NavLink to="/legacy-instructions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-journal-text"></i>
          <span>Legacy Instructions</span>
        </NavLink>

        <NavLink to="/important-info" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-info-circle"></i>
          <span>Important Info</span>
        </NavLink>

        <div className="nav-section-title">Security & Sharing</div>

        <NavLink to="/family-access" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-share"></i>
          <span>Access Management</span>
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bell"></i>
          <span className="flex-grow-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge bg-danger rounded-pill px-2">{unreadCount}</span>
          )}
        </NavLink>

        <NavLink to="/audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-clock-history"></i>
          <span>Audit Logs</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-section-title text-primary">System Administration</div>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-shield-shaded text-primary"></i>
              <span className="text-primary fw-bold">Admin Panel</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '36px', height: '36px', minWidth: '36px', fontSize: '0.85rem' }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-truncate">
              <div className="fw-semibold text-dark small text-truncate">{user?.fullName || 'User'}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Vault Owner'}
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-danger p-1 rounded-2"
            title="Sign Out"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
