// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');
require('dotenv').config();

// Verify JWT from httpOnly cookie "token"
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected – fetch from DB
      user = await User.findById(decoded.id).select('-password');
    } else {
      // MongoDB offline – fall back to in-memory store
      const raw = memoryStore.users.find(
        (u) => String(u._id) === String(decoded.id)
      );
      if (raw) {
        const copy = { ...raw };
        delete copy.password;
        copy._id = String(raw._id);
        copy.id  = String(raw._id);
        user = copy;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.user.id  = String(user._id || user.id || decoded.id);
    req.user._id = String(user._id || user.id || decoded.id);

    if (req.user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked by an administrator' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not attached' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

module.exports = { protect, authorize };
