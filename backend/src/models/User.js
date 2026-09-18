// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const memoryStore = require('../config/memoryStore');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  specialization: { type: String },
  qualifications: { type: String },
  experience: { type: Number },
  fee: { type: Number, default: 100 },
  bio: { type: String },
  phone: { type: String },
  address: { type: String },
  photo: { type: String },
  licenseNumber: { type: String },
  hospitalAffiliation: { type: String },
  areasOfExpertise: { type: String },
  maxAppsPerSlot: { type: Number, default: 2 },
  maxAppsPerDay: { type: Number, default: 20 },
  breakTimes: { type: String },
  unavailableDates: [{ type: String }],
  availability: [{ day: String, slots: [String] }],
  approved: { type: Boolean, default: false },
  // Patient specific
  bloodGroup: { type: String },
  age: { type: Number },
  gender: { type: String },
  allergies: { type: String },
  existingConditions: { type: String },
  currentMedications: { type: String },
  emergencyContact: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);

class UserModelProxy {
  constructor(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongooseUser(data);
    }
    this.data = { ...data };
  }

  async save() {
    if (mongoose.connection.readyState === 1) {
      return this.save();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.data.password, salt);
    const newDoc = {
      _id: memoryStore.generateId(),
      ...this.data,
      password: hashedPassword,
      approved: this.data.role === 'doctor' ? (this.data.approved ?? false) : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.push(newDoc);
    return memoryStore.wrapUserDoc(newDoc);
  }

  static findOne(filter) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(filter);
    }
    const match = memoryStore.users.find(u => {
      if (filter.email) {
        const queryEmail = filter.email.toLowerCase();
        const mainMatch = u.email && u.email.toLowerCase() === queryEmail;
        const altMatch = u.altEmail && u.altEmail.toLowerCase() === queryEmail;
        if (!mainMatch && !altMatch) return false;
      }
      if (filter._id && String(u._id) !== String(filter._id)) return false;
      if (filter.role && u.role !== filter.role) return false;
      if (filter.approved !== undefined && u.approved !== filter.approved) return false;
      return true;
    });

    let doc = memoryStore.wrapUserDoc(match);
    const query = {
      select: function(fields) {
        if (doc && fields && fields.includes('-password')) {
          const clone = { ...doc };
          delete clone.password;
          doc = clone;
        }
        return query;
      },
      then: function(resolve, reject) {
        return Promise.resolve(doc).then(resolve, reject);
      },
      catch: function(reject) {
        return Promise.resolve(doc).catch(reject);
      }
    };
    return query;
  }

  static findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id);
    }
    const match = memoryStore.users.find(u => String(u._id) === String(id));
    let doc = memoryStore.wrapUserDoc(match);

    const query = {
      select: function(fields) {
        if (doc && fields && fields.includes('-password')) {
          const clone = { ...doc };
          delete clone.password;
          doc = clone;
        }
        return query;
      },
      then: function(resolve, reject) {
        return Promise.resolve(doc).then(resolve, reject);
      },
      catch: function(reject) {
        return Promise.resolve(doc).catch(reject);
      }
    };
    return query;
  }

  static find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.find(filter);
    }
    let matches = memoryStore.users.filter(u => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.approved !== undefined && u.approved !== filter.approved) return false;
      if (filter.specialization && u.specialization !== filter.specialization) return false;
      return true;
    }).map(u => {
      const doc = memoryStore.wrapUserDoc(u);
      return doc;
    });

    const query = {
      select: function(fields) {
        if (fields && fields.includes('-password')) {
          matches = matches.map(m => {
            const clone = { ...m };
            delete clone.password;
            return clone;
          });
        }
        return query;
      },
      sort: function() {
        return query;
      },
      then: function(resolve, reject) {
        return Promise.resolve(matches).then(resolve, reject);
      },
      catch: function(reject) {
        return Promise.resolve(matches).catch(reject);
      }
    };
    return query;
  }

  static findByIdAndUpdate(id, updates, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findByIdAndUpdate(id, updates, options);
    }
    const user = memoryStore.users.find(u => String(u._id) === String(id));
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
    }
    let doc = memoryStore.wrapUserDoc(user);

    const query = {
      select: function(fields) {
        if (doc && fields && fields.includes('-password')) {
          const clone = { ...doc };
          delete clone.password;
          doc = clone;
        }
        return query;
      },
      then: function(resolve, reject) {
        return Promise.resolve(doc).then(resolve, reject);
      },
      catch: function(reject) {
        return Promise.resolve(doc).catch(reject);
      }
    };
    return query;
  }

  static async countDocuments(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.countDocuments(filter);
    }
    return memoryStore.users.filter(u => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.approved !== undefined && u.approved !== filter.approved) return false;
      return true;
    }).length;
  }

  static async deleteOne(filter) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.deleteOne(filter);
    }
    const idx = memoryStore.users.findIndex(u => String(u._id) === String(filter._id));
    if (idx !== -1) {
      memoryStore.users.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = UserModelProxy;
