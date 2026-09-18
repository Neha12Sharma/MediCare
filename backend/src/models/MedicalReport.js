// src/models/MedicalReport.js
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const medicalReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
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
      _id: memoryStore.generateId(),
      patient: this.data.patient,
      filename: this.data.filename,
      originalName: this.data.originalName,
      mimeType: this.data.mimeType,
      path: this.data.path,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.medicalReports.push(newDoc);
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
}

module.exports = MedicalReportModelProxy;
