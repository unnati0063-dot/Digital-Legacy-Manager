import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    city: '',
    state: '',
    country: 'India',
    emergencyContact: '',
  });

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: request, 2: reset
  const [resetMsg, setResetMsg] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(usernameOrEmail, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(registerData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user, pass) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    login(user, pass)
      .then((res) => {
        if (res.success) navigate('/dashboard');
      })
      .catch((err) => setError(err.response?.data?.message || 'Quick login failed'));
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setResetToken(res.data.data.token || '');
        setResetStep(2);
        setResetMsg('Reset token generated! Enter your new password below.');
      }
    } catch (err) {
      setResetMsg(err.response?.data?.message || 'Email not found.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        token: resetToken,
        newPassword: newPassword,
      });
      if (res.data.success) {
        setShowForgotModal(false);
        setSuccessMsg('Password reset successful! Please login with your new password.');
        setResetStep(1);
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
      }
    } catch (err) {
      setResetMsg(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-modern shadow-sm p-4 p-md-5" style={{ maxWidth: isRegister ? '650px' : '460px', width: '100%' }}>
        {/* Header Branding */}
        <div className="text-center mb-4">
          <div
            className="brand-icon mx-auto mb-3"
            style={{ width: '56px', height: '56px', fontSize: '1.75rem', borderRadius: '14px' }}
          >
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Digital Legacy Manager</h3>
          <p className="text-muted small">
            Secure Personal & Family Digital Vault, Documents & Asset Protection
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="d-flex rounded-3 bg-light p-1 mb-4 border">
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 ${
              !isRegister ? 'btn-white shadow-sm text-primary bg-white' : 'text-muted'
            }`}
            onClick={() => {
              setIsRegister(false);
              setError('');
              setSuccessMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 ${
              isRegister ? 'btn-white shadow-sm text-primary bg-white' : 'text-muted'
            }`}
            onClick={() => {
              setIsRegister(true);
              setError('');
              setSuccessMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
        {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

        {!isRegister ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Username or Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your username or email"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 fw-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>Authenticating...
                </span>
              ) : (
                'Sign In to Vault'
              )}
            </button>

            {/* Quick Demo Logins */}
            <div className="mt-4 pt-3 border-top">
              <div className="text-center text-muted small fw-medium mb-2">Quick Demo Access:</div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-50 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => handleQuickLogin('john_doe', 'Password@123')}
                >
                  <i className="bi bi-person-check"></i> Vault Owner
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-50 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => handleQuickLogin('admin', 'Password@123')}
                >
                  <i className="bi bi-shield-lock"></i> Administrator
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="row g-2">
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Johnathan Doe"
                  required
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Username *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. john_doe"
                  required
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="john@example.com"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Password *</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Mobile Number</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="+91 9876543210"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Date of Birth</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={registerData.dateOfBirth}
                  onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Gender</label>
                <select
                  className="form-select form-select-sm"
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-12 col-md-6 mb-2">
                <label className="form-label small fw-semibold text-secondary">Emergency Contact</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Name & Contact number"
                  value={registerData.emergencyContact}
                  onChange={(e) => setRegisterData({ ...registerData, emergencyContact: e.target.value })}
                />
              </div>
              <div className="col-12 mb-2">
                <label className="form-label small fw-semibold text-secondary">Address</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Street / House details"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                />
              </div>
              <div className="col-4 mb-2">
                <label className="form-label small fw-semibold text-secondary">City</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="City"
                  value={registerData.city}
                  onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                />
              </div>
              <div className="col-4 mb-2">
                <label className="form-label small fw-semibold text-secondary">State</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="State"
                  value={registerData.state}
                  onChange={(e) => setRegisterData({ ...registerData, state: e.target.value })}
                />
              </div>
              <div className="col-4 mb-2">
                <label className="form-label small fw-semibold text-secondary">Country</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Country"
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 fw-semibold mt-3"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>Creating Vault...
                </span>
              ) : (
                'Register & Initialize Vault'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowForgotModal(false)}>
          <div
            className="modal-content-custom"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h6 className="m-0 fw-bold">Reset Password</h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowForgotModal(false)}
              ></button>
            </div>
            <div className="modal-body-custom">
              {resetMsg && <div className="alert alert-info py-2 small mb-3">{resetMsg}</div>}
              {resetStep === 1 ? (
                <form onSubmit={handleForgotSubmit}>
                  <p className="small text-muted mb-3">
                    Enter the email registered with your account. We will generate a verification reset code.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Account Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      required
                      placeholder="e.g. john@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary-custom btn-sm w-100">
                    Send Reset Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">Verification Code</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-bold text-center"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">New Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      required
                      minLength={6}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-success btn-sm w-100">
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
