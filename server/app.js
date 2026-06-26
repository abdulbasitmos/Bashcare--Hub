const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
require('./src/config/passport');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Database Connection
const seedMasterStaff = async () => {
  try {
    const User = require('./src/models/User');
    
    // Seed main admin
    const adminEmail = 'admin@bashcare.internal';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'Head Admin',
        email: adminEmail,
        password: 'STAFF_USER_NO_PASSWORD',
        role: 'admin',
        staffId: 'ADMIN_SECURE_2026',
        status: 'active',
        isVerified: true
      });
      await admin.save();
      console.log('Pre-seeded Head Admin account');
    } else if (!admin.staffId) {
      admin.staffId = 'ADMIN_SECURE_2026';
      await admin.save();
    }

    // Seed senior officer
    const officerEmail = 'officer@bashcare.internal';
    let officer = await User.findOne({ email: officerEmail });
    if (!officer) {
      officer = new User({
        name: 'Senior Officer',
        email: officerEmail,
        password: 'STAFF_USER_NO_PASSWORD',
        role: 'officer',
        staffId: 'OFFICER_HUB_2026',
        status: 'active',
        isVerified: true
      });
      await officer.save();
      console.log('Pre-seeded Senior Officer account');
    } else if (!officer.staffId) {
      officer.staffId = 'OFFICER_HUB_2026';
      await officer.save();
    }
  } catch (error) {
    console.error('Error seeding master staff accounts:', error);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedMasterStaff();
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());

// Routes
const authRoutes = require('./src/routes/auth');
const dataRoutes = require('./src/routes/data');
const aiRoutes = require('./src/routes/ai');
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', dataRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Socket.io
const setupChatSocket = require('./src/sockets/chat');
const setupMeetingSocket = require('./src/sockets/meeting');
setupChatSocket(io);
setupMeetingSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
});
