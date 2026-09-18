// src/models/Appointment.js
const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'canceled', 'completed'], default: 'pending' },
  notes: { type: String },
  rating: { type: Number },
  reviewText: { type: String },
  joinLink: { type: String },
}, { timestamps: true });

const MongooseAppointment = mongoose.model('Appointment', appointmentSchema);

class AppointmentModelProxy {
  constructor(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongooseAppointment(data);
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
      doctor: this.data.doctor,
      date: new Date(this.data.date),
      status: this.data.status || 'pending',
      notes: this.data.notes || '',
      rating: this.data.rating || null,
      reviewText: this.data.reviewText || '',
      joinLink: this.data.joinLink || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.appointments.push(newDoc);
    return newDoc;
  }

  static async find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAppointment.find(filter);
    }
    let results = memoryStore.appointments.filter(a => {
      if (filter.patient && String(a.patient) !== String(filter.patient)) return false;
      if (filter.doctor && String(a.doctor) !== String(filter.doctor)) return false;
      if (filter.status && a.status !== filter.status) return false;
      return true;
    }).map(a => ({ ...a }));

    const chain = {
      populate: function(field, fields) {
        results = results.map(item => {
          const clone = { ...item };
          if (field === 'doctor') {
            const doc = memoryStore.users.find(u => String(u._id) === String(item.doctor));
            clone.doctor = doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization } : null;
          }
          if (field === 'patient') {
            const pat = memoryStore.users.find(u => String(u._id) === String(item.patient));
            clone.patient = pat ? { _id: pat._id, name: pat.name, email: pat.email } : null;
          }
          return clone;
        });
        return chain;
      },
      sort: function() {
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        return results;
      },
      then: function(resolve) {
        resolve(results);
      }
    };
    return chain;
  }

  static async findOne(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAppointment.findOne(filter);
    }
    const match = memoryStore.appointments.find(a => {
      if (filter._id && String(a._id) !== String(filter._id)) return false;
      if (filter.doctor && String(a.doctor) !== String(filter.doctor)) return false;
      if (filter.patient && String(a.patient) !== String(filter.patient)) return false;
      return true;
    });
    if (!match) return null;
    return {
      ...match,
      save: async function() {
        match.status = this.status;
        match.notes = this.notes;
        match.rating = this.rating;
        match.reviewText = this.reviewText;
        match.joinLink = this.joinLink;
        match.updatedAt = new Date();
        return match;
      }
    };
  }

  static async countDocuments(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseAppointment.countDocuments(filter);
    }
    return memoryStore.appointments.length;
  }
}

module.exports = AppointmentModelProxy;
