// src/controllers/patientController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const memoryStore = require('../config/memoryStore');
const mongoose = require('mongoose');

// @desc   Get list of approved doctors
// @route  GET /api/patient/doctors
// @access Private (patient)
exports.getDoctors = async (req, res) => {
  const { specialization, search } = req.query;
  try {
    let doctors;
    if (mongoose.connection.readyState === 1) {
      const filter = { role: 'doctor', approved: true };
      if (specialization && specialization !== 'all') filter.specialization = specialization;
      doctors = await User.find(filter).select('-password');
    } else {
      doctors = memoryStore.users.filter(u => {
        if (u.role !== 'doctor' || !u.approved) return false;
        if (specialization && specialization !== 'all' && u.specialization !== specialization) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchName = u.name && u.name.toLowerCase().includes(s);
          const matchSpec = u.specialization && u.specialization.toLowerCase().includes(s);
          if (!matchName && !matchSpec) return false;
        }
        return true;
      }).map(u => {
        const doc = { ...u };
        delete doc.password;
        return doc;
      });
    }
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

// @desc   Book an appointment with a doctor
// @route  POST /api/patient/appointments
// @access Private (patient)
exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;
  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor and date are required' });
  }

  const patientId = String(req.user.id || req.user._id);
  const targetSlot = timeSlot || '10:00 AM';
  const targetDateStr = new Date(date).toISOString().split('T')[0];

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.approved) {
      return res.status(404).json({ message: 'Selected doctor is not available' });
    }

    // Double booking check
    const existingConflict = memoryStore.appointments.find(a => {
      if (String(a.doctor) !== String(doctorId)) return false;
      if (a.status === 'canceled' || a.status === 'rejected') return false;
      const appDateStr = new Date(a.date).toISOString().split('T')[0];
      return appDateStr === targetDateStr && (a.timeSlot || '10:00 AM') === targetSlot;
    });

    if (existingConflict) {
      return res.status(400).json({
        message: `Slot ${targetSlot} on ${targetDateStr} is already booked. Please choose another available time slot.`
      });
    }

    let appointment;
    if (mongoose.connection.readyState === 1) {
      appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date(date),
        timeSlot: targetSlot,
        status: 'pending',
        reason: reason || 'General Consultation'
      });
      await appointment.save();
    } else {
      const newDoc = {
        _id: memoryStore.generateId(),
        patient: patientId,
        doctor: String(doctorId),
        date: new Date(date),
        timeSlot: targetSlot,
        status: 'pending',
        reason: reason || 'General Consultation',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.appointments.unshift(newDoc);
      appointment = newDoc;
    }

    // Notifications
    const patUser = memoryStore.users.find(u => String(u._id) === patientId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(doctorId),
      title: 'New Appointment Booking',
      message: `${patUser?.name || 'A patient'} booked an appointment for ${targetDateStr} at ${targetSlot}.`,
      type: 'appointment',
      isRead: false,
      createdAt: new Date()
    });

    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: patientId,
      title: 'Appointment Requested',
      message: `Your appointment request with ${doctor.name} for ${targetDateStr} at ${targetSlot} has been submitted.`,
      type: 'appointment',
      isRead: false,
      createdAt: new Date()
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
};

