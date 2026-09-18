// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Import route modules (will be created later)
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patient');
const doctorRoutes = require('./src/routes/doctor');
const adminRoutes = require('./src/routes/admin');

dotenv.config();
const app = express();

// Middleware
app.use(require('cookie-parser')());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, postman) or any localhost/127.0.0.1
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// Serve uploads folder statically for file downloads/viewing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  // If the script is run directly, start the server
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
