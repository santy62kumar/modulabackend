// // // server/routes/auth.js
// // import express from 'express';
// // import jwt from 'jsonwebtoken';
// // import { db } from '../services/firebase.js';
// // import { sendSMS, generateOTP } from '../services/twilio.js';

// // const router = express.Router();

// // // Store OTP sessions in memory (in production, use Redis)
// // const otpSessions = new Map();

// // // Registration endpoint
// // router.post('/register', async (req, res) => {
// //   try {
// //     const { firstName, lastName, address, pincode, phone } = req.body;

// //     // Validation
// //     if (!firstName || !lastName || !address || !pincode || !phone) {
// //       return res.status(400).json({ message: 'All fields are required' });
// //     }

// //     // Validate phone number (10 digits)
// //     if (!/^[0-9]{10}$/.test(phone)) {
// //       return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
// //     }

// //     // Validate pincode (6 digits)
// //     if (!/^[0-9]{6}$/.test(pincode)) {
// //       return res.status(400).json({ message: 'Pincode must be exactly 6 digits' });
// //     }

// //     // Check if user already exists
// //     const userQuery = await db.collection('users').where('phone', '==', phone).get();
// //     if (!userQuery.empty) {
// //       return res.status(400).json({ message: 'User with this phone number already exists' });
// //     }

// //     // Create user in Firestore
// //     const userData = {
// //       firstName: firstName.trim(),
// //       lastName: lastName.trim(),
// //       address: address.trim(),
// //       pincode,
// //       phone,
// //       role: 'customer',
// //       isVerified: false,
// //       createdAt: new Date()
// //     };

// //     const userRef = await db.collection('users').add(userData);

// //     res.status(201).json({
// //       message: 'Registration successful',
// //       userId: userRef.id
// //     });
// //   } catch (error) {
// //     console.error('Registration error:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });

// // // Login - Send OTP
// // router.post('/login', async (req, res) => {
// //   try {
// //     const { phone } = req.body;

// //     // Validation
// //     if (!phone || !/^[0-9]{10}$/.test(phone)) {
// //       return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
// //     }

// //     // Check if user exists
// //     const userQuery = await db.collection('users').where('phone', '==', phone).get();
// //     if (userQuery.empty) {
// //       return res.status(404).json({ message: 'User not found. Please register first.' });
// //     }

// //     // Generate OTP
// //     const otp = generateOTP();
// //     const sessionId = `${phone}_${Date.now()}`;

// //     // Store OTP session
// //     otpSessions.set(sessionId, {
// //       phone,
// //       otp,
// //       createdAt: Date.now(),
// //       attempts: 0
// //     });

// //     // Send OTP via SMS
// //     const message = `Your Modula login OTP is: ${otp}. Valid for 10 minutes.`;
// //     await sendSMS(phone, message);

// //     // Clean up expired sessions
// //     setTimeout(() => {
// //       otpSessions.delete(sessionId);
// //     }, 10 * 60 * 1000); // 10 minutes

// //     res.json({
// //       message: 'OTP sent successfully',
// //       sessionId
// //     });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ message: 'Failed to send OTP' });
// //   }
// // });

// // // Verify OTP
// // router.post('/verify-otp', async (req, res) => {
// //   try {
// //     const { phone, otp, sessionId } = req.body;

// //     // Validation
// //     if (!phone || !otp || !sessionId) {
// //       return res.status(400).json({ message: 'Phone, OTP, and session ID are required' });
// //     }

// //     if (!/^[0-9]{6}$/.test(otp)) {
// //       return res.status(400).json({ message: 'OTP must be 6 digits' });
// //     }

// //     // Check session
// //     const session = otpSessions.get(sessionId);
// //     if (!session) {
// //       return res.status(400).json({ message: 'Invalid or expired session' });
// //     }

// //     // Check attempts
// //     if (session.attempts >= 3) {
// //       otpSessions.delete(sessionId);
// //       return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
// //     }

