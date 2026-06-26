const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: String, required: true }, // 'patient', 'doctor', 'admin', 'officer'
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    messageType: { type: String, enum: ['text', 'voice', 'video', 'file', 'image'], default: 'text' },
    fileUrl: { type: String }, // Base64 data URL or file link
    fileName: { type: String },
    fileSize: { type: String },
    duration: { type: String } // For voice notes or video calls
  }],
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
