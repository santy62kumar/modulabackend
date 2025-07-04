// server/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/firebase.js';
import { sendSMS, generateOTP } from '../services/twilio.js';

const router = express.Router();

// Store OTP sessions in memory (in production, use Redis)
const otpSessions = new Map();

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, address, pincode, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !address || !pincode || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // Validate pincode (6 digits)
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be exactly 6 digits' });
    }

    // Check if user already exists
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (!userQuery.empty) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Create user in Firestore
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      pincode,
      phone,
      role: 'customer',
      isVerified: false,
      createdAt: new Date()
    };

    const userRef = await db.collection('users').add(userData);

    res.status(201).json({
      message: 'Registration successful',
      userId: userRef.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login - Send OTP
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;

    // Validation
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    // Check if user exists
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (userQuery.empty) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const sessionId = `${phone}_${Date.now()}`;

    // Store OTP session
    otpSessions.set(sessionId, {
      phone,
      otp,
      createdAt: Date.now(),
      attempts: 0
    });

    // Send OTP via SMS
    const message = `Your Modula login OTP is: ${otp}. Valid for 10 minutes.`;
    await sendSMS(phone, message);

    // Clean up expired sessions
    setTimeout(() => {
      otpSessions.delete(sessionId);
    }, 10 * 60 * 1000); // 10 minutes

    res.json({
      message: 'OTP sent successfully',
      sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, sessionId } = req.body;

    // Validation
    if (!phone || !otp || !sessionId) {
      return res.status(400).json({ message: 'Phone, OTP, and session ID are required' });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    // Check session
    const session = otpSessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Invalid or expired session' });
    }

    // Check attempts
    if (session.attempts >= 3) {
      otpSessions.delete(sessionId);
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (session.otp !== otp || session.phone !== phone) {
      session.attempts += 1;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Get user from database
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (userQuery.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Update user as verified
    await userDoc.ref.update({
      isVerified: true,
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userDoc.id,
        phone: userData.phone,
        role: userData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Clean up session
    otpSessions.delete(sessionId);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;