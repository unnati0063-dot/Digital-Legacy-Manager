import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const POLICY_TYPES = ['Life Insurance','Health Insurance','Vehicle Insurance','Home Insurance','Term Insurance','Endowment Plan','ULIP','Accident Insurance','Travel Insurance','Other'];
const defaultForm = { insuranceProvider:'', policyType:'', policyNumber:'', policyHolder:'', nominee:'', startDate:'', expiryDate:'', premiumAmount:'', premiumFrequency:'Yearly', notes:'' };

export default function Insurance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [policyFile, setPolicyFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/insurance'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load insurance information.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setPolicyFile(null); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ insuranceProvider:i.insuranceProvider||'', policyType:i.policyType||'', policyNumber:i.policyNumber||'', policyHolder:i.policyHolder||'', nominee:i.nominee||'', startDate:i.startDate||'', expiryDate:i.expiryDate||'', premiumAmount:i.premiumAmount||'', premiumFrequency:i.premiumFrequency||'Yearly', notes:i.notes||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.insuranceProvider.trim()) { setError('Insurance provider is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => v && fd.append(k,v));
      if (policyFile) fd.append('policyDocument', policyFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editItem) { await api.put(`/api/insurance/${editItem.id}`, fd, cfg); setSuccess('Updated.'); }
      else { await api.post('/api/insurance', fd, cfg); setSuccess('Policy added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this insurance policy?')) return;
    try { await api.delete(`/api/insurance/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const getExpiryStatus = expiryDate => {
    if (!expiryDate) return null;
    const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000*60*60*24));
    if (diff < 0) return { label:'Expired', color:'danger' };
    if (diff <= 30) return { label:`Expires in ${diff}d`, color:'warning' };
    if (diff <= 90) return { label:'Expiring soon', color:'info' };
    return { label:'Active', color:'success' };
  };

  const getPolicyIcon = type => {
    if (type?.includes('Life') || type?.includes('Term')) return 'bi-heart-pulse';
    if (type?.includes('Health')) return 'bi-hospital';
    if (type?.includes('Vehicle')) return 'bi-car-front';
    if (type?.includes('Home')) return 'bi-house';
    return 'bi-shield-check';
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Insurance</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-shield-check-fill text-primary me-2"></i>Insurance Information</h2>
          <p className="text-muted mb-0">Manage all your insurance policies and coverage details</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Policy</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       items.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-shield-check display-1 text-muted"></i><h5 className="mt-3 text-muted">No insurance policies added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Policy</button></div>
      ) : (
        <div className="row g-4">
          {items.map(item => {
            const status = getExpiryStatus(item.expiryDate);
            return (
              <div key={item.id} className="col-12 col-md-6">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3" style={{width:'50px',height:'50px',borderRadius:'12px',background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>
                          <i className={`bi ${getPolicyIcon(item.policyType)} text-warning`}></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{item.insuranceProvider}</h6>
                          <span className="badge bg-light text-dark border small">{item.policyType}</span>
                        </div>
                      </div>
                      {status && <span className={`badge bg-${status.color}`}>{status.label}</span>}
                    </div>
                    <div className="row g-2 mb-3">
                      {item.policyNumber && <div className="col-6"><div className="text-muted small">Policy No.</div><div className="fw-medium small font-monospace">{item.policyNumber}</div></div>}
                      {item.policyHolder && <div className="col-6"><div className="text-muted small">Policy Holder</div><div className="fw-medium small">{item.policyHolder}</div></div>}
                      {item.nominee && <div className="col-6"><div className="text-muted small">Nominee</div><div className="fw-medium small">{item.nominee}</div></div>}
                      {item.expiryDate && <div className="col-6"><div className="text-muted small">Renewal Date</div><div className="fw-medium small">{item.expiryDate}</div></div>}
                      {item.premiumAmount && <div className="col-6"><div className="text-muted small">Premium</div><div className="fw-medium small">₹{Number(item.premiumAmount).toLocaleString('en-IN')} / {item.premiumFrequency}</div></div>}
                    </div>
                    {item.notes && <p className="text-muted small mb-3">{item.notes}</p>}
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setViewItem(item)}><i className="bi bi-eye me-1"></i>View</button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(item)}><i className="bi bi-pencil me-1"></i>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Insurance Policy' : 'Add Insurance Policy'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Insurance Provider <span className="text-danger">*</span></label><input name="insuranceProvider" className="form-control" value={form.insuranceProvider} onChange={handleChange} placeholder="e.g. LIC, HDFC Life" required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Policy Type</label><select name="policyType" className="form-select" value={form.policyType} onChange={handleChange}><option value="">Select type</option>{POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Policy Number</label><input name="policyNumber" className="form-control" value={form.policyNumber} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Policy Holder</label><input name="policyHolder" className="form-control" value={form.policyHolder} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Nominee</label><input name="nominee" className="form-control" value={form.nominee} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Premium Frequency</label><select name="premiumFrequency" className="form-select" value={form.premiumFrequency} onChange={handleChange}><option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option><option>One-Time</option></select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Premium Amount (₹)</label><input type="number" name="premiumAmount" className="form-control" value={form.premiumAmount} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Start Date</label><input type="date" name="startDate" className="form-control" value={form.startDate} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Expiry/Renewal Date</label><input type="date" name="expiryDate" className="form-control" value={form.expiryDate} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Notes</label><textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange}></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Policy Document (Optional)</label><input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setPolicyFile(e.target.files[0])} /></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update Policy' : 'Add Policy'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Insurance Policy Details" size="lg">
          <div className="row g-3">
            {[['Provider',viewItem.insuranceProvider],['Policy Type',viewItem.policyType],['Policy Number',viewItem.policyNumber],['Policy Holder',viewItem.policyHolder],['Nominee',viewItem.nominee],['Start Date',viewItem.startDate],['Expiry Date',viewItem.expiryDate],['Premium',viewItem.premiumAmount ? `₹${Number(viewItem.premiumAmount).toLocaleString('en-IN')} / ${viewItem.premiumFrequency}` : ''],['Notes',viewItem.notes]].filter(([,v])=>v).map(([l,v])=>(
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
