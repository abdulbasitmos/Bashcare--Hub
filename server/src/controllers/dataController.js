const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Record = require('../models/Record');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Chat = require('../models/Chat');
const Meeting = require('../models/Meeting');
const Department = require('../models/Department');
const mailService = require('../utils/mailService');

const models = {
  users: User,
  doctors: Doctor,
  appointments: Appointment,
  records: Record,
  prescriptions: Prescription,
  notifications: Notification,
  announcements: Announcement,
  chats: Chat,
  departments: Department
};

const handleAppointmentCreation = async (appointment) => {
  try {
    let doctorUser = await User.findById(appointment.doctorId);
    let doctorDoc = null;
    if (!doctorUser) {
      doctorDoc = await Doctor.findById(appointment.doctorId);
      if (doctorDoc) {
        doctorUser = await User.findById(doctorDoc.userId);
      }
    }

    const doctorEmail = doctorUser ? doctorUser.email : (doctorDoc ? doctorDoc.email : appointment.doctorEmail);
    const doctorName = doctorUser ? doctorUser.name : (doctorDoc ? doctorDoc.name : appointment.doctorName);

    // Email to Doctor
    if (doctorEmail) {
      await mailService.sendAppointmentEmail({
        toEmail: doctorEmail,
        toName: doctorName || 'Doctor',
        role: 'doctor',
        action: 'create',
        appointmentDetails: {
          patientName: appointment.patientName,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status
        }
      });
    }

    // Email to Patient
    let patientUser = await User.findById(appointment.patientId);
    const patientEmail = patientUser ? patientUser.email : appointment.patientEmail;
    const patientName = patientUser ? patientUser.name : appointment.patientName;
    
    if (patientEmail) {
      await mailService.sendAppointmentEmail({
        toEmail: patientEmail,
        toName: patientName || 'Patient',
        role: 'patient',
        action: 'create',
        appointmentDetails: {
          doctorName: doctorName || appointment.doctorName || 'Doctor',
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status
        }
      });
    }
  } catch (error) {
    console.error('Error handling appointment creation email:', error);
  }
};

const handleAppointmentStatusChange = async (appointment) => {
  try {
    const patientUser = await User.findById(appointment.patientId);
    const doctorUser = await User.findById(appointment.doctorId);
    
    if (patientUser) {
      await mailService.sendAppointmentEmail({
        toEmail: patientUser.email,
        toName: patientUser.name,
        role: 'patient',
        action: 'status_change',
        appointmentDetails: {
          doctorName: doctorUser ? doctorUser.name : appointment.doctorName,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status
        }
      });
    }
  } catch (error) {
    console.error('Error handling appointment status change email:', error);
  }
};

