const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { register, login, staffLogin, googleLogin, verifyEmail, forgotPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/staff-login', staffLogin);
router.post('/google-login', googleLogin);

router.get('/google', (req, res, next) => {
  const role = req.query.role || 'patient';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const hasGoogleKeys = process.env.GOOGLE_CLIENT_ID && 
                         process.env.GOOGLE_CLIENT_SECRET && 
                         !process.env.GOOGLE_CLIENT_ID.includes('your_google_') && 
                         !process.env.GOOGLE_CLIENT_SECRET.includes('your_google_');

  if (!hasGoogleKeys) {
    // If Google Client keys are not configured or are placeholders, redirect to client-side Mock Google Login page
    return res.redirect(`${frontendUrl}/mock-google-login?role=${role}`);
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: JSON.stringify({ role })
  })(req, res, next);
});

router.get('/google/callback', 
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    passport.authenticate('google', { failureRedirect: `${frontendUrl}/auth/patient/signin` })(req, res, next);
  },
  (req, res) => {
    // Successful authentication, issue JWT token and redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const user = req.user;
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    const userJson = encodeURIComponent(JSON.stringify({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }));
    res.redirect(`${frontendUrl}/auth-callback?token=${token}&user=${userJson}`);
  });

router.post('/forgot-password', forgotPassword);
router.get('/verify-email', verifyEmail);

module.exports = router;
