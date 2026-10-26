import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const defaultForm = { bloodGroup:'', allergies:'', emergencyContact:'', emergencyContactName:'', doctorName:'', doctorContact:'', hospitalName:'', medicalConditions:'', medications:'', medicalNotes:'', emergencyInstructions:'' };

export default function Medical() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/medical'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load medical information.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ bloodGroup:i.bloodGroup||'', allergies:i.allergies||'', emergencyContact:i.emergencyContact||'', emergencyContactName:i.emergencyContactName||'', doctorName:i.doctorName||'', doctorContact:i.doctorContact||'', hospitalName:i.hospitalName||'', medicalConditions:i.medicalConditions||'', medications:i.medications||'', medicalNotes:i.medicalNotes||'', emergencyInstructions:i.emergencyInstructions||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      if (editItem) { await api.put(`/api/medical/${editItem.id}`, form); setSuccess('Medical information updated.'); }
      else { await api.post('/api/medical', form); setSuccess('Medical information added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this medical record?')) return;
    try { await api.delete(`/api/medical/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const bgColors = { 'A+':'#dc3545','A-':'#dc3545','B+':'#0d6efd','B-':'#0d6efd','AB+':'#ffc107','AB-':'#ffc107','O+':'#198754','O-':'#198754' };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Medical & Emergency</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-heart-pulse-fill text-danger me-2"></i>Medical & Emergency Information</h2>
          <p className="text-muted mb-0">Store critical medical details for emergency situations</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Record</button>
      </div>

      <div className="alert alert-danger mb-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        <strong>Emergency Section:</strong> This section contains sensitive medical information. Access is restricted to authorized users only.
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-danger"></div></div>) :
       items.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-heart-pulse display-1 text-muted"></i><h5 className="mt-3 text-muted">No medical information added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Medical Information</button></div>
      ) : (
        <div className="row g-4">
          {items.map(item => (
            <div key={item.id} className="col-12">
              <div className="card shadow-sm border-start border-danger border-3">
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-2 text-center">
                      {item.bloodGroup && (
                        <div>
                          <div style={{width:'80px',height:'80px',borderRadius:'50%',background:bgColors[item.bloodGroup]||'#dc3545',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:'bold',color:'#fff',margin:'0 auto 0.5rem'}}>{item.bloodGroup}</div>
                          <div className="text-muted small">Blood Group</div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-10">
                      <div className="row g-3">
                        {item.allergies && <div className="col-md-6"><div className="text-muted small">Allergies</div><div className="fw-medium text-danger">{item.allergies}</div></div>}
                        {item.emergencyContactName && <div className="col-md-6"><div className="text-muted small">Emergency Contact</div><div className="fw-medium">{item.emergencyContactName} — {item.emergencyContact}</div></div>}
                        {item.doctorName && <div className="col-md-6"><div className="text-muted small">Doctor</div><div className="fw-medium">{item.doctorName}{item.doctorContact && ` — ${item.doctorContact}`}</div></div>}
                        {item.hospitalName && <div className="col-md-6"><div className="text-muted small">Hospital/Clinic</div><div className="fw-medium">{item.hospitalName}</div></div>}
                        {item.medicalConditions && <div className="col-12"><div className="text-muted small">Medical Conditions</div><div className="fw-medium">{item.medicalConditions}</div></div>}
                        {item.medications && <div className="col-12"><div className="text-muted small">Current Medications</div><div className="fw-medium">{item.medications}</div></div>}
                        {item.emergencyInstructions && (
                          <div className="col-12">
                            <div className="alert alert-warning mb-0 py-2">
                              <div className="small fw-bold"><i className="bi bi-exclamation-triangle me-1"></i>Emergency Instructions</div>
                              <div className="small mt-1">{item.emergencyInstructions}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(item)}><i className="bi bi-pencil me-1"></i>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash me-1"></i>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Medical Information' : 'Add Medical Information'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label fw-medium">Blood Group</label><select name="bloodGroup" className="form-select" value={form.bloodGroup} onChange={handleChange}><option value="">Select...</option>{BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <div className="col-md-8"><label className="form-label fw-medium">Allergies</label><input name="allergies" className="form-control" value={form.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Peanuts" /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Emergency Contact Name</label><input name="emergencyContactName" className="form-control" value={form.emergencyContactName} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Emergency Contact Number</label><input name="emergencyContact" className="form-control" value={form.emergencyContact} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Doctor Name</label><input name="doctorName" className="form-control" value={form.doctorName} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Doctor Contact</label><input name="doctorContact" className="form-control" value={form.doctorContact} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Hospital/Clinic</label><input name="hospitalName" className="form-control" value={form.hospitalName} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Medical Conditions</label><textarea name="medicalConditions" className="form-control" rows={2} value={form.medicalConditions} onChange={handleChange} placeholder="List any known medical conditions..."></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Current Medications</label><textarea name="medications" className="form-control" rows={2} value={form.medications} onChange={handleChange} placeholder="List medications and dosages..."></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Medical Notes</label><textarea name="medicalNotes" className="form-control" rows={2} value={form.medicalNotes} onChange={handleChange}></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Emergency Instructions <span className="badge bg-danger ms-1">Important</span></label><textarea name="emergencyInstructions" className="form-control" rows={3} value={form.emergencyInstructions} onChange={handleChange} placeholder="Instructions for medical emergencies..."></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Add Record'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
