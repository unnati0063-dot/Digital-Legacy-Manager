import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['Email','Cloud Storage','Social Media','Online Shopping','Banking/Finance','Government Portal','Streaming Service','Subscription Service','Work/Professional','Other'];
const STATUSES = ['Active','Inactive','Closed','Unknown'];
const defaultForm = { serviceName:'', category:'', username:'', email:'', website:'', accountStatus:'Active', recoveryEmail:'', recoveryPhone:'', twoFactorEnabled:'false', instructions:'', notes:'' };

export default function DigitalAccounts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/digital-accounts'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load digital accounts.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ serviceName:i.serviceName||'', category:i.category||'', username:i.username||'', email:i.email||'', website:i.website||'', accountStatus:i.accountStatus||'Active', recoveryEmail:i.recoveryEmail||'', recoveryPhone:i.recoveryPhone||'', twoFactorEnabled:String(i.twoFactorEnabled||'false'), instructions:i.instructions||'', notes:i.notes||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.serviceName.trim()) { setError('Service name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, twoFactorEnabled: form.twoFactorEnabled === 'true' };
      if (editItem) { await api.put(`/api/digital-accounts/${editItem.id}`, payload); setSuccess('Account updated.'); }
      else { await api.post('/api/digital-accounts', payload); setSuccess('Account added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this digital account record?')) return;
    try { await api.delete(`/api/digital-accounts/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const getCategoryIcon = cat => {
    const icons = { Email:'bi-envelope-fill','Cloud Storage':'bi-cloud-fill','Social Media':'bi-share-fill','Online Shopping':'bi-cart-fill','Banking/Finance':'bi-bank','Streaming Service':'bi-play-circle-fill','Government Portal':'bi-building','Work/Professional':'bi-briefcase-fill' };
    return icons[cat] || 'bi-globe';
  };

  const statusColors = { Active:'success', Inactive:'secondary', Closed:'danger', Unknown:'warning' };

  const filtered = items.filter(i => {
    const ms = !search || i.serviceName?.toLowerCase().includes(search.toLowerCase());
    const mc = !filterCategory || i.category === filterCategory;
    return ms && mc;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Digital Accounts</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-globe2 text-primary me-2"></i>Digital Accounts</h2>
          <p className="text-muted mb-0">Track your digital services and online accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Account</button>
      </div>

      <div className="alert alert-info mb-4">
        <i className="bi bi-shield-lock me-2"></i>
        <strong>Security Notice:</strong> Passwords are never stored. Only account details, recovery information and instructions are kept for family reference.
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="col-md-4"><select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-globe2 display-1 text-muted"></i><h5 className="mt-3 text-muted">No digital accounts added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Account</button></div>
      ) : (
        <div className="row g-4">
          {filtered.map(item => (
            <div key={item.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{width:'44px',height:'44px',borderRadius:'10px',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>
                        <i className={`bi ${getCategoryIcon(item.category)} text-primary`}></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{item.serviceName}</h6>
                        <span className="text-muted small">{item.category}</span>
                      </div>
                    </div>
                    <span className={`badge bg-${statusColors[item.accountStatus] || 'secondary'}`}>{item.accountStatus}</span>
                  </div>
                  {item.username && <div className="mb-1"><span className="text-muted small">Username: </span><span className="small fw-medium">{item.username}</span></div>}
                  {item.email && <div className="mb-1"><span className="text-muted small">Email: </span><span className="small">{item.email}</span></div>}
                  {item.website && <div className="mb-2"><a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="small text-primary"><i className="bi bi-box-arrow-up-right me-1"></i>{item.website}</a></div>}
                  {item.twoFactorEnabled && <div className="mb-2"><span className="badge bg-success-subtle text-success border border-success small"><i className="bi bi-shield-check me-1"></i>2FA Enabled</span></div>}
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => setViewItem(item)}><i className="bi bi-eye me-1"></i>View</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(item)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Digital Account' : 'Add Digital Account'} size="lg">
        <div className="alert alert-info small mb-3"><i className="bi bi-info-circle me-2"></i>Passwords are never stored. Store recovery info and instructions to help family members in future.</div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Service Name <span className="text-danger">*</span></label><input name="serviceName" className="form-control" value={form.serviceName} onChange={handleChange} placeholder="e.g. Gmail, Facebook" required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Category</label><select name="category" className="form-select" value={form.category} onChange={handleChange}><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Username</label><input name="username" className="form-control" value={form.username} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Email (for this account)</label><input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Website/URL</label><input name="website" className="form-control" value={form.website} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Account Status</label><select name="accountStatus" className="form-select" value={form.accountStatus} onChange={handleChange}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Recovery Email</label><input type="email" name="recoveryEmail" className="form-control" value={form.recoveryEmail} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Recovery Phone</label><input name="recoveryPhone" className="form-control" value={form.recoveryPhone} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Two-Factor Authentication</label><select name="twoFactorEnabled" className="form-select" value={form.twoFactorEnabled} onChange={handleChange}><option value="false">Not Enabled</option><option value="true">Enabled</option></select></div>
            <div className="col-12"><label className="form-label fw-medium">Access Instructions</label><textarea name="instructions" className="form-control" rows={3} value={form.instructions} onChange={handleChange} placeholder="How to access this account, recovery steps..."></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange}></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Add Account'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Digital Account Details" size="lg">
          <div className="row g-3">
            {[['Service',viewItem.serviceName],['Category',viewItem.category],['Username',viewItem.username],['Email',viewItem.email],['Website',viewItem.website],['Status',viewItem.accountStatus],['Recovery Email',viewItem.recoveryEmail],['Recovery Phone',viewItem.recoveryPhone],['2FA',viewItem.twoFactorEnabled ? 'Enabled' : 'Not Enabled'],['Instructions',viewItem.instructions],['Notes',viewItem.notes]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} className="col-md-6"><div className="text-muted small">{l}</div><div className="fw-medium">{v}</div></div>
            ))}
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button className="btn btn-outline-warning" onClick={() => { setViewItem(null); openEdit(viewItem); }}><i className="bi bi-pencil me-2"></i>Edit</button>
            <button className="btn btn-light" onClick={() => setViewItem(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
