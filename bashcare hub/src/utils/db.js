// API Utility for Bashcare Hub
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const fetchAPI = async (endpoint, options = {}) => {
  const session = db.getSession();
  const token = session?.token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'API request failed');
    }
    
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const db = {
  // Auth & Users
  getUsers: () => fetchAPI('/users'),
  saveUser: (user) => fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }),
  updateUser: (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getUser: (id) => fetchAPI(`/users/${id}`),
  deleteUser: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE'
  }),
  
  // Doctors
  getDoctors: () => fetchAPI('/doctors'),
  saveDoctor: (doctor) => fetchAPI('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctor)
  }),
  updateDoctor: (id, data) => fetchAPI(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getDoctor: (id) => fetchAPI(`/doctors/${id}`),
  deleteDoctor: (id) => fetchAPI(`/doctors/${id}`, {
    method: 'DELETE'
  }),

  // Appointments
  getAppointments: () => fetchAPI('/appointments'),
  addAppointment: (appointment) => fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  }),
  updateAppointment: (id, data) => fetchAPI(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getPatientAppointments: (patientId) => fetchAPI(`/appointments/patient/${patientId}`),
  getDoctorAppointments: (doctorId) => fetchAPI(`/appointments/doctor/${doctorId}`),

  // Medical Records
  getRecords: () => fetchAPI('/records'),
  addRecord: (record) => fetchAPI('/records', {
    method: 'POST',
    body: JSON.stringify(record)
  }),
  getPatientRecords: (patientId) => fetchAPI(`/records/patient/${patientId}`),
  getDoctorRecords: (doctorId) => fetchAPI(`/records/doctor/${doctorId}`),

  // Prescriptions
  getPrescriptions: () => fetchAPI('/prescriptions'),
  addPrescription: (prescription) => fetchAPI('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription)
  }),
  getPatientPrescriptions: (patientId) => fetchAPI(`/prescriptions/patient/${patientId}`),
  getDoctorPrescriptions: (doctorId) => fetchAPI(`/prescriptions/doctor/${doctorId}`),

  // Messaging
  getChats: () => fetchAPI('/chats'),
  searchUsersForChat: (query) => fetchAPI(`/chats/search-users?q=${encodeURIComponent(query)}`),
  addChatMessage: (chatId, message) => fetchAPI(`/chats/${chatId}`, {
    method: 'POST',
    body: JSON.stringify(message)
  }),
  getChatById: (chatId) => fetchAPI(`/chats/${chatId}`),

  // Notifications
  getNotifications: (userId) => fetchAPI(`/notifications/user/${userId}`),
  addNotification: (notification) => fetchAPI('/notifications', {
    method: 'POST',
    body: JSON.stringify(notification)
  }),
  markNotificationRead: (id) => fetchAPI(`/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true })
  }),
  triggerEmergency: (alertData) => fetchAPI('/emergency/alert', {
    method: 'POST',
    body: JSON.stringify(alertData)
  }),

  // Payments
  createCheckoutSession: (appointmentId) => fetchAPI('/payment/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ appointmentId })
  }),
  verifyPaymentSession: (sessionId, appointmentId) => fetchAPI(`/payment/verify-session?sessionId=${sessionId}&appointmentId=${appointmentId}`),

  // Announcements
  getAnnouncements: () => fetchAPI('/announcements'),
  addAnnouncement: (ann) => fetchAPI('/announcements', {
    method: 'POST',
    body: JSON.stringify(ann)
  }),
  deleteAnnouncement: (id) => fetchAPI(`/announcements/${id}`, {
    method: 'DELETE'
  }),
  addAnnouncementComment: (id, text) => fetchAPI(`/announcements/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),

  // Schedules
  getSchedules: () => fetchAPI('/schedules'),
  updateSchedule: (doctorId, schedule) => fetchAPI(`/schedules/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(schedule)
  }),
  getDoctorSchedule: (doctorId) => fetchAPI(`/schedules/${doctorId}`),

  // Departments
  getDepartments: () => fetchAPI('/departments'),
  saveDepartment: (dept) => fetchAPI('/departments', {
    method: 'POST',
    body: JSON.stringify(dept)
  }),
  updateDepartment: (id, data) => fetchAPI(`/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteDepartment: (id) => fetchAPI(`/departments/${id}`, {
    method: 'DELETE'
  }),

  // Session
  getSession: () => {
    const saved = localStorage.getItem('bashcare_session');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
  setSession: (sessionData) => localStorage.setItem('bashcare_session', JSON.stringify(sessionData)),
  clearSession: () => localStorage.removeItem('bashcare_session'),

  // Real Auth API
  login: async (credentials) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    // Response should be { user, token }
    return response;
  },
  staffLogin: async (data) => {
    const response = await fetchAPI('/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },
  register: async (userData) => {
    const response = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    // Response should be { user, token }
    return response;
  },
  googleLogin: async (data) => {
    const response = await fetchAPI('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },
  verifyEmail: (token) => fetchAPI(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  // AI Chat
  aiChat: (question) => fetchAPI('/ai-chat', {
    method: 'POST',
    body: JSON.stringify({ question })
  }),

  // AI Symptom Check
  aiSymptomCheck: (symptoms) => fetchAPI('/ai-symptom-check', {
    method: 'POST',
    body: JSON.stringify({ symptoms })
  }),

  // AI Vitals Check
  aiVitalsCheck: (vitalsList) => fetchAPI('/ai-vitals-check', {
    method: 'POST',
    body: JSON.stringify({ vitalsList })
  }),

  // Health Goals
  getGoals: (patientId) => fetchAPI(`/goals/patient/${patientId}`),
  addGoal: (goal) => fetchAPI('/goals', {
    method: 'POST',
    body: JSON.stringify(goal)
  }),
  updateGoal: (id, data) => fetchAPI(`/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // User Documents
  getDocuments: (patientId) => fetchAPI(`/documents/patient/${patientId}`),
  uploadDocument: (doc) => fetchAPI('/documents', {
    method: 'POST',
    body: JSON.stringify(doc)
  }),

  // Educational Hub
  getArticles: () => fetchAPI('/articles'),
  
  // Wellness Reports
  generateWellnessReport: (patientId) => fetchAPI(`/reports/generate/${patientId}`, {
    method: 'POST'
  }),

  // Meetings
  createMeeting: (meetingData) => fetchAPI('/meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData)
  }),
  getMeetingByCode: (roomCode) => fetchAPI(`/meetings/${roomCode}`),
  updateMeeting: (roomCode, data) => fetchAPI(`/meetings/${roomCode}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  };
