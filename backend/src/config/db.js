// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let lastFailedAttempt = 0;
const RETRY_INTERVAL = 60000; // Retry connection at most once every 60s if offline

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // If no MONGODB_URI is provided, use memory store without waiting
  if (!uri && !process.env.NODE_ENV?.includes('prod')) {
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection failed recently, avoid re-trying on every single request
  if (Date.now() - lastFailedAttempt < RETRY_INTERVAL) {
    return null;
  }

  if (!cached.promise) {
    const targetUri = uri || 'mongodb://127.0.0.1:27017/medicare';
    const opts = {
      serverSelectionTimeoutMS: 2000,
    };

    cached.promise = mongoose.connect(targetUri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection not available. Running with in-memory database store.');
      lastFailedAttempt = Date.now();
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
  }

  return cached.conn;
};

module.exports = connectDB;
