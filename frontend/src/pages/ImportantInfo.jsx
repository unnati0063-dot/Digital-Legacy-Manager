import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['Important Instruction','Emergency Information','Location Information','Important Contact','Family Note','Document Location','Password Hint','Account Information','Other'];
const defaultForm = { title:'', category:'', content:'', isPinned:'false' };

export default function ImportantInfo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/important-info'); setItems(res.data.data || res.data || []); }
    catch { setError('Failed to load important information.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = i => { setEditItem(i); setForm({ title:i.title||'', category:i.category||'', content:i.content||'', isPinned:String(i.isPinned||'false') }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, isPinned: form.isPinned === 'true' };
      if (editItem) { await api.put(`/api/important-info/${editItem.id}`, payload); setSuccess('Updated.'); }
      else { await api.post('/api/important-info', payload); setSuccess('Added.'); }
      setShowModal(false); fetchItems();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this information?')) return;
    try { await api.delete(`/api/important-info/${id}`); setSuccess('Deleted.'); fetchItems(); }
    catch { setError('Failed to delete.'); }
  };

  const catColors = { 'Emergency Information':'danger','Important Instruction':'warning','Location Information':'info','Family Note':'success' };
  const getColor = cat => catColors[cat] || 'primary';

  const sortedItems = [...items].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const filtered = sortedItems.filter(i => {
    const ms = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.content?.toLowerCase().includes(search.toLowerCase());
    const mc = !filterCategory || i.category === filterCategory;
    return ms && mc;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Important Information</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-bookmark-star-fill text-primary me-2"></i>Important Information</h2>
          <p className="text-muted mb-0">Store important notes and information your family may need</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Information</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search information..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="col-md-4"><select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-bookmark-star display-1 text-muted"></i><h5 className="mt-3 text-muted">No important information added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Note</button></div>
      ) : (
        <div className="row g-4">
          {filtered.map(item => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className={`card h-100 shadow-sm ${item.isPinned ? 'border-warning border-2' : ''}`}>
                {item.isPinned && <div className="card-header bg-warning bg-opacity-10 py-1 px-3"><i className="bi bi-pin-angle-fill text-warning me-1"></i><span className="small fw-medium text-warning">Pinned</span></div>}
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <h6 className="fw-bold mb-0">{item.title}</h6>
                    {item.category && <span className={`badge bg-${getColor(item.category)} bg-opacity-10 text-${getColor(item.category)} border border-${getColor(item.category)} small`}>{item.category}</span>}
                  </div>
                  <p className="text-muted small mb-3" style={{whiteSpace:'pre-wrap'}}>{item.content?.length > 120 ? item.content.substring(0,120) + '...' : item.content}</p>
                  <div className="d-flex gap-2">
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Information' : 'Add Important Information'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label fw-medium">Title <span className="text-danger">*</span></label><input name="title" className="form-control" value={form.title} onChange={handleChange} placeholder="e.g. Location of Important Documents" required /></div>
            <div className="col-md-8"><label className="form-label fw-medium">Category</label><select name="category" className="form-select" value={form.category} onChange={handleChange}><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label fw-medium">Pin to Top</label><select name="isPinned" className="form-select" value={form.isPinned} onChange={handleChange}><option value="false">No</option><option value="true">Yes</option></select></div>
            <div className="col-12"><label className="form-label fw-medium">Information <span className="text-danger">*</span></label><textarea name="content" className="form-control" rows={6} value={form.content} onChange={handleChange} placeholder="Enter important information here..." required style={{whiteSpace:'pre-wrap'}}></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Add Information'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} size="lg">
          {viewItem.category && <div className="mb-3"><span className={`badge bg-${getColor(viewItem.category)}`}>{viewItem.category}</span>{viewItem.isPinned && <span className="badge bg-warning ms-2"><i className="bi bi-pin-angle me-1"></i>Pinned</span>}</div>}
          <div className="bg-light p-3 rounded" style={{whiteSpace:'pre-wrap',minHeight:'120px'}}>{viewItem.content}</div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button className="btn btn-outline-warning" onClick={() => { setViewItem(null); openEdit(viewItem); }}><i className="bi bi-pencil me-2"></i>Edit</button>
            <button className="btn btn-light" onClick={() => setViewItem(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
