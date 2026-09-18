// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');
require('dotenv').config();

// Generate JWT
function generateToken(user) {
  const payload = { id: String(user._id || user.id), role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Cookie options helper
function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

// @desc   Register user (patient or doctor)
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const {
    name, email, password, role, specialization, qualifications, experience,
    phone, age, gender, bloodGroup, emergencyContact, address, fee, bio, department
  } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      // MongoDB path
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use' });

      const user = new User({
        name, email, password, role,
        specialization: role === 'doctor' ? specialization : undefined,
        qualifications:  role === 'doctor' ? qualifications  : undefined,
        experience:      role === 'doctor' ? experience      : undefined,
        fee:             role === 'doctor' ? (fee || 100)    : undefined,
        bio:             role === 'doctor' ? bio             : undefined,
        phone,
        age:             role === 'patient' ? age            : undefined,
        gender:          role === 'patient' ? gender         : undefined,
        bloodGroup:      role === 'patient' ? bloodGroup     : undefined,
        emergencyContact:role === 'patient' ? emergencyContact : undefined,
        address,
        hospitalAffiliation: role === 'admin' ? department   : undefined,
        approved: true,
      });
      await user.save();
      return res.status(201).json({
        id: user._id, name: user.name, email: user.email,
        role: user.role, approved: user.approved,
        message: 'Account registered successfully. Please sign in.'
      });
    }

    // MemoryStore path
    if (memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = {
      _id: memoryStore.generateId(),
      name, email,
      password: hashed,
      role,
      specialization: role === 'doctor' ? specialization : undefined,
      qualifications:  role === 'doctor' ? qualifications  : undefined,
      experience:      role === 'doctor' ? experience      : undefined,
      fee:             role === 'doctor' ? (fee || 100)    : undefined,
      bio:             role === 'doctor' ? bio             : undefined,
      phone:           phone || '+1 (555) 000-0000',
      age:             role === 'patient' ? (age || 28)    : undefined,
      gender:          role === 'patient' ? (gender || 'Not specified') : undefined,
      bloodGroup:      role === 'patient' ? (bloodGroup || 'O+') : undefined,
      emergencyContact:role === 'patient' ? emergencyContact : undefined,
      address,
      hospitalAffiliation: role === 'admin' ? department   : undefined,
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    newUser.id = newUser._id;
    memoryStore.users.push(newUser);

    return res.status(201).json({
      id: newUser._id, name: newUser.name, email: newUser.email,
      role: newUser.role, approved: newUser.approved,
      message: 'Account registered successfully. Please sign in.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      // MongoDB path
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      if (user.role === 'doctor' && !user.approved) {
        return res.status(403).json({ message: 'Doctor account pending approval' });
      }
      const token = generateToken(user);
      return res.cookie('token', token, cookieOptions()).json({
        id: user._id, name: user.name, email: user.email,
        role: user.role, approved: user.approved,
      });
    }

    // MemoryStore path
    const raw = memoryStore.users.find(u => u.email === email);
    if (!raw) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, raw.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (raw.role === 'doctor' && !raw.approved) {
      return res.status(403).json({ message: 'Doctor account pending approval' });
    }

    const token = generateToken(raw);
    return res.cookie('token', token, cookieOptions()).json({
      id: raw._id, name: raw.name, email: raw.email,
      role: raw.role, approved: raw.approved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc   Logout user (clear cookie)
// @route  POST /api/auth/logout
// @access Private
exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' }).json({ message: 'Logged out' });
};

// @desc   Get current authenticated user info
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    // MemoryStore path
    const raw = memoryStore.users.find(u => String(u._id) === String(req.user.id));
    if (!raw) return res.status(404).json({ message: 'User not found' });
    const copy = { ...raw };
    delete copy.password;
    res.json(copy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
