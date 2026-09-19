// src/routes/patient.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDoctors,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getPrescriptions,
  getReports,
  uploadReport,
  viewReport,
  downloadReport,
  deleteReport,
  updateProfile,
  getHealthRecord,
  getNotifications,
  markNotificationRead,
  getChatMessages,
  sendChatMessage,
  rateDoctor
} = require('../controllers/patientController');

const router = express.Router();

// Public/semi-public report viewing route (allows embedding in iframes, new tab links)
router.get('/reports/:id/view', viewReport);
router.get('/reports/:id/download', downloadReport);

// All other patient routes require authentication
router.use(protect);

// Shared endpoints accessible by patient or doctor
router.get('/health-record', authorize('patient', 'doctor', 'admin'), getHealthRecord);
router.get('/chat/:peerId', authorize('patient', 'doctor', 'admin'), getChatMessages);
router.post('/chat', authorize('patient', 'doctor', 'admin'), sendChatMessage);

// Patient-only endpoints
router.get('/doctors', authorize('patient', 'admin'), getDoctors);
router.post('/appointments', authorize('patient'), bookAppointment);
router.get('/appointments', authorize('patient'), getAppointments);
router.patch('/appointments/:id/cancel', authorize('patient'), cancelAppointment);
router.patch('/appointments/:id/reschedule', authorize('patient'), rescheduleAppointment);
router.post('/appointments/:id/rate', authorize('patient'), rateDoctor);
router.get('/prescriptions', authorize('patient'), getPrescriptions);
router.get('/reports', authorize('patient', 'doctor', 'admin'), getReports);
router.delete('/reports/:id', authorize('patient', 'admin'), deleteReport);
router.put('/profile', authorize('patient'), updateProfile);
router.get('/notifications', authorize('patient'), getNotifications);
router.patch('/notifications/read', authorize('patient'), markNotificationRead);

router.post('/reports', authorize('patient'), (req, res, next) => {
  upload.single('report')(req, res, (err) => {
    // If multer has no file, proceed anyway for manual file title submissions
    next();
  });
}, uploadReport);

module.exports = router;