// @desc   Get patient's appointment history
// @route  GET /api/patient/appointments
// @access Private (patient)
exports.getAppointments = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const apps = await Appointment.find({ patient: patientId })
        .populate('doctor', 'name specialization fee')
        .sort({ date: -1 });
      return res.json(apps);
    }

    const apps = memoryStore.appointments
      .filter(a => String(a.patient) === patientId)
      .map(a => {
        const doc = memoryStore.users.find(u => String(u._id) === String(a.doctor));
        return {
          ...a,
          doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization, fee: doc.fee } : null
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// @desc   Cancel an appointment
// @route  PATCH /api/patient/appointments/:id/cancel
// @access Private (patient)
exports.cancelAppointment = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const app = await Appointment.findOne({ _id: req.params.id, patient: patientId });
      if (!app) return res.status(404).json({ message: 'Appointment not found' });
      app.status = 'canceled';
      await app.save();
      return res.json(app);
    }

    const app = memoryStore.appointments.find(a => String(a._id) === String(req.params.id) && String(a.patient) === patientId);
    if (!app) return res.status(404).json({ message: 'Appointment not found' });
    app.status = 'canceled';
    app.updatedAt = new Date();

    const patUser = memoryStore.users.find(u => String(u._id) === patientId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(app.doctor),
      title: 'Appointment Canceled',
      message: `${patUser?.name || 'A patient'} has canceled their appointment on ${new Date(app.date).toLocaleDateString()}.`,
      type: 'appointment',
      isRead: false,
      createdAt: new Date()
    });

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error canceling appointment' });
  }
};

