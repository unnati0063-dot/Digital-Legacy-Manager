import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const DOC_TYPES = ['Educational Certificate','Resume/CV','Experience Letter','Property Document','Marriage Document','Family Document','Medical Record','Tax Document','Insurance Document','Will/Testament','Important Letter','Other'];
const defaultForm = { documentName:'', documentType:'', documentNumber:'', issuingAuthority:'', issueDate:'', expiryDate:'', description:'', familyMemberId:'' };

export default function PersonalDocuments() {
  const [docs, setDocs] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [docFile, setDocFile] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showReplaceModal, setShowReplaceModal] = useState(null);

  useEffect(() => { fetchDocs(); fetchFamilyMembers(); }, []);

  const fetchDocs = async () => {
    try { setLoading(true); const res = await api.get('/api/documents/category/PERSONAL'); setDocs(res.data.data || res.data || []); }
    catch { setError('Failed to load documents.'); } finally { setLoading(false); }
  };
  const fetchFamilyMembers = async () => {
    try { const r = await api.get('/api/family-members'); setFamilyMembers(r.data.data || r.data || []); } catch {}
  };
  const openAdd = () => { setEditItem(null); setForm(defaultForm); setDocFile(null); setShowModal(true); };
  const openEdit = d => { setEditItem(d); setForm({ documentName:d.documentName||'', documentType:d.documentType||'', documentNumber:d.documentNumber||'', issuingAuthority:d.issuingAuthority||'', issueDate:d.issueDate||'', expiryDate:d.expiryDate||'', description:d.description||'', familyMemberId:d.familyMemberId||'' }); setDocFile(null); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.documentName.trim()) { setError('Document name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append('category', 'PERSONAL');
      if (docFile) fd.append('file', docFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editItem) { await api.put(`/api/documents/${editItem.id}`, fd, cfg); setSuccess('Updated.'); }
      else { await api.post('/api/documents', fd, cfg); setSuccess('Uploaded.'); }
      setShowModal(false); fetchDocs();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this document?')) return;
    try { await api.delete(`/api/documents/${id}`); setSuccess('Deleted.'); fetchDocs(); }
    catch { setError('Failed to delete.'); }
  };

  const handleDownload = async doc => {
    try {
      const res = await api.get(`/api/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = doc.documentName || 'document';
      document.body.appendChild(a); a.click(); a.remove();
    } catch { setError('Download failed.'); }
  };

  const handleReplace = async e => {
    e.preventDefault();
    if (!replaceFile) return;
    setSubmitting(true);
    try {
      const fd = new FormData(); fd.append('file', replaceFile);
      await api.post(`/api/documents/${showReplaceModal.id}/replace`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('File replaced.'); setShowReplaceModal(null); setReplaceFile(null); fetchDocs();
    } catch { setError('Replace failed.'); } finally { setSubmitting(false); }
  };

  const filtered = docs.filter(d => {
    const ms = !search || d.documentName?.toLowerCase().includes(search.toLowerCase());
    const mt = !filterType || d.documentType === filterType;
    return ms && mt;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Personal Documents</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-folder2-open text-primary me-2"></i>Personal Documents</h2>
          <p className="text-muted mb-0">Store educational certificates, property papers and other personal documents</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-upload me-2"></i>Upload Document</button>
      </div>

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="col-md-4"><select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Types</option>{DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-folder2-open display-1 text-muted"></i><h5 className="mt-3 text-muted">No personal documents found.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-upload me-2"></i>Upload First Document</button></div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light"><tr><th>Document Name</th><th>Type</th><th>Owner</th><th>Issue Date</th><th>Expiry</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{width:'36px',height:'36px',borderRadius:'8px',background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <i className="bi bi-file-earmark-text" style={{color:'#d97706'}}></i>
                        </div>
                        <div className="fw-medium">{d.documentName}</div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{d.documentType || 'Other'}</span></td>
                    <td>{d.familyMemberName || 'Self'}</td>
                    <td>{d.issueDate || '-'}</td>
                    <td>{d.expiryDate || '-'}</td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        {d.fileUrl && <button className="btn btn-sm btn-outline-success" onClick={() => handleDownload(d)} title="Download"><i className="bi bi-download"></i></button>}
                        <button className="btn btn-sm btn-outline-info" onClick={() => { setShowReplaceModal(d); setReplaceFile(null); }} title="Replace"><i className="bi bi-arrow-repeat"></i></button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(d)} title="Edit"><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)} title="Delete"><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Document' : 'Upload Personal Document'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Document Name <span className="text-danger">*</span></label><input name="documentName" className="form-control" value={form.documentName} onChange={handleChange} required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Document Type</label><select name="documentType" className="form-select" value={form.documentType} onChange={handleChange}><option value="">Select type</option>{DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Document Number</label><input name="documentNumber" className="form-control" value={form.documentNumber} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Owner</label><select name="familyMemberId" className="form-select" value={form.familyMemberId} onChange={handleChange}><option value="">Self</option>{familyMembers.map(fm => <option key={fm.id} value={fm.id}>{fm.fullName} ({fm.relationship})</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Issue Date</label><input type="date" name="issueDate" className="form-control" value={form.issueDate} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Expiry Date</label><input type="date" name="expiryDate" className="form-control" value={form.expiryDate} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Issuing Authority</label><input name="issuingAuthority" className="form-control" value={form.issuingAuthority} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Description</label><textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange}></textarea></div>
            {!editItem && <div className="col-12"><label className="form-label fw-medium">Upload File</label><input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setDocFile(e.target.files[0])} /><div className="form-text">PDF, JPG, PNG, DOC, DOCX supported</div></div>}
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update' : 'Upload'}</button>
          </div>
        </form>
      </Modal>

      {showReplaceModal && (
        <Modal isOpen={!!showReplaceModal} onClose={() => setShowReplaceModal(null)} title="Replace Document File">
          <form onSubmit={handleReplace}>
            <div className="mb-3"><label className="form-label fw-medium">Select New File</label><input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setReplaceFile(e.target.files[0])} required /></div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-light" onClick={() => setShowReplaceModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-warning" disabled={submitting}>{submitting ? 'Replacing...' : 'Replace File'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
