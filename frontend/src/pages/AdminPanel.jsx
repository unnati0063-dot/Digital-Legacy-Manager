import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'logs') fetchAuditLogs();
    else if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  const fetchStats = async () => {
    try { setLoading(true); const r = await api.get('/api/admin/stats'); setStats(r.data.data || r.data); }
    catch { setError('Failed to load statistics.'); } finally { setLoading(false); }
  };
  const fetchUsers = async () => {
    try { setLoading(true); const r = await api.get('/api/admin/users'); setUsers(r.data.data || r.data || []); }
    catch { setError('Failed to load users.'); } finally { setLoading(false); }
  };
  const fetchAuditLogs = async () => {
    try { setLoading(true); const r = await api.get('/api/admin/audit-logs?page=0&size=50'); setAuditLogs(r.data.data?.content || r.data?.content || r.data || []); }
    catch { setError('Failed to load audit logs.'); } finally { setLoading(false); }
  };
  const fetchCategories = async () => {
    try { setLoading(true); const r = await api.get('/api/admin/categories'); setCategories(r.data.data || r.data || []); }
    catch { setError('Failed to load categories.'); } finally { setLoading(false); }
  };

  const toggleUser = async (user) => {
    const currentlyEnabled = user.isEnabled !== false && user.enabled !== false;
    const action = currentlyEnabled ? 'disable' : 'enable';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user ${user.username}?`)) return;
    try {
      await api.put(`/api/admin/users/${user.id}/status`, { isEnabled: !currentlyEnabled });
      setSuccess(`User ${action}d successfully.`);
      fetchUsers();
    } catch { setError(`Failed to ${action} user.`); }
  };

  const handleAddCategory = async e => {
    e.preventDefault();
    if (!catForm.name.trim()) { setError('Category name is required.'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/categories', catForm);
      setSuccess('Category added.');
      setShowCatModal(false);
      setCatForm({ name: '', description: '' });
      fetchCategories();
    } catch (e) { setError(e.response?.data?.message || 'Failed to add category.'); }
    finally { setSubmitting(false); }
  };

  const actionColors = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', LOGIN: 'primary', LOGOUT: 'secondary', DOWNLOAD: 'info' };
  const getAC = a => actionColors[a?.toUpperCase()] || 'secondary';

  const TabBtn = ({ id, label, icon }) => (
    <li className="nav-item">
      <button
        className={`nav-link ${activeTab === id ? 'active' : ''}`}
        onClick={() => setActiveTab(id)}
      >
        <i className={`bi ${icon} me-2`}></i>{label}
      </button>
    </li>
  );

  const StatBox = ({ label, value, icon, color = 'primary' }) => (
    <div className="col-md-3 col-6">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `var(--bs-${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`bi ${icon} text-white fs-5`}></i>
          </div>
          <div>
            <div className="h4 fw-bold mb-0">{value ?? '—'}</div>
            <div className="text-muted small">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item text-muted">Dashboard</li>
            <li className="breadcrumb-item active">Admin Panel</li>
          </ol>
        </nav>
        <h2 className="mb-0 fw-bold"><i className="bi bi-gear-fill text-primary me-2"></i>Admin Panel</h2>
        <p className="text-muted mb-0">System administration and management</p>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white p-0">
          <ul className="nav nav-tabs card-header-tabs px-3">
            <TabBtn id="stats" label="Statistics" icon="bi-bar-chart" />
            <TabBtn id="users" label="Users" icon="bi-people" />
            <TabBtn id="logs" label="Audit Logs" icon="bi-clock-history" />
            <TabBtn id="categories" label="Categories" icon="bi-tags" />
          </ul>
        </div>
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <>
              {/* STATISTICS */}
              {activeTab === 'stats' && (
                <div>
                  <h6 className="fw-bold mb-3">System Overview</h6>
                  <div className="row g-3">
                    <StatBox label="Total Users" value={stats?.totalUsers} icon="bi-people" color="primary" />
                    <StatBox label="Total Documents" value={stats?.totalDocuments} icon="bi-file-earmark-text" color="info" />
                    <StatBox label="Total Assets" value={stats?.totalAssets} icon="bi-building" color="success" />
                    <StatBox label="Family Members" value={stats?.totalFamilyMembers} icon="bi-person-heart" color="warning" />
                    <StatBox label="Active Users" value={stats?.activeUsers} icon="bi-person-check" color="success" />
                    <StatBox label="Contacts" value={stats?.totalContacts} icon="bi-person-lines-fill" color="secondary" />
                    <StatBox label="Insurance Policies" value={stats?.totalInsurance} icon="bi-shield-check" color="info" />
                    <StatBox label="Digital Accounts" value={stats?.totalDigitalAccounts} icon="bi-globe" color="primary" />
                  </div>
                </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <div>
                  <h6 className="fw-bold mb-3">User Management</h6>
                  {users.length === 0 ? (
                    <p className="text-muted">No users found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th className="text-end">Actions</th></tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id}>
                              <td className="fw-medium font-monospace">{user.username}</td>
                              <td>{user.fullName || '—'}</td>
                              <td className="text-muted small">{user.email}</td>
                              <td>
                                <span className={`badge bg-${user.roles?.includes('ROLE_ADMIN') ? 'danger' : 'secondary'}`}>
                                  {user.roles?.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge bg-${user.isEnabled !== false ? 'success' : 'danger'}`}>
                                  {user.isEnabled !== false ? 'Active' : 'Disabled'}
                                </span>
                              </td>
                              <td className="text-muted small">
                                {user.createdAt && new Date(user.createdAt).toLocaleDateString('en-IN')}
                              </td>
                              <td>
                                <div className="d-flex gap-1 justify-content-end">
                                  <button
                                    className={`btn btn-sm btn-outline-${user.isEnabled !== false ? 'warning' : 'success'}`}
                                    onClick={() => toggleUser(user)}
                                  >
                                    <i className={`bi bi-${user.isEnabled !== false ? 'person-x' : 'person-check'}`}></i>
                                    {user.isEnabled !== false ? ' Disable' : ' Enable'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div>
                  <h6 className="fw-bold mb-3">Recent Activity (All Users)</h6>
                  {auditLogs.length === 0 ? (
                    <p className="text-muted">No audit logs found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr><th>User</th><th>Action</th><th>Section</th><th>Description</th><th>Date & Time</th></tr>
                        </thead>
                        <tbody>
                          {auditLogs.map(log => (
                            <tr key={log.id}>
                              <td className="fw-medium small">{log.username || '—'}</td>
                              <td><span className={`badge bg-${getAC(log.action)}`}>{log.action}</span></td>
                              <td className="small">{log.entityType || '—'}</td>
                              <td className="text-muted small">{log.description?.substring(0, 60) || '—'}</td>
                              <td className="text-muted small">{log.createdAt && new Date(log.createdAt).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* CATEGORIES */}
              {activeTab === 'categories' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Document Categories</h6>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCatModal(true)}>
                      <i className="bi bi-plus-lg me-2"></i>Add Category
                    </button>
                  </div>
                  {categories.length === 0 ? (
                    <p className="text-muted">No categories found.</p>
                  ) : (
                    <div className="row g-3">
                      {categories.map(cat => (
                        <div key={cat.id} className="col-md-4">
                          <div className="card border shadow-sm">
                            <div className="card-body py-2 px-3">
                              <div className="fw-medium">{cat.name}</div>
                              {cat.description && <div className="text-muted small">{cat.description}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Add Document Category">
        <form onSubmit={handleAddCategory}>
          <div className="mb-3">
            <label className="form-label fw-medium">Category Name <span className="text-danger">*</span></label>
            <input className="form-control" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Medical Records" required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Description</label>
            <textarea className="form-control" rows={2} value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}></textarea>
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-light" onClick={() => setShowCatModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
