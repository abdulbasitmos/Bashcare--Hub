const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendLoginNotification = async (userEmail, userName) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "New Login Detected - Bashcare Hub";
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
             <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bashcare Hub</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin-top: 0;">Security Alert: New Login</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>This is a quick notification to let you know that your account was accessed on <strong>${new Date().toLocaleString()}</strong>.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">If this was you, you can safely ignore this email. If you don't recognize this activity, please reset your password immediately in your account settings.</p>
            </div>
            <p>Thank you for helping us keep your account secure.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Bashcare Hub Healthcare Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": userEmail, "name": userName }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Login notification sent successfully');
    return data;
  } catch (error) {
    console.error('Error sending login notification:', error);
  }
};

const sendVerificationEmail = async (userEmail, userName, verificationToken, role = 'patient') => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  const isDoctor = role === 'doctor';
  sendSmtpEmail.subject = isDoctor ? "Welcome to the Medical Team - Bashcare Hub" : "Welcome to Bashcare Hub - Verify Your Account";
  
  const roleSpecificContent = isDoctor ? `
    <h3 style="color: #2563eb;">Onboarding for Medical Professionals:</h3>
    <ul style="padding-left: 20px; color: #475569;">
      <li><strong>Step 1:</strong> Verify your email using the button below.</li>
      <li><strong>Step 2:</strong> Our administration will review your credentials.</li>
      <li><strong>Step 3:</strong> Once approved, you'll gain access to your Doctor Dashboard.</li>
      <li><strong>Step 4:</strong> You can then set your schedule and start accepting consultations.</li>
    </ul>
  ` : `
    <h3 style="color: #2563eb;">How to get started:</h3>
    <ul style="padding-left: 20px; color: #475569;">
      <li><strong>Step 1:</strong> Verify your account to unlock all features.</li>
      <li><strong>Step 2:</strong> Browse our list of specialized doctors.</li>
      <li><strong>Step 3:</strong> Book your first appointment in just a few clicks.</li>
      <li><strong>Step 4:</strong> Access your medical records and prescriptions anytime.</li>
    </ul>
  `;

  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 1px;">Bashcare Hub</h1>
            <p style="color: #bfdbfe; margin-top: 10px; font-size: 16px;">Modern Healthcare Management</p>
          </div>
          
          <!-- Hero Image Placeholder -->
          <div style="text-align: center; padding: 20px;">
            <img src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg" alt="Healthcare" style="max-width: 80%; border-radius: 10px;">
          </div>

          <!-- Main Content -->
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}!</h2>
            <p style="font-size: 16px; color: #4b5563;">We are thrilled to have you join Bashcare Hub. Our platform is designed to make healthcare management simple, secure, and efficient.</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
              ${roleSpecificContent}
            </div>

            <p style="text-align: center; margin: 40px 0;">
              <a href="${frontendUrl}/verify-email?token=${verificationToken}" 
                 style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                Verify Your Account
              </a>
            </p>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              If the button doesn't work, copy this link: <br>
              <a href="${frontendUrl}/verify-email?token=${verificationToken}" style="color: #2563eb;">${frontendUrl}/verify-email?token=${verificationToken}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
            <p style="margin: 10px 0 0; font-size: 12px; color: #d1d5db;">You are receiving this because you signed up for Bashcare Hub.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": userEmail, "name": userName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

