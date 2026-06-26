const mongoose = require('mongoose');

const meetingRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeetingRoom', meetingRoomSchema);
