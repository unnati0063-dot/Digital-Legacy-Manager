import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const RELATIONSHIPS = ['Father','Mother','Brother','Sister','Husband','Wife','Son','Daughter','Grandfather','Grandmother','Uncle','Aunt','Nephew','Niece','Cousin','Other'];
const defaultForm = { fullName:'', relationship:'', dateOfBirth:'', gender:'', mobileNumber:'', email:'', address:'', occupation:'', emergencyContact:'', importantNotes:'' };

export default function FamilyMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/family-members');
      setMembers(res.data.data || res.data || []);
    } catch { setError('Failed to load family members.'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setPhotoFile(null); setShowModal(true); };
  const openEdit = (m) => {
    setEditItem(m);
    setForm({ fullName:m.fullName||'', relationship:m.relationship||'', dateOfBirth:m.dateOfBirth||'', gender:m.gender||'', mobileNumber:m.mobileNumber||'', email:m.email||'', address:m.address||'', occupation:m.occupation||'', emergencyContact:m.emergencyContact||'', importantNotes:m.importantNotes||'' });
    setPhotoFile(null); setShowModal(true);
  };
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.relationship) { setError('Full name and relationship are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editItem) { await api.put(`/api/family-members/${editItem.id}`, fd, config); setSuccess('Family member updated.'); }
      else { await api.post('/api/family-members', fd, config); setSuccess('Family member added.'); }
      setShowModal(false); fetchMembers();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save family member.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this family member?')) return;
    try { await api.delete(`/api/family-members/${id}`); setSuccess('Deleted.'); fetchMembers(); }
    catch { setError('Failed to delete.'); }
  };

  const relColors = { Father:'primary',Mother:'danger',Brother:'info',Sister:'pink',Husband:'dark',Wife:'warning',Son:'success',Daughter:'secondary' };
  const getBadge = (rel) => relColors[rel] || 'secondary';

  const filtered = members.filter(m =>
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.relationship?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Family Members</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-people-fill text-primary me-2"></i>Family Members</h2>
          <p className="text-muted mb-0">Manage profiles for all your family members</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Family Member</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
            <input type="text" className="form-control" placeholder="Search by name or relationship..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><i className="bi bi-x"></i></button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="text-muted mt-2">Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">{search ? 'No members match your search.' : 'No family members added yet.'}</h5>
          {!search && <button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Member</button>}
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(m => (
            <div key={m.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="mx-auto mb-3" style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',color:'#fff'}}>
                    {m.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <h5 className="card-title mb-1 fw-bold">{m.fullName}</h5>
                  <span className={`badge bg-${getBadge(m.relationship)} mb-2`}>{m.relationship}</span>
                  {m.mobileNumber && <p className="text-muted small mb-1"><i className="bi bi-telephone me-1"></i>{m.mobileNumber}</p>}
                  {m.occupation && <p className="text-muted small mb-2"><i className="bi bi-briefcase me-1"></i>{m.occupation}</p>}
                  <div className="d-flex gap-2 justify-content-center mt-3">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setViewItem(m)} title="View"><i className="bi bi-eye"></i></button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(m)} title="Edit"><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)} title="Delete"><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Family Member' : 'Add Family Member'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Full Name <span className="text-danger">*</span></label><input name="fullName" className="form-control" value={form.fullName} onChange={handleChange} required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Relationship <span className="text-danger">*</span></label><select name="relationship" className="form-select" value={form.relationship} onChange={handleChange} required><option value="">Select...</option>{RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Date of Birth</label><input type="date" name="dateOfBirth" className="form-control" value={form.dateOfBirth} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Gender</label><select name="gender" className="form-select" value={form.gender} onChange={handleChange}><option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option></select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Mobile Number</label><input name="mobileNumber" className="form-control" value={form.mobileNumber} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Email</label><input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Address</label><input name="address" className="form-control" value={form.address} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Occupation</label><input name="occupation" className="form-control" value={form.occupation} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Emergency Contact</label><input name="emergencyContact" className="form-control" value={form.emergencyContact} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Important Notes</label><textarea name="importantNotes" className="form-control" rows={3} value={form.importantNotes} onChange={handleChange}></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Profile Photo</label><input type="file" className="form-control" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} /></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update Member' : 'Add Member'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Family Member Details" size="lg">
          <div className="row g-3">
            <div className="col-12 text-center mb-2">
              <div className="mx-auto mb-2" style={{width:'80px',height:'80px',borderRadius:'50%',background:'linear-gradient(135deg,#667eea,#764ba2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',color:'#fff'}}>{viewItem.fullName?.charAt(0)}</div>
              <h4 className="fw-bold">{viewItem.fullName}</h4>
              <span className={`badge bg-${getBadge(viewItem.relationship)}`}>{viewItem.relationship}</span>
            </div>
            {[['Date of Birth',viewItem.dateOfBirth],['Gender',viewItem.gender],['Mobile',viewItem.mobileNumber],['Email',viewItem.email],['Address',viewItem.address],['Occupation',viewItem.occupation],['Emergency Contact',viewItem.emergencyContact]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} className="col-md-6"><div className="text-muted small">{l}</div><div className="fw-medium">{v}</div></div>
            ))}
            {viewItem.importantNotes && <div className="col-12"><div className="text-muted small">Important Notes</div><div className="fw-medium">{viewItem.importantNotes}</div></div>}
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
