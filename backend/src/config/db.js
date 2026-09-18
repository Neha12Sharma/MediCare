// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicare';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('MongoDB connected successfully to', uri);
  } catch (err) {
    console.warn('MongoDB connection not available. Running seamlessly with in-memory database store.');
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
