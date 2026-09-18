// src/routes/doctor.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  setAvailability,
  getAppointments,
  updateAppointmentStatus,
  addPrescription,
  getPrescriptions,
  getPatients,
  saveConsultation,
  getAnalytics,
  recordGrowth,
  recordVaccination,
  getNotifications,
  markNotificationRead,
  getDoctorChatMessages,
  sendDoctorChatMessage
} = require('../controllers/doctorController');

const router = express.Router();

// All doctor routes require authentication and doctor role
router.use(protect, authorize('doctor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/availability', setAvailability);
router.get('/appointments', getAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/prescriptions', addPrescription);
router.get('/prescriptions', getPrescriptions);
router.get('/patients', getPatients);
router.post('/consultations', saveConsultation);
router.get('/analytics', getAnalytics);
router.post('/pediatric/growth', recordGrowth);
router.post('/pediatric/vaccination', recordVaccination);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationRead);
router.get('/chat/:patientId', getDoctorChatMessages);
router.post('/chat', sendDoctorChatMessage);

module.exports = router;