// //     // Verify OTP
// //     if (session.otp !== otp || session.phone !== phone) {
// //       session.attempts += 1;
// //       return res.status(400).json({ message: 'Invalid OTP' });
// //     }

// //     // Get user from database
// //     const userQuery = await db.collection('users').where('phone', '==', phone).get();
// //     if (userQuery.empty) {
// //       return res.status(404).json({ message: 'User not found' });
// //     }

// //     const userDoc = userQuery.docs[0];
// //     const userData = userDoc.data();

// //     // Update user as verified
// //     await userDoc.ref.update({
// //       isVerified: true,
// //       lastLogin: new Date()
// //     });

// //     // Generate JWT token
// //     const token = jwt.sign(
// //       {
// //         userId: userDoc.id,
// //         phone: userData.phone,
// //         role: userData.role
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: process.env.JWT_EXPIRE || '7d' }
// //     );

// //     // Clean up session
// //     otpSessions.delete(sessionId);

// //     res.json({
// //       message: 'Login successful',
// //       token,
// //       user: {
// //         id: userDoc.id,
// //         firstName: userData.firstName,
// //         lastName: userData.lastName,
// //         phone: userData.phone,
// //         role: userData.role
// //       }
// //     });
// //   } catch (error) {
// //     console.error('OTP verification error:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });

// // export default router;

// // server/src/routes/auth.js - Updated to use centralized Firebase

// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { db } from '../config/firebase.js';
// import { sendSMS, generateOTP } from '../services/twilio.js';

// const router = express.Router();

// // Store OTP sessions in memory (in production, use Redis)
// const otpSessions = new Map();

// // Helper function to generate OTP
// function generateOTPCode() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Registration endpoint
// router.post('/register', async (req, res) => {
//   try {
//     const { firstName, lastName, address, pincode, phone } = req.body;

//     // Validation
//     if (!firstName || !lastName || !address || !pincode || !phone) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'All fields are required' 
//       });
//     }

//     // Validate phone number (10 digits)
//     if (!/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Phone number must be exactly 10 digits' 
//       });
//     }

//     // Validate pincode (6 digits)
//     if (!/^[0-9]{6}$/.test(pincode)) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Pincode must be exactly 6 digits' 
//       });
//     }

//     // Check if user already exists
//     const userQuery = await db.collection('users').where('phone', '==', phone).get();
//     if (!userQuery.empty) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'User with this phone number already exists' 
//       });
//     }

//     // Create user in Firestore
//     const userData = {
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       address: address.trim(),
//       pincode,
//       phone,
//       role: 'customer',
//       isVerified: false,
//       createdAt: new Date()
//     };

