// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(
    location.state?.registeredEmail
      ? `✓ Registration successful for ${location.state.name || location.state.registeredEmail}! Please enter your password to sign in.`
      : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email.trim(), password);
      if (userData && userData.role) {
        // If they were redirected from a protected page, go back there
        const from = location.state?.from;
        if (from && from.pathname && !['/login', '/register'].includes(from.pathname)) {
          navigate(from, { replace: true });
          return;
        }
        // Otherwise go to their role dashboard
        const role = userData.role;
        const path = role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/';
        navigate(path, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const appendGmail = () => {
    if (!email.includes('@')) {
      setEmail(email + '@gmail.com');
    } else {
      const base = email.split('@')[0];
      setEmail(base + '@gmail.com');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicNavbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          maxWidth: '1080px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
        }}>
          {/* Left Column: Hospital Image & Highlights */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            {/* Background Hospital Image with Gradient Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url(/hospital_building.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              zIndex: 0
            }} />

            {/* Content Overlays */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '1.5rem'
              }}>
                🏥 SUMMIT HEALTH CAMPUS
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem 0', color: '#ffffff' }}>
                Next-Generation Hospital & Clinical Care
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#e0f2fe', lineHeight: 1.6, margin: 0 }}>
                Unified healthcare portal connecting patients, specialist physicians, and hospital administration with real-time appointments, diagnostic lab archives, and digital prescriptions.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>🩺</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Verified Specialist Doctors</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Cardiology, Dermatology, Neurology & More</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>📑</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Secure Electronic Health Records</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Instant lab downloads & digital prescription slips</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>🚨</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>24/7 Clinical Network</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Hospital emergency care and telehealth support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CLINICAL PORTAL ACCESS
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem 0' }}>
                Sign In to MediCare+
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Select a quick demo profile or enter your registered account credentials.
              </p>
            </div>

            {infoMessage && (
              <div style={{
                padding: '0.85rem 1rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <span>✓</span>
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div style={{
                padding: '0.85rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#dc2626',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Logins with @gmail.com */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ One-Click Demo Credentials:
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                  Ends with @gmail.com
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@gmail.com', 'admin123')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    fontSize: '0.8rem',
                    background: '#ede9fe',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  👑 Admin
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>admin@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('doctor@gmail.com', 'doctor123')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    fontSize: '0.8rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  🩺 Doctor
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>doctor@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('patient@gmail.com', 'patient123')}
                  style={{
                    padding: '0.55rem 0.5rem',
                    fontSize: '0.8rem',
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  👤 Patient
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>patient@gmail.com</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Email Address
                  </label>
                  <button
                    type="button"
                    onClick={appendGmail}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    + Add @gmail.com
                  </button>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. yourname@gmail.com"
                  className="form-control"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-control"
                  style={{ fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Remember this terminal</span>
                </label>
                <span style={{ color: '#0284c7', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal →'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              Don't have an active hospital profile?{' '}
              <Link to="/register" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                Register new account here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Login;
