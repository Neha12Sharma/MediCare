// src/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Use in-memory storage: completely serverless-friendly, zero filesystem writes
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only PDFs and images
  const allowed = /pdf|jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

module.exports = upload;
