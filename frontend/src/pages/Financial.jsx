import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const ACCOUNT_TYPES = ['Savings Account','Current Account','Fixed Deposit','Recurring Deposit','PPF Account','NPS Account','Demat Account','Other'];
const defaultForm = { bankName:'', accountType:'', accountHolder:'', lastFourDigits:'', branch:'', ifscCode:'', notes:'' };

export default function Financial() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState({});

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/financial'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load financial information.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ bankName:i.bankName||'', accountType:i.accountType||'', accountHolder:i.accountHolder||'', lastFourDigits:i.lastFourDigits||'', branch:i.branch||'', ifscCode:i.ifscCode||'', notes:i.notes||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.bankName.trim()) { setError('Bank name is required.'); return; }
    if (form.lastFourDigits && (form.lastFourDigits.length !== 4 || !/^\d{4}$/.test(form.lastFourDigits))) { setError('Last 4 digits must be exactly 4 numbers.'); return; }
    setSubmitting(true); setError('');
    try {
      if (editItem) { await api.put(`/api/financial/${editItem.id}`, form); setSuccess('Updated.'); }
      else { await api.post('/api/financial', form); setSuccess('Account added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this bank account record?')) return;
    try { await api.delete(`/api/financial/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const toggleDetails = id => setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Bank & Financial</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-bank text-primary me-2"></i>Bank & Financial Information</h2>
          <p className="text-muted mb-0">Securely store basic bank account information for family reference</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Account</button>
      </div>

      <div className="alert alert-warning mb-4">
        <i className="bi bi-shield-lock me-2"></i>
        <strong>Security Notice:</strong> Only basic account details are stored. Full account numbers are never stored. Sensitive fields are visible only to the account owner.
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       items.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-bank display-1 text-muted"></i><h5 className="mt-3 text-muted">No bank accounts added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Account</button></div>
      ) : (
        <div className="row g-4">
          {items.map(item => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{width:'50px',height:'50px',borderRadius:'12px',background:'linear-gradient(135deg,#11998e,#38ef7d)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <i className="bi bi-bank text-white" style={{fontSize:'1.4rem'}}></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{item.bankName}</h6>
                      <span className="badge bg-light text-dark border small">{item.accountType}</span>
                    </div>
                  </div>
                  <div className="mb-2"><span className="text-muted small">Account Holder: </span><span className="fw-medium">{item.accountHolder}</span></div>
                  <div className="mb-3">
                    <span className="text-muted small">Account No.: </span>
                    {showDetails[item.id] ? (
                      <span className="fw-medium font-monospace">XXXX XXXX XXXX {item.lastFourDigits}</span>
                    ) : (
                      <span className="text-muted">•••• •••• •••• {item.lastFourDigits}</span>
                    )}
                    <button className="btn btn-link btn-sm p-0 ms-2" onClick={() => toggleDetails(item.id)}>
                      <i className={`bi bi-${showDetails[item.id] ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {item.branch && <div className="text-muted small mb-1"><i className="bi bi-geo-alt me-1"></i>{item.branch}</div>}
                  {item.ifscCode && <div className="text-muted small mb-2"><i className="bi bi-hash me-1"></i>IFSC: {item.ifscCode}</div>}
                  {item.notes && <p className="text-muted small mb-3">{item.notes}</p>}
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning flex-fill" onClick={() => openEdit(item)}><i className="bi bi-pencil me-1"></i>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Account' : 'Add Bank Account'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Bank Name <span className="text-danger">*</span></label><input name="bankName" className="form-control" value={form.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Account Type</label><select name="accountType" className="form-select" value={form.accountType} onChange={handleChange}><option value="">Select type</option>{ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Account Holder Name</label><input name="accountHolder" className="form-control" value={form.accountHolder} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Last 4 Digits of Account Number</label><input name="lastFourDigits" className="form-control font-monospace" value={form.lastFourDigits} onChange={handleChange} placeholder="XXXX" maxLength={4} /><div className="form-text">Only last 4 digits for security</div></div>
            <div className="col-md-6"><label className="form-label fw-medium">Branch</label><input name="branch" className="form-control" value={form.branch} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">IFSC Code</label><input name="ifscCode" className="form-control font-monospace" value={form.ifscCode} onChange={handleChange} style={{textTransform:'uppercase'}} /></div>
            <div className="col-12"><label className="form-label fw-medium">Important Notes</label><textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange} placeholder="e.g. joint holder, nominee, etc."></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Add Account'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
