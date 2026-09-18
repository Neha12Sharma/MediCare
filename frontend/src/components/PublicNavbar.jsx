// src/components/PublicNavbar.jsx
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PublicNavbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const userPortalPath = user
    ? user.role === 'patient'
      ? '/patient'
      : user.role === 'doctor'
      ? '/doctor'
      : '/admin'
    : '/login';

  const navLinkStyle = (path) => ({
    padding: '0.5rem 1.1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive(path) ? '#0284c7' : '#475569',
    background: isActive(path) ? '#e0f2fe' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {/* Brand Logo — always links to home */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontSize: '1.6rem', fontWeight: 900,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
          }}>+</div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              MediCare<span style={{ color: '#0284c7' }}>+</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Hospital & Clinical Health System
            </div>
          </div>
        </Link>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Emergency strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: '#fef2f2', border: '1px solid #fee2e2',
            padding: '0.4rem 0.85rem', borderRadius: '30px',
            fontSize: '0.825rem', color: '#dc2626', fontWeight: 700,
          }}>
            <span>🚨</span>
            <span>Emergency: <strong>1-800-MEDICARE</strong></span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/" style={navLinkStyle('/')}>Dashboard</Link>
            
            {/* On home page, do not show Sign In and Register at the top */}
            {location.pathname !== '/' && (
              <>
                <Link to="/login" style={navLinkStyle('/login')}>
                  🔑 Sign In
                </Link>

                <Link to="/register" style={navLinkStyle('/register')}>
                  Register
                </Link>
              </>
            )}

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link to={userPortalPath} style={navLinkStyle(userPortalPath)}>
                  👤 Portal ({user.name || user.role})
                </Link>
                <button
                  onClick={logout}
                  title="Logout of portal session"
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Logout
                </button>
              </div>
            )}

            <Link
              to="/register"
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              📅 Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;


