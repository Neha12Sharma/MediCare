// src/routes/admin.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  listDoctors,
  approveDoctor,
  listUsers,
  deleteUser,
  getAllAppointments
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/doctors', listDoctors);
router.patch('/doctors/:id/approve', approveDoctor);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', require('../controllers/adminController').toggleUserStatus);
router.post('/notifications/broadcast', require('../controllers/adminController').broadcastNotification);
router.get('/analytics/reports', require('../controllers/adminController').getAdvancedAnalytics);
router.get('/appointments', getAllAppointments);

module.exports = router;
