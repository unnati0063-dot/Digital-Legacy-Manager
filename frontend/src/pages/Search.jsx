import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SEARCH_CATEGORIES = [
  { key: 'documents',      label: 'Documents',         icon: 'bi-file-earmark-text', route: '/government-documents', getLabel: i => i.documentName || i.name },
  { key: 'familyMembers',  label: 'Family Members',    icon: 'bi-people',             route: '/family-members',       getLabel: i => `${i.fullName} (${i.relationship})` },
  { key: 'assets',         label: 'Assets',            icon: 'bi-building',           route: '/assets',               getLabel: i => `${i.assetName} — ${i.assetType}` },
  { key: 'contacts',       label: 'Contacts',          icon: 'bi-person-lines-fill',  route: '/contacts',             getLabel: i => `${i.name}${i.contactType ? ` — ${i.contactType}` : ''}` },
  { key: 'importantInfo',  label: 'Important Info',    icon: 'bi-bookmark-star',      route: '/important-info',       getLabel: i => i.title },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.length < 2) { setError('Please enter at least 2 characters to search.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.get(`/api/search/global?q=${encodeURIComponent(query)}`);
      setResults(res.data.data || res.data || {});
    } catch { setError('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setError('');
    inputRef.current?.focus();
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return SEARCH_CATEGORIES.reduce((s, cat) => s + (results[cat.key]?.length || 0), 0);
  };

  const ResultSection = ({ cat }) => {
    const items = results?.[cat.key];
    if (!items?.length) return null;
    return (
      <div className="mb-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center">
          <i className={`bi ${cat.icon} me-2 text-primary`}></i>
          {cat.label}
          <span className="badge bg-primary ms-2">{items.length}</span>
        </h6>
        <div className="list-group">
          {items.map((item, idx) => (
            <button
              key={idx}
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => navigate(cat.route)}
            >
              <i className={`bi ${cat.icon} me-3 text-primary`}></i>
              <div className="text-start">
                <div className="fw-medium">{cat.getLabel(item)}</div>
                {item.description && (
                  <div className="text-muted small">{String(item.description).substring(0, 80)}{item.description?.length > 80 ? '...' : ''}</div>
                )}
              </div>
              <i className="bi bi-chevron-right ms-auto text-muted"></i>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item text-muted">Dashboard</li>
            <li className="breadcrumb-item active">Search</li>
          </ol>
        </nav>
        <h2 className="mb-0 fw-bold"><i className="bi bi-search text-primary me-2"></i>Global Search</h2>
        <p className="text-muted mb-0">Search across all documents, family members, contacts and more</p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSearch}>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white"><i className="bi bi-search text-primary"></i></span>
              <input
                ref={inputRef}
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search documents, family members, contacts, assets..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button type="button" className="btn btn-outline-secondary" onClick={clearSearch}>
                  <i className="bi bi-x"></i>
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <span className="spinner-border spinner-border-sm"></span>
                  : <><i className="bi bi-search me-2"></i>Search</>
                }
              </button>
            </div>
          </form>
          {error && (
            <div className="alert alert-danger mt-3 mb-0">
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}
        </div>
      </div>

      {results === null && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">Search across your entire vault</h5>
          <p className="text-muted">Type a keyword above to find anything stored in your Digital Legacy Manager</p>
          <div className="row g-3 mt-2 justify-content-center">
            {SEARCH_CATEGORIES.map(cat => (
              <div key={cat.key} className="col-auto">
                <span className="badge bg-light text-dark border p-2">
                  <i className={`bi ${cat.icon} me-2`}></i>{cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results !== null && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h6 className="mb-0 fw-bold">
              {getTotalResults() === 0
                ? `No results found for "${query}"`
                : `${getTotalResults()} result${getTotalResults() !== 1 ? 's' : ''} for "${query}"`
              }
            </h6>
          </div>
          <div className="card-body">
            {getTotalResults() === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-search display-3 text-muted"></i>
                <p className="text-muted mt-2">
                  No results found for "<strong>{query}</strong>". Try different keywords.
                </p>
              </div>
            ) : (
              SEARCH_CATEGORIES.map(cat => <ResultSection key={cat.key} cat={cat} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
