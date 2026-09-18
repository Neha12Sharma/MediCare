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

// All patient routes require authentication and patient role
router.use(protect, authorize('patient'));

router.get('/doctors', getDoctors);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);
router.patch('/appointments/:id/cancel', cancelAppointment);
router.patch('/appointments/:id/reschedule', rescheduleAppointment);
router.post('/appointments/:id/rate', rateDoctor);
router.get('/prescriptions', getPrescriptions);
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);
router.put('/profile', updateProfile);
router.get('/health-record', getHealthRecord);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationRead);
router.get('/chat/:peerId', getChatMessages);
router.post('/chat', sendChatMessage);

router.post('/reports', (req, res, next) => {
  upload.single('report')(req, res, (err) => {
    // If multer has no file, proceed anyway for manual file title submissions
    next();
  });
}, uploadReport);

module.exports = router;
