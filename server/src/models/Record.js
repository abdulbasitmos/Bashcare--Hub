const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  treatment: { type: String },
  notes: { type: String },
  files: [String],
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

recordSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Record', recordSchema);
