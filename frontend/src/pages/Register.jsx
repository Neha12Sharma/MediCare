// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Register = () => {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentInfo = location.state || {};
  
  const [mode, setMode] = useState(location.state?.mode || 'register');
  const [loginEmail, setLoginEmail] = useState(location.state?.registeredEmail || location.state?.email || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Patient Specific
    age: '28',
    gender: 'Female',
    bloodGroup: 'B+',
    emergencyContact: '',
    address: '',
    // Doctor Specific
    specialization: appointmentInfo.specialty || 'Dermatology',
    qualifications: 'MD, FAAD - Stanford Health',
    experience: '8',
    fee: '140',
    department: 'Outpatient Clinical Department',
    bio: '',
    // Admin Specific
    adminDepartment: 'Hospital Operations',
    adminPin: 'ADMIN-2026'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const appendGmail = () => {
    if (!form.email.includes('@')) {
      setForm(prev => ({ ...prev, email: prev.email + '@gmail.com' }));
    } else {
      const base = form.email.split('@')[0];
      setForm(prev => ({ ...prev, email: base + '@gmail.com' }));
    }
  };

  const appendLoginGmail = () => {
    if (!loginEmail.includes('@')) {
      setLoginEmail(loginEmail + '@gmail.com');
    } else {
      const base = loginEmail.split('@')[0];
      setLoginEmail(base + '@gmail.com');
    }
  };

  const handleDemoFill = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const userData = await login(loginEmail.trim(), loginPassword);
      if (userData && userData.role) {
        const role = userData.role;
        const path = role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/';
        navigate(path, { replace: true, state: { bookingInfo: appointmentInfo } });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: role,
        phone: form.phone,
        // Role specifics
        age: role === 'patient' ? Number(form.age) : undefined,
        gender: role === 'patient' ? form.gender : undefined,
        bloodGroup: role === 'patient' ? form.bloodGroup : undefined,
        emergencyContact: role === 'patient' ? form.emergencyContact : undefined,
        address: role === 'patient' ? form.address : undefined,
        specialization: role === 'doctor' ? form.specialization : undefined,
        qualifications: role === 'doctor' ? form.qualifications : undefined,
        experience: role === 'doctor' ? Number(form.experience) : undefined,
        fee: role === 'doctor' ? Number(form.fee) : undefined,
        bio: role === 'doctor' ? form.bio : undefined,
        department: role === 'admin' ? form.adminDepartment : undefined
      };

      const userData = await register(payload);
      // Auto-login successful — navigate to the appropriate dashboard
      const dashboardPath = role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/';
      navigate(dashboardPath, { replace: true, state: { bookingInfo: appointmentInfo } });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicNavbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          maxWidth: '1120px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
        }}>
          {/* Left Column: Hospital Vision & Facilities */}
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
            {/* Background Hospital Image */}
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

            {/* Overlays */}
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
                🌟 NEW ACCOUNT REGISTRATION
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem 0', color: '#ffffff' }}>
                Join MediCare+ Healthcare Network
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#e0f2fe', lineHeight: 1.6, margin: 0 }}>
                Register as a patient to schedule appointments and view medical records, or join as an accredited medical specialist to manage consultation queues.
              </p>
            </div>

            {/* Role Features List */}
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
                <div style={{ fontSize: '1.5rem' }}>👤</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Patient Portal Benefits</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Direct doctor booking, digital Rx, lab report archive</div>
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
                <div style={{ fontSize: '1.5rem' }}>🩺</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Doctor Clinical Workflow</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Appointment queues, electronic Rx generator, patient roster</div>
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
                <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Hospital Governance</div>
                  <div style={{ fontSize: '0.78rem', color: '#bae6fd' }}>Physician approval, department analytics, EHR security</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Details Registration Form */}
          <div style={{ padding: '2.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
            {appointmentInfo.date && (
              <div style={{
                background: '#e0f2fe',
                border: '1.5px solid #bae6fd',
                color: '#0369a1',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                marginBottom: '1.25rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📅</span>
                <div>
                  <div>Booking Appointment: <strong>{appointmentInfo.specialty}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>Date: {appointmentInfo.date} • Preference: {appointmentInfo.doctor || 'Any Specialist'}</div>
                </div>
              </div>
            )}

            {/* Top Switcher Tabs: Sign In vs Register */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              background: '#f1f5f9',
              padding: '0.35rem',
              borderRadius: '14px'
            }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setLoginError(''); }}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'signin' ? '#0284c7' : 'transparent',
                  color: mode === 'signin' ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s',
                  boxShadow: mode === 'signin' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                🔑 Sign In (Existing User)
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setLoginError(''); }}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'register' ? '#0284c7' : 'transparent',
                  color: mode === 'register' ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s',
                  boxShadow: mode === 'register' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                📝 Register New Account
              </button>
            </div>

            {mode === 'signin' ? (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CLINICAL PORTAL ACCESS
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem 0' }}>
                    Sign In to MediCare+
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Enter your registered email and password to access your dashboard.
                  </p>
                </div>

                {success && (
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
                    <span>{success}</span>
                  </div>
                )}

                {loginError && (
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
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Quick Demo Credentials */}
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⚡ Quick Demo Logins:
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                      Ends with @gmail.com
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
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
                        textAlign: 'center'
                      }}
                    >
                      👤 Patient
                      <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>patient@gmail.com</div>
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
                        textAlign: 'center'
                      }}
                    >
                      🩺 Doctor
                      <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>doctor@gmail.com</div>
                    </button>

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
                        textAlign: 'center'
                      }}
                    >
                      👑 Admin
                      <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.85 }}>admin@gmail.com</div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Email Address
                      </label>
                      <button
                        type="button"
                        onClick={appendLoginGmail}
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
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="e.g. yourname@gmail.com"
                      className="form-control"
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showLoginPassword ? '🙈 Hide' : '👁️ Show'}
                      </button>
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="form-control"
                      style={{ fontSize: '0.95rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard →'}
                  </button>
                </form>

                <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  Don't have an active hospital profile?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setLoginError(''); }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Register new account here
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ONLINE ENROLLMENT
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem 0' }}>
                    Fill Your Profile Details
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Please provide accurate clinical information for medical records.
                  </p>
                </div>

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

            {/* Role Selection Tabs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Select Account Role:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'patient' ? '#0284c7' : '#e2e8f0'}`,
                    background: role === 'patient' ? '#e0f2fe' : '#f8fafc',
                    color: role === 'patient' ? '#0369a1' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  👤 Patient
                </button>

                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'doctor' ? '#0284c7' : '#e2e8f0'}`,
                    background: role === 'doctor' ? '#e0f2fe' : '#f8fafc',
                    color: role === 'doctor' ? '#0369a1' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🩺 Doctor
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'admin' ? '#0284c7' : '#e2e8f0'}`,
                    background: role === 'admin' ? '#e0f2fe' : '#f8fafc',
                    color: role === 'admin' ? '#0369a1' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  👑 Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Primary Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Neha Sharma"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="e.g. +1 (555) 678-9012"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Email Address with @gmail.com auto-append */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Email Address (uses @gmail.com)
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
                    + Append @gmail.com
                  </button>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. neha@gmail.com, doctor@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              {/* =================================================== */}
              {/* PATIENT ROLE SPECIFIC FIELDS */}
              {/* =================================================== */}
              {role === 'patient' && (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                    🏥 Patient Clinical Details & Vitals:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Blood Group</label>
                      <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="form-control" style={{ fontSize: '0.85rem' }}>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Age (Years)</label>
                      <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} className="form-control" style={{ fontSize: '0.85rem' }} />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className="form-control" style={{ fontSize: '0.85rem' }}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Emergency Contact Name & Phone</label>
                    <input
                      name="emergencyContact"
                      type="text"
                      placeholder="e.g. Rajesh Sharma (Brother) +1 555-890-1234"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Residential Address</label>
                    <input
                      name="address"
                      type="text"
                      placeholder="e.g. 500 Tech Park, Suite 4B, Springfield"
                      value={form.address}
                      onChange={handleChange}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* DOCTOR ROLE SPECIFIC FIELDS */}
              {/* =================================================== */}
              {role === 'doctor' && (
                <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                    🩺 Medical Credentials & Specialization:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Specialization</label>
                      <select name="specialization" value={form.specialization} onChange={handleChange} className="form-control" style={{ fontSize: '0.85rem' }}>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Qualifications</label>
                      <input
                        name="qualifications"
                        type="text"
                        placeholder="e.g. MD, FAAD, MBBS"
                        value={form.qualifications}
                        onChange={handleChange}
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Experience (Years)</label>
                      <input
                        name="experience"
                        type="number"
                        min="1"
                        max="50"
                        value={form.experience}
                        onChange={handleChange}
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Consultation Fee ($)</label>
                      <input
                        name="fee"
                        type="number"
                        min="20"
                        max="1000"
                        value={form.fee}
                        onChange={handleChange}
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Clinical Practice Bio</label>
                    <textarea
                      name="bio"
                      rows="2"
                      placeholder="Brief overview of clinical expertise and patient care philosophy..."
                      value={form.bio}
                      onChange={handleChange}
                      className="form-control"
                      style={{ fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* ADMIN ROLE SPECIFIC FIELDS */}
              {/* =================================================== */}
              {role === 'admin' && (
                <div style={{ background: '#fdf4ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f5d0fe', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#86198f', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                    👑 Hospital Administration Governance:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Hospital Department</label>
                      <select name="adminDepartment" value={form.adminDepartment} onChange={handleChange} className="form-control" style={{ fontSize: '0.85rem' }}>
                        <option value="Hospital Operations">Hospital Operations</option>
                        <option value="Clinical Governance">Clinical Governance</option>
                        <option value="Healthcare Informatics">Healthcare Informatics</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Admin Access Authorization</label>
                      <input
                        name="adminPin"
                        type="text"
                        value={form.adminPin}
                        onChange={handleChange}
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                disabled={submitting}
              >
                {submitting ? 'Registering Account...' : 'Complete Registration →'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              Already registered in MediCare+?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setLoginError(''); }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign in to your portal
              </button>
            </div>
          </div>
        )}
      </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Register;
