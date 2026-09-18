// src/components/Layout.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const role = user?.role || 'guest';

  const getRoleBadge = () => {
    if (role === 'admin') return <span className="badge badge-info">👑 Admin Director</span>;
    if (role === 'doctor') return <span className="badge badge-primary">🩺 Specialist Doctor</span>;
    if (role === 'patient') return <span className="badge badge-success">👤 Verified Patient</span>;
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Top Professional Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
            }}>
              +
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                MediCare<span style={{ color: '#0284c7' }}>+</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hospital Management System
              </div>
            </div>
          </div>

          {/* User Profile & Navigation */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {role === 'doctor' ? '🩺' : role === 'admin' ? '🛡️' : '👤'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                      {user.name || 'User'}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {user.email}
                  </span>
                </div>
              </div>

              <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#fecaca', fontWeight: 600 }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div className="app-container">
          {children}
        </div>
      </main>

      {/* Professional Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 1rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} MediCare+ Integrated Clinical Network. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              Clinical Node Online
            </span>
            <span>v2.4 Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