const sendPasswordRecoveryEmail = async (userEmail, userName, tempPassword) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Password Recovery - Bashcare Hub";
  sendSmtpEmail.htmlContent = `
  <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 1px;">Bashcare Hub</h1>
          <p style="color: #bfdbfe; margin-top: 10px; font-size: 16px;">Security & Account Recovery</p>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello, ${userName}</h2>
          <p style="font-size: 16px; color: #4b5563;">We received a request to recover your password. For your security, we have generated a temporary password for you.</p>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; border: 2px dashed #2563eb;">
            <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Your Temporary Password</p>
            <h3 style="color: #2563eb; font-size: 32px; margin: 10px 0; font-family: monospace; letter-spacing: 4px;">${tempPassword}</h3>
          </div>

          <p style="font-size: 15px; color: #4b5563;">Please use this temporary password to log in. Once you're in, we strongly recommend changing it immediately in your account settings.</p>

          <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>Important:</strong> If you did not request this recovery, please ignore this email or contact support if you suspect unauthorized access.</p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 14px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": userEmail, "name": userName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Password recovery email sent successfully');
  } catch (error) {
    console.error('Error sending password recovery email:', error);
  }
};

const sendAnnouncementEmail = async (userEmail, userName, announcement) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `New Announcement: ${announcement.title}`;
  sendSmtpEmail.htmlContent = `
  <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 1px;">Bashcare Hub</h1>
          <p style="color: #bfdbfe; margin-top: 10px; font-size: 16px;">System Announcement</p>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello, ${userName}</h2>
          <p style="font-size: 16px; color: #4b5563;">A new announcement has been posted on Bashcare Hub.</p>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e293b; margin-top: 0;">${announcement.title}</h3>
            <p style="color: #475569; font-size: 15px; white-space: pre-line;">${announcement.content}</p>
          </div>

          <p style="text-align: center; margin: 40px 0;">
            <a href="${frontendUrl}/dashboard" 
               style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              View on Dashboard
            </a>
          </p>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 14px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": userEmail, "name": userName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Announcement email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending announcement email to ${userEmail}:`, error);
  }
};

const sendGoogleWelcomeEmail = async (userEmail, userName, role = 'patient') => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  const isDoctor = role === 'doctor';
  
  sendSmtpEmail.subject = isDoctor 
    ? "Welcome to the Medical Team - Bashcare Hub" 
    : "Welcome to Bashcare Hub - Account Connected via Google";
    
  const roleSpecificContent = isDoctor ? `
    <h3 style="color: #2563eb; margin-top: 0;">Onboarding for Medical Professionals:</h3>
    <ul style="padding-left: 20px; color: #475569; margin-bottom: 0;">
      <li><strong>Step 1:</strong> Your account is registered and verified via Google Sign-In.</li>
      <li><strong>Step 2:</strong> Our administration will review your medical credentials.</li>
      <li><strong>Step 3:</strong> Once approved, you'll gain full access to your Doctor Dashboard.</li>
    </ul>
  ` : `
    <h3 style="color: #2563eb; margin-top: 0;">Getting started with your Patient Dashboard:</h3>
    <ul style="padding-left: 20px; color: #475569; margin-bottom: 0;">
      <li><strong>Step 1:</strong> Access your customized health dashboard.</li>
      <li><strong>Step 2:</strong> Find and schedule appointments with doctors.</li>
      <li><strong>Step 3:</strong> Set up your interactive medication reminders.</li>
    </ul>
  `;

  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 1px;">Bashcare Hub</h1>
            <p style="color: #bfdbfe; margin-top: 10px; font-size: 16px;">Modern Healthcare Management</p>
          </div>
          
          <div style="padding: 40px;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}!</h2>
            <p style="font-size: 16px; color: #4b5563;">Your account was successfully created and verified using Google Sign-In. You can start using your account immediately.</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
              ${roleSpecificContent}
            </div>

            <p style="text-align: center; margin: 40px 0;">
              <a href="${frontendUrl}/auth/${role}/signin" 
                 style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Access Your Dashboard
              </a>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": userEmail, "name": userName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Google welcome email sent successfully');
  } catch (error) {
    console.error('Error sending Google welcome email:', error);
  }
};

