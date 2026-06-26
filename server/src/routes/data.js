const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authMiddleware to all routes except health check
router.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  authMiddleware(req, res, next);
});

// Users
router.get('/users', roleMiddleware(['admin']), dataController.getAll('users'));
router.get('/users/:id', dataController.getById('users'));
router.post('/users', roleMiddleware(['admin']), dataController.save('users'));
router.patch('/users/:id', (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.id === req.params.id)) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
}, dataController.update('users'));
router.delete('/users/:id', roleMiddleware(['admin']), dataController.deleteById('users'));

// Doctors
router.get('/doctors', dataController.getAll('doctors'));
router.get('/doctors/:id', dataController.getById('doctors'));
router.post('/doctors', roleMiddleware(['admin']), dataController.save('doctors'));
router.patch('/doctors/:id', roleMiddleware(['admin', 'doctor', 'officer']), dataController.update('doctors'));
router.delete('/doctors/:id', roleMiddleware(['admin']), dataController.deleteById('doctors'));

// Appointments
router.get('/appointments', roleMiddleware(['admin', 'officer', 'doctor']), dataController.getAll('appointments'));
router.post('/appointments', dataController.save('appointments'));
router.patch('/appointments/:id', dataController.update('appointments'));
router.get('/appointments/patient/:patientId', dataController.getAppointmentsByPatient);
router.get('/appointments/doctor/:doctorId', dataController.getAppointmentsByDoctor);

// Records
router.get('/records', roleMiddleware(['admin', 'doctor']), dataController.getAll('records'));
router.post('/records', roleMiddleware(['doctor']), dataController.save('records'));
router.get('/records/patient/:patientId', dataController.getRecordsByPatient);
router.get('/records/doctor/:doctorId', dataController.getRecordsByDoctor);

// Prescriptions
router.get('/prescriptions', roleMiddleware(['admin', 'doctor']), dataController.getAll('prescriptions'));
router.post('/prescriptions', roleMiddleware(['doctor']), dataController.save('prescriptions'));
router.get('/prescriptions/patient/:patientId', dataController.getPrescriptionsByPatient);
router.get('/prescriptions/doctor/:doctorId', dataController.getPrescriptionsByDoctor);

// Notifications
router.get('/notifications/user/:userId', dataController.getNotificationsByUser);
router.post('/notifications', dataController.save('notifications'));
router.patch('/notifications/:id', dataController.update('notifications'));

// Emergency Trigger
router.post('/emergency/alert', dataController.triggerEmergencyAlert);

// Announcements
router.get('/announcements', dataController.getAll('announcements'));
router.post('/announcements', roleMiddleware(['admin']), dataController.createAnnouncement);
router.delete('/announcements/:id', roleMiddleware(['admin']), dataController.deleteById('announcements'));
router.post('/announcements/:id/comments', dataController.addAnnouncementComment);

// Chats
router.get('/chats', dataController.getUserChats);
router.get('/chats/search-users', dataController.searchUsersForChat);
router.get('/chats/:chatId', dataController.getChatById);
router.post('/chats/:chatId', dataController.addChatMessage);

// Schedules
router.get('/schedules/:doctorId', dataController.getScheduleByDoctor);
router.put('/schedules/:doctorId', roleMiddleware(['doctor']), dataController.updateSchedule);

// Meetings
router.post('/meetings', dataController.createMeeting);
router.get('/meetings/:roomCode', dataController.getMeetingByCode);
router.patch('/meetings/:roomCode', dataController.updateMeeting);

// Departments
router.get('/departments', dataController.getAll('departments'));
router.post('/departments', roleMiddleware(['admin']), dataController.save('departments'));
router.patch('/departments/:id', roleMiddleware(['admin']), dataController.update('departments'));
router.delete('/departments/:id', roleMiddleware(['admin']), dataController.deleteById('departments'));

// Payments
router.post('/payment/create-checkout-session', paymentController.createCheckoutSession);
router.get('/payment/verify-session', paymentController.verifySession);

module.exports = router;
