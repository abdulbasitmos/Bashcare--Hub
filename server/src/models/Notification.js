const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be ObjectId string or 'all'
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['system', 'appointment', 'message'], default: 'system' },
  link: { type: String }, // Optional target redirect URL
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

notificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Notification', notificationSchema);
