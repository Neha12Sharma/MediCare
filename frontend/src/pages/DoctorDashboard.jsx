// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterSort, setRosterSort] = useState('recent');

  // Consultation Module State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedAppForConsult, setSelectedAppForConsult] = useState(null);
  const [consultForm, setConsultForm] = useState({
    bp: '120/80',
    pulse: '74 bpm',
    temp: '98.6 °F',
    weight: '62 kg',
    chiefComplaint: '',
    symptoms: '',
    medicalHistory: '',
    examinationNotes: '',
    diagnosis: '',
    clinicalNotes: '',
    advice: '',
    followUpDate: '',
    followUpReason: ''
  });
  const [consultMedicines, setConsultMedicines] = useState([
    { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: 'After meals' }
  ]);
  const [consultSaving, setConsultSaving] = useState(false);

  // Patient Health Record Modal State
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(null);
  const [patientRecordModalOpen, setPatientRecordModalOpen] = useState(false);
  const [recordActiveTab, setRecordActiveTab] = useState('overview');
  const [healthRecordData, setHealthRecordData] = useState(null);

  // Digital Prescription Pad State
  const [rxPatientId, setRxPatientId] = useState('');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState([
    { name: '', dosage: '', frequency: 'Once daily', duration: '14 days', instructions: 'After meals' }
  ]);
  const [rxNotes, setRxNotes] = useState('');
  const [rxSubmitting, setRxSubmitting] = useState(false);
  const [allergyWarning, setAllergyWarning] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Pediatric Tracker State
  const [pediaPatientId, setPediaPatientId] = useState('');
  const [pediaHeight, setPediaHeight] = useState('');
  const [pediaWeight, setPediaWeight] = useState('');
  const [pediaNotes, setPediaNotes] = useState('');
  const [pediaVaccineName, setPediaVaccineName] = useState('');
  const [pediaVaccineStatus, setPediaVaccineStatus] = useState('Completed');
  const [pediaNextDue, setPediaNextDue] = useState('');
  const [pediaSubmitting, setPediaSubmitting] = useState(false);

  // Availability & Calendar State
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newSlotTime, setNewSlotTime] = useState('09:00 AM');
  const [availabilityList, setAvailabilityList] = useState([]);
  const [breakTimes, setBreakTimes] = useState('12:30 PM - 01:30 PM (Lunch Break)');
  const [maxAppsPerSlot, setMaxAppsPerSlot] = useState(2);
  const [maxAppsPerDay, setMaxAppsPerDay] = useState(20);
  const [blackoutDate, setBlackoutDate] = useState('');
  const [unavailableDatesList, setUnavailableDatesList] = useState([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Doctor Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    qualifications: '',
    experience: 10,
    fee: 150,
    phone: '',
    address: '',
    hospitalAffiliation: '',
    licenseNumber: '',
    areasOfExpertise: '',
    bio: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Chat State
  const [chatSelectedPatient, setChatSelectedPatient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, rxRes, patRes, profRes, analyticsRes, notifRes] = await Promise.all([
        api.get('/doctor/appointments').catch(() => ({ data: [] })),
        api.get('/doctor/prescriptions').catch(() => ({ data: [] })),
        api.get('/doctor/patients').catch(() => ({ data: [] })),
        api.get('/doctor/profile').catch(() => ({ data: null })),
        api.get('/doctor/analytics').catch(() => ({ data: null })),
        api.get('/doctor/notifications').catch(() => ({ data: [] }))
      ]);

      setAppointments(appsRes.data || []);
      setPrescriptions(rxRes.data || []);
      setPatients(patRes.data || []);
      setAnalytics(analyticsRes.data || null);
      
      const notifs = notifRes.data || [];
      setNotifications(notifs);
      setUnreadNotifsCount(notifs.filter(n => !n.isRead).length);

      if (profRes.data) {
        const p = profRes.data;
        setProfile(p);
        setAvailabilityList(p.availability || []);
        setBreakTimes(p.breakTimes || '12:30 PM - 01:30 PM (Lunch Break)');
        setMaxAppsPerSlot(p.maxAppsPerSlot || 2);
        setMaxAppsPerDay(p.maxAppsPerDay || 20);
        setUnavailableDatesList(p.unavailableDates || []);
        
        setProfileForm({
          name: p.name || user?.name || '',
          specialization: p.specialization || 'Cardiology',
          qualifications: p.qualifications || 'MD, FACC',
          experience: p.experience !== undefined ? p.experience : 10,
          fee: p.fee || 150,
          phone: p.phone || '+1 (555) 321-9876',
          address: p.address || '700 Medical Center Plaza, Suite 400',
          hospitalAffiliation: p.hospitalAffiliation || 'Stanford Health System',
          licenseNumber: p.licenseNumber || 'MED-LIC-908234',
          areasOfExpertise: p.areasOfExpertise || 'Preventive Cardiology, Lipidology',
          bio: p.bio || ''
        });
      }
    } catch (err) {
      console.error('Error fetching doctor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for new chat messages every 3s when chat tab is active
  useEffect(() => {
    if (activeTab !== 'chat' || !chatSelectedPatient) return;
    const pId = chatSelectedPatient._id || chatSelectedPatient.id;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/doctor/chat/${pId}`);
        setChatMessages(res.data || []);
      } catch (err) {
        // quiet fail on polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, chatSelectedPatient]);

  // Update Appointment Status
  const handleUpdateStatus = async (id, status, notes = '') => {
    try {
      await api.patch(`/doctor/appointments/${id}/status`, { status, notes });
      showAlert(`Appointment marked as ${status.toUpperCase()}`, 'success');
      fetchData();
    } catch (err) {
      showAlert('Failed to update appointment status', 'danger');
    }
  };

  const handleJoinVideoCall = (appId) => {
    window.open(`https://meet.jit.si/MediCare-${appId}`, '_blank');
  };

  // Start Consultation Modal
  const handleOpenConsultation = (app) => {
    setSelectedAppForConsult(app);
    setConsultForm({
      bp: '120/80',
      pulse: '74 bpm',
      temp: '98.6 °F',
      weight: '62 kg',
      chiefComplaint: app.reason || 'Routine medical checkup',
      symptoms: 'Patient reports mild fatigue and stress',
      medicalHistory: app.patient?.medicalHistory || 'No acute surgical history',
      examinationNotes: 'General physical examination unremarkable. Vitals stable.',
      diagnosis: 'Mild Stress & Routine Health Evaluation',
      clinicalNotes: 'Discussed diet, exercise, and stress mitigation.',
      advice: 'Hydrate well, 30 mins exercise daily, follow-up in 2 weeks.',
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      followUpReason: 'Routine progress re-evaluation'
    });
    setConsultMedicines([
      { name: 'Multivitamin Complex', dosage: '1 tablet', frequency: 'Once daily after breakfast', duration: '30 days', instructions: 'Take with water' }
    ]);
    setConsultModalOpen(true);
  };

  // Submit Consultation
  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppForConsult) return;
    setConsultSaving(true);
    try {
      await api.post('/doctor/consultations', {
        patientId: selectedAppForConsult.patient?._id || selectedAppForConsult.patient?.id || selectedAppForConsult.patient,
        appointmentId: selectedAppForConsult._id,
        vitals: {
          bp: consultForm.bp,
          pulse: consultForm.pulse,
          temp: consultForm.temp,
          weight: consultForm.weight
        },
        chiefComplaint: consultForm.chiefComplaint,
        symptoms: consultForm.symptoms,
        medicalHistory: consultForm.medicalHistory,
        examinationNotes: consultForm.examinationNotes,
        diagnosis: consultForm.diagnosis,
        clinicalNotes: consultForm.clinicalNotes,
        advice: consultForm.advice,
        followUpDate: consultForm.followUpDate,
        followUpReason: consultForm.followUpReason,
        prescription: {
          medicines: consultMedicines.filter(m => m.name.trim() !== '')
        }
      });
      showAlert('Consultation, Prescription, and Follow-up saved successfully!', 'success');
      setConsultModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('Failed to save consultation details', 'danger');
    } finally {
      setConsultSaving(false);
    }
  };

  // View Comprehensive Patient Health Record
  const handleViewPatientRecord = async (patient) => {
    setSelectedPatientRecord(patient);
    setPatientRecordModalOpen(true);
    setRecordActiveTab('overview');
    try {
      const pId = patient._id || patient.id;
      const res = await api.get(`/patient/health-record?patientId=${pId}`);
      setHealthRecordData(res.data);
    } catch (err) {
      console.error('Error fetching patient health record', err);
    }
  };

  // Prescription Medicines handlers & warnings
  const handleAddMedicineRow = (targetState, setTargetState) => {
    setTargetState([...targetState, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: 'After meals' }]);
  };

  const handleRemoveMedicineRow = (index, targetState, setTargetState) => {
    if (targetState.length === 1) return;
    setTargetState(targetState.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, val, targetState, setTargetState) => {
    const updated = [...targetState];
    updated[index][field] = val;
    setTargetState(updated);

    // Allergy check & Duplicate check for standalone Rx form
    if (setTargetState === setRxMedicines) {
      checkRxWarnings(updated);
    }
  };

  const checkRxWarnings = (meds) => {
    setAllergyWarning(null);
    setDuplicateWarning(null);

    // Duplicate check
    const names = meds.map(m => m.name.trim().toLowerCase()).filter(n => n.length > 0);
    const hasDup = names.some((n, idx) => names.indexOf(n) !== idx);
    if (hasDup) {
      setDuplicateWarning('⚠️ Duplicate medicine entry detected in prescription list.');
    }

    // Allergy check if patient selected
    if (rxPatientId) {
      const pat = patients.find(p => String(p._id) === String(rxPatientId));
      if (pat && pat.allergies) {
        const algs = pat.allergies.toLowerCase();
        const matched = meds.find(m => m.name.trim() && algs.includes(m.name.trim().toLowerCase()));
        if (matched) {
          setAllergyWarning(`🚨 ALLERGY ALERT: Patient is recorded allergic to "${matched.name}"!`);
        }
      }
    }
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!rxPatientId) {
      showAlert('Please select a patient to issue prescription', 'danger');
      return;
    }
    const validMeds = rxMedicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      showAlert('Please specify at least one medicine', 'danger');
      return;
    }

    setRxSubmitting(true);
    try {
      await api.post('/doctor/prescriptions', {
        patientId: rxPatientId,
        diagnosis: rxDiagnosis || 'Clinical Assessment',
        medicines: validMeds,
        notes: rxNotes
      });
      showAlert('Digital prescription successfully issued and added to patient records', 'success');
      setRxPatientId('');
      setRxDiagnosis('');
      setRxMedicines([{ name: '', dosage: '', frequency: 'Once daily', duration: '14 days', instructions: 'After meals' }]);
      setRxNotes('');
      fetchData();
      setActiveTab('prescriptions');
    } catch (err) {
      showAlert('Failed to issue prescription', 'danger');
    } finally {
      setRxSubmitting(false);
    }
  };

  // Generate Printable PDF Prescription Window
  const handleGeneratePDFPrescription = (rx) => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      showAlert('Please allow popups to generate PDF Prescription', 'warning');
      return;
    }

    const docName = profileForm.name || user?.name || 'Dr. Specialist';
    const spec = profileForm.specialization || 'Clinical Specialist';
    const qual = profileForm.qualifications || 'MD, Certified Specialist';
    const lic = profileForm.licenseNumber || 'MED-LIC-2026';
    const patName = rx.patient?.name || 'Patient User';
    const patEmail = rx.patient?.email || 'N/A';
    const rxDate = new Date(rx.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 800; color: #0284c7; }
          .doc-info { text-align: right; font-size: 14px; color: #475569; }
          .patient-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 25px; display: flex; justify-content: space-between; }
          .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #e0f2fe; color: #0369a1; text-align: left; padding: 10px; font-size: 13px; border: 1px solid #bae6fd; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 14px; }
          .advice-box { background: #fffbebf; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 30px; font-size: 14px; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .signature { text-align: right; }
          .sig-line { width: 200px; border-bottom: 1px solid #0f172a; margin-bottom: 5px; display: inline-block; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">✚ MediCare+</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Integrated Clinical Network & Digital Prescription</div>
          </div>
          <div class="doc-info">
            <strong style="font-size: 16px; color: #0f172a;">${docName}</strong><br/>
            ${spec} • ${qual}<br/>
            License No: ${lic}<br/>
            ${profileForm.hospitalAffiliation || 'Medicare+ Main Medical Center'}
          </div>
        </div>

        <div class="patient-box">
          <div>
            <strong>Patient Name:</strong> ${patName}<br/>
            <strong>Email:</strong> ${patEmail}
          </div>
          <div style="text-align: right;">
            <strong>Prescription Date:</strong> ${rxDate}<br/>
            <strong>Rx Reference:</strong> #${(rx._id || 'RX90823').substring(0, 8).toUpperCase()}
          </div>
        </div>

        <div class="section-title">Primary Diagnosis</div>
        <div style="font-size: 15px; font-weight: 600; color: #0284c7; margin-bottom: 20px;">
          ${rx.diagnosis || 'Clinical Medical Evaluation'}
        </div>

        <div class="section-title">Rx — Prescribed Medications</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medication Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
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
                <td>${m.instructions || 'As advised'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${rx.notes ? `
          <div class="section-title">Clinical Advice & Patient Instructions</div>
          <div class="advice-box">${rx.notes}</div>
        ` : ''}

        <div class="footer">
          <div style="font-size: 11px; color: #94a3b8;">
            Issued via MediCare+ Electronic Health Record System.<br/>
            Verified Digital Document.
          </div>
          <div class="signature">
            <div class="sig-line"></div><br/>
            <strong>${docName}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">Attending Physician Signature</span>
          </div>
        </div>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  // Pediatric Record Submission
  const handleAddPediatricGrowth = async (e) => {
    e.preventDefault();
    if (!pediaPatientId || !pediaHeight || !pediaWeight) {
      showAlert('Please select patient and specify height & weight', 'danger');
      return;
    }
    setPediaSubmitting(true);
    try {
      await api.post('/doctor/pediatric/growth', {
        patientId: pediaPatientId,
        height: Number(pediaHeight),
        weight: Number(pediaWeight),
        notes: pediaNotes
      });
      showAlert('Pediatric growth record logged successfully!', 'success');
      setPediaHeight('');
      setPediaWeight('');
      setPediaNotes('');
      fetchData();
    } catch (err) {
      showAlert('Failed to record growth data', 'danger');
    } finally {
      setPediaSubmitting(false);
    }
  };

  const handleAddPediatricVaccination = async (e) => {
    e.preventDefault();
    if (!pediaPatientId || !pediaVaccineName) {
      showAlert('Please select patient and specify vaccine name', 'danger');
      return;
    }
    setPediaSubmitting(true);
    try {
      await api.post('/doctor/pediatric/vaccination', {
        patientId: pediaPatientId,
        vaccineName: pediaVaccineName,
        dateAdministered: pediaVaccineStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null,
        nextDueDate: pediaNextDue || null,
        status: pediaVaccineStatus,
        notes: pediaNotes
      });
      showAlert('Vaccination record updated successfully!', 'success');
      setPediaVaccineName('');
      setPediaNextDue('');
      fetchData();
    } catch (err) {
      showAlert('Failed to record vaccination', 'danger');
    } finally {
      setPediaSubmitting(false);
    }
  };

  // Availability Schedule Handlers
  const handleAddSlot = () => {
    const current = [...availabilityList];
    let dayObj = current.find(d => d.day === selectedDay);
    if (!dayObj) {
      dayObj = { day: selectedDay, slots: [] };
      current.push(dayObj);
    }
    if (!dayObj.slots.includes(newSlotTime)) {
      dayObj.slots.push(newSlotTime);
      setAvailabilityList(current);
    }
  };

  const handleRemoveSlot = (dayName, slotTime) => {
    const current = availabilityList.map(d => {
      if (d.day === dayName) {
        return { ...d, slots: d.slots.filter(s => s !== slotTime) };
      }
      return d;
    }).filter(d => d.slots.length > 0);
    setAvailabilityList(current);
  };

  const handleAddBlackoutDate = () => {
    if (!blackoutDate) return;
    if (!unavailableDatesList.includes(blackoutDate)) {
      setUnavailableDatesList([...unavailableDatesList, blackoutDate]);
    }
    setBlackoutDate('');
  };

  const handleRemoveBlackoutDate = (dt) => {
    setUnavailableDatesList(unavailableDatesList.filter(d => d !== dt));
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleSaving(true);
    try {
      await Promise.all([
        api.post('/doctor/availability', { availability: availabilityList }),
        api.put('/doctor/profile', {
          maxAppsPerSlot: Number(maxAppsPerSlot),
          maxAppsPerDay: Number(maxAppsPerDay),
          breakTimes,
          unavailableDates: unavailableDatesList
        })
      ]);
      showAlert('Clinic calendar & slot capacities updated successfully!', 'success');
      fetchData();
    } catch (err) {
      showAlert('Failed to update schedule', 'danger');
    } finally {
      setScheduleSaving(false);
    }
  };

  // Save Doctor Profile Form (Fix for Feature 16 & 17)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/doctor/profile', profileForm);
      setProfile(res.data);
      if (login && user) {
        login({ ...user, name: res.data.name });
      }
      showAlert('Doctor professional profile saved successfully!', 'success');
    } catch (err) {
      showAlert('Failed to update doctor profile', 'danger');
    } finally {
      setProfileSaving(false);
    }
  };

  // Calculate Doctor Profile Completion Bar
  const calculateProfileCompletion = () => {
    const fields = [
      profileForm.name,
      profileForm.specialization,
      profileForm.qualifications,
      profileForm.experience,
      profileForm.fee,
      profileForm.phone,
      profileForm.address,
      profileForm.hospitalAffiliation,
      profileForm.licenseNumber,
      profileForm.bio
    ];
    const filled = fields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPct = calculateProfileCompletion();

  // Notification Mark Read
  const handleMarkNotifRead = async (id = null) => {
    try {
      await api.patch('/doctor/notifications/read', { id });
      setNotifications(notifications.map(n => (!id || n._id === id ? { ...n, isRead: true } : n)));
      setUnreadNotifsCount(id ? Math.max(0, unreadNotifsCount - 1) : 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    handleMarkNotifRead(notif._id);
    if (notif.type === 'message' && notif.senderId) {
      const patient = patients.find(p => String(p._id) === notif.senderId);
      if (patient) {
        handleOpenChatWithPatient(patient);
        setShowNotifDropdown(false);
      }
    }
  };

  // Chat handlers
  const handleOpenChatWithPatient = async (pat) => {
    setChatSelectedPatient(pat);
    setActiveTab('chat');
    try {
      const pId = pat._id || pat.id;
      const res = await api.get(`/doctor/chat/${pId}`);
      setChatMessages(res.data || []);
    } catch (err) {
      console.error('Error fetching chat messages', err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatSelectedPatient || !chatInput.trim()) return;
    try {
      const pId = chatSelectedPatient._id || chatSelectedPatient.id;
      const res = await api.post('/doctor/chat', {
        receiverId: pId,
        message: chatInput.trim()
      });
      setChatMessages([...chatMessages, res.data]);
      setChatInput('');
    } catch (err) {
      console.error('Failed to send doctor chat message:', err);
      showAlert(err.response?.data?.message || 'Failed to send message', 'danger');
    }
  };

  // Stats Counters
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => new Date(a.date).toISOString().split('T')[0] === todayStr);
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const acceptedCount = appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const totalRxCount = prescriptions.length;

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  // Filtered Patient Roster
  const filteredRoster = patients.filter(p => {
    const q = rosterSearch.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.includes(q);
  }).sort((a, b) => {
    if (rosterSort === 'name') return a.name.localeCompare(b.name);
    return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
  });

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
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      {/* Header Bar with Notifications */}
      <div className="dashboard-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="dashboard-title">Physician Portal</h1>
          <p className="dashboard-subtitle">
            <strong>{profileForm.name || user?.name || 'Dr. Specialist'}</strong> • {profileForm.specialization} • License: {profileForm.licenseNumber}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              🔔
              {unreadNotifsCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', borderRadius: '10px', padding: '0.1rem 0.4rem', fontWeight: 800 }}>
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '320px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 100,
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Notifications</h4>
                  <button onClick={() => handleMarkNotifRead()} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No new notifications</div>
                ) : (
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(n => (
                      <div key={n._id} onClick={() => handleNotifClick(n)} style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        background: n.isRead ? '#f8fafc' : '#eff6ff',
                        borderLeft: `3px solid ${n.isRead ? '#cbd5e1' : '#0284c7'}`,
                        cursor: 'pointer'
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{n.message}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('prescriptions')}
            style={{ boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}
          >
            📝 Digital Rx Pad
          </button>
        </div>
      </div>

      {/* FEATURE 1: Dynamic Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>⏳</div>
          <div className="stat-info">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('appointments')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>📅</div>
          <div className="stat-info">
            <span className="stat-value">{acceptedCount}</span>
            <span className="stat-label">Confirmed Sessions</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('appointments')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>✓</div>
          <div className="stat-info">
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Completed Consults</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('patients')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>👥</div>
          <div className="stat-info">
            <span className="stat-value">{patients.length}</span>
            <span className="stat-label">Total Patients</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('prescriptions')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: '#ede9fe', color: '#6d28d9' }}>💊</div>
          <div className="stat-info">
            <span className="stat-value">{totalRxCount}</span>
            <span className="stat-label">Prescriptions Issued</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 Overview & Today's Schedule
        </button>
        <button className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📋 Appointments Queue ({appointments.length})
        </button>
        <button className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
          👥 Patient Roster & Records ({patients.length})
        </button>
        <button className={`tab-button ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
          💊 Prescriptions & PDF Pad ({prescriptions.length})
        </button>
        <button className={`tab-button ${activeTab === 'pediatrics' ? 'active' : ''}`} onClick={() => setActiveTab('pediatrics')}>
          👶 Pediatric Module
        </button>
        <button className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          ⏰ Clinic Calendar & Hours
        </button>
        <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          📈 Analytics
        </button>
        <button className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          💬 Patient Chat
        </button>
        <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          ⚙️ Edit Doctor Profile ({completionPct}%)
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & TODAY'S SCHEDULE (FEATURE 1) */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">Today's Consultation Schedule</h2>
              <span className="badge badge-primary">{todaysAppointments.length} Appointments Today</span>
            </div>

            {todaysAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <p style={{ fontSize: '1.1rem' }}>No clinical visits booked specifically for today.</p>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('appointments')}>View Full Appointment Queue</button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Time & Slot</th>
                      <th>Visit Reason</th>
                      <th>Status</th>
                      <th>Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map(app => (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.patient?.name || 'Patient User'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.patient?.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>⏰ {app.timeSlot || '10:00 AM'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>In-Person</div>
                        </td>
                        <td>{app.reason || 'General Consultation'}</td>
                        <td>
                          <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleViewPatientRecord(app.patient)} className="btn btn-outline btn-sm">View Patient</button>
                            <button onClick={() => handleOpenConsultation(app)} className="btn btn-primary btn-sm">Start Consult</button>
                            {app.status === 'accepted' && (
                              <button onClick={() => handleJoinVideoCall(app._id)} className="btn btn-primary btn-sm">📹 Join Call</button>
                            )}
                            {app.status === 'pending' && (
                              <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="btn btn-success btn-sm">Accept</button>
                            )}
                            <button onClick={() => handleUpdateStatus(app._id, 'canceled')} className="btn btn-danger btn-sm">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: APPOINTMENT QUEUE (FEATURE 3) */}
      {/* ========================================================= */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="card-title">Patient Appointment Queue</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'pending', 'accepted', 'completed', 'canceled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
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
                  <th>Patient Details</th>
                  <th>Date & Time Slot</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.patient?.name || 'Patient'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.patient?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(app.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>⏰ {app.timeSlot || '10:00 AM'}</div>
                    </td>
                    <td>{app.reason || 'General Checkup'}</td>
                    <td>
                      <span className={`badge ${app.status === 'accepted' ? 'badge-success' : app.status === 'completed' ? 'badge-info' : app.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button onClick={() => handleOpenConsultation(app)} className="btn btn-primary btn-sm">Start Consult</button>
                        {app.status === 'accepted' && (
                          <button onClick={() => handleJoinVideoCall(app._id)} className="btn btn-primary btn-sm">📹 Join Call</button>
                        )}
                        {app.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="btn btn-success btn-sm">Accept</button>
                            <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <button onClick={() => handleUpdateStatus(app._id, 'completed')} className="btn btn-info btn-sm">Complete</button>
                        )}
                        {app.status !== 'canceled' && app.status !== 'completed' && app.status !== 'rejected' && (
                          <button onClick={() => handleUpdateStatus(app._id, 'canceled')} className="btn btn-danger btn-sm">Cancel</button>
                        )}
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
      {/* TAB 3: PATIENTS ROSTER & HEALTH RECORDS (FEATURE 6 & 15) */}
      {/* ========================================================= */}
      {activeTab === 'patients' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="card-title">Patient Roster & Records</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search patient by name or email..."
                className="form-control"
                style={{ width: '240px' }}
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
              />
              <select className="form-control" value={rosterSort} onChange={(e) => setRosterSort(e.target.value)}>
                <option value="recent">Sort by Recent Visit</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Contact Info</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Last Visit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map(pat => (
                  <tr key={pat._id || pat.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>👤 {pat.name}</td>
                    <td>
                      <div>{pat.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{pat.phone}</div>
                    </td>
                    <td>{pat.age || 26} yrs • {pat.gender || 'Female'}</td>
                    <td><span className="badge badge-danger">{pat.bloodGroup || 'B+'}</span></td>
                    <td>{pat.lastVisit ? new Date(pat.lastVisit).toLocaleDateString() : 'Recent'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleViewPatientRecord(pat)} className="btn btn-outline btn-sm">Full Medical History</button>
                        <button onClick={() => handleOpenChatWithPatient(pat)} className="btn btn-primary btn-sm">💬 Chat</button>
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
      {/* TAB 4: PRESCRIPTIONS & PDF PAD (FEATURE 8) */}
      {/* ========================================================= */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Write Prescription Form */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Digital Prescription Pad</h2>

            {allergyWarning && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 700 }}>
                {allergyWarning}
              </div>
            )}

            {duplicateWarning && (
              <div style={{ background: '#fffbe8', border: '1px solid #fde68a', color: '#b45309', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 700 }}>
                {duplicateWarning}
              </div>
            )}

            <form onSubmit={handleIssuePrescription}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  required
                  className="form-control"
                  value={rxPatientId}
                  onChange={(e) => {
                    setRxPatientId(e.target.value);
                    checkRxWarnings(rxMedicines);
                  }}
                >
                  <option value="">-- Choose Patient from Roster --</option>
                  {patients.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="Primary clinical diagnosis..."
                  className="form-control"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                />
              </div>

              {/* Dynamic Medicines Builder */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Medications List</label>
                  <button type="button" onClick={() => handleAddMedicineRow(rxMedicines, setRxMedicines)} className="btn btn-outline btn-sm">➕ Add Drug</button>
                </div>

                {rxMedicines.map((m, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="Drug name (e.g. Amoxicillin)"
                        className="form-control"
                        value={m.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value, rxMedicines, setRxMedicines)}
                      />
                      <input
                        type="text"
                        placeholder="Dosage (500mg)"
                        className="form-control"
                        value={m.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value, rxMedicines, setRxMedicines)}
                      />
                      <input
                        type="text"
                        placeholder="Frequency (Twice daily)"
                        className="form-control"
                        value={m.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value, rxMedicines, setRxMedicines)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Duration (7 days)"
                        className="form-control"
                        value={m.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value, rxMedicines, setRxMedicines)}
                      />
                      <button type="button" onClick={() => handleRemoveMedicineRow(idx, rxMedicines, setRxMedicines)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Advice & Patient Instructions</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={rxSubmitting}>
                {rxSubmitting ? 'Issuing...' : '🚀 Submit Prescription to Patient File'}
              </button>
            </form>
          </div>

          {/* Issued Prescriptions History & PDF Generator */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Issued Prescriptions Archive</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map(rx => (
                <div key={rx._id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#0f172a' }}>Patient: {rx.patient?.name || 'Patient'}</strong>
                    <button onClick={() => handleGeneratePDFPrescription(rx)} className="btn btn-outline btn-sm">
                      📄 Generate PDF Prescription
                    </button>
                  </div>
                  <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    Diagnosis: {rx.diagnosis}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {rx.medicines?.map((m, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        💊 {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PEDIATRIC HEALTH MODULE (FEATURE 7) */}
      {/* ========================================================= */}
      {activeTab === 'pediatrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Growth Tracking (Height / Weight / BMI)</h2>
            <form onSubmit={handleAddPediatricGrowth}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select className="form-control" required value={pediaPatientId} onChange={(e) => setPediaPatientId(e.target.value)}>
                  <option value="">-- Select Child / Patient --</option>
                  {patients.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input type="number" required placeholder="e.g. 110" className="form-control" value={pediaHeight} onChange={(e) => setPediaHeight(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" required placeholder="e.g. 18.5" className="form-control" value={pediaWeight} onChange={(e) => setPediaWeight(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Growth Notes</label>
                <input type="text" placeholder="Developmental milestones..." className="form-control" value={pediaNotes} onChange={(e) => setPediaNotes(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Record Growth Metrics</button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Pediatric Vaccination Manager</h2>
            <form onSubmit={handleAddPediatricVaccination}>
              <div className="form-group">
                <label className="form-label">Select Child / Patient</label>
                <select className="form-control" required value={pediaPatientId} onChange={(e) => setPediaPatientId(e.target.value)}>
                  <option value="">-- Select Child --</option>
                  {patients.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vaccine Name</label>
                <input type="text" required placeholder="e.g. MMR Vaccine / Polio Booster" className="form-control" value={pediaVaccineName} onChange={(e) => setPediaVaccineName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={pediaVaccineStatus} onChange={(e) => setPediaVaccineStatus(e.target.value)}>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Due">Due</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Due Date</label>
                  <input type="date" className="form-control" value={pediaNextDue} onChange={(e) => setPediaNextDue(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Save Vaccine Record</button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CLINIC CALENDAR & HOURS (FEATURE 4) */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Weekly Working Hours & Slots</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <select className="form-control" style={{ flex: 1 }} value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="form-control" style={{ flex: 1 }} value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)}>
                {['08:30 AM', '09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" onClick={handleAddSlot} className="btn btn-primary btn-sm">➕ Add Slot</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {availabilityList.map(item => (
                <div key={item.day} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.day}</div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {item.slots?.map(slot => (
                      <span key={slot} className="badge badge-secondary">
                        ⏰ {slot}
                        <button type="button" onClick={() => handleRemoveSlot(item.day, slot)} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '4px', cursor: 'pointer' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSaveSchedule} className="btn btn-success" style={{ width: '100%' }} disabled={scheduleSaving}>
              {scheduleSaving ? 'Saving...' : '💾 Save Availability Schedule'}
            </button>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Breaks & Blackout Dates</h2>
            <div className="form-group">
              <label className="form-label">Break Times</label>
              <input type="text" className="form-control" value={breakTimes} onChange={(e) => setBreakTimes(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Max Apps Per Slot</label>
                <input type="number" className="form-control" value={maxAppsPerSlot} onChange={(e) => setMaxAppsPerSlot(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Apps Per Day</label>
                <input type="number" className="form-control" value={maxAppsPerDay} onChange={(e) => setMaxAppsPerDay(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Unavailable Blackout Date</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="date" className="form-control" value={blackoutDate} onChange={(e) => setBlackoutDate(e.target.value)} />
                <button type="button" onClick={handleAddBlackoutDate} className="btn btn-outline btn-sm">Add Blackout</button>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {unavailableDatesList.map(dt => (
                  <span key={dt} className="badge badge-danger">
                    🚫 {dt}
                    <button type="button" onClick={() => handleRemoveBlackoutDate(dt)} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '4px', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: DOCTOR ANALYTICS (FEATURE 12) */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>Clinical Performance & Patient Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Patients Treated</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>{analytics?.totalPatients || patients.length}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed Consultations</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{analytics?.completedConsultations || completedCount}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Prescriptions Issued</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6d28d9' }}>{analytics?.prescriptionsIssued || prescriptions.length}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Weekly Appointment Traffic</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {(analytics?.dailyStats || [
              { day: 'Mon', appointments: 6 },
              { day: 'Tue', appointments: 8 },
              { day: 'Wed', appointments: 5 },
              { day: 'Thu', appointments: 9 },
              { day: 'Fri', appointments: 7 },
              { day: 'Sat', appointments: 4 }
            ]).map(item => (
              <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ height: `${item.appointments * 12}px`, width: '100%', maxWidth: '36px', background: '#0284c7', borderRadius: '6px 6px 0 0' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '6px' }}>{item.day}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.appointments} apps</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: REAL-TIME DOCTOR-PATIENT CHAT (FEATURE 11) */}
      {/* ========================================================= */}
      {activeTab === 'chat' && (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', minHeight: '400px' }}>
          <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '0.75rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Patients</h4>
            {patients.map(p => (
              <div key={p._id || p.id} onClick={() => handleOpenChatWithPatient(p)} style={{
                padding: '0.6rem',
                borderRadius: '8px',
                background: (chatSelectedPatient?._id || chatSelectedPatient?.id) === (p._id || p.id) ? '#e0f2fe' : '#f8fafc',
                cursor: 'pointer',
                marginBottom: '0.4rem'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {chatSelectedPatient ? (
              <>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>Chatting with {chatSelectedPatient.name}</strong>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {chatMessages.map(m => {
                    const isDoc = String(m.sender) === String(user?._id || user?.id);
                    return (
                      <div key={m._id} style={{
                        alignSelf: isDoc ? 'flex-end' : 'flex-start',
                        background: isDoc ? '#0284c7' : '#f1f5f9',
                        color: isDoc ? '#ffffff' : '#0f172a',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '12px',
                        maxWidth: '75%',
                        fontSize: '0.875rem'
                      }}>
                        {m.message}
                        <div style={{ fontSize: '0.65rem', opacity: 0.8, textAlign: 'right', marginTop: '2px' }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Type clinical response..." className="form-control" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>Select a patient to begin conversation</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: EDIT DOCTOR PROFILE (FEATURE 16 & 17 FIX) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h2 className="card-title">Complete Your Professional Doctor Profile</h2>
            <span className="badge badge-success">Profile Completion: {completionPct}%</span>
          </div>

          {/* Profile Completion Bar */}
          <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '10px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ background: '#0284c7', width: `${completionPct}%`, height: '100%', transition: 'width 0.4s' }}></div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Doctor Name</label>
                <input type="text" required className="form-control" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input type="text" required className="form-control" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input type="text" required placeholder="e.g. MD, FAAD, FACC" className="form-control" value={profileForm.qualifications} onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" min="0" required className="form-control" value={profileForm.experience} onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee ($ USD)</label>
                <input type="number" min="0" required className="form-control" value={profileForm.fee} onChange={(e) => setProfileForm({ ...profileForm, fee: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Medical License Verification No.</label>
                <input type="text" className="form-control" value={profileForm.licenseNumber} onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital / Clinic Affiliation</label>
                <input type="text" className="form-control" value={profileForm.hospitalAffiliation} onChange={(e) => setProfileForm({ ...profileForm, hospitalAffiliation: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinic Address</label>
              <input type="text" className="form-control" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Areas of Expertise</label>
              <input type="text" placeholder="e.g. Pediatric Cardiology, Eczema, Joint Replacements" className="form-control" value={profileForm.areasOfExpertise} onChange={(e) => setProfileForm({ ...profileForm, areasOfExpertise: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea rows="4" className="form-control" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : '💾 Save Doctor Profile'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* START CONSULTATION MODAL (FEATURE 5) */}
      {/* ========================================================= */}
      {consultModalOpen && selectedAppForConsult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Clinical Consultation Session</h2>
              <button onClick={() => setConsultModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSaveConsultation}>
              {/* PATIENT INFO HEADER */}
              <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #bae6fd' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0369a1' }}>
                  Patient: {selectedAppForConsult.patient?.name || 'Patient'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0369a1', marginTop: '0.25rem' }}>
                  Age: {selectedAppForConsult.patient?.age || 26} yrs • Gender: {selectedAppForConsult.patient?.gender || 'Female'} • Blood: {selectedAppForConsult.patient?.bloodGroup || 'B+'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#b45309', marginTop: '0.25rem' }}>
                  ⚠️ Recorded Allergies: {selectedAppForConsult.patient?.allergies || 'None reported'}
                </div>
              </div>

              {/* VITALS SECTION */}
              <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Patient Vitals</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">BP (mmHg)</label>
                  <input type="text" className="form-control" value={consultForm.bp} onChange={(e) => setConsultForm({ ...consultForm, bp: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Pulse (bpm)</label>
                  <input type="text" className="form-control" value={consultForm.pulse} onChange={(e) => setConsultForm({ ...consultForm, pulse: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Temp (°F)</label>
                  <input type="text" className="form-control" value={consultForm.temp} onChange={(e) => setConsultForm({ ...consultForm, temp: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Weight (kg)</label>
                  <input type="text" className="form-control" value={consultForm.weight} onChange={(e) => setConsultForm({ ...consultForm, weight: e.target.value })} />
                </div>
              </div>

              {/* CLINICAL EVALUATION */}
              <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Clinical Evaluation & Diagnosis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Chief Complaint</label>
                  <input type="text" className="form-control" value={consultForm.chiefComplaint} onChange={(e) => setConsultForm({ ...consultForm, chiefComplaint: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <input type="text" required className="form-control" value={consultForm.diagnosis} onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Examination & Clinical Notes</label>
                <textarea rows="3" className="form-control" value={consultForm.clinicalNotes} onChange={(e) => setConsultForm({ ...consultForm, clinicalNotes: e.target.value })} />
              </div>

              {/* PRESCRIPTION BUILDER */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>Prescription Medications</h4>
                  <button type="button" onClick={() => handleAddMedicineRow(consultMedicines, setConsultMedicines)} className="btn btn-outline btn-sm">➕ Add Drug</button>
                </div>
                {consultMedicines.map((m, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input type="text" placeholder="Medicine" className="form-control" value={m.name} onChange={(e) => handleMedicineChange(idx, 'name', e.target.value, consultMedicines, setConsultMedicines)} />
                    <input type="text" placeholder="Dosage" className="form-control" value={m.dosage} onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value, consultMedicines, setConsultMedicines)} />
                    <input type="text" placeholder="Frequency" className="form-control" value={m.frequency} onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value, consultMedicines, setConsultMedicines)} />
                    <button type="button" onClick={() => handleRemoveMedicineRow(idx, consultMedicines, setConsultMedicines)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </div>
                ))}
              </div>

              {/* FOLLOW-UP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" className="form-control" value={consultForm.followUpDate} onChange={(e) => setConsultForm({ ...consultForm, followUpDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Reason</label>
                  <input type="text" className="form-control" value={consultForm.followUpReason} onChange={(e) => setConsultForm({ ...consultForm, followUpReason: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setConsultModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={consultSaving}>
                  {consultSaving ? 'Saving...' : '✓ Complete Consultation & Issue Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PATIENT HEALTH RECORD MODAL (FEATURE 6) */}
      {/* ========================================================= */}
      {patientRecordModalOpen && selectedPatientRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedPatientRecord.name}'s Health File</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Blood: {selectedPatientRecord.bloodGroup || 'B+'} • Age: {selectedPatientRecord.age || 26} yrs</div>
              </div>
              <button onClick={() => setPatientRecordModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* RECORD TABS */}
            <div className="tabs-nav" style={{ marginBottom: '1rem' }}>
              <button className={`tab-button ${recordActiveTab === 'overview' ? 'active' : ''}`} onClick={() => setRecordActiveTab('overview')}>Overview</button>
              <button className={`tab-button ${recordActiveTab === 'history' ? 'active' : ''}`} onClick={() => setRecordActiveTab('history')}>Medical History</button>
              <button className={`tab-button ${recordActiveTab === 'rx' ? 'active' : ''}`} onClick={() => setRecordActiveTab('rx')}>Prescriptions</button>
              <button className={`tab-button ${recordActiveTab === 'reports' ? 'active' : ''}`} onClick={() => setRecordActiveTab('reports')}>Reports</button>
            </div>

            {recordActiveTab === 'overview' && (
              <div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                  <strong>Allergies:</strong> {selectedPatientRecord.allergies || 'None reported'}<br/>
                  <strong>Existing Conditions:</strong> {selectedPatientRecord.existingConditions || 'None reported'}<br/>
                  <strong>Current Medications:</strong> {selectedPatientRecord.currentMedications || 'None'}
                </div>
              </div>
            )}

            {recordActiveTab === 'history' && (
              <div>
                {healthRecordData?.consultations?.map(c => (
                  <div key={c._id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0284c7' }}>{c.diagnosis}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(c.createdAt).toLocaleDateString()} • Doctor: {c.doctor?.name || 'Physician'}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{c.clinicalNotes || c.advice}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
