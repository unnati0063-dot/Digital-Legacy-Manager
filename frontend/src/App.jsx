import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyProfile from './pages/MyProfile';
import FamilyMembers from './pages/FamilyMembers';
import GovernmentDocuments from './pages/GovernmentDocuments';
import PersonalDocuments from './pages/PersonalDocuments';
import Assets from './pages/Assets';
import Financial from './pages/Financial';
import Insurance from './pages/Insurance';
import Medical from './pages/Medical';
import DigitalAccounts from './pages/DigitalAccounts';
import Contacts from './pages/Contacts';
import LegacyInstructions from './pages/LegacyInstructions';
import ImportantInfo from './pages/ImportantInfo';
import Notifications from './pages/Notifications';
import FamilyAccess from './pages/FamilyAccess';
import AuditLogs from './pages/AuditLogs';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';

// Protected Layout
const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <div className="text-muted fw-medium">Loading your vault...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Admin-only guard
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

    {/* Protected */}
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<MyProfile />} />
      <Route path="/family-members" element={<FamilyMembers />} />
      <Route path="/government-documents" element={<GovernmentDocuments />} />
      <Route path="/personal-documents" element={<PersonalDocuments />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/financial" element={<Financial />} />
      <Route path="/insurance" element={<Insurance />} />
      <Route path="/medical" element={<Medical />} />
      <Route path="/digital-accounts" element={<DigitalAccounts />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/legacy-instructions" element={<LegacyInstructions />} />
      <Route path="/important-info" element={<ImportantInfo />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/family-access" element={<FamilyAccess />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/search" element={<Search />} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
    </Route>

    {/* Default redirect */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
