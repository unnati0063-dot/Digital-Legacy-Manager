import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const CONTACT_TYPES = ['Family','Doctor','Lawyer','CA/Accountant','Insurance Agent','Financial Advisor','Emergency Contact','Police/Fire','Hospital','Government','Trusted Friend','Other'];
const defaultForm = { name:'', relationship:'', contactNumber:'', email:'', address:'', contactType:'', notes:'' };

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try { setLoading(true); const res = await api.get('/api/contacts'); setContacts(res.data.data || res.data || []); }
    catch { setError('Failed to load contacts.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = c => { setEditItem(c); setForm({ name:c.name||'', relationship:c.relationship||'', contactNumber:c.contactNumber||'', email:c.email||'', address:c.address||'', contactType:c.contactType||'', notes:c.notes||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Contact name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      if (editItem) { await api.put(`/api/contacts/${editItem.id}`, form); setSuccess('Contact updated.'); }
      else { await api.post('/api/contacts', form); setSuccess('Contact added.'); }
      setShowModal(false); fetchContacts();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this contact?')) return;
    try { await api.delete(`/api/contacts/${id}`); setSuccess('Deleted.'); fetchContacts(); }
    catch { setError('Failed to delete.'); }
  };

  const typeColorMap = { Family:'primary', Doctor:'danger', Lawyer:'dark', Emergency:'warning', Police:'primary', Hospital:'danger' };
  const getColor = type => { for (const [k, v] of Object.entries(typeColorMap)) { if (type?.includes(k)) return v; } return 'secondary'; };
  const getInitials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const filtered = contacts.filter(c => {
    const ms = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.contactNumber?.includes(search);
    const mt = !filterType || c.contactType === filterType;
    return ms && mt;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Important Contacts</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-person-lines-fill text-primary me-2"></i>Important Contacts</h2>
          <p className="text-muted mb-0">Keep important contact details for family emergencies</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Contact</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search by name or number..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="col-md-4"><select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Types</option>{CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-person-lines-fill display-1 text-muted"></i><h5 className="mt-3 text-muted">No contacts added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Contact</button></div>
      ) : (
        <div className="row g-4">
          {filtered.map(c => (
            <div key={c.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{width:'50px',height:'50px',borderRadius:'50%',background:`var(--bs-${getColor(c.contactType)})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',color:'#fff',fontSize:'1rem'}}>
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{c.name}</h6>
                      <span className={`badge bg-${getColor(c.contactType)} opacity-75 small`}>{c.contactType || 'Contact'}</span>
                    </div>
                  </div>
                  {c.relationship && <div className="mb-1"><span className="text-muted small">Rel: </span><span className="small">{c.relationship}</span></div>}
                  {c.contactNumber && <div className="mb-1"><i className="bi bi-telephone me-2 text-primary"></i><a href={`tel:${c.contactNumber}`} className="small text-dark">{c.contactNumber}</a></div>}
                  {c.email && <div className="mb-2"><i className="bi bi-envelope me-2 text-primary"></i><a href={`mailto:${c.email}`} className="small text-dark">{c.email}</a></div>}
                  {c.notes && <p className="text-muted small mb-3">{c.notes.length > 60 ? c.notes.substring(0,60) + '...' : c.notes}</p>}
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => setViewItem(c)}><i className="bi bi-eye me-1"></i>View</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(c)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Contact' : 'Add Contact'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Name <span className="text-danger">*</span></label><input name="name" className="form-control" value={form.name} onChange={handleChange} required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Contact Type</label><select name="contactType" className="form-select" value={form.contactType} onChange={handleChange}><option value="">Select type</option>{CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Relationship</label><input name="relationship" className="form-control" value={form.relationship} onChange={handleChange} placeholder="e.g. Family Doctor" /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Contact Number</label><input name="contactNumber" className="form-control" value={form.contactNumber} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Email</label><input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Address</label><input name="address" className="form-control" value={form.address} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Notes</label><textarea name="notes" className="form-control" rows={3} value={form.notes} onChange={handleChange}></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update Contact' : 'Add Contact'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Contact Details" size="lg">
          <div className="row g-3">
            {[['Name',viewItem.name],['Type',viewItem.contactType],['Relationship',viewItem.relationship],['Phone',viewItem.contactNumber],['Email',viewItem.email],['Address',viewItem.address],['Notes',viewItem.notes]].filter(([,v])=>v).map(([l,v])=>(
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
