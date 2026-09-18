// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicare';

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection not available. Running with in-memory database store. Error:', err.message);
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
