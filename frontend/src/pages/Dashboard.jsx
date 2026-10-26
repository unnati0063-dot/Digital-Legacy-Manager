import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (expiryDate) => {
    if (!expiryDate) return <span className="badge-valid">Valid</span>;
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge-expired">Expired</span>;
    } else if (diffDays <= 30) {
      return <span className="badge-expiring">Expires in {diffDays} days</span>;
    } else if (diffDays <= 90) {
      return <span className="badge-expiring">Expires in {Math.round(diffDays / 30)} mos</span>;
    }
    return <span className="badge-valid">Valid</span>;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header / Greeting */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Personal & Family Vault Overview</h4>
          <p className="text-muted small m-0">
            Real-time status of your protected records, family members, assets and upcoming renewals.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/government-documents" className="btn btn-primary-custom btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-cloud-arrow-up"></i> Upload Document
          </Link>
          <Link to="/family-members" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-person-plus"></i> Add Family
          </Link>
          <Link to="/family-access" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-shield-check"></i> Manage Access
          </Link>
        </div>
      </div>

      {/* Expiry Alert Banner if any expiring */}
      {stats?.expiringSoonDocuments > 0 && (
        <div className="alert alert-warning border-warning shadow-sm d-flex align-items-center justify-content-between p-3 mb-4 rounded-3">
          <div className="d-flex align-items-center gap-3">
            <div className="fs-3 text-warning">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div>
              <div className="fw-bold text-dark">Action Required: Document Renewals</div>
              <div className="small text-secondary">
                You have <strong>{stats.expiringSoonDocuments} document(s)</strong> expiring in the next 60 days. Check and update renewals.
              </div>
            </div>
          </div>
          <Link to="/government-documents" className="btn btn-sm btn-warning fw-semibold px-3">
            Review Documents
          </Link>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Total Docs"
            count={stats?.totalDocuments}
            icon="bi-files"
            color="#1e3a8a"
            bgColor="#eff6ff"
            onClick={() => navigate('/government-documents')}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Family"
            count={stats?.totalFamilyMembers}
            icon="bi-people-fill"
            color="#0284c7"
            bgColor="#f0f9ff"
            onClick={() => navigate('/family-members')}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Expiring Soon"
            count={stats?.expiringSoonDocuments}
            icon="bi-clock-history"
            color="#d97706"
            bgColor="#fffbeb"
            onClick={() => navigate('/government-documents')}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Assets"
            count={stats?.totalAssets}
            icon="bi-building"
            color="#059669"
            bgColor="#ecfdf5"
            onClick={() => navigate('/assets')}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Contacts"
            count={stats?.totalContacts}
            icon="bi-person-lines-fill"
            color="#7c3aed"
            bgColor="#f5f3ff"
            onClick={() => navigate('/contacts')}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Pending Access"
            count={stats?.pendingInvitations}
            icon="bi-send-check"
            color="#dc2626"
            bgColor="#fef2f2"
            onClick={() => navigate('/family-access')}
          />
        </div>
      </div>

      {/* Middle Row: Recent Documents & Upcoming Expiries */}
      <div className="row g-3 mb-4">
        {/* Recent Documents Table */}
        <div className="col-12 col-lg-8">
          <div className="card-modern h-100 p-3">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark m-0">Recent Documents in Vault</h6>
                <small className="text-muted">Latest verified records uploaded across all categories</small>
              </div>
              <Link to="/government-documents" className="small text-primary text-decoration-none fw-semibold">
                View All Docs <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {stats?.recentDocuments?.length === 0 ? (
              <div className="text-center py-4 text-muted small">No documents in vault yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Category</th>
                      <th>Owner</th>
                      <th>Status / Expiry</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentDocuments?.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                            <div>
                              <div className="fw-semibold text-dark">{doc.documentName}</div>
                              <small className="text-muted">{doc.documentType}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {doc.category}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium text-dark">{doc.ownerName}</span>
                        </td>
                        <td>
                          {getStatusBadge(doc.expiryDate)}
                        </td>
                        <td>
                          <Link
                            to={doc.category === 'GOVERNMENT' ? '/government-documents' : '/personal-documents'}
                            className="btn btn-sm btn-light border"
                            title="Manage"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Expiry Dates Card */}
        <div className="col-12 col-lg-4">
          <div className="card-modern h-100 p-3">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark m-0">Upcoming Expiry Dates</h6>
                <small className="text-muted">Documents requiring attention</small>
              </div>
              <i className="bi bi-calendar-check text-muted"></i>
            </div>

            {stats?.upcomingExpiries?.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
                All documents and policies are up to date!
              </div>
            ) : (
              <div className="d-flex flex-direction-column gap-2">
                {stats?.upcomingExpiries?.map((item) => (
                  <div key={item.id} className="p-2 border rounded-3 mb-2 bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold small text-dark">{item.documentName}</div>
                      <small className="text-muted">{item.ownerName} • {item.documentType}</small>
                    </div>
                    <div className="text-end">
                      <div className="badge-expiring">{item.expiryDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Important Information & Recent Activity Logs */}
      <div className="row g-3">
        {/* Important Directives & Notes */}
        <div className="col-12 col-lg-6">
          <div className="card-modern p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark m-0">Critical Emergency Notes & Locations</h6>
                <small className="text-muted">Directives accessible to family representatives</small>
              </div>
              <Link to="/important-info" className="small text-primary text-decoration-none fw-semibold">
                Manage <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {stats?.importantInformation?.length === 0 ? (
              <div className="text-center py-3 text-muted small">No emergency directives registered yet.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {stats?.importantInformation?.map((info) => (
                  <div key={info.id} className="p-3 border rounded-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark small">{info.title}</span>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                        {info.importanceLevel} Priority
                      </span>
                    </div>
                    <p className="text-muted small m-0 line-clamp-2">{info.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="col-12 col-lg-6">
          <div className="card-modern p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h6 className="fw-bold text-dark m-0">Recent Vault Activity (Audit Trail)</h6>
                <small className="text-muted">Cryptographically recorded security logs</small>
              </div>
              <Link to="/audit-logs" className="small text-primary text-decoration-none fw-semibold">
                Full Log <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {stats?.recentActivities?.length === 0 ? (
              <div className="text-center py-3 text-muted small">No recent activity recorded.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {stats?.recentActivities?.map((act) => (
                  <div key={act.id} className="d-flex align-items-center justify-content-between p-2 border-bottom small">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary-subtle text-primary">{act.action}</span>
                      <span className="text-dark">{act.details}</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