const getAll = (key) => async (req, res) => {
  try {
    const Model = models[key];
    if (!Model) return res.status(404).json({ message: 'Model not found' });
    let data;
    if (key === 'appointments') {
      const appointments = await Model.find().populate('patientId', 'name').sort({ createdAt: -1 });
      data = appointments.map(app => {
        const obj = app.toObject();
        obj.patientName = obj.patientName || (obj.patientId ? obj.patientId.name : 'Unknown Patient');
        obj.patientId = obj.patientId ? (obj.patientId._id || obj.patientId) : null;
        return obj;
      });
    } else {
      data = await Model.find().sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getById = (key) => async (req, res) => {
  try {
    const { id } = req.params;
    const Model = models[key];
    
    let item = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Model.findById(id);
    }
    
    if (!item && key === 'doctors') {
      item = await Model.findOne({ userId: id });
    }
    
    if (item) res.json(item);
    else res.status(404).json({ message: 'Not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const save = (key) => async (req, res) => {
  try {
    const Model = models[key];
    const itemData = req.body;
    
    // Check if adding or updating an admin/officer staff user
    if (key === 'users' && (itemData.role === 'admin' || itemData.role === 'officer')) {
      if (!req.user || req.user.email !== 'admin@bashcare.internal') {
        return res.status(403).json({ message: 'Forbidden. Only the main Head Admin can manage staff accounts.' });
      }
    }
    
    let item;
    if (itemData._id || itemData.id) {
      const id = itemData._id || itemData.id;
      
      let oldStatus = null;
      if (key === 'appointments' && itemData.status) {
        const oldApp = await Model.findById(id);
        if (oldApp) oldStatus = oldApp.status;
      }

      item = await Model.findByIdAndUpdate(id, itemData, { new: true });

      if (key === 'appointments' && item && itemData.status && oldStatus && oldStatus !== item.status) {
        handleAppointmentStatusChange(item).catch(err => console.error('Status email error:', err));
      }
    } else {
      item = new Model(itemData);
      await item.save();

      if (key === 'appointments') {
        handleAppointmentCreation(item).catch(err => console.error('Creation email error:', err));
      }
    }
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = (key) => async (req, res) => {
  try {
    const { id } = req.params;
    const Model = models[key];
    
    // Enforce main admin only for modifying staff users
    if (key === 'users') {
      const targetUser = await Model.findById(id);
      if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'officer')) {
        if (!req.user || req.user.email !== 'admin@bashcare.internal') {
          return res.status(403).json({ message: 'Forbidden. Only the main Head Admin can modify staff accounts.' });
        }
      }
    }
    
    let oldStatus = null;
    if (key === 'appointments' && req.body.status) {
      const oldApp = await Model.findById(id);
      if (oldApp) oldStatus = oldApp.status;
    }

    let updated = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    }
    
    if (!updated && key === 'doctors') {
      updated = await Model.findOneAndUpdate({ userId: id }, req.body, { new: true });
    }

    if (updated) {
      if (key === 'appointments' && req.body.status && oldStatus && oldStatus !== updated.status) {
        handleAppointmentStatusChange(updated).catch(err => console.error('Status email error:', err));
      }
      res.json(updated);
    }
    else res.status(404).json({ message: 'Not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteById = (key) => async (req, res) => {
  try {
    const { id } = req.params;
    const Model = models[key];
    
    // Enforce main admin only for deleting staff users
    if (key === 'users') {
      const targetUser = await Model.findById(id);
      if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'officer')) {
        if (!req.user || req.user.email !== 'admin@bashcare.internal') {
          return res.status(403).json({ message: 'Forbidden. Only the main Head Admin can delete staff accounts.' });
        }
      }
    }
    await Model.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Specialized handlers
const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId }).populate('patientId', 'name').sort({ date: 1 });
    const data = appointments.map(app => {
      const obj = app.toObject();
      obj.patientName = obj.patientName || (obj.patientId ? obj.patientId.name : 'Unknown Patient');
      obj.patientId = obj.patientId ? (obj.patientId._id || obj.patientId) : null;
      return obj;
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId }).populate('patientId', 'name').sort({ date: 1 });
    const data = appointments.map(app => {
      const obj = app.toObject();
      obj.patientName = obj.patientName || (obj.patientId ? obj.patientId.name : 'Unknown Patient');
      obj.patientId = obj.patientId ? (obj.patientId._id || obj.patientId) : null;
      return obj;
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = await Record.find({ patientId }).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = await Prescription.find({ patientId }).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await Prescription.find({ doctorId }).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let userRole = '';
    
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) userRole = user.role.toLowerCase();
    }

    const data = await Notification.find({ 
      $or: [
        { userId: userId }, 
        { userId: 'all' },
        ...(userRole ? [{ userId: userRole }] : [])
      ] 
    }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await Record.find({ doctorId }).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chat and Schedule could also be models, but for now we focus on the core
// Let's assume they are handled similarly or keep as placeholders if not used much
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    // Retrieve all chats where the current user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params; // other participant's ID
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.json([]);
    }
    const chat = await Chat.findOne({ 
      participants: { $all: [userId, chatId] } 
    });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addChatMessage = async (req, res) => {
  try {
    const { chatId } = req.params; // other participant's ID
    const { sender, text, messageType, fileUrl, fileName, fileSize, duration } = req.body;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid participant or user IDs' });
    }
    
    let chat = await Chat.findOne({ 
      participants: { $all: [userId, chatId] } 
    });
    
    if (!chat) {
      // If no exact match, check if the doctor (or user) already started a chat with themselves
      if (userId !== chatId) {
         chat = await Chat.findOne({ participants: chatId });
         if (chat && !chat.participants.includes(userId)) {
           chat.participants.push(userId);
         }
      }
      
      if (!chat) {
        // If still no chat, create a new one. If userId === chatId, it will just be [userId].
        const newParticipants = userId === chatId ? [userId] : [userId, chatId];
        chat = new Chat({ participants: newParticipants, messages: [] });
      }
    }
    
    const newMessage = {
      sender: sender || req.user.role || 'system',
      senderId: userId,
      text,
      time: new Date(),
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileSize,
      duration
    };
    
    chat.messages.push(newMessage);
    
    let lastMsgText = text;
    if (messageType === 'voice') lastMsgText = '🎤 Voice Note';
    else if (messageType === 'file') lastMsgText = `📁 File: ${fileName || 'Attachment'}`;
    else if (messageType === 'video') lastMsgText = '📹 Video Call';
    
    chat.lastMessage = lastMsgText || text || '';
    chat.updatedAt = new Date();
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScheduleByDoctor = async (req, res) => {
  res.json({ workingHours: { start: '09:00', end: '17:00' }, offDays: [] });
};

const updateSchedule = async (req, res) => {
  res.json(req.body);
};

const searchUsersForChat = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    if (!q) return res.json([]);
    
    const users = await User.find({
      _id: { $ne: userId },
      role: { $in: ['patient', 'doctor'] },
      name: { $regex: q, $options: 'i' }
    }).select('name email role').limit(15);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target } = req.body;
    const announcement = new Announcement({
      title,
      content,
      targetRole: target || 'all'
    });
    await announcement.save();

    // Trigger email notifications
    let userQuery = {};
    if (target && target !== 'all') {
      userQuery.role = target;
    } else {
      userQuery.role = { $in: ['patient', 'doctor'] };
    }

    const targetedUsers = await User.find(userQuery).select('name email');
    
    // Send emails in background
    targetedUsers.forEach(user => {
      mailService.sendAnnouncementEmail(user.email, user.name, announcement);
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAnnouncementComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    
    // Need to get user name
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    announcement.comments.push({
      userId,
      userName: user.name,
      text
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMeeting = async (req, res) => {
  try {
    const { roomCode, hostName } = req.body;
    const hostId = req.user.id;
    
    // Check if there is already an active meeting with this room code
    let meeting = await Meeting.findOne({ roomCode, status: 'active' });
    if (meeting) {
      return res.status(400).json({ message: 'Meeting room code already active' });
    }

    meeting = new Meeting({
      roomCode,
      hostId,
      hostName,
      status: 'active'
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMeetingByCode = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const meeting = await Meeting.findOne({ roomCode, status: 'active' });
    if (!meeting) {
      return res.status(404).json({ message: 'Active meeting room not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const meeting = await Meeting.findOneAndUpdate({ roomCode, status: 'active' }, req.body, { new: true });
    if (!meeting) {
      return res.status(404).json({ message: 'Active meeting room not found' });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const triggerEmergencyAlert = async (req, res) => {
  try {
    const { message, latitude, longitude, contactNumber } = req.body;
    const patientName = req.user.name;
    const patientPhone = contactNumber || req.user.phone;

    // 1. Fetch active/verified doctors
    const activeDoctors = await Doctor.find({ status: { $in: ['verified', 'active'] } }).populate('userId');

    // 2. Loop to notify each doctor
    for (const doc of activeDoctors) {
      if (doc.userId) {
        // Create an in-app notification
        const notification = new Notification({
          userId: doc.userId._id.toString(),
          title: '🚨 EMERGENCY ALERT - Urgent Patient Care Required',
          message: `Patient ${patientName} is requesting immediate help. Contact phone: ${patientPhone || 'Not provided'}. Message: ${message || 'No additional details.'} ${latitude && longitude ? `(Location: ${latitude}, ${longitude})` : ''}`,
          type: 'system',
          link: '/dashboard/doctor/messages'
        });
        await notification.save();

        // Send high-priority emergency email via Brevo
        if (doc.email) {
          mailService.sendEmergencyEmail(
            doc.email,
            doc.name,
            patientName,
            patientPhone,
            message,
            latitude,
            longitude
          ).catch(err => console.error(`Failed to send email to Dr. ${doc.name}:`, err));
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Emergency notification dispatched to all active doctors.', 
      doctors: activeDoctors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  save,
  update,
  deleteById,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getRecordsByPatient,
  getRecordsByDoctor,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  getNotificationsByUser,
  getUserChats,
  getChatById,
  addChatMessage,
  getScheduleByDoctor,
  updateSchedule,
  searchUsersForChat,
  createAnnouncement,
  addAnnouncementComment,
  createMeeting,
  getMeetingByCode,
  updateMeeting,
  triggerEmergencyAlert
};
