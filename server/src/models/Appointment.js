const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'rescheduled'], default: 'pending' },
  reason: { type: String },
  type: { type: String, default: 'General Consultation' },
  specialty: { type: String, default: 'General Practitioner' },
  amount: { type: Number, default: 0 },
  paymentConfirmed: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'unpaid'], default: 'unpaid' },
  appointmentType: { type: String, enum: ['online', 'in_person'], default: 'online' },
  patientAddress: { type: String },
  patientPhone: { type: String },
  paymentMethod: { type: String },
  symptoms: { type: String },
  rejectionReason: { type: String },
  preparationInstructions: { type: String },
  rescheduledDate: { type: String },
  rescheduledTime: { type: String },
  rescheduledBy: { type: String, enum: ['doctor', 'patient'] },
  rescheduleReason: { type: String },
  doctorNotes: { type: String },
  priority: { type: String, enum: ['routine', 'urgent', 'follow-up'], default: 'routine' },
  followUpDate: { type: Date },
  followUpReminded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

appointmentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
