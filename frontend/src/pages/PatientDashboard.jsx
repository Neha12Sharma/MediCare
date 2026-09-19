// src/pages/PatientDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const PatientDashboard = () => {
  const { user, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [healthRecordData, setHealthRecordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM');
  const [bookingType, setBookingType] = useState('In-Person Consultation');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppToReschedule, setSelectedAppToReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('10:00 AM');
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Doctor Profile View Modal State
  const [doctorDetailModalOpen, setDoctorDetailModalOpen] = useState(false);
  const [doctorDetail, setDoctorDetail] = useState(null);

  // Report Upload & View State
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Blood Test');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const localFileCache = React.useRef({});
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [viewReportModalOpen, setViewReportModalOpen] = useState(false);
  const [viewReportItem, setViewReportItem] = useState(null);

  // Profile Edit Form State (Feature 17 Fix)
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    existingConditions: '',
    currentMedications: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Chat State
  const [chatSelectedDoctor, setChatSelectedDoctor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Payment State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Rating State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingAppointment, setRatingAppointment] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const specialties = [
    'all',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology'
  ];

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, appsRes, rxRes, repRes, meRes, notifRes, hrRes] = await Promise.all([
        api.get('/patient/doctors').catch(() => ({ data: [] })),
        api.get('/patient/appointments').catch(() => ({ data: [] })),
        api.get('/patient/prescriptions').catch(() => ({ data: [] })),
        api.get('/patient/reports').catch(() => ({ data: [] })),
        api.get('/auth/me').catch(() => ({ data: null })),
        api.get('/patient/notifications').catch(() => ({ data: [] })),
        api.get('/patient/health-record').catch(() => ({ data: null }))
      ]);

      setDoctors(docsRes.data || []);
      setAppointments(appsRes.data || []);
      setPrescriptions(rxRes.data || []);
      setReports(repRes.data || []);
      setHealthRecordData(hrRes.data || null);

      const notifs = notifRes.data || [];
      setNotifications(notifs);
      setUnreadNotifsCount(notifs.filter(n => !n.isRead).length);

      if (meRes.data) {
        const u = meRes.data;
        setProfileForm({
          name: u.name || user?.name || '',
          phone: u.phone || '+1 (555) 678-9012',
          age: u.age || 26,
          gender: u.gender || 'Female',
          bloodGroup: u.bloodGroup || 'B+',
          address: u.address || '500 Tech Park, Suite 4B',
          emergencyContact: u.emergencyContact || 'Rajesh Sharma (+1 555-890-1234)',
          allergies: u.allergies || 'Penicillin, Dust Mites',
          existingConditions: u.existingConditions || 'Mild Asthma',
          currentMedications: u.currentMedications || 'Cetirizine 10mg'
        });
      }
    } catch (err) {
      console.error('Error loading patient data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for new chat messages every 3s when chat tab is active
  useEffect(() => {
    if (activeTab !== 'chat' || !chatSelectedDoctor) return;
    const dId = chatSelectedDoctor._id || chatSelectedDoctor.id;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/patient/chat/${dId}`);
        setChatMessages(res.data || []);
      } catch (err) {
        // quiet fail on polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, chatSelectedDoctor]);

  // Calculate Profile Completion %
  const calculatePatientProfileCompletion = () => {
    const fields = [
      profileForm.name,
      profileForm.phone,
      profileForm.age,
      profileForm.gender,
      profileForm.bloodGroup,
      profileForm.address,
      profileForm.emergencyContact,
      profileForm.allergies
    ];
    const filled = fields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const patientCompletionPct = calculatePatientProfileCompletion();

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSpec = selectedSpecialty === 'all' || doc.specialization?.toLowerCase() === selectedSpecialty.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      doc.name?.toLowerCase().includes(query) ||
      doc.specialization?.toLowerCase().includes(query) ||
      doc.qualifications?.toLowerCase().includes(query) ||
      doc.bio?.toLowerCase().includes(query);
    return matchesSpec && matchesSearch;
  });

  // Filter Appointments
  const filteredAppointments = appointments.filter(app => {
    if (appointmentStatusFilter === 'all') return true;
    return app.status === appointmentStatusFilter;
  });

  // Booking Flow
  const handleOpenBooking = (doc) => {
    setSelectedDoctor(doc);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setBookingDate(tomorrow);
    const firstSlot = doc.availability?.[0]?.slots?.[0] || '10:00 AM';
    setBookingSlot(firstSlot);
    setBookingReason('');
    setBookingType('In-Person Consultation');
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate) return;
    setBookingSubmitting(true);
    try {
      await api.post('/patient/appointments', {
        doctorId: selectedDoctor._id || selectedDoctor.id,
        date: bookingDate,
        timeSlot: bookingSlot,
        reason: `${bookingType}: ${bookingReason || 'General Clinical Consultation'}`
      });
      showAlert(`Appointment request submitted successfully with ${selectedDoctor.name}!`, 'success');
      setBookingModalOpen(false);
      await fetchData();
      setActiveTab('appointments');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to schedule appointment', 'danger');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/patient/appointments/${id}/cancel`);
      showAlert('Appointment cancelled', 'info');
      fetchData();
    } catch (err) {
      showAlert('Failed to cancel appointment', 'danger');
    }
  };

  const handleOpenReschedule = (app) => {
    setSelectedAppToReschedule(app);
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    setRescheduleDate(futureDate);
    setRescheduleSlot(app.timeSlot || '10:00 AM');
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppToReschedule || !rescheduleDate) return;
    setRescheduleSubmitting(true);
    try {
      await api.patch(`/patient/appointments/${selectedAppToReschedule._id}/reschedule`, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot
      });
      showAlert('Appointment rescheduled successfully!', 'success');
      setRescheduleModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to reschedule appointment', 'danger');
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // PDF Prescription Download
  const handlePrintPDFPrescription = (rx) => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      showAlert('Please allow popups to download/print prescription PDF', 'warning');
      return;
    }

    const docName = rx.doctor?.name || 'MediCare+ Specialist';
    const spec = rx.doctor?.specialization || 'Clinical Specialist';
    const patName = profileForm.name || user?.name || 'Patient';
    const rxDate = new Date(rx.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 800; color: #0284c7; }
          .patient-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 25px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #e0f2fe; color: #0369a1; text-align: left; padding: 10px; border: 1px solid #bae6fd; }
          td { padding: 10px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Download PDF / Print
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">✚ MediCare+</div>
            <div style="font-size: 12px; color: #64748b;">Patient Digital Prescription</div>
          </div>
          <div style="text-align: right;">
            <strong>${docName}</strong><br/>${spec}
          </div>
        </div>

        <div class="patient-box">
          <div><strong>Patient:</strong> ${patName}</div>
          <div><strong>Date:</strong> ${rxDate}</div>
        </div>

        <h3 style="color: #0284c7;">Diagnosis: ${rx.diagnosis}</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${(rx.medicines || []).map((m, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.dosage}</td>
                <td>${m.frequency}</td>
                <td>${m.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${rx.notes ? `<p><strong>Doctor Advice:</strong> ${rx.notes}</p>` : ''}
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  // Upload Report
  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!selectedFile && !reportTitle.trim()) {
      showAlert('Please select a file from your PC or provide a report title', 'danger');
      return;
    }
    setUploadSubmitting(true);
    try {
      const formData = new FormData();
      const titleText = reportTitle.trim() || (selectedFile ? selectedFile.name : 'Diagnostic Lab Report');
      const fullTitle = `[${reportCategory}] ${titleText}`;
      formData.append('title', fullTitle);
      if (selectedFile) {
        formData.append('report', selectedFile);
      }
      const res = await api.post('/patient/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (selectedFile && res.data) {
        try {
          const localUrl = URL.createObjectURL(selectedFile);
          if (res.data._id) localFileCache.current[res.data._id] = localUrl;
          if (res.data.filename) localFileCache.current[res.data.filename] = localUrl;
          localFileCache.current[selectedFile.name] = localUrl;
        } catch (e) {
          // ignore object url error
        }
      }
      showAlert(`Medical report "${selectedFile ? selectedFile.name : titleText}" uploaded successfully!`, 'success');
      setReportTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
    } catch (err) {
      console.error('Error uploading report file', err);
      showAlert('Failed to upload report file', 'danger');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const getReportFileUrl = (r) => {
    if (!r) return '';
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api';
    const reportId = r._id || r.id || r.filename;
    const titleParam = encodeURIComponent(r.originalName || r.filename || 'Diagnostic_Report.pdf');
    return `${base}/patient/reports/${reportId}/view?title=${titleParam}`;
  };

  const handleOpenReportModal = (r) => {
    const cachedUrl = localFileCache.current[r._id] || localFileCache.current[r.originalName] || localFileCache.current[r.filename];
    setViewReportItem({
      ...r,
      previewUrl: cachedUrl || getReportFileUrl(r)
    });
    setViewReportModalOpen(true);
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this medical report?')) return;
    try {
      await api.delete(`/patient/reports/${reportId}`);
      showAlert('Medical report deleted successfully', 'info');
      fetchData();
    } catch (err) {
      showAlert('Failed to delete medical report', 'danger');
    }
  };

  // Save Patient Profile (Feature 17 Fix)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      const res = await api.put('/patient/profile', profileForm);
      if (login && user) {
        login({ ...user, name: res.data.name });
      }
      showAlert('Patient medical profile saved successfully!', 'success');
      setProfileModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('Failed to update profile', 'danger');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Notifications
  const handleMarkNotifRead = async (id = null) => {
    try {
      await api.patch('/patient/notifications/read', { id });
      setNotifications(notifications.map(n => (!id || n._id === id ? { ...n, isRead: true } : n)));
      setUnreadNotifsCount(id ? Math.max(0, unreadNotifsCount - 1) : 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    handleMarkNotifRead(notif._id);
    if (notif.type === 'message' && notif.senderId) {
      const doc = doctors.find(d => String(d._id) === notif.senderId);
      if (doc) {
        handleOpenChatWithDoctor(doc);
        setShowNotifDropdown(false);
      }
    }
  };

  // Chat
  const handleOpenChatWithDoctor = async (doc) => {
    setChatSelectedDoctor(doc);
    setActiveTab('chat');
    try {
      const dId = doc._id || doc.id;
      const res = await api.get(`/patient/chat/${dId}`);
      setChatMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatSelectedDoctor || !chatInput.trim()) return;
    try {
      const dId = chatSelectedDoctor._id || chatSelectedDoctor.id;
      const res = await api.post('/patient/chat', {
        receiverId: dId,
        message: chatInput.trim()
      });
      setChatMessages([...chatMessages, res.data]);
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
      showAlert(err.response?.data?.message || 'Failed to send message', 'danger');
    }
  };

  // Payment Handlers
  const handleOpenPayment = (app) => {
    setPaymentAppointment(app);
    const fee = app.doctor?.fee || app.fee || 150;
    setPaymentAmount(String(fee));
    setPaymentMethod('upi');
    setPaymentNote('');
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      showAlert('Please enter a valid payment amount', 'danger');
      return;
    }
    setPaymentSubmitting(true);
    setTimeout(() => {
      const newPayment = {
        id: Date.now(),
        doctorName: paymentAppointment?.doctor?.name || 'Doctor',
        specialization: paymentAppointment?.doctor?.specialization || 'Specialist',
        appointmentDate: paymentAppointment?.date
          ? new Date(paymentAppointment.date).toLocaleDateString()
          : new Date().toLocaleDateString(),
        amount: paymentAmount,
        method: paymentMethod,
        note: paymentNote,
        paidAt: new Date().toLocaleString(),
        status: 'Paid',
        txnId: 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };
      setPaymentHistory(prev => [newPayment, ...prev]);
      setPaymentSubmitting(false);
      setPaymentModalOpen(false);
      showAlert(
        `✅ Payment of ₹${paymentAmount} confirmed via ${paymentMethod.toUpperCase()}! Txn ID: ${newPayment.txnId}`,
        'success'
      );
    }, 1800);
  };

  const handleOpenRating = (app) => {
    setRatingAppointment(app);
    setRatingValue(5);
    setRatingReview('');
    setRatingModalOpen(true);
  };

  const handleConfirmRating = async (e) => {
    e.preventDefault();
    setRatingSubmitting(true);
    try {
      await api.post(`/patient/appointments/${ratingAppointment._id}/rate`, {
        rating: ratingValue,
        reviewText: ratingReview
      });
      showAlert('Thank you for rating your consultation!', 'success');
      setRatingModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit rating', 'danger');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleJoinVideoCall = (appId) => {
    window.open(`https://meet.jit.si/MediCare-${appId}`, '_blank');
  };

  const upcomingAppointment = appointments.find(a => a.status === 'accepted' || a.status === 'confirmed' || a.status === 'pending');
  const upcomingFollowUp = healthRecordData?.followUps?.find(f => f.status === 'scheduled');
  const upcomingVaccine = healthRecordData?.vaccinations?.find(v => v.status === 'Upcoming' || v.status === 'Due');

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '4rem' }}>
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
          fontWeight: 600
        }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="card" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.35)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Welcome back, {profileForm.name || user?.name || 'Patient'}!
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Health ID: <strong>#MED-908234</strong> • Blood: {profileForm.bloodGroup} • Age: {profileForm.age} yrs
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                🔔
                {unreadNotifsCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', borderRadius: '10px', padding: '0.1rem 0.4rem', marginLeft: '4px', fontWeight: 800 }}>
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '300px',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>Notifications</h4>
                    <button onClick={() => handleMarkNotifRead()} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer' }}>Mark all read</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>No notifications</div>
                  ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {notifications.map(n => (
                        <div key={n._id} onClick={() => handleNotifClick(n)} style={{ padding: '0.5rem', borderRadius: '6px', background: n.isRead ? '#f8fafc' : '#eff6ff', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                          <div style={{ color: '#475569', fontSize: '0.75rem' }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setProfileModalOpen(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
              ⚙️ Profile ({patientCompletionPct}%)
            </button>
            <button onClick={() => { setActiveTab('doctors'); setSearchQuery(''); }} style={{ background: '#fff', color: '#0284c7', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
              ➕ Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          🏠 Health Portal Overview
        </button>
        <button className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          🩺 Find Doctors ({filteredDoctors.length})
        </button>
        <button className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📅 Appointments ({appointments.length})
        </button>
        <button className={`tab-button ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
          💊 Prescriptions ({prescriptions.length})
        </button>
        <button className={`tab-button ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
          📁 Medical Records ({reports.length})
        </button>
        <button className={`tab-button ${activeTab === 'health-record' ? 'active' : ''}`} onClick={() => setActiveTab('health-record')}>
          📋 Health Record & History
        </button>
        <button className={`tab-button ${activeTab === 'pediatrics' ? 'active' : ''}`} onClick={() => setActiveTab('pediatrics')}>
          👶 Vaccinations & Growth
        </button>
        <button className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          💬 Doctor Chat
        </button>
        <button className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
          💳 Payment {paymentHistory.length > 0 && `(${paymentHistory.length})`}
        </button>
      </div>

      {/* ========================================================= */}
      {/* FEATURE 2: ADVANCED PATIENT DASHBOARD OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Upcoming Appointment */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>🗓️ Next Upcoming Appointment</h3>
            {upcomingAppointment ? (
              <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '1rem' }}>
                  {upcomingAppointment.doctor?.name || 'Specialist Doctor'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0369a1', marginTop: '4px' }}>
                  Specialization: {upcomingAppointment.doctor?.specialization || 'Clinical Specialist'}
                </div>
                <div style={{ fontWeight: 700, marginTop: '8px', color: '#0f172a' }}>
                  ⏰ {new Date(upcomingAppointment.date).toLocaleDateString()} at {upcomingAppointment.timeSlot || '10:00 AM'}
                </div>
                <span className="badge badge-warning" style={{ marginTop: '8px', display: 'inline-block' }}>
                  Status: {upcomingAppointment.status.toUpperCase()}
                </span>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No upcoming appointments scheduled.</div>
            )}
          </div>

          {/* Next Follow-up & Vaccination Reminders (Feature 14 & 7) */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>⏰ Follow-ups & Reminders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Next Follow-up</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {upcomingFollowUp ? `${upcomingFollowUp.reason} (${upcomingFollowUp.followUpDate})` : 'No upcoming follow-up scheduled'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Vaccination Reminder</div>
                <div style={{ fontWeight: 700, color: '#059669' }}>
                  {upcomingVaccine ? `💉 ${upcomingVaccine.vaccineName} - Due: ${upcomingVaccine.nextDueDate}` : 'All vaccines up to date'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Feature 2) */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Quick Portal Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setActiveTab('doctors'); setSearchQuery(''); }} className="btn btn-primary">
                ➕ Book Appointment
              </button>
              <button onClick={() => setActiveTab('prescriptions')} className="btn btn-outline">
                💊 View Prescriptions ({prescriptions.length})
              </button>
              <button onClick={() => setActiveTab('records')} className="btn btn-outline">
                📁 Medical Records ({reports.length})
              </button>
              <button onClick={() => setActiveTab('health-record')} className="btn btn-outline">
                📋 My Health Record
              </button>
              <button onClick={() => setProfileModalOpen(true)} className="btn btn-outline">
                👤 Edit Health Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 3 & 15: SEARCH DOCTORS & SMART BOOKING */}
      {/* ========================================================= */}
      {activeTab === 'doctors' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search doctor by name, specialty..."
                className="form-control"
                style={{ flex: '1 1 260px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {specialties.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`btn btn-sm ${selectedSpecialty.toLowerCase() === spec.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                    style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}
                  >
                    {spec === 'all' ? '✨ All Specialties' : spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="doctor-grid">
            {filteredDoctors.map(doc => (
              <div key={doc._id || doc.id} className="doctor-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{doc.name}</h3>
                  <div style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{doc.specialization}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{doc.qualifications} • {doc.experience || 10} Yrs Exp</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>{doc.bio || 'Experienced medical specialist.'}</div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>${doc.fee || 150} / visit</div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => { setDoctorDetail(doc); setDoctorDetailModalOpen(true); }} className="btn btn-outline btn-sm">Profile</button>
                    <button onClick={() => handleOpenBooking(doc)} className="btn btn-primary btn-sm">Book</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 3: MY APPOINTMENTS QUEUE */}
      {/* ========================================================= */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="card-title">My Scheduled Appointments</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'pending', 'accepted', 'completed', 'canceled'].map(st => (
                <button
                  key={st}
                  onClick={() => setAppointmentStatusFilter(st)}
                  className={`btn btn-sm ${appointmentStatusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time Slot</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.doctor?.name || 'Doctor'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.doctor?.specialization}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(app.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>⏰ {app.timeSlot || '10:00 AM'}</div>
                    </td>
                    <td>{app.reason}</td>
                    <td>
                      <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'completed' ? 'badge-info' : app.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {app.status === 'accepted' && (
                          <button onClick={() => handleJoinVideoCall(app._id)} className="btn btn-primary btn-sm">
                            📹 Join Call
                          </button>
                        )}
                        {app.status === 'completed' && !app.rating && (
                          <button onClick={() => handleOpenRating(app)} className="btn btn-warning btn-sm" style={{ background: '#f59e0b', color: '#fff' }}>
                            ⭐ Rate Doctor
                          </button>
                        )}
                        {app.status === 'completed' && app.rating && (
                          <span className="badge badge-success">⭐ Rated {app.rating}/5</span>
                        )}
                        {app.status !== 'canceled' && app.status !== 'completed' && (
                          <>
                            <button onClick={() => handleOpenReschedule(app)} className="btn btn-outline btn-sm">Reschedule</button>
                            <button onClick={() => handleCancelAppointment(app._id)} className="btn btn-danger btn-sm">Cancel</button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenPayment(app)}
                          className="btn btn-sm"
                          style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 700, borderRadius: '7px', padding: '0.3rem 0.75rem', cursor: 'pointer' }}
                        >
                          💳 Pay ₹{app.doctor?.fee || 150}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 8: PRESCRIPTIONS ARCHIVE */}
      {/* ========================================================= */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Digital Prescriptions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptions.map(rx => (
              <div key={rx._id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>Doctor: {rx.doctor?.name || 'Specialist'}</strong>
                  <button onClick={() => handlePrintPDFPrescription(rx)} className="btn btn-primary btn-sm">
                    📄 Print / Download PDF
                  </button>
                </div>
                <div style={{ color: '#0284c7', fontWeight: 600, marginBottom: '0.5rem' }}>Diagnosis: {rx.diagnosis}</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {rx.medicines?.map((m, idx) => (
                    <span key={idx} className="badge badge-primary">
                      💊 {m.name} - {m.dosage} ({m.frequency})
                    </span>
                  ))}
                </div>
                {rx.notes && <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Doctor Instructions:</strong> {rx.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 9: MEDICAL REPORT MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'records' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Upload Diagnostic Report</h2>
            <form onSubmit={handleUploadReport}>
              <div className="form-group">
                <label className="form-label">Report Category</label>
                <select className="form-control" value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
                  <option value="Blood Test">Blood Test / CBC</option>
                  <option value="Lipid Panel">Lipid Panel</option>
                  <option value="Skin Allergy">Skin Allergy Screening</option>
                  <option value="ECG Graph">ECG & Cardiology</option>
                  <option value="X-Ray / MRI">X-Ray / MRI Imaging</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Choose File from Computer (PC)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="form-control"
                  style={{ padding: '0.4rem 0.75rem' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                {selectedFile && (
                  <div style={{ fontSize: '0.825rem', color: '#0284c7', marginTop: '0.4rem', fontWeight: 600, background: '#e0f2fe', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                    📄 Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Report Title / Description (Optional)</label>
                <input type="text" placeholder="e.g. Annual Blood Screening 2026" className="form-control" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploadSubmitting}>
                {uploadSubmitting ? 'Uploading...' : '✅ Submit'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Diagnostic Reports Library</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.length === 0 && (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>No reports uploaded yet.</div>
              )}
              {reports.map(r => (
                <div key={r._id || r.filename} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>📄 {r.originalName || r.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Filing Date: {new Date(r.date || r.createdAt || Date.now()).toLocaleDateString()} {r.size ? `• ${r.size}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-success">Verified</span>
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(r)}
                      className="btn btn-outline btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      👁️ View File
                    </button>
                    <a
                      href={getReportFileUrl(r)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none', padding: '0.3rem 0.5rem' }}
                      title="Open in new window"
                    >
                      ↗️
                    </a>
                    {r._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(r._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                        title="Delete Report"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 6: PATIENT HEALTH RECORD & HISTORY */}
      {/* ========================================================= */}
      {activeTab === 'health-record' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Comprehensive Health Profile</h2>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0284c7' }}>Personal Medical Background</h4>
            <div><strong>Blood Group:</strong> {profileForm.bloodGroup}</div>
            <div><strong>Allergies:</strong> {profileForm.allergies || 'None reported'}</div>
            <div><strong>Existing Conditions:</strong> {profileForm.existingConditions || 'None reported'}</div>
            <div><strong>Current Medications:</strong> {profileForm.currentMedications || 'None'}</div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Consultation & Diagnosis History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {healthRecordData?.consultations?.map(c => (
              <div key={c._id} style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0284c7' }}>{c.diagnosis}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(c.createdAt).toLocaleDateString()} • Doctor: {c.doctor?.name || 'Physician'}</div>
                <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>{c.clinicalNotes || c.advice}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 7 & 13: PEDIATRICS & HEALTH ANALYTICS */}
      {/* ========================================================= */}
      {activeTab === 'pediatrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>💉 Vaccination Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!healthRecordData?.vaccinations || healthRecordData.vaccinations.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💉</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No vaccination records found</div>
                  <div style={{ fontSize: '0.82rem' }}>Your vaccination history will appear here once added by your doctor.</div>
                </div>
              )}
              {healthRecordData?.vaccinations?.map(v => (
                <div key={v._id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>💉 {v.vaccineName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Next Due: {v.nextDueDate || 'N/A'}</div>
                  </div>
                  <span className={`badge ${v.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{v.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>📈 Growth Trends</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!healthRecordData?.growthRecords || healthRecordData.growthRecords.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No growth records found</div>
                  <div style={{ fontSize: '0.82rem' }}>Height, weight and BMI records will appear here once added by your doctor.</div>
                </div>
              )}
              {healthRecordData?.growthRecords?.map(g => (
                <div key={g._id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700 }}>Height: {g.height} cm • Weight: {g.weight} kg</div>
                  <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>BMI: {g.bmi} ({g.notes || 'Normal'})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 11: DOCTOR CHAT */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', minHeight: '400px' }}>
          <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '0.75rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Doctors</h4>
            {doctors.map(d => (
              <div key={d._id || d.id} onClick={() => handleOpenChatWithDoctor(d)} style={{
                padding: '0.6rem',
                borderRadius: '8px',
                background: (chatSelectedDoctor?._id || chatSelectedDoctor?.id) === (d._id || d.id) ? '#e0f2fe' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: '0.4rem'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.specialization}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {chatSelectedDoctor ? (
              <>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>Chatting with {chatSelectedDoctor.name}</strong>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {chatMessages.map(m => {
                    const isPatient = String(m.sender) === String(user?._id || user?.id);
                    return (
                      <div key={m._id} style={{
                        alignSelf: isPatient ? 'flex-end' : 'flex-start',
                        background: isPatient ? '#0284c7' : '#f1f5f9',
                        color: isPatient ? '#ffffff' : '#0f172a',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '12px',
                        maxWidth: '75%',
                        fontSize: '0.875rem'
                      }}>
                        {m.message}
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Type your query..." className="form-control" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>Select a doctor to start conversation</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAYMENT TAB */}
      {/* ========================================================= */}
      {activeTab === 'payment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

          {/* Pay for Appointment Card */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>💳 Pay for Appointment</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Select an appointment below to make payment. The amount will be auto-filled based on the doctor's consultation fee.
            </p>
            {appointments.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No appointments found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appointments.map(app => (
                  <div key={app._id} style={{
                    background: '#f8fafc', padding: '1rem', borderRadius: '10px',
                    border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.doctor?.name || 'Doctor'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.doctor?.specialization}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        📅 {new Date(app.date).toLocaleDateString()} • ⏰ {app.timeSlot || '10:00 AM'}
                      </div>
                      <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'completed' ? 'badge-info' : app.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}
                        style={{ marginTop: '4px', display: 'inline-block' }}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '6px' }}>
                        ₹{app.doctor?.fee || 150}
                      </div>
                      <button
                        onClick={() => handleOpenPayment(app)}
                        style={{
                          background: 'linear-gradient(135deg,#16a34a,#15803d)',
                          color: '#fff', border: 'none', padding: '0.45rem 1rem',
                          borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
                        }}
                      >
                        💳 Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History Card */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>🧾 Payment History</h2>
            {paymentHistory.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                No payments made yet. Pay for an appointment to see history here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {paymentHistory.map(p => (
                  <div key={p.id} style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '10px', padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.doctorName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.specialization}</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '3px' }}>
                          📅 Appt: {p.appointmentDate} • 🕐 Paid: {p.paidAt}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          Txn ID: <strong>{p.txnId}</strong> • Method: {p.method.toUpperCase()}
                        </div>
                        {p.note && <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>Note: {p.note}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.15rem' }}>₹{p.amount}</div>
                        <span className="badge badge-success" style={{ marginTop: '4px' }}>✅ {p.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAYMENT MODAL WITH QR CODE */}
      {/* ========================================================= */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '18px', maxWidth: '480px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>💳 Make Payment</h2>
              <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            {/* Doctor Info Summary */}
            {paymentAppointment && (
              <div style={{ background: '#e0f2fe', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #bae6fd' }}>
                <div style={{ fontWeight: 700, color: '#0369a1' }}>🩺 {paymentAppointment.doctor?.name || 'Doctor'}</div>
                <div style={{ fontSize: '0.85rem', color: '#0369a1' }}>{paymentAppointment.doctor?.specialization}</div>
                <div style={{ fontSize: '0.82rem', color: '#0369a1', marginTop: '2px' }}>
                  📅 {paymentAppointment.date ? new Date(paymentAppointment.date).toLocaleDateString() : ''} • ⏰ {paymentAppointment.timeSlot || '10:00 AM'}
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmPayment}>
              {/* Amount Field - Auto filled */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  💰 Consultation Fee Amount (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-control"
                    style={{ paddingLeft: '2rem', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
                  ✅ Amount auto-filled from doctor's consultation fee. You can edit if needed.
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Payment Method</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'upi', label: '📱 UPI / QR Code' },
                    { value: 'card', label: '💳 Debit/Credit Card' },
                    { value: 'netbanking', label: '🏦 Net Banking' },
                    { value: 'cash', label: '💵 Cash at Counter' }
                  ].map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPaymentMethod(m.value)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        border: paymentMethod === m.value ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: paymentMethod === m.value ? '#e0f2fe' : '#f8fafc',
                        color: paymentMethod === m.value ? '#0369a1' : '#475569',
                        fontWeight: paymentMethod === m.value ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '0.83rem'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI QR Code Section */}
              {paymentMethod === 'upi' && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid #86efac',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    📱 Scan to Pay with any UPI App
                  </div>
                  <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    Neha Sharma • Google Pay / PhonePe / Paytm / BHIM
                  </div>
                  <img
                    src="/upi_qr.jpg"
                    alt="Scan to Pay - Neha Sharma UPI QR Code"
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'contain',
                      borderRadius: '10px',
                      border: '3px solid #16a34a',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                  <div style={{ marginTop: '0.75rem', background: '#fff', borderRadius: '8px', padding: '0.6rem 1rem', display: 'inline-block', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                      Amount: <span style={{ color: '#16a34a' }}>₹{paymentAmount}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      After scanning, enter this amount in your UPI app
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                    ✅ Once paid, click "Confirm Payment" below to record your payment.
                  </div>
                </div>
              )}

              {/* Card / Net Banking Info */}
              {(paymentMethod === 'card' || paymentMethod === 'netbanking') && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  🏗️ Online {paymentMethod === 'card' ? 'Card' : 'Net Banking'} gateway integration coming soon.<br />
                  Please use UPI QR or Cash at Counter for now.
                </div>
              )}

              {/* Cash Info */}
              {paymentMethod === 'cash' && (
                <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', color: '#92400e', fontSize: '0.88rem', fontWeight: 600 }}>
                  💵 Please pay <strong>₹{paymentAmount}</strong> at the hospital counter on the day of your appointment and show this confirmation.
                </div>
              )}

              {/* Note Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Google Pay, Ref: 123456"
                  className="form-control"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  style={{
                    flex: 2,
                    background: paymentSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#15803d)',
                    color: '#fff', border: 'none', padding: '0.75rem',
                    borderRadius: '10px', fontWeight: 800, fontSize: '1rem',
                    cursor: paymentSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {paymentSubmitting ? '⏳ Processing Payment...' : `✅ Confirm Payment ₹${paymentAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT PATIENT PROFILE MODAL (FEATURE 17 FIX) */}
      {/* ========================================================= */}
      {profileModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Edit Patient Health Profile ({patientCompletionPct}% Complete)</h2>
              <button onClick={() => setProfileModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required className="form-control" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" min="0" className="form-control" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <input type="text" className="form-control" value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input type="text" className="form-control" value={profileForm.bloodGroup} onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input type="text" className="form-control" value={profileForm.emergencyContact} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Recorded Drug / Food Allergies</label>
                <input type="text" placeholder="e.g. Penicillin, Sulfa, Dust" className="form-control" value={profileForm.allergies} onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Existing Conditions</label>
                <input type="text" placeholder="e.g. Asthma, Hypertension" className="form-control" value={profileForm.existingConditions} onChange={(e) => setProfileForm({ ...profileForm, existingConditions: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={profileSubmitting}>
                {profileSubmitting ? 'Saving...' : '💾 Save Patient Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCTOR DETAIL MODAL (FEATURE 16) */}
      {doctorDetailModalOpen && doctorDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '550px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Doctor Professional Profile</h2>
              <button onClick={() => setDoctorDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{doctorDetail.name}</h3>
            <div style={{ color: '#0284c7', fontWeight: 700, marginBottom: '0.75rem' }}>{doctorDetail.specialization}</div>
            <div><strong>Qualifications:</strong> {doctorDetail.qualifications}</div>
            <div><strong>Experience:</strong> {doctorDetail.experience || 10} Years Practicing</div>
            <div><strong>Consultation Fee:</strong> ${doctorDetail.fee || 150}</div>
            <div><strong>License Verification:</strong> Verified Registered Specialist</div>
            <div><strong>Hospital Affiliation:</strong> Stanford Medical Network</div>
            <p style={{ marginTop: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>{doctorDetail.bio}</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setDoctorDetailModalOpen(false)} className="btn btn-outline">Close</button>
              <button onClick={() => { setDoctorDetailModalOpen(false); handleOpenBooking(doctorDetail); }} className="btn btn-primary">Book Consultation</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalOpen && selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Book Consultation</h2>
              <button onClick={() => setBookingModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>Doctor:</strong> {selectedDoctor.name} ({selectedDoctor.specialization})
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Date</label>
                <input type="date" required className="form-control" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <select className="form-control" value={bookingSlot} onChange={(e) => setBookingSlot(e.target.value)}>
                  {(selectedDoctor.availability?.[0]?.slots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <input type="text" placeholder="Describe symptoms or reason..." className="form-control" value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setBookingModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookingSubmitting}>
                  {bookingSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {ratingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Rate Consultation</h2>
            <form onSubmit={handleConfirmRating} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-control"
                  value={ratingValue}
                  onChange={(e) => setRatingValue(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Review</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="Share your experience..."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRatingModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={ratingSubmitting}>
                  {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Report Viewer Modal */}
      {viewReportModalOpen && viewReportItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                  📄 {viewReportItem.originalName || viewReportItem.filename}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                  Filing Date: {new Date(viewReportItem.date || viewReportItem.createdAt || Date.now()).toLocaleDateString()} {viewReportItem.size ? `• Size: ${viewReportItem.size}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={viewReportItem.previewUrl || getReportFileUrl(viewReportItem)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  ↗️ Open in New Window
                </a>
                <button
                  onClick={() => setViewReportModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe Preview */}
            <div style={{ flex: 1, minHeight: '480px', maxHeight: '70vh', background: '#f1f5f9', position: 'relative' }}>
              <iframe
                src={viewReportItem.previewUrl || getReportFileUrl(viewReportItem)}
                title={viewReportItem.originalName || viewReportItem.filename}
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '480px' }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Verified MediCare+ Electronic Health Record
              </div>
              <button onClick={() => setViewReportModalOpen(false)} className="btn btn-outline btn-sm">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
