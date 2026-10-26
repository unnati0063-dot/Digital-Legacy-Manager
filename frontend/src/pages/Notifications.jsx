import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      setNotifications(res.data.data || res.data || []);
    } catch { setError('Failed to load notifications.'); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await api.put(`/api/notifications/${id}/read`); fetchNotifications(); }
    catch { setError('Failed to mark as read.'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setSuccess('All notifications marked as read.');
      fetchNotifications();
    } catch { setError('Failed to mark all as read.'); }
  };

  const typeColors = {
    EXPIRY_WARNING: 'warning',
    EXPIRY_ALERT: 'danger',
    INFO: 'info',
    SUCCESS: 'success',
    SYSTEM: 'secondary'
  };
  const typeIcons = {
    EXPIRY_WARNING: 'bi-exclamation-triangle',
    EXPIRY_ALERT: 'bi-x-circle',
    INFO: 'bi-info-circle',
    SUCCESS: 'bi-check-circle',
    SYSTEM: 'bi-gear'
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item text-muted">Dashboard</li>
              <li className="breadcrumb-item active">Notifications</li>
            </ol>
          </nav>
          <h2 className="mb-0 fw-bold">
            <i className="bi bi-bell-fill text-primary me-2"></i>
            Notifications
            {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}
          </h2>
          <p className="text-muted mb-0">Document expiry alerts and system notifications</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline-primary" onClick={markAllRead}>
            <i className="bi bi-check-all me-2"></i>Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-circle me-2"></i>{error}
          <button className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible">
          <i className="bi bi-check-circle me-2"></i>{success}
          <button className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="btn-group">
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('all')}>
              All ({notifications.length})
            </button>
            <button className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('unread')}>
              Unread ({unreadCount})
            </button>
            <button className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('read')}>
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bell-slash display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No notifications found.</h5>
          <p className="text-muted small">Document expiry alerts will appear here automatically.</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          {filtered.map((n, idx) => (
            <div
              key={n.id}
              className={`p-3 d-flex align-items-start gap-3 ${!n.isRead ? 'bg-primary bg-opacity-5' : ''} ${idx < filtered.length - 1 ? 'border-bottom' : ''}`}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '40px', height: '40px',
                  background: `var(--bs-${typeColors[n.type] || 'secondary'})`,
                  opacity: 0.15
                }}
              ></div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 position-absolute"
                style={{
                  width: '40px', height: '40px',
                  background: 'transparent'
                }}
              >
                <i className={`bi ${typeIcons[n.type] || 'bi-bell'} text-${typeColors[n.type] || 'secondary'}`} style={{ position: 'absolute', left: '12px', marginTop: '2px' }}></i>
              </div>
              <div className="flex-grow-1" style={{ marginLeft: '8px' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-medium">{n.title}</span>
                  {!n.isRead && (
                    <span
                      className="rounded-circle bg-primary"
                      style={{ width: '8px', height: '8px', display: 'inline-block', flexShrink: 0 }}
                    ></span>
                  )}
                  <span className={`badge bg-${typeColors[n.type] || 'secondary'} ms-auto`}>
                    {n.type?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-muted small mb-1">{n.message}</p>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {n.createdAt && new Date(n.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              {!n.isRead && (
                <button
                  className="btn btn-sm btn-outline-secondary flex-shrink-0"
                  onClick={() => markRead(n.id)}
                  title="Mark as read"
                >
                  <i className="bi bi-check"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
