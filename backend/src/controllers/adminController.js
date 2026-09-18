// src/controllers/adminController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const memoryStore = require('../config/memoryStore');
const mongoose = require('mongoose');

// @desc   Get platform statistics
// @route  GET /api/admin/stats
// @access Private (admin)
exports.getStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [usersCount, doctorsCount, patientsCount] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'doctor' }),
        User.countDocuments({ role: 'patient' }),
      ]);
      const appointmentsCount = await Appointment.countDocuments({});
      const prescriptionsCount = await Prescription.countDocuments({});
      const pendingDoctors = await User.countDocuments({ role: 'doctor', approved: false });

      return res.json({
        usersCount,
        doctorsCount,
        patientsCount,
        appointmentsCount,
        prescriptionsCount,
        pendingDoctors
      });
    }

    const totalUsers = memoryStore.users.length;
    const totalDoctors = memoryStore.users.filter(u => u.role === 'doctor').length;
    const approvedDoctors = memoryStore.users.filter(u => u.role === 'doctor' && u.approved).length;
    const pendingDoctors = memoryStore.users.filter(u => u.role === 'doctor' && !u.approved).length;
    const totalPatients = memoryStore.users.filter(u => u.role === 'patient').length;
    const totalAppointments = memoryStore.appointments.length;
    const pendingAppointments = memoryStore.appointments.filter(a => a.status === 'pending').length;
    const completedAppointments = memoryStore.appointments.filter(a => a.status === 'completed' || a.status === 'accepted').length;
    const totalPrescriptions = memoryStore.prescriptions.length;

    res.json({
      usersCount: totalUsers,
      doctorsCount: totalDoctors,
      approvedDoctors,
      pendingDoctors,
      patientsCount: totalPatients,
      appointmentsCount: totalAppointments,
      pendingAppointments,
      completedAppointments,
      prescriptionsCount: totalPrescriptions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Approve a doctor account
// @route  PATCH /api/admin/doctors/:id/approve
// @access Private (admin)
exports.approveDoctor = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      doctor.approved = true;
      await doctor.save();
      return res.json({ message: 'Doctor approved', doctorId: doctor._id });
    }

    const doctor = memoryStore.users.find(u => String(u._id) === String(req.params.id) && u.role === 'doctor');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.approved = true;
    doctor.updatedAt = new Date();
    res.json({ message: 'Doctor approved successfully', doctorId: doctor._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   List all doctors
// @route  GET /api/admin/doctors
// @access Private (admin)
exports.listDoctors = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doctors = await User.find({ role: 'doctor' }).select('-password');
      return res.json(doctors);
    }

    const doctors = memoryStore.users
      .filter(u => u.role === 'doctor')
      .map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });

    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   List all platform users
// @route  GET /api/admin/users
// @access Private (admin)
exports.listUsers = async (req, res) => {
  const { role, search } = req.query;
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (role && role !== 'all') filter.role = role;
      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }

    let users = memoryStore.users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        (u.name && u.name.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        (u.specialization && u.specialization.toLowerCase().includes(s))
      );
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Delete a user
// @route  DELETE /api/admin/users/:id
// @access Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const result = await User.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User deleted' });
    }

    const idx = memoryStore.users.findIndex(u => String(u._id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    memoryStore.users.splice(idx, 1);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get all appointments across hospital
// @route  GET /api/admin/appointments
// @access Private (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const apps = await Appointment.find({})
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization')
        .sort({ date: -1 });
      return res.json(apps);
    }

    const apps = memoryStore.appointments.map(a => {
      const pat = memoryStore.users.find(u => String(u._id) === String(a.patient));
      const doc = memoryStore.users.find(u => String(u._id) === String(a.doctor));
      return {
        ...a,
        patient: pat ? { _id: pat._id, name: pat.name, email: pat.email, phone: pat.phone } : null,
        doctor: doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { status } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.status = status;
      await user.save();
      return res.json({ message: `User status updated to ${status}` });
    }
    const user = memoryStore.users.find(u => String(u._id) === String(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = status;
    user.updatedAt = new Date();
    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.broadcastNotification = async (req, res) => {
  const { title, message, targetAudience } = req.body;
  try {
    const notifyUsers = memoryStore.users.filter(u => targetAudience === 'all' || u.role === targetAudience);
    notifyUsers.forEach(u => {
      memoryStore.notifications.push({
        _id: memoryStore.generateId(),
        user: String(u._id),
        title,
        message,
        type: 'announcement',
        isRead: false,
        createdAt: new Date()
      });
    });
    // For mongoose mode, you'd typically have a Notification model. Since we are storing notifications in memoryStore anyway, we'll keep it there for simplicity.
    res.json({ message: 'Notification broadcasted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const reports = {
      appointmentsOverTime: months.slice(0, currentMonthIndex + 1).map(m => ({ month: m, value: Math.floor(Math.random() * 50) + 10 })),
      revenueOverTime: months.slice(0, currentMonthIndex + 1).map(m => ({ month: m, value: Math.floor(Math.random() * 5000) + 1000 }))
    };
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
