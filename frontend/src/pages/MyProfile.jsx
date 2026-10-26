import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MyProfile = () => {
  const { updateLocalProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Tab state: 'profile' or 'password'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    city: '',
    state: '',
    country: 'India',
    profilePhoto: '',
    emergencyContact: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
      }
    } catch (e) {
      setMessage({ text: 'Failed to load profile', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/profile', profile);
      if (res.data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        updateLocalProfile(res.data.data);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'danger' });
      return;
    }
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.post('/profile/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        setMessage({ text: 'Password changed successfully!', type: 'success' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px' }}>
      {/* Title */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark m-0">My Vault Profile</h4>
        <p className="text-muted small m-0">
          Manage your personal details, emergency contact numbers, and security credentials.
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show py-2 small mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'profile' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => { setActiveTab('profile'); setMessage({ text: '', type: '' }); }}
          >
            <i className="bi bi-person me-2"></i>Profile Information
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'password' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => { setActiveTab('password'); setMessage({ text: '', type: '' }); }}
          >
            <i className="bi bi-shield-lock me-2"></i>Security & Password
          </button>
        </li>
      </ul>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card-modern p-4">
          <form onSubmit={handleProfileSubmit}>
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fs-2 fw-bold"
                style={{ width: '70px', height: '70px' }}
              >
                {profile.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0">{profile.fullName}</h5>
                <span className="badge bg-primary-subtle text-primary border me-2">{profile.role}</span>
                <span className="text-muted small">@{profile.username}</span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Email Address (Registered)</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  disabled
                  value={profile.email || ''}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Gender</label>
                <select
                  className="form-select"
                  value={profile.gender || 'Male'}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Emergency Contact Details</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Primary contact name & phone"
                  value={profile.emergencyContact || ''}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Permanent Residential Address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.state || ''}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.country || 'India'}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-end">
              <button type="submit" className="btn btn-primary-custom px-4" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card-modern p-4" style={{ maxWidth: '520px' }}>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Current Password *</label>
              <input
                type="password"
                className="form-control"
                required
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">New Password *</label>
              <input
                type="password"
                className="form-control"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Confirm New Password *</label>
              <input
                type="password"
                className="form-control"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary-custom w-100" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