// @desc   Get patient's prescriptions
// @route  GET /api/patient/prescriptions
// @access Private (patient)
exports.getPrescriptions = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const rx = await Prescription.find({ patient: patientId })
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 });
      return res.json(rx);
    }

    const rx = memoryStore.prescriptions
      .filter(p => String(p.patient) === patientId)
      .map(p => {
        const doc = memoryStore.users.find(u => String(u._id) === String(p.doctor));
        return {
          ...p,
          doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(rx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching prescriptions' });
  }
};

// @desc   Get patient's medical reports
// @route  GET /api/patient/reports
// @access Private (patient)
exports.getReports = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const reports = await MedicalReport.find({ patient: patientId }).sort({ createdAt: -1 });
      return res.json(reports);
    }

    const reports = memoryStore.medicalReports
      .filter(r => String(r.patient) === patientId)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

exports.rateDoctor = async (req, res) => {
  const { rating, reviewText } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  try {
    const patientId = String(req.user.id || req.user._id);
    let app, doctor;

    if (mongoose.connection.readyState === 1) {
      app = await Appointment.findOne({ _id: req.params.id, patient: patientId });
      if (!app) return res.status(404).json({ message: 'Appointment not found' });
      if (app.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed appointments' });
      if (app.rating) return res.status(400).json({ message: 'Appointment already rated' });

      app.rating = rating;
      app.reviewText = reviewText;
      await app.save();

      doctor = await User.findById(app.doctor);
    } else {
      app = memoryStore.appointments.find(a => String(a._id) === String(req.params.id) && String(a.patient) === patientId);
      if (!app) return res.status(404).json({ message: 'Appointment not found' });
      if (app.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed appointments' });
      if (app.rating) return res.status(400).json({ message: 'Appointment already rated' });

      app.rating = rating;
      app.reviewText = reviewText;
      app.updatedAt = new Date();

      doctor = memoryStore.users.find(u => String(u._id) === String(app.doctor));
    }

    if (doctor) {
      const currentRating = doctor.rating || 0;
      const currentReviewsCount = doctor.reviewsCount || 0;
      const newReviewsCount = currentReviewsCount + 1;
      const newRating = ((currentRating * currentReviewsCount) + rating) / newReviewsCount;
      doctor.rating = newRating;
      doctor.reviewsCount = newReviewsCount;
      if (mongoose.connection.readyState === 1) {
        await doctor.save();
      } else {
        doctor.updatedAt = new Date();
      }
    }

    res.json({ message: 'Rating submitted successfully', appointment: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
};

// @desc   Upload a medical report
// @route  POST /api/patient/reports
// @access Private (patient)
exports.uploadReport = async (req, res) => {
  const { title } = req.body;
  const patientId = String(req.user.id || req.user._id);

  try {
    const newReport = {
      _id: memoryStore.generateId(),
      patient: patientId,
      filename: req.file ? req.file.filename : (title ? `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.pdf` : 'lab_report.pdf'),
      originalName: req.file ? req.file.originalname : (title || 'Diagnostic Lab Report.pdf'),
      mimeType: req.file ? req.file.mimetype : 'application/pdf',
      size: req.file ? `${(req.file.size / 1024).toFixed(1)} KB` : `${(Math.random() * 1.5 + 0.5).toFixed(1)} MB`,
      date: new Date(),
      createdAt: new Date(),
      path: req.file ? `/uploads/${req.file.filename}` : '/uploads/sample_report.pdf'
    };

    if (mongoose.connection.readyState === 1) {
      const report = new MedicalReport(newReport);
      await report.save();
    } else {
      memoryStore.medicalReports.unshift(newReport);
    }

    res.status(201).json(newReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error uploading report' });
  }
};

// @desc   Reschedule an appointment
// @route  PATCH /api/patient/appointments/:id/reschedule
// @access Private (patient)
exports.rescheduleAppointment = async (req, res) => {
  const { date, timeSlot } = req.body;
  if (!date || !timeSlot) {
    return res.status(400).json({ message: 'Date and time slot are required to reschedule' });
  }
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const app = await Appointment.findOne({ _id: req.params.id, patient: patientId });
      if (!app) return res.status(404).json({ message: 'Appointment not found' });
      app.date = new Date(date);
      app.timeSlot = timeSlot;
      app.status = 'pending'; // Requires doctor confirmation for new slot
      await app.save();
      return res.json(app);
    }

    const app = memoryStore.appointments.find(a => String(a._id) === String(req.params.id) && String(a.patient) === patientId);
    if (!app) return res.status(404).json({ message: 'Appointment not found' });
    app.date = new Date(date);
    app.timeSlot = timeSlot;
    app.status = 'pending';
    app.updatedAt = new Date();

    const patUser = memoryStore.users.find(u => String(u._id) === patientId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(app.doctor),
      title: 'Appointment Rescheduled',
      message: `${patUser?.name || 'A patient'} has rescheduled their appointment to ${new Date(date).toLocaleDateString()} at ${timeSlot}.`,
      type: 'appointment',
      isRead: false,
      createdAt: new Date()
    });

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error rescheduling appointment' });
  }
};

// @desc   Delete a medical report
// @route  DELETE /api/patient/reports/:id
// @access Private (patient)
exports.deleteReport = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const result = await MedicalReport.deleteOne({ _id: req.params.id, patient: patientId });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Report not found' });
      return res.json({ message: 'Report deleted successfully' });
    }

    const idx = memoryStore.medicalReports.findIndex(r => String(r._id) === String(req.params.id) && String(r.patient) === patientId);
    if (idx === -1) return res.status(404).json({ message: 'Report not found' });
    memoryStore.medicalReports.splice(idx, 1);
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting report' });
  }
};

// @desc   Update patient medical profile
// @route  PUT /api/patient/profile
// @access Private (patient)
exports.updateProfile = async (req, res) => {
  const {
    name, phone, age, gender, bloodGroup, address, emergencyContact,
    allergies, existingConditions, currentMedications, photo
  } = req.body;
  try {
    const patientId = String(req.user.id || req.user._id);

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (age !== undefined) updateData.age = age;
      if (gender !== undefined) updateData.gender = gender;
      if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
      if (address !== undefined) updateData.address = address;
      if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
      if (allergies !== undefined) updateData.allergies = allergies;
      if (existingConditions !== undefined) updateData.existingConditions = existingConditions;
      if (currentMedications !== undefined) updateData.currentMedications = currentMedications;
      if (photo !== undefined) updateData.photo = photo;

      const updated = await User.findByIdAndUpdate(patientId, updateData, { new: true }).select('-password');
      return res.json(updated);
    }

    const pat = memoryStore.users.find(u => String(u._id) === patientId);
    if (!pat) return res.status(404).json({ message: 'Patient profile not found' });
    if (name !== undefined) pat.name = name;
    if (phone !== undefined) pat.phone = phone;
    if (age !== undefined) pat.age = Number(age);
    if (gender !== undefined) pat.gender = gender;
    if (bloodGroup !== undefined) pat.bloodGroup = bloodGroup;
    if (address !== undefined) pat.address = address;
    if (emergencyContact !== undefined) pat.emergencyContact = emergencyContact;
    if (allergies !== undefined) pat.allergies = allergies;
    if (existingConditions !== undefined) pat.existingConditions = existingConditions;
    if (currentMedications !== undefined) pat.currentMedications = currentMedications;
    if (photo !== undefined) pat.photo = photo;
    pat.updatedAt = new Date();

    const copy = { ...pat };
    delete copy.password;
    res.json(copy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating patient profile' });
  }
};

// @desc   Get comprehensive health record for patient
// @route  GET /api/patient/health-record
// @access Private (patient/doctor)
exports.getHealthRecord = async (req, res) => {
  try {
    const patientId = req.query.patientId || String(req.user.id || req.user._id);

    const patient = memoryStore.users.find(u => String(u._id) === String(patientId));
    const consults = memoryStore.consultations
      .filter(c => String(c.patient) === String(patientId))
      .map(c => {
        const doc = memoryStore.users.find(u => String(u._id) === String(c.doctor));
        return { ...c, doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null };
      });

    const appointments = memoryStore.appointments
      .filter(a => String(a.patient) === String(patientId))
      .map(a => {
        const doc = memoryStore.users.find(u => String(u._id) === String(a.doctor));
        return { ...a, doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null };
      });

    const prescriptions = memoryStore.prescriptions
      .filter(p => String(p.patient) === String(patientId))
      .map(p => {
        const doc = memoryStore.users.find(u => String(u._id) === String(p.doctor));
        return { ...p, doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null };
      });

    const reports = memoryStore.medicalReports.filter(r => String(r.patient) === String(patientId));
    const vaccinations = memoryStore.vaccinations.filter(v => String(v.patient) === String(patientId));
    const growthRecords = memoryStore.growthRecords.filter(g => String(g.patient) === String(patientId));
    const followUps = memoryStore.followUps.filter(f => String(f.patient) === String(patientId));

    res.json({
      patient,
      consultations: consults,
      appointments,
      prescriptions,
      reports,
      vaccinations,
      growthRecords,
      followUps
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading health record' });
  }
};

// @desc   Get patient notifications
// @route  GET /api/patient/notifications
// @access Private (patient)
exports.getNotifications = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);
    const notifs = memoryStore.notifications
      .filter(n => String(n.user) === patientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Mark patient notification as read
// @route  PATCH /api/patient/notifications/read
// @access Private (patient)
exports.markNotificationRead = async (req, res) => {
  try {
    const patientId = String(req.user.id || req.user._id);
    const { id } = req.body;
    memoryStore.notifications.forEach(n => {
      if (String(n.user) === patientId && (!id || String(n._id) === String(id))) {
        n.isRead = true;
      }
    });
    res.json({ message: 'Notifications updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get chat messages between user and peer
// @route  GET /api/patient/chat/:peerId
// @access Private (patient/doctor)
exports.getChatMessages = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user._id);
    const peerId = String(req.params.peerId);

    const msgs = memoryStore.chats.filter(c =>
      (String(c.sender) === userId && String(c.receiver) === peerId) ||
      (String(c.sender) === peerId && String(c.receiver) === userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Send chat message
// @route  POST /api/patient/chat
// @access Private (patient/doctor)
exports.sendChatMessage = async (req, res) => {
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

    // Create notification for receiver
    const senderUser = memoryStore.users.find(u => String(u._id) === senderId);
    memoryStore.notifications.unshift({
      _id: memoryStore.generateId(),
      user: String(receiverId),
      senderId: senderId,
      title: 'New Message',
      message: `You have a new message from ${senderUser?.name || 'a user'}.`,
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