//     const userRef = await db.collection('users').add(userData);

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       data: {
//         userId: userRef.id
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Internal server error' 
//     });
//   }
// });

// // Login - Send OTP
// router.post('/login', async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Validation
//     if (!phone || !/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
//     }

//     // Check if user exists
//     const userQuery = await db.collection('users').where('phone', '==', phone).get();
//     if (userQuery.empty) {
//       return res.status(404).json({ message: 'User not found. Please register first.' });
//     }

//     // Generate OTP
//     const otp = generateOTP();
//     const sessionId = `${phone}_${Date.now()}`;

//     // Store OTP session
//     otpSessions.set(sessionId, {
//       phone,
//       otp,
//       createdAt: Date.now(),
//       attempts: 0
//     });

//     // Send OTP via SMS
//     const message = `Your Modula login OTP is: ${otp}. Valid for 10 minutes.`;
//     await sendSMS(phone, message);

//     // Clean up expired sessions
//     setTimeout(() => {
//       otpSessions.delete(sessionId);
//     }, 10 * 60 * 1000); // 10 minutes

//     res.json({
//       message: 'OTP sent successfully',
//       sessionId
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// });

// // Send OTP endpoint
// router.post('/send-otp', async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Validation
//     if (!phone || !/^[0-9]{10}$/.test(phone)) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Valid 10-digit phone number is required' 
//       });
//     }

//     // Check if user exists
//     const userQuery = await db.collection('users').where('phone', '==', phone).get();
//     if (userQuery.empty) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found. Please register first.' 
//       });
//     }

//     // Generate OTP
//     const otp = generateOTPCode();
//     const sessionId = `${phone}_${Date.now()}`;

//     // Store OTP session
//     otpSessions.set(sessionId, {
//       phone,
//       otp,
//       createdAt: Date.now(),
//       attempts: 0
//     });

//     // Send OTP via SMS
//     const message = `Your Modula login OTP is: ${otp}. Valid for 10 minutes.`;
//     const smsResult = await sendSMS(phone, message);

//     if (!smsResult.success) {
//       console.error('SMS sending failed:', smsResult.error);
//       // Continue anyway for development, but log the error
//     }

//     // Clean up expired sessions
//     setTimeout(() => {
//       otpSessions.delete(sessionId);
//     }, 10 * 60 * 1000); // 10 minutes

//     res.json({
//       success: true,
//       message: 'OTP sent successfully',
//       data: {
//         sessionId
//       }
//     });
//   } catch (error) {
//     console.error('Send OTP error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to send OTP' 
//     });
//   }
// });

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { phone, otp, sessionId } = req.body;

//     // Validation
//     if (!phone || !otp || !sessionId) {
//       return res.status(400).json({ message: 'Phone, OTP, and session ID are required' });
//     }

//     if (!/^[0-9]{6}$/.test(otp)) {
//       return res.status(400).json({ message: 'OTP must be 6 digits' });
//     }

//     // Check session
//     const session = otpSessions.get(sessionId);
//     if (!session) {
//       return res.status(400).json({ message: 'Invalid or expired session' });
//     }

//     // Check attempts
//     if (session.attempts >= 3) {
//       otpSessions.delete(sessionId);
//       return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
//     }

//     // Verify OTP
//     if (session.otp !== otp || session.phone !== phone) {
//       session.attempts += 1;
//       return res.status(400).json({ message: 'Invalid OTP' });
//     }

//     // Get user from database
//     const userQuery = await db.collection('users').where('phone', '==', phone).get();
//     if (userQuery.empty) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userDoc = userQuery.docs[0];
//     const userData = userDoc.data();

//     // Update user as verified
//     await userDoc.ref.update({
//       isVerified: true,
//       lastLogin: new Date()
//     });

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         userId: userDoc.id,
//         phone: userData.phone,
//         role: userData.role
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRE || '7d' }
//     );

//     // Clean up session
//     otpSessions.delete(sessionId);

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: userDoc.id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         phone: userData.phone,
//         role: userData.role
//       }
//     });
//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Get current user endpoint
// router.get('/me', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided'
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userDoc = await db.collection('users').doc(decoded.userId).get();
    
//     if (!userDoc.exists) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const userData = userDoc.data();
    
