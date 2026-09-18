// src/controllers/doctorController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const memoryStore = require('../config/memoryStore');
const mongoose = require('mongoose');

// @desc   Get doctor profile
// @route  GET /api/doctor/profile
// @access Private (doctor)
exports.getProfile = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doctor = await User.findById(req.user.id).select('-password');
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      return res.json(doctor);
    }
    const doc = memoryStore.users.find(u => String(u._id) === String(req.user.id));
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    const copy = { ...doc };
    delete copy.password;
    res.json(copy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Update doctor profile
// @route  PUT /api/doctor/profile
// @access Private (doctor)
exports.updateProfile = async (req, res) => {
  const {
    name, specialization, qualifications, experience, bio, fee, phone, address, photo,
    licenseNumber, hospitalAffiliation, areasOfExpertise, maxAppsPerSlot, maxAppsPerDay,
    breakTimes, unavailableDates
  } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (specialization !== undefined) updateData.specialization = specialization;
      if (qualifications !== undefined) updateData.qualifications = qualifications;
      if (experience !== undefined) updateData.experience = experience;
      if (bio !== undefined) updateData.bio = bio;
      if (fee !== undefined) updateData.fee = fee;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (photo !== undefined) updateData.photo = photo;
      if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
      if (hospitalAffiliation !== undefined) updateData.hospitalAffiliation = hospitalAffiliation;
      if (areasOfExpertise !== undefined) updateData.areasOfExpertise = areasOfExpertise;
      if (maxAppsPerSlot !== undefined) updateData.maxAppsPerSlot = maxAppsPerSlot;
      if (maxAppsPerDay !== undefined) updateData.maxAppsPerDay = maxAppsPerDay;
      if (breakTimes !== undefined) updateData.breakTimes = breakTimes;
      if (unavailableDates !== undefined) updateData.unavailableDates = unavailableDates;

      const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
      return res.json(updated);
    }

    const doc = memoryStore.users.find(u => String(u._id) === String(req.user.id));
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    if (name !== undefined) doc.name = name;
    if (specialization !== undefined) doc.specialization = specialization;
    if (qualifications !== undefined) doc.qualifications = qualifications;
    if (experience !== undefined) doc.experience = Number(experience);
    if (bio !== undefined) doc.bio = bio;
    if (fee !== undefined) doc.fee = Number(fee);
    if (phone !== undefined) doc.phone = phone;
    if (address !== undefined) doc.address = address;
    if (photo !== undefined) doc.photo = photo;
    if (licenseNumber !== undefined) doc.licenseNumber = licenseNumber;
    if (hospitalAffiliation !== undefined) doc.hospitalAffiliation = hospitalAffiliation;
    if (areasOfExpertise !== undefined) doc.areasOfExpertise = areasOfExpertise;
    if (maxAppsPerSlot !== undefined) doc.maxAppsPerSlot = Number(maxAppsPerSlot);
    if (maxAppsPerDay !== undefined) doc.maxAppsPerDay = Number(maxAppsPerDay);
    if (breakTimes !== undefined) doc.breakTimes = breakTimes;
    if (unavailableDates !== undefined) doc.unavailableDates = unavailableDates;
    doc.updatedAt = new Date();

    const copy = { ...doc };
    delete copy.password;
    res.json(copy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Set availability schedule
// @route  POST /api/doctor/availability
// @access Private (doctor)
exports.setAvailability = async (req, res) => {
  const { availability } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const doctor = await User.findById(req.user.id);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      doctor.availability = availability;
      await doctor.save();
      return res.json({ availability: doctor.availability });
    }

    const doc = memoryStore.users.find(u => String(u._id) === String(req.user.id));
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    doc.availability = availability;
    doc.updatedAt = new Date();
    res.json({ availability: doc.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   List appointments for doctor
// @route  GET /api/doctor/appointments
// @access Private (doctor)
exports.getAppointments = async (req, res) => {
  const { status } = req.query;
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = { doctor: req.user.id };
      if (status && status !== 'all') filter.status = status;
      const apps = await Appointment.find(filter)
        .populate('patient', 'name email phone age gender bloodGroup')
        .sort({ date: -1 });
      return res.json(apps);
    }

    let apps = memoryStore.appointments.filter(a => String(a.doctor) === String(req.user.id));
    if (status && status !== 'all') {
      apps = apps.filter(a => a.status === status);
    }

    const result = apps.map(a => {
      const pat = memoryStore.users.find(u => String(u._id) === String(a.patient));
      return {
        ...a,
        patient: pat ? {
          _id: pat._id,
          name: pat.name,
          email: pat.email,
          phone: pat.phone || '+1 (555) 000-0000',
          age: pat.age || 30,
          gender: pat.gender || 'Not specified',
          bloodGroup: pat.bloodGroup || 'O+'
        } : null
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Accept, reject, or complete an appointment
// @route  PATCH /api/doctor/appointments/:id/status
// @access Private (doctor)
exports.updateAppointmentStatus = async (req, res) => {
  const { status, notes } = req.body;
  if (!['accepted', 'rejected', 'completed', 'canceled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    if (mongoose.connection.readyState === 1) {
      const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user.id });
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      appointment.status = status;
      if (notes) appointment.notes = notes;
      await appointment.save();
      return res.json(appointment);
    }

    const app = memoryStore.appointments.find(a => String(a._id) === String(req.params.id) && String(a.doctor) === String(req.user.id));
    if (!app) return res.status(404).json({ message: 'Appointment not found' });
    app.status = status;
    if (notes) app.notes = notes;
    app.updatedAt = new Date();
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Add digital prescription for a patient
// @route  POST /api/doctor/prescriptions
// @access Private (doctor)
exports.addPrescription = async (req, res) => {
  const { patientId, diagnosis, medicines, notes } = req.body;
  if (!patientId || !medicines || medicines.length === 0) {
    return res.status(400).json({ message: 'Patient and medicines list are required' });
  }

  try {
    let prescription;
    if (mongoose.connection.readyState === 1) {
      prescription = new Prescription({
        doctor: req.user.id,
        patient: patientId,
        diagnosis: diagnosis || 'General Medical Assessment',
        medicines,
        notes: notes || ''
      });
      await prescription.save();
    } else {
      const newDoc = {
        _id: memoryStore.generateId(),
        doctor: String(req.user.id),
        patient: String(patientId),
        diagnosis: diagnosis || 'General Medical Assessment',
        medicines,
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.prescriptions.unshift(newDoc);
      prescription = newDoc;
    }

    res.status(201).json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating prescription' });
  }
};

// @desc   Get doctor's issued prescriptions
// @route  GET /api/doctor/prescriptions
// @access Private (doctor)
exports.getPrescriptions = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const rx = await Prescription.find({ doctor: req.user.id })
        .populate('patient', 'name email phone age')
        .sort({ createdAt: -1 });
      return res.json(rx);
    }

    const rx = memoryStore.prescriptions
      .filter(p => String(p.doctor) === String(req.user.id))
      .map(p => {
        const pat = memoryStore.users.find(u => String(u._id) === String(p.patient));
        return {
          ...p,
          patient: pat ? { _id: pat._id, name: pat.name, email: pat.email, phone: pat.phone } : null
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(rx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get doctor's patient roster
// @route  GET /api/doctor/patients
// @access Private (doctor)
exports.getPatients = async (req, res) => {
  try {
    const doctorId = String(req.user.id || req.user._id);
    const doctorApps = memoryStore.appointments.filter(a => String(a.doctor) === doctorId);

    const patients = memoryStore.users
      .filter(u => u.role === 'patient')
      .map(u => {
        const lastApp = doctorApps.find(a => String(a.patient) === String(u._id));
        return {
          _id: u._id,
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+1 (555) 234-5678',
          bloodGroup: u.bloodGroup || 'O+',
          age: u.age || 32,
          gender: u.gender || 'Not specified',
          lastVisit: lastApp ? lastApp.date : null
        };
      });

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Save complete consultation details
// @route  POST /api/doctor/consultations
// @access Private (doctor)
exports.saveConsultation = async (req, res) => {
  const {
    patientId, appointmentId, vitals, chiefComplaint, symptoms, medicalHistory,
    examinationNotes, diagnosis, clinicalNotes, advice, followUpDate, followUpReason,
    prescription
  } = req.body;

  try {
    const doctorId = String(req.user.id || req.user._id);

    const newConsultation = {
      _id: memoryStore.generateId(),
      patient: String(patientId),
      doctor: doctorId,
      appointmentId: appointmentId ? String(appointmentId) : null,
      vitals: vitals || {},
      chiefComplaint: chiefComplaint || '',
      symptoms: symptoms || '',
      medicalHistory: medicalHistory || '',
      examinationNotes: examinationNotes || '',
      diagnosis: diagnosis || 'Clinical Consultation',
      clinicalNotes: clinicalNotes || '',
      advice: advice || '',
      followUpDate: followUpDate || null,
      followUpReason: followUpReason || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryStore.consultations.unshift(newConsultation);

    // If appointment ID was provided, mark appointment completed
    if (appointmentId) {
      const app = memoryStore.appointments.find(a => String(a._id) === String(appointmentId));
      if (app) {
        app.status = 'completed';
        app.updatedAt = new Date();
      }
    }

    // Save prescription if provided
    let issuedRx = null;
    if (prescription && prescription.medicines && prescription.medicines.length > 0) {
      issuedRx = {
        _id: memoryStore.generateId(),
        doctor: doctorId,
        patient: String(patientId),
        diagnosis: diagnosis || 'Clinical Consultation',
        medicines: prescription.medicines,
        notes: advice || prescription.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.prescriptions.unshift(issuedRx);
    }

    // Save follow-up if requested
    if (followUpDate) {
      const newFollowUp = {
        _id: memoryStore.generateId(),
        patient: String(patientId),
        doctor: doctorId,
        followUpDate,
        reason: followUpReason || 'Post-consultation follow-up',
        notes: advice || '',
        status: 'scheduled',
        createdAt: new Date()
      };
      memoryStore.followUps.unshift(newFollowUp);
    }

    // Notify patient
    const patientUser = memoryStore.users.find(u => String(u._id) === String(patientId));
    const docUser = memoryStore.users.find(u => String(u._id) === doctorId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(patientId),
      title: 'Consultation Completed',
      message: `${docUser?.name || 'Your doctor'} has completed your consultation session and updated your health record.`,
      type: 'consultation',
      isRead: false,
      createdAt: new Date()
    });

    res.status(201).json({ consultation: newConsultation, prescription: issuedRx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving consultation' });
  }
};

// @desc   Get doctor analytics metrics
// @route  GET /api/doctor/analytics
// @access Private (doctor)
exports.getAnalytics = async (req, res) => {
  try {
    const doctorId = String(req.user.id || req.user._id);

    const docApps = memoryStore.appointments.filter(a => String(a.doctor) === doctorId);
    const docRx = memoryStore.prescriptions.filter(p => String(p.doctor) === doctorId);
    const docFollows = memoryStore.followUps.filter(f => String(f.doctor) === doctorId);
    const docConsults = memoryStore.consultations.filter(c => String(c.doctor) === doctorId);

    const uniquePatientIds = new Set(docApps.map(a => String(a.patient)));

    const analytics = {
      totalPatients: uniquePatientIds.size || 5,
      newPatientsThisMonth: Math.max(1, Math.floor(uniquePatientIds.size * 0.4)),
      totalAppointments: docApps.length,
      pendingRequests: docApps.filter(a => a.status === 'pending').length,
      confirmedAppointments: docApps.filter(a => a.status === 'accepted').length,
      completedConsultations: docApps.filter(a => a.status === 'completed').length || docConsults.length,
      prescriptionsIssued: docRx.length,
      upcomingFollowUps: docFollows.filter(f => f.status === 'scheduled').length,
      dailyStats: [
        { day: 'Mon', appointments: 6, consults: 5 },
        { day: 'Tue', appointments: 8, consults: 7 },
        { day: 'Wed', appointments: 5, consults: 4 },
        { day: 'Thu', appointments: 9, consults: 8 },
        { day: 'Fri', appointments: 7, consults: 6 },
        { day: 'Sat', appointments: 4, consults: 4 }
      ]
    };

    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading analytics' });
  }
};

// @desc   Record pediatric growth
// @route  POST /api/doctor/pediatric/growth
// @access Private (doctor)
exports.recordGrowth = async (req, res) => {
  const { patientId, height, weight, date, notes } = req.body;
  if (!patientId || !height || !weight) {
    return res.status(400).json({ message: 'Patient, height and weight are required' });
  }
  try {
    const hMeter = Number(height) / 100;
    const bmi = Number((Number(weight) / (hMeter * hMeter)).toFixed(1));
    const newRecord = {
      _id: memoryStore.generateId(),
      patient: String(patientId),
      doctor: String(req.user.id),
      height: Number(height),
      weight: Number(weight),
      bmi,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date()
    };
    memoryStore.growthRecords.unshift(newRecord);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error recording growth data' });
  }
};

// @desc   Record vaccination
// @route  POST /api/doctor/pediatric/vaccination
// @access Private (doctor)
exports.recordVaccination = async (req, res) => {
  const { patientId, vaccineName, dateAdministered, nextDueDate, status, notes } = req.body;
  if (!patientId || !vaccineName) {
    return res.status(400).json({ message: 'Patient and vaccine name are required' });
  }
  try {
    const newVac = {
      _id: memoryStore.generateId(),
      patient: String(patientId),
      doctor: String(req.user.id),
      vaccineName,
      dateAdministered: dateAdministered || null,
      nextDueDate: nextDueDate || null,
      status: status || 'Completed',
      notes: notes || '',
      createdAt: new Date()
    };
    memoryStore.vaccinations.unshift(newVac);
    res.status(201).json(newVac);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error recording vaccination' });
  }
};

// @desc   Get doctor notifications
// @route  GET /api/doctor/notifications
// @access Private (doctor)
exports.getNotifications = async (req, res) => {
  try {
    const doctorId = String(req.user.id || req.user._id);
    const notifs = memoryStore.notifications
      .filter(n => String(n.user) === doctorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Mark notification as read
// @route  PATCH /api/doctor/notifications/read
// @access Private (doctor)
exports.markNotificationRead = async (req, res) => {
  try {
    const doctorId = String(req.user.id || req.user._id);
    const { id } = req.body;
    memoryStore.notifications.forEach(n => {
      if (String(n.user) === doctorId && (!id || String(n._id) === String(id))) {
        n.isRead = true;
      }
    });
    res.json({ message: 'Notifications updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get chat messages between doctor and a patient
// @route  GET /api/doctor/chat/:patientId
// @access Private (doctor)
exports.getDoctorChatMessages = async (req, res) => {
  try {
    const doctorId = String(req.user.id || req.user._id);
    const patientId = String(req.params.patientId);

    const msgs = memoryStore.chats.filter(c =>
      (String(c.sender) === doctorId && String(c.receiver) === patientId) ||
      (String(c.sender) === patientId && String(c.receiver) === doctorId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Send a chat message from doctor to a patient
// @route  POST /api/doctor/chat
// @access Private (doctor)
exports.sendDoctorChatMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  if (!receiverId || !message) {
    return res.status(400).json({ message: 'Receiver and message content required' });
  }
  try {
    const senderId = String(req.user.id || req.user._id);
    const newMsg = {
      _id: memoryStore.generateId(),
      sender: senderId,
      receiver: String(receiverId),
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };
    memoryStore.chats.push(newMsg);

    const senderUser = memoryStore.users.find(u => String(u._id) === senderId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(receiverId),
      senderId: senderId,
      title: 'New Message from Doctor',
      message: `You have a new message from ${senderUser?.name || 'your doctor'}.`,
      type: 'message',
      isRead: false,
      createdAt: new Date()
    });
    res.status(201).json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

