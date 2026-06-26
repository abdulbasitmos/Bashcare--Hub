const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  instructions: { type: String },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  date: { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate: { type: Date },
  refills: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

prescriptionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
