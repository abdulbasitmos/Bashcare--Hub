const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { sendLoginNotification, sendVerificationEmail, sendPasswordRecoveryEmail, sendGoogleWelcomeEmail } = require('../utils/mailService');

const register = async (req, res) => {
  try {
    const { email, password, name, role, gender, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role === 'doctor') {
      if (!gender || !phone) {
        return res.status(400).json({ message: 'Gender and Phone number are required for doctors' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'doctor') {
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({ message: 'A doctor profile already exists with this email address' });
      }
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({ 
      email, 
      password, 
      name,
      role: role || 'patient',
      status: 'active', // All users active by default now
      verificationToken,
      gender,
      phone
    });

    await newUser.save();

    // If role is doctor, also add to doctors collection
    if (role === 'doctor') {
      try {
        const newDoctor = new Doctor({
          userId: newUser._id,
          email: newUser.email,
          name: newUser.name,
          status: 'pending' // Set doctor profile to pending for officer verification
        });
        await newDoctor.save();
      } catch (docError) {
        console.error('Doctor profile creation failed:', docError);
        await User.findByIdAndDelete(newUser._id);
        throw new Error(`Failed to create doctor profile: ${docError.message}`);
      }
    }

    // Send verification email
    try {
      // Async call, but we handle errors internally in mailService
      sendVerificationEmail(newUser.email, newUser.name, verificationToken, newUser.role);
    } catch (mailError) {
      console.error('Email sending failed (Register):', mailError);
    }

    // Create notifications for registrations
    try {
      if (role === 'doctor') {
        // Admin Notification
        const adminNotif = new Notification({
          userId: 'admin',
          title: 'New Doctor Registered',
          message: `A new doctor has registered: ${newUser.name}. The profile is pending verification.`,
          type: 'system'
        });
        await adminNotif.save();

        // Get the saved doctor record to get its _id
        const docRecord = await Doctor.findOne({ userId: newUser._id });
        if (docRecord) {
          // Public Notification (for all patients and doctors)
          const publicNotif = new Notification({
            userId: 'all',
            title: 'New Doctor Joined',
            message: `Bashcare Hub has a new doctor: ${newUser.name}`,
            type: 'system',
            link: `/doctor/${docRecord._id}`
          });
          await publicNotif.save();
        }
      } else {
        // Patient Registration: Admin Notification
        const adminNotif = new Notification({
          userId: 'admin',
          title: 'New Patient Registered',
          message: `A new patient has registered: ${newUser.name}`,
          type: 'system'
        });
        await adminNotif.save();
      }
    } catch (notifErr) {
      console.error('Failed to create registration notifications:', notifErr);
    }

    const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Send email notification (async)
    sendLoginNotification(user.email, user.name);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Generate a random 8-character password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Update user password
    user.password = tempPassword;
    await user.save();

    // Send email
    await sendPasswordRecoveryEmail(user.email, user.name, tempPassword);

    res.status(200).json({ message: 'Recovery email sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken, role, email, name, picture } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID Token is required' });
    }

    // Default mock credentials
    let googleUser = {
      email: email || 'google-user@gmail.com',
      name: name || 'Google User',
      picture: picture || 'https://lh3.googleusercontent.com/a/placeholder'
    };

    // If idToken is a detailed mock token (e.g. mock_email_name), parse it
    if (idToken.startsWith('mock_')) {
      const parts = idToken.split('_');
      if (parts.length >= 3) {
        googleUser.email = parts[1];
        googleUser.name = decodeURIComponent(parts[2]);
      }
    }

    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      const newUser = new User({
        email: googleUser.email,
        name: googleUser.name,
        role: role || 'patient',
        status: 'active',
        isVerified: true,
        password: 'GOOGLE_USER_NO_PASSWORD' // Placeholder password for Google SSO accounts
      });
      
      await newUser.save();
      user = newUser;
      
      // Send welcome verification email
      try {
        sendGoogleWelcomeEmail(user.email, user.name, role || 'patient');
      } catch (mailErr) {
        console.error('Error sending Google welcome email:', mailErr);
      }
      
      if (role === 'doctor') {
        const newDoctor = new Doctor({
          userId: user._id,
          email: user.email,
          name: user.name,
          status: 'pending' // Pending verification by verification officer
        });
        await newDoctor.save();
      }
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Error with Google authentication', error: error.message });
  }
};

const staffLogin = async (req, res) => {
  try {
    const { role, securityKey, email } = req.body;
    
    const MASTER_KEYS = {
      admin: "ADMIN_SECURE_2026",
      officer: "OFFICER_HUB_2026"
    };

    let user;

    if (email && email.trim() !== '') {
      user = await User.findOne({ email: email.toLowerCase(), role, staffId: securityKey });
      if (!user) {
        return res.status(401).json({ message: 'Invalid staff credentials or unauthorized role' });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'This staff account has been suspended' });
      }
    } else {
      if (securityKey !== MASTER_KEYS[role]) {
        return res.status(401).json({ message: 'Invalid security key' });
      }

      const staffEmail = role + '@bashcare.internal';
      const staffName = role === 'admin' ? 'Head Admin' : 'Senior Officer';
      
      user = await User.findOne({ email: staffEmail });
      if (!user) {
        user = new User({
          name: staffName,
          email: staffEmail,
          password: 'STAFF_USER_NO_PASSWORD',
          role: role,
          status: 'active',
          isVerified: true
        });
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        accessiblePages: user.accessiblePages || []
      }, 
      token 
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ message: 'Error during staff authentication', error: error.message });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, googleLogin, staffLogin };
