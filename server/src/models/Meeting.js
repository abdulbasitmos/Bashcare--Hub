const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostName: { type: String, required: true },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  isLocked: { type: Boolean, default: false },
  muteAllMics: { type: Boolean, default: false },
  broadcastMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

meetingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Meeting', meetingSchema);
