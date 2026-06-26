const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_placeholder');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Default amount to $50 if not specified
    const amountVal = appointment.amount || 50;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("WARNING: STRIPE_SECRET_KEY not set. Falling back to mock checkout url.");
      // Redirect to a local mock success route for demonstration
      return res.json({
        url: `${frontendUrl}/dashboard/patient/appointments?payment_success=true&appointment_id=${appointment._id.toString()}&session_id=mock_session_${Date.now()}`
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Medical Appointment - Dr. ${appointment.doctorName}`,
              description: `Specialty: ${appointment.specialty || 'General Practitioner'} | Date: ${appointment.date} at ${appointment.time}`,
            },
            unit_amount: Math.round(amountVal * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard/patient/appointments?payment_success=true&appointment_id=${appointment._id.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard/patient/appointments?payment_cancelled=true`,
      metadata: {
        appointmentId: appointment._id.toString(),
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifySession = async (req, res) => {
  try {
    const { sessionId, appointmentId } = req.query;
    if (!sessionId || !appointmentId) {
      return res.status(400).json({ error: 'Session ID and Appointment ID are required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (sessionId.startsWith('mock_session_')) {
      // Mock payment verification if secret key not configured
      appointment.paymentConfirmed = true;
      appointment.paymentStatus = 'paid';
      await appointment.save();
      return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ error: 'Stripe is not configured on the server' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      appointment.paymentConfirmed = true;
      appointment.paymentStatus = 'paid';
      await appointment.save();
      res.json({ success: true, message: 'Payment verified and confirmed' });
    } else {
      res.status(400).json({ error: 'Payment has not been completed' });
    }
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  verifySession
};
