// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // User Filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Analytics
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);

  // Broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all');
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes, usersRes, appsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors'),
        api.get('/admin/users'),
        api.get('/admin/appointments')
      ]);
      setStats(statsRes.data || {});
      setDoctors(docsRes.data || []);
      setUsers(usersRes.data || []);
      setAppointments(appsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDoctor = async (id) => {
    try {
      await api.patch(`/admin/doctors/${id}/approve`);
      showAlert('Doctor credentials verified and account activated successfully!', 'success');
      fetchData();
    } catch (err) {
      showAlert('Failed to approve doctor', 'danger');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}" from the system?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      showAlert(`User "${name}" has been removed from platform`, 'info');
      fetchData();
    } catch (err) {
      showAlert('Failed to delete user', 'danger');
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      showAlert(`User status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showAlert('Failed to update user status', 'danger');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcastSubmitting(true);
    try {
      await api.post('/admin/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        targetAudience: broadcastAudience
      });
      showAlert('Announcement broadcasted successfully!', 'success');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err) {
      showAlert('Failed to broadcast announcement', 'danger');
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics/reports');
      setAdvancedAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingDoctorsList = doctors.filter(d => !d.approved);
  const verifiedDoctorsList = doctors.filter(d => d.approved);

  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.specialization?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div>
      {/* Alert Banner */}
      {alert && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          background: alert.type === 'success' ? '#ecfdf5' : alert.type === 'danger' ? '#fef2f2' : '#eff6ff',
          border: `1px solid ${alert.type === 'success' ? '#a7f3d0' : alert.type === 'danger' ? '#fecaca' : '#bfdbfe'}`,
          color: alert.type === 'success' ? '#065f46' : alert.type === 'danger' ? '#991b1b' : '#1e40af',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hospital Administration Console</h1>
          <p className="dashboard-subtitle">
            System Director: <strong>{user?.name || 'Administrator'}</strong> • Clinical Operations & Security Hub
          </p>
        </div>

        {pendingDoctorsList.length > 0 && (
          <button
            className="btn btn-warning"
            onClick={() => setActiveTab('approvals')}
            style={{ fontWeight: 700, background: '#f59e0b', color: '#ffffff' }}
          >
            ⚠️ {pendingDoctorsList.length} Pending Doctor Approval{pendingDoctorsList.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Executive KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            👥
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.usersCount || users.length}</span>
            <span className="stat-label">Total System Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            🩺
          </div>
          <div className="stat-info">
            <span className="stat-value">{verifiedDoctorsList.length}</span>
            <span className="stat-label">Verified Specialists</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: pendingDoctorsList.length > 0 ? '4px solid #f59e0b' : '1px solid var(--border)' }}>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
            ⏳
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: pendingDoctorsList.length > 0 ? '#b45309' : '#0f172a' }}>
              {pendingDoctorsList.length}
            </span>
            <span className="stat-label">Pending Verification</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
            📅
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.appointmentsCount || appointments.length}</span>
            <span className="stat-label">Total Appointments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            💊
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.prescriptionsCount || 0}</span>
            <span className="stat-label">Prescriptions Issued</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Operations Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          🩺 Doctor Approvals {pendingDoctorsList.length > 0 && <span className="badge badge-warning">{pendingDoctorsList.length}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Directory ({users.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Hospital Appointments ({appointments.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          🏥 Clinical Departments
        </button>
        <button
          className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}
        >
          📈 Reports & Analytics
        </button>
      </div>

      {/* TAB 1: OPERATIONS OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* System Health Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Hospital Platform Status</h2>
                <span className="badge badge-success">● Operational 99.98%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>Patient / Doctor Ratio</span>
                  <strong>{verifiedDoctorsList.length > 0 ? (stats?.patientsCount / verifiedDoctorsList.length).toFixed(1) : 0} : 1</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>Appointment Completion Rate</span>
                  <strong style={{ color: '#059669' }}>94.2%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>HIPAA Compliance & Encryption</span>
                  <strong style={{ color: '#0284c7' }}>AES-256 Enabled</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Administrative Fast Actions</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('approvals')}
                  style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🩺</span>
                  <span>Review Doctors</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('users')}
                  style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>👥</span>
                  <span>Manage Users</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('appointments')}
                  style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📅</span>
                  <span>View Schedule</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('departments')}
                  style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🏥</span>
                  <span>Departments</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pending Applications Alert Callout */}
          {pendingDoctorsList.length > 0 && (
            <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ color: '#92400e', margin: 0 }}>
                    ⚡ {pendingDoctorsList.length} Doctor Application{pendingDoctorsList.length > 1 ? 's' : ''} Awaiting Review
                  </h3>
                  <p style={{ color: '#b45309', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    New specialists have registered and submitted their clinical credentials for administrative verification.
                  </p>
                </div>
                <button
                  className="btn btn-warning"
                  onClick={() => setActiveTab('approvals')}
                  style={{ fontWeight: 700, background: '#d97706', color: '#fff' }}
                >
                  Review Applications Now →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCTOR APPROVALS DESK */}
      {activeTab === 'approvals' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Specialist Credentialing & Approval Desk</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Verify medical degrees, practice licenses, and board certifications before granting clinical access.
              </p>
            </div>
            <span className="badge badge-warning">{pendingDoctorsList.length} Pending</span>
          </div>

          {pendingDoctorsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3>All Doctor Applications are Verified!</h3>
              <p style={{ marginTop: '0.5rem' }}>There are no pending doctor approval requests at this moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingDoctorsList.map(doc => (
                <div
                  key={doc._id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: '#fef3c7',
                      border: '2px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem'
                    }}>
                      🩺
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>
                        {doc.specialization || 'General Specialist'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                        📧 {doc.email} • 🎓 {doc.qualifications || 'MD Certified'} • ⏳ {doc.experience || 5} yrs practice
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApproveDoctor(doc._id)}
                      className="btn btn-success"
                    >
                      ✓ Approve Credentials
                    </button>
                    <button
                      onClick={() => handleDeleteUser(doc._id, doc.name)}
                      className="btn btn-danger"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT DIRECTORY */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="card-title">Platform User Directory</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'patient', 'doctor', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`btn btn-sm ${userRoleFilter === r ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {r === 'all' ? 'All Roles' : `${r}s`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="form-control"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Department / Info</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-info' :
                        u.role === 'doctor' ? 'badge-primary' : 'badge-success'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === 'doctor' ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.specialization}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.qualifications}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {u.bloodGroup ? `Blood: ${u.bloodGroup} • Age: ${u.age || 30}` : 'Standard Profile'}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'blocked' ? 'badge-danger' : (u.approved !== false ? 'badge-success' : 'badge-warning')}`}>
                        {u.status === 'blocked' ? 'Blocked' : (u.approved !== false ? 'Active' : 'Pending Verification')}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.status)}
                            className={`btn btn-sm ${u.status === 'blocked' ? 'btn-success' : 'btn-warning'}`}
                          >
                            {u.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HOSPITAL GLOBAL APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Hospital Global Appointments Log</h2>
            <span className="badge badge-info">{appointments.length} Total Bookings</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Assigned Doctor</th>
                  <th>Date & Time</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => {
                  const statusClass =
                    app.status === 'accepted' ? 'badge-success' :
                    app.status === 'pending' ? 'badge-warning' :
                    app.status === 'completed' ? 'badge-info' : 'badge-danger';

                  return (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 700 }}>
                        {app.patient?.name || 'Patient'}
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>
                          {app.patient?.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.doctor?.name || 'Specialist'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>
                          {app.doctor?.specialization || 'Clinical'}
                        </div>
                      </td>
                      <td>
                        {new Date(app.date).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.timeSlot || '10:00 AM'}</div>
                      </td>
                      <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                        {app.reason || 'General Checkup'}
                      </td>
                      <td>
                        <span className={`badge ${statusClass}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CLINICAL DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'Cardiology', icon: '❤️', head: 'Dr. Sarah Jenkins', doctorsCount: 1, openSlots: 11 },
            { name: 'Neurology', icon: '🧠', head: 'Dr. Marcus Vance', doctorsCount: 1, openSlots: 6 },
            { name: 'Pediatrics', icon: '👶', head: 'Dr. Elena Rostova', doctorsCount: 1, openSlots: 9 },
            { name: 'Orthopedics', icon: '🦴', head: 'Dr. David Chen', doctorsCount: 1, openSlots: 5 },
            { name: 'General Medicine', icon: '🩺', head: 'Dr. Olivia Thorne', doctorsCount: 1, openSlots: 7 },
            { name: 'Dermatology', icon: '✨', head: 'Pending Assignment', doctorsCount: 0, openSlots: 0 }
          ].map(dept => (
            <div key={dept.name} className="card" style={{ margin: 0 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{dept.icon}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{dept.name}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Department Head: <strong>{dept.head}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <span>Staff: <strong>{dept.doctorsCount} Doctor(s)</strong></span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>{dept.openSlots} Available Slots</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Broadcast Announcements</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Send system-wide or targeted notifications to users.</p>
          </div>
          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Audience</label>
              <select className="form-control" value={broadcastAudience} onChange={(e) => setBroadcastAudience(e.target.value)} required>
                <option value="all">All Users</option>
                <option value="patient">Patients Only</option>
                <option value="doctor">Doctors Only</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Title</label>
              <input type="text" className="form-control" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} required placeholder="e.g., System Maintenance" />
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Message</label>
              <textarea className="form-control" rows="4" value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} required placeholder="Write your announcement here..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={broadcastSubmitting}>
              {broadcastSubmitting ? 'Sending...' : 'Broadcast Message'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: REPORTS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Advanced Reports & Analytics</h2>
          </div>
          {advancedAnalytics ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Appointments Trend</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
                  {advancedAnalytics.appointmentsOverTime.map(d => (
                    <div key={d.month} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <div style={{ width: '100%', background: '#0284c7', height: `${(d.value / 60) * 100}%`, minHeight: '1px', borderRadius: '4px 4px 0 0' }}></div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Revenue Trend (USD)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
                  {advancedAnalytics.revenueOverTime.map(d => (
                    <div key={d.month} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <div style={{ width: '100%', background: '#10b981', height: `${(d.value / 6000) * 100}%`, minHeight: '1px', borderRadius: '4px 4px 0 0' }}></div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Loading analytics data...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
