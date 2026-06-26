const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialty: { type: String, default: 'General Practitioner' },
  category: { type: String },
  department: { type: String },
  professionalRole: { type: String },
  age: { type: Number },
  profilePicture: { type: String },
  bio: { type: String },
  availableTime: [{
    day: String,
    slots: [String]
  }],
  status: { type: String, enum: ['pending', 'verified', 'active', 'rejected'], default: 'pending' },
  isProfileComplete: { type: Boolean, default: false },
  experience: { type: String, default: '0 years' },
  rating: { type: Number, default: 5.0 },
  patients: { type: Number, default: 0 },
  about: { type: String },
  education: [String],
  verificationDocuments: [{
    name: String,
    size: String,
    type: String,
    url: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

doctorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Doctor', doctorSchema);
