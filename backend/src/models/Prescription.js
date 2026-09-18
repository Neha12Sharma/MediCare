// src/models/Prescription.js
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const prescriptionSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
    }
  ],
  notes: { type: String },
}, { timestamps: true });

const MongoosePrescription = mongoose.model('Prescription', prescriptionSchema);

class PrescriptionModelProxy {
  constructor(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongoosePrescription(data);
    }
    this.data = { ...data };
  }

  async save() {
    if (mongoose.connection.readyState === 1) {
      return this.save();
    }
    const newDoc = {
      _id: memoryStore.generateId(),
      doctor: this.data.doctor,
      patient: this.data.patient,
      medicines: this.data.medicines || [],
      notes: this.data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.prescriptions.push(newDoc);
    return newDoc;
  }

  static async find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePrescription.find(filter);
    }
    return memoryStore.prescriptions.filter(p => {
      if (filter.patient && String(p.patient) !== String(filter.patient)) return false;
      if (filter.doctor && String(p.doctor) !== String(filter.doctor)) return false;
      return true;
    });
  }

  static async countDocuments(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePrescription.countDocuments(filter);
    }
    return memoryStore.prescriptions.length;
  }
}

module.exports = PrescriptionModelProxy;
