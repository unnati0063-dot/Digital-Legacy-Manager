import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const SECTIONS = [
  'Government Documents', 'Personal Documents', 'Family Members',
  'Assets & Property', 'Bank & Financial', 'Insurance',
  'Medical & Emergency', 'Digital Accounts', 'Contacts',
  'Legacy Instructions', 'Important Information'
];
const PERMISSIONS = ['View', 'Upload', 'Edit', 'Download', 'No Access'];

const defaultInviteForm = {
  familyMemberName: '',
  familyMemberEmail: '',
  relationship: '',
  permissions: {}
};

export default function FamilyAccess() {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [inviteForm, setInviteForm] = useState(defaultInviteForm);
  const [editPermissions, setEditPermissions] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAccessList(); }, []);

  const fetchAccessList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/family-access');
      setAccessList(res.data.data || res.data || []);
    } catch { setError('Failed to load family access list.'); }
    finally { setLoading(false); }
  };

  const handleInviteChange = e => setInviteForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleInvite = async e => {
    e.preventDefault();
    if (!inviteForm.familyMemberEmail.trim()) { setError('Email is required.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post('/api/family-access/invite', inviteForm);
      setSuccess('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm(defaultInviteForm);
      fetchAccessList();
    } catch (e) { setError(e.response?.data?.message || 'Failed to send invitation.'); }
    finally { setSubmitting(false); }
  };

  const handleUpdatePermissions = async (accessId) => {
    setSubmitting(true); setError('');
    try {
      await api.put(`/api/family-access/${accessId}`, { permissions: editPermissions });
      setSuccess('Permissions updated.');
      setShowEditModal(null);
      fetchAccessList();
    } catch (e) { setError(e.response?.data?.message || 'Failed to update permissions.'); }
    finally { setSubmitting(false); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke access for this family member?')) return;
    try { await api.post(`/api/family-access/${id}/revoke`); setSuccess('Access revoked.'); fetchAccessList(); }
    catch { setError('Failed to revoke access.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this family access record?')) return;
    try { await api.delete(`/api/family-access/${id}`); setSuccess('Record removed.'); fetchAccessList(); }
    catch { setError('Failed to remove record.'); }
  };

  const statusColors = { PENDING: 'warning', ACTIVE: 'success', REVOKED: 'danger', EXPIRED: 'secondary' };
  const statusIcons = { PENDING: 'bi-clock', ACTIVE: 'bi-check-circle', REVOKED: 'bi-x-circle', EXPIRED: 'bi-calendar-x' };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item text-muted">Dashboard</li>
              <li className="breadcrumb-item active">Family Access</li>
            </ol>
          </nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-shield-lock-fill text-primary me-2"></i>Family Access & Privacy</h2>
          <p className="text-muted mb-0">Control who can access your digital legacy information</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setInviteForm(defaultInviteForm); setShowInviteModal(true); }}>
          <i className="bi bi-person-plus me-2"></i>Invite Family Member
        </button>
      </div>

      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Access Control:</strong> You are the Owner. You can invite family members and control exactly what each person can see or do. Permissions can be changed or revoked at any time.
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

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : accessList.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No family members invited yet.</h5>
          <p className="text-muted">Invite family members to give them controlled access to your digital vault.</p>
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            <i className="bi bi-person-plus me-2"></i>Invite First Member
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {accessList.map(access => (
            <div key={access.id} className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#667eea,#764ba2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
                      }}>
                        {access.familyMemberName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{access.familyMemberName || 'Family Member'}</h6>
                        <div className="text-muted small">{access.familyMemberEmail}</div>
                        {access.relationship && <div className="text-muted small">{access.relationship}</div>}
                      </div>
                    </div>
                    <span className={`badge bg-${statusColors[access.status] || 'secondary'}`}>
                      <i className={`bi ${statusIcons[access.status] || 'bi-question'} me-1`}></i>
                      {access.status}
                    </span>
                  </div>

                  {access.permissions && Object.keys(access.permissions).length > 0 && (
                    <div className="mb-3">
                      <div className="text-muted small fw-medium mb-2">Permissions:</div>
                      <div className="d-flex flex-wrap gap-1">
                        {Object.entries(access.permissions)
                          .filter(([, v]) => v && v !== 'No Access')
                          .map(([section, perm]) => (
                            <span key={section} className="badge bg-light text-dark border small">
                              {section}: {perm}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {access.status === 'PENDING' && (
                    <div className="alert alert-warning py-2 px-3 small mb-3">
                      <i className="bi bi-clock me-2"></i>Invitation pending — waiting for family member to accept
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {access.status === 'ACTIVE' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => { setShowEditModal(access); setEditPermissions(access.permissions || {}); }}
                      >
                        <i className="bi bi-sliders me-1"></i>Permissions
                      </button>
                    )}
                    {(access.status === 'ACTIVE' || access.status === 'PENDING') && (
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleRevoke(access.id)}>
                        <i className="bi bi-x-circle me-1"></i>Revoke
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => handleDelete(access.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Family Member" size="lg">
        <form onSubmit={handleInvite}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Family Member Name</label>
              <input name="familyMemberName" className="form-control" value={inviteForm.familyMemberName} onChange={handleInviteChange} placeholder="Full name" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Relationship</label>
              <input name="relationship" className="form-control" value={inviteForm.relationship} onChange={handleInviteChange} placeholder="e.g. Son, Daughter, Wife" />
            </div>
            <div className="col-12">
              <label className="form-label fw-medium">Email Address <span className="text-danger">*</span></label>
              <input type="email" name="familyMemberEmail" className="form-control" value={inviteForm.familyMemberEmail} onChange={handleInviteChange} placeholder="Their email address" required />
            </div>
          </div>
          <hr />
          <h6 className="fw-bold mb-3"><i className="bi bi-sliders me-2"></i>Set Permissions for Each Section</h6>
          <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-sm align-middle">
              <thead className="table-light sticky-top"><tr><th>Section</th><th>Permission</th></tr></thead>
              <tbody>
                {SECTIONS.map(section => (
                  <tr key={section}>
                    <td className="fw-medium small">{section}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={inviteForm.permissions[section] || 'No Access'}
                        onChange={e => setInviteForm(f => ({ ...f, permissions: { ...f.permissions, [section]: e.target.value } }))}
                      >
                        {PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button type="button" className="btn btn-light" onClick={() => setShowInviteModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : <><i className="bi bi-send me-2"></i>Send Invitation</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Permissions Modal */}
      {showEditModal && (
        <Modal isOpen={!!showEditModal} onClose={() => setShowEditModal(null)} title={`Update Permissions — ${showEditModal.familyMemberName}`} size="lg">
          <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table table-sm align-middle">
              <thead className="table-light sticky-top"><tr><th>Section</th><th>Permission</th></tr></thead>
              <tbody>
                {SECTIONS.map(section => (
                  <tr key={section}>
                    <td className="fw-medium small">{section}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={editPermissions[section] || 'No Access'}
                        onChange={e => setEditPermissions(prev => ({ ...prev, [section]: e.target.value }))}
                      >
                        {PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button type="button" className="btn btn-light" onClick={() => setShowEditModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => handleUpdatePermissions(showEditModal.id)} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
