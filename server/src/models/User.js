const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin', 'officer'], 
    default: 'patient' 
  },
  status: { type: String, default: 'active' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  staffId: { type: String },
  accessiblePages: { type: [String], default: [] },
  phone: { type: String },
  address: { type: String },
  dob: { type: String },
  bloodGroup: { type: String },
  gender: { type: String },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.password === 'GOOGLE_USER_NO_PASSWORD') return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
