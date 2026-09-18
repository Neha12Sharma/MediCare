// src/routes/AppRoutes.jsx
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import LandingPage from '../pages/LandingPage';
import PatientDashboard from '../pages/PatientDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

/* Global loading screen shown while AuthContext resolves the session */
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '1.25rem'
  }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '16px',
      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2rem', boxShadow: '0 8px 24px rgba(2,132,199,0.3)',
      animation: 'pulse 1.5s infinite',
    }}>+</div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>MediCare+</div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Verifying your session…</div>
    </div>
    <div style={{
      width: '180px', height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden'
    }}>
      <div style={{
        height: '100%', background: '#0284c7', borderRadius: '999px',
        animation: 'loadbar 1.4s ease-in-out infinite',
        width: '45%',
      }} />
    </div>
  </div>
);

/* ProtectedRoute — guards private pages; saves intended location for post-login redirect */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    // Save where they were trying to go so Login can redirect back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Wrong role — send to their own dashboard
    const home = user.role === 'patient' ? '/patient' : user.role === 'doctor' ? '/doctor' : '/admin';
    return <Navigate to={home} replace />;
  }

  return children;
};

/* PublicOnlyRoute — if already logged in, skip login/register and go straight to dashboard */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (user) {
    // Honour any redirect state (e.g. after being sent to login from a protected page)
    const from = location.state?.from;
    if (from && from.pathname !== '/login' && from.pathname !== '/register') {
      return <Navigate to={from} replace />;
    }
    const home = user.role === 'patient' ? '/patient' : user.role === 'doctor' ? '/doctor' : '/admin';
    return <Navigate to={home} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page — public, no auth required */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication pages */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient dashboard */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout><PatientDashboard /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Doctor dashboard */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout><DoctorDashboard /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all → landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
