import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['Document Instructions','Property Instructions','Digital Account Instructions','Contact Instructions','Personal Message','Family Instructions','Financial Instructions','Other'];
const PRIORITIES = ['High','Medium','Low'];
const defaultForm = { title:'', category:'', content:'', priority:'Medium', isConfidential:'false' };

export default function LegacyInstructions() {
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
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/legacy-instructions'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load legacy instructions.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ title:i.title||'', category:i.category||'', content:i.content||'', priority:i.priority||'Medium', isConfidential:String(i.isConfidential||'false') }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, isConfidential: form.isConfidential === 'true' };
      if (editItem) { await api.put(`/api/legacy-instructions/${editItem.id}`, payload); setSuccess('Instruction updated.'); }
      else { await api.post('/api/legacy-instructions', payload); setSuccess('Instruction added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this instruction?')) return;
    try { await api.delete(`/api/legacy-instructions/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const priorityColors = { High:'danger', Medium:'warning', Low:'success' };

  const filtered = items.filter(i => {
    const mc = !filterCategory || i.category === filterCategory;
    const mp = !filterPriority || i.priority === filterPriority;
    return mc && mp;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Legacy Instructions</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-journal-richtext text-primary me-2"></i>Legacy Instructions</h2>
          <p className="text-muted mb-0">Write important instructions for your family about your digital legacy</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Instruction</button>
      </div>

      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Use this section to leave instructions about what should happen to your digital information, accounts, property and personal affairs in the future.
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-6"><select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-md-6"><select className="form-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}><option value="">All Priorities</option>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-journal-richtext display-1 text-muted"></i><h5 className="mt-3 text-muted">No legacy instructions added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Instruction</button></div>
      ) : (
        <div className="row g-4">
          {filtered.map(item => (
            <div key={item.id} className="col-12 col-md-6">
              <div className={`card h-100 shadow-sm border-start border-${priorityColors[item.priority]||'secondary'} border-3`}>
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <div className="d-flex gap-2 flex-wrap">
                        {item.category && <span className="badge bg-light text-dark border small">{item.category}</span>}
                        <span className={`badge bg-${priorityColors[item.priority]||'secondary'}`}>{item.priority}</span>
                        {item.isConfidential && <span className="badge bg-dark"><i className="bi bi-lock me-1"></i>Confidential</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted small mb-3" style={{whiteSpace:'pre-wrap'}}>{item.content?.length > 150 ? item.content.substring(0,150) + '...' : item.content}</p>
                  {item.createdAt && <div className="text-muted" style={{fontSize:'0.75rem'}} className="mb-3">Written: {new Date(item.createdAt).toLocaleDateString('en-IN')}</div>}
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setViewItem(item)}><i className="bi bi-eye me-1"></i>Read</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(item)}><i className="bi bi-pencil me-1"></i>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Instruction' : 'Add Legacy Instruction'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label fw-medium">Title <span className="text-danger">*</span></label><input name="title" className="form-control" value={form.title} onChange={handleChange} placeholder="e.g. How to handle my email accounts" required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Category</label><select name="category" className="form-select" value={form.category} onChange={handleChange}><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label fw-medium">Priority</label><select name="priority" className="form-select" value={form.priority} onChange={handleChange}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label fw-medium">Confidential</label><select name="isConfidential" className="form-select" value={form.isConfidential} onChange={handleChange}><option value="false">No</option><option value="true">Yes</option></select></div>
            <div className="col-12"><label className="form-label fw-medium">Instructions <span className="text-danger">*</span></label><textarea name="content" className="form-control" rows={8} value={form.content} onChange={handleChange} placeholder="Write detailed instructions here..." required style={{whiteSpace:'pre-wrap'}}></textarea><div className="form-text">{form.content.length} characters</div></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Add Instruction'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} size="lg">
          <div className="mb-3">
            <span className={`badge bg-${priorityColors[viewItem.priority]||'secondary'} me-2`}>{viewItem.priority} Priority</span>
            {viewItem.category && <span className="badge bg-light text-dark border me-2">{viewItem.category}</span>}
            {viewItem.isConfidential && <span className="badge bg-dark"><i className="bi bi-lock me-1"></i>Confidential</span>}
          </div>
          <div className="bg-light p-3 rounded" style={{whiteSpace:'pre-wrap',minHeight:'150px'}}>{viewItem.content}</div>
          {viewItem.createdAt && <div className="text-muted small mt-2">Written on: {new Date(viewItem.createdAt).toLocaleDateString('en-IN')}</div>}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button className="btn btn-outline-warning" onClick={() => { setViewItem(null); openEdit(viewItem); }}><i className="bi bi-pencil me-2"></i>Edit</button>
            <button className="btn btn-light" onClick={() => setViewItem(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
