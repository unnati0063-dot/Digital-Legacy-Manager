import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const ASSET_TYPES = ['Property','House','Apartment','Land','Vehicle','Car','Two-Wheeler','Gold/Jewellery','Investment','Mutual Fund','Shares/Stocks','Fixed Deposit','Business','Other'];
const defaultForm = { assetName:'', assetType:'', owner:'Self', description:'', location:'', estimatedValue:'', documentReference:'', notes:'' };

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try { setLoading(true); const res = await api.get('/api/assets'); setAssets(res.data.data || res.data || []); }
    catch { setError('Failed to load assets.'); } finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = a => { setEditItem(a); setForm({ assetName:a.assetName||'', assetType:a.assetType||'', owner:a.owner||'Self', description:a.description||'', location:a.location||'', estimatedValue:a.estimatedValue||'', documentReference:a.documentReference||'', notes:a.notes||'' }); setShowModal(true); };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.assetName.trim()) { setError('Asset name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      if (editItem) { await api.put(`/api/assets/${editItem.id}`, form); setSuccess('Asset updated.'); }
      else { await api.post('/api/assets', form); setSuccess('Asset added.'); }
      setShowModal(false); fetchAssets();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this asset?')) return;
    try { await api.delete(`/api/assets/${id}`); setSuccess('Deleted.'); fetchAssets(); }
    catch { setError('Failed to delete.'); }
  };

  const getTypeIcon = type => {
    if (['Property','House','Apartment','Land'].includes(type)) return 'bi-house-fill';
    if (['Vehicle','Car','Two-Wheeler'].includes(type)) return 'bi-car-front-fill';
    if (['Gold/Jewellery'].includes(type)) return 'bi-gem';
    if (['Investment','Mutual Fund','Shares/Stocks','Fixed Deposit'].includes(type)) return 'bi-graph-up-arrow';
    return 'bi-box-seam';
  };

  const formatCurrency = v => v ? `₹${Number(v).toLocaleString('en-IN')}` : 'Not specified';
  const totalValue = assets.reduce((s, a) => s + (Number(a.estimatedValue) || 0), 0);

  const filtered = assets.filter(a => {
    const ms = !search || a.assetName?.toLowerCase().includes(search.toLowerCase()) || a.owner?.toLowerCase().includes(search.toLowerCase());
    const mt = !filterType || a.assetType === filterType;
    return ms && mt;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-1"><li className="breadcrumb-item text-muted">Dashboard</li><li className="breadcrumb-item active">Assets & Property</li></ol></nav>
          <h2 className="mb-0 fw-bold"><i className="bi bi-building-fill text-primary me-2"></i>Assets & Property</h2>
          <p className="text-muted mb-0">Track all your properties, vehicles, investments and other assets</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Asset</button>
      </div>

      {totalValue > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}>
              <div className="card-body text-white"><div className="small opacity-75">Total Estimated Value</div><div className="h4 fw-bold mb-0">{formatCurrency(totalValue)}</div></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm bg-white">
              <div className="card-body"><div className="text-muted small">Total Assets</div><div className="h4 fw-bold mb-0 text-primary">{assets.length}</div></div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="col-md-4"><select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Types</option>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
        </div>
      </div>

      {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) :
       filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-building display-1 text-muted"></i><h5 className="mt-3 text-muted">No assets added yet.</h5><button className="btn btn-primary mt-2" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add First Asset</button></div>
      ) : (
        <div className="row g-4">
          {filtered.map(a => (
            <div key={a.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3" style={{width:'48px',height:'48px',borderRadius:'12px',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>
                      <i className={`bi ${getTypeIcon(a.assetType)} text-primary`}></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{a.assetName}</h6>
                      <span className="badge bg-light text-dark border small">{a.assetType}</span>
                    </div>
                  </div>
                  {a.owner && <div className="mb-1"><span className="text-muted small">Owner: </span><span className="small fw-medium">{a.owner}</span></div>}
                  {a.location && <div className="mb-1"><i className="bi bi-geo-alt text-muted me-1 small"></i><span className="small">{a.location}</span></div>}
                  {a.estimatedValue && <div className="mb-2"><span className="text-muted small">Value: </span><span className="fw-bold text-success">{formatCurrency(a.estimatedValue)}</span></div>}
                  {a.description && <p className="text-muted small mb-3">{a.description.length > 80 ? a.description.substring(0,80) + '...' : a.description}</p>}
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => setViewItem(a)}><i className="bi bi-eye me-1"></i>View</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => openEdit(a)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Asset' : 'Add Asset'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-medium">Asset Name <span className="text-danger">*</span></label><input name="assetName" className="form-control" value={form.assetName} onChange={handleChange} required /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Asset Type</label><select name="assetType" className="form-select" value={form.assetType} onChange={handleChange}><option value="">Select type</option>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label fw-medium">Owner</label><input name="owner" className="form-control" value={form.owner} onChange={handleChange} /></div>
            <div className="col-md-6"><label className="form-label fw-medium">Estimated Value (₹)</label><input type="number" name="estimatedValue" className="form-control" value={form.estimatedValue} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Location/Address</label><input name="location" className="form-control" value={form.location} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Description</label><textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange}></textarea></div>
            <div className="col-12"><label className="form-label fw-medium">Document Reference</label><input name="documentReference" className="form-control" value={form.documentReference} onChange={handleChange} /></div>
            <div className="col-12"><label className="form-label fw-medium">Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange}></textarea></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editItem ? 'Update Asset' : 'Add Asset'}</button>
          </div>
        </form>
      </Modal>

      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Asset Details" size="lg">
          <div className="row g-3">
            {[['Asset Name',viewItem.assetName],['Asset Type',viewItem.assetType],['Owner',viewItem.owner],['Location',viewItem.location],['Estimated Value',formatCurrency(viewItem.estimatedValue)],['Document Reference',viewItem.documentReference],['Description',viewItem.description],['Notes',viewItem.notes]].filter(([,v])=>v).map(([l,v])=>(
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
