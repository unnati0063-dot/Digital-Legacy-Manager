import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/audit-logs?page=${page}&size=20`);
      const data = res.data.data || res.data || [];
      if (data.content) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 0);
      } else {
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch { setError('Failed to load audit logs.'); }
    finally { setLoading(false); }
  };

  const actionColors = {
    CREATE: 'success', UPDATE: 'warning', DELETE: 'danger',
    LOGIN: 'primary', LOGOUT: 'secondary', DOWNLOAD: 'info',
    VIEW: 'light', UPLOAD: 'primary'
  };
  const getColor = action => actionColors[action?.toUpperCase()] || 'secondary';

  const filtered = logs.filter(l =>
    !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item text-muted">Dashboard</li>
              <li className="breadcrumb-item active">Audit Logs</li>
            </ol>
          </nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-clock-history text-primary me-2"></i>Audit Logs</h2>
          <p className="text-muted mb-0">Track all activity and changes in your vault</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>{error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
            <input
              className="form-control"
              placeholder="Search by action, section, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-clock-history display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No activity logs found.</h5>
          <p className="text-muted small">Your actions — login, uploads, edits — will appear here.</p>
        </div>
      ) : (
        <>
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Action</th>
                    <th>Section</th>
                    <th>Description</th>
                    <th>IP Address</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span className={`badge bg-${getColor(log.action)} ${getColor(log.action) === 'light' ? 'text-dark' : ''}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="small fw-medium">{log.entityType || '-'}</td>
                      <td className="text-muted small">{log.description || '-'}</td>
                      <td className="font-monospace small">{log.ipAddress || '-'}</td>
                      <td className="text-muted small">
                        {log.createdAt && new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <span className="btn btn-light btn-sm">Page {page + 1} of {totalPages}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