//     res.json({
//       success: true,
//       data: {
//         user: {
//           id: userDoc.id,
//           firstName: userData.firstName,
//           lastName: userData.lastName,
//           phone: userData.phone,
//           role: userData.role
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(401).json({
//       success: false,
//       message: 'Invalid token'
//     });
//   }
// });

// // Logout endpoint
// router.post('/logout', (req, res) => {
//   // In a JWT system, logout is typically handled client-side
//   // by removing the token from storage
//   res.json({
//     success: true,
//     message: 'Logged out successfully'
//   });
// });

// export default router;

// server/src/routes/auth.js - ENHANCED VERSION
import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';
import { sendSMS, generateOTP } from '../services/twilio.js';
import OdooService from '../services/odoo.js'; // ✅ Import Odoo service

const router = express.Router();

// Store OTP sessions in memory (in production, use Redis)
const otpSessions = new Map();

// Helper function to generate OTP
function generateOTPCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ ENHANCED Registration endpoint - with feedback_status
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, address, pincode, phone } = req.body;

    // Validation
    if (!firstName || !lastName || !address || !pincode || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Validate phone number (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number must be exactly 10 digits' 
      });
    }

    // Validate pincode (6 digits)
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ 
        success: false,
        message: 'Pincode must be exactly 6 digits' 
      });
    }

    // Check if user already exists
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (!userQuery.empty) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this phone number already exists' 
      });
    }

    // ✅ ENHANCED: Create user with feedback_status
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      pincode,
      phone,
      role: 'customer',
      isVerified: false,
      leadId: null, // Will be set during login
      
      // ✅ NEW: Feedback status tracking
      feedback_status: {
        is_eligible: false,      // Set to true when stage 22 reached
        is_submitted: false,     // Set to true when feedback submitted
        submitted_at: null,      // Timestamp when submitted
        form_id: null           // Reference to feedback document
      },
      
      createdAt: new Date()
    };

    const userRef = await db.collection('users').add(userData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        userId: userRef.id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
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

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Validation
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid 10-digit phone number is required' 
      });
    }

    // Check if user exists
    const userQuery = await db.collection('users').where('phone', '==', phone).get();
    if (userQuery.empty) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please register first.' 
      });
    }

    // Generate OTP
    const otp = generateOTPCode();
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
    const smsResult = await sendSMS(phone, message);

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error);
      // Continue anyway for development, but log the error
    }

    // Clean up expired sessions
    setTimeout(() => {
      otpSessions.delete(sessionId);
    }, 10 * 60 * 1000); // 10 minutes

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        sessionId
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP' 
    });
  }
});

// ✅ ENHANCED Verify OTP - with leadId fetching and storage
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

    // ✅ NEW: Fetch leadId from Odoo using phone number
    let leadData = null;
    let leadId = null;
    
    try {
      leadData = await OdooService.searchLeadByPhone(phone);
      if (leadData) {
        leadId = leadData.id;
        console.log(`✅ Found Odoo lead for phone ${phone}:`, { 
          leadId, 
          name: leadData.name, 
          stage_id: leadData.stage_id 
        });
      } else {
        console.log(`⚠️ No Odoo lead found for phone ${phone}`);
      }
    } catch (error) {
      console.error('❌ Error fetching lead from Odoo:', error);
      // Continue login even if Odoo fails - leadId will be null
    }

    // ✅ ENHANCED: Update user with leadId and verification status
    const updateData = {
      isVerified: true,
      lastLogin: new Date()
    };

    // Store leadId permanently if found
    if (leadId) {
      updateData.leadId = leadId;
      updateData.leadInfo = {
        name: leadData.name,
        phone: leadData.phone,
        stage_id: leadData.stage_id,
        lastSyncedAt: new Date()
      };
    }

    await userDoc.ref.update(updateData);

    // ✅ ENHANCED: Generate JWT token with leadId (if available)
    const tokenPayload = {
      userId: userDoc.id,
      phone: userData.phone,
      role: userData.role
    };

    // Only add leadId if found
    if (leadId) {
      tokenPayload.leadId = leadId;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Clean up session
    otpSessions.delete(sessionId);

    // ✅ ENHANCED: Response includes lead info and feedback status
    const response = {
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        feedback_status: userData.feedback_status || {
          is_eligible: false,
          is_submitted: false,
          submitted_at: null,
          form_id: null
        }
      }
    };

    // Include lead info if found
    if (leadData) {
      response.lead = {
        id: leadData.id,
        name: leadData.name,
        stage_id: leadData.stage_id ? leadData.stage_id[0] : null
      };
    }

    res.json(response);

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ ENHANCED Get current user endpoint - with feedback status
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: {
        user: {
          id: userDoc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          leadId: userData.leadId || null,
          feedback_status: userData.feedback_status || {
            is_eligible: false,
            is_submitted: false,
            submitted_at: null,
            form_id: null
          }
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a JWT system, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;