const sendAppointmentEmail = async ({ toEmail, toName, role, action, appointmentDetails }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  const formattedDate = new Date(appointmentDetails.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (action === 'create') {
    if (role === 'doctor') {
      sendSmtpEmail.subject = "New Appointment Request - Bashcare Hub";
      sendSmtpEmail.htmlContent = `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bashcare Hub</h1>
                <p style="color: #bfdbfe; margin-top: 5px; font-size: 14px;">Appointment Booking Notification</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1e293b; margin-top: 0;">New Appointment Request</h2>
                <p>Hello <strong>Dr. ${toName}</strong>,</p>
                <p>You have received a new consultation request on the Bashcare Hub platform. Here are the booking details:</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0;"><strong>Patient Name:</strong> ${appointmentDetails.patientName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Requested Time Slot:</strong> ${appointmentDetails.time}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Reason/Notes:</strong> ${appointmentDetails.reason || 'N/A'}</p>
                  <p style="margin: 0;"><strong>Status:</strong> Pending Approval</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${frontendUrl}/dashboard/doctor/queue" 
                     style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Review Appointment Queue
                  </a>
                </p>
              </div>
              <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (role === 'patient') {
      sendSmtpEmail.subject = "Appointment Requested Successfully - Bashcare Hub";
      sendSmtpEmail.htmlContent = `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bashcare Hub</h1>
                <p style="color: #bfdbfe; margin-top: 5px; font-size: 14px;">Appointment Booking Request</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1e293b; margin-top: 0;">Appointment Request Submitted</h2>
                <p>Hello <strong>${toName}</strong>,</p>
                <p>Your appointment request has been successfully submitted. We will notify you as soon as the doctor or medical officer reviews and confirms your booking details.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0 0 10px 0;"><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Time Slot:</strong> ${appointmentDetails.time}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Reason:</strong> ${appointmentDetails.reason || 'N/A'}</p>
                  <p style="margin: 0;"><strong>Status:</strong> Pending Approval</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${frontendUrl}/dashboard/patient/appointments" 
                     style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                    View My Appointments
                  </a>
                </p>
              </div>
              <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }
  } else if (action === 'status_change') {
    const statusText = appointmentDetails.status === 'confirmed' ? 'Approved & Confirmed' : appointmentDetails.status === 'cancelled' ? 'Cancelled' : appointmentDetails.status;
    const statusColor = appointmentDetails.status === 'confirmed' ? '#10b981' : '#ef4444';
    
    sendSmtpEmail.subject = `Appointment Status Update: ${statusText} - Bashcare Hub`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Bashcare Hub</h1>
              <p style="color: #bfdbfe; margin-top: 5px; font-size: 14px;">Appointment Booking Update</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1e293b; margin-top: 0;">Appointment Status Update</h2>
              <p>Hello <strong>${toName}</strong>,</p>
              <p>The status of your appointment booking with <strong>Dr. ${appointmentDetails.doctorName}</strong> has been updated:</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 10px 0;"><strong>Time Slot:</strong> ${appointmentDetails.time}</p>
                <p style="margin: 0;"><strong>Current Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/dashboard/patient/appointments" 
                   style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                  View My Appointments
                </a>
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME, "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": toEmail, "name": toName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Appointment email notification sent successfully to ${toEmail}`);
  } catch (error) {
    console.error('Error sending appointment notification email:', error);
  }
};

const sendEmergencyEmail = async (toEmail, toName, patientName, patientPhone, message, latitude, longitude) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `🚨 HIGH PRIORITY: Emergency Alert from ${patientName} - Bashcare Hub`;
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #dc2626; background-color: #fef2f2; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; border: 3px solid #dc2626; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">🚨 EMERGENCY ALERT</h1>
            <p style="color: #fee2e2; margin-top: 5px; font-size: 14px;">Bashcare Hub Emergency Service</p>
          </div>
          <div style="padding: 40px; color: #333;">
            <h2 style="color: #991b1b; margin-top: 0;">Patient Requests Urgent Assistance</h2>
            <p>Hello <strong>Dr. ${toName}</strong>,</p>
            <p>A patient has triggered an emergency request on the platform. Please contact them immediately.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0 0 10px 0;"><strong>Patient Name:</strong> ${patientName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Contact Number:</strong> ${patientPhone || 'Not specified'}</p>
              <p style="margin: 0 0 10px 0;"><strong>Message:</strong> ${message || 'No additional details provided.'}</p>
              ${latitude && longitude ? `
                <p style="margin: 0 0 10px 0;"><strong>Coordinates:</strong> ${latitude}, ${longitude}</p>
                <p style="margin: 0;"><a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" style="color: #dc2626; font-weight: bold; text-decoration: underline;">View Patient Location on Maps</a></p>
              ` : ''}
            </div>

            <p style="font-size: 14px; color: #4b5563;">You can log in to view details or chat with the patient on the portal.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Bashcare Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  sendSmtpEmail.sender = { "name": process.env.SENDER_NAME || "Bashcare Hub Emergency", "email": process.env.SENDER_EMAIL || "emergency@bashcare.internal" };
  sendSmtpEmail.to = [{ "email": toEmail, "name": toName }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Emergency alert email sent to Dr. ${toName}`);
  } catch (error) {
    console.error(`Error sending emergency email to ${toEmail}:`, error);
  }
};

module.exports = {
  sendLoginNotification,
  sendVerificationEmail,
  sendPasswordRecoveryEmail,
  sendAnnouncementEmail,
  sendGoogleWelcomeEmail,
  sendAppointmentEmail,
  sendEmergencyEmail
};
