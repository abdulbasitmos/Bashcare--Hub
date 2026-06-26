const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { sendGoogleWelcomeEmail } = require('../utils/mailService');
require('dotenv').config();

const hasGoogleKeys = process.env.GOOGLE_CLIENT_ID && 
                       process.env.GOOGLE_CLIENT_SECRET && 
                       !process.env.GOOGLE_CLIENT_ID.includes('your_google_') && 
                       !process.env.GOOGLE_CLIENT_SECRET.includes('your_google_');

if (hasGoogleKeys) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      try {
        let role = 'patient';
        if (req.query.state) {
          try {
            const parsed = JSON.parse(req.query.state);
            if (parsed && parsed.role) {
              role = parsed.role;
            }
          } catch (e) {
            role = req.query.state || 'patient';
          }
        }

        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            role: role,
            status: 'active',
            isVerified: true,
            password: 'GOOGLE_USER_NO_PASSWORD' // Placeholder
          });
          await user.save();

          // Send welcome verification email
          try {
            sendGoogleWelcomeEmail(user.email, user.name, role);
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
        } else {
          let updated = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isVerified = true;
            updated = true;
          }
          if (updated) {
            await user.save();
          }
        }
        
        return cb(null, user);
      } catch (err) {
        return cb(err, null);
      }
    }
  ));
} else {
  console.warn("WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found in env. Google login will be disabled.");
}
