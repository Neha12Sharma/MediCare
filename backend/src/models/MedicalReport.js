// src/models/MedicalReport.js
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const medicalReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, default: 'application/pdf' },
  size: { type: String },
  path: { type: String },
  fileData: { type: String }, // Base64 encoded file data for serverless/cloud persistence
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const MongooseMedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

class MedicalReportModelProxy {
  constructor(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongooseMedicalReport(data);
    }
    this.data = { ...data };
  }

  async save() {
    if (mongoose.connection.readyState === 1) {
      return this.save();
    }
    const newDoc = {
      _id: this.data._id || memoryStore.generateId(),
      patient: this.data.patient,
      filename: this.data.filename,
      originalName: this.data.originalName,
      mimeType: this.data.mimeType || 'application/pdf',
      size: this.data.size,
      path: this.data.path,
      fileData: this.data.fileData,
      date: this.data.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.medicalReports.unshift(newDoc);
    return newDoc;
  }

  static async find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseMedicalReport.find(filter);
    }
    return memoryStore.medicalReports.filter(r => {
      if (filter.patient && String(r.patient) !== String(filter.patient)) return false;
      return true;
    });
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseMedicalReport.findById(id);
    }
    return memoryStore.medicalReports.find(r => String(r._id) === String(id) || String(r.id) === String(id)) || null;
  }

  static async deleteOne(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseMedicalReport.deleteOne(filter);
    }
    const idx = memoryStore.medicalReports.findIndex(r => {
      if (filter._id && String(r._id) !== String(filter._id)) return false;
      if (filter.patient && String(r.patient) !== String(filter.patient)) return false;
      return true;
    });
    if (idx !== -1) {
      memoryStore.medicalReports.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = MedicalReportModelProxy;
