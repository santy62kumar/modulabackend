// // server/routes/customer.js
// import express from 'express';
// import { db } from '../services/firebase.js';
// import odooService from '../services/odoo.js';

// const router = express.Router();

// // Get customer dashboard data
// router.get('/dashboard', async (req, res) => {
//   try {
//     const { userId, phone } = req.user;

//     // Get user data from Firestore
//     const userDoc = await db.collection('users').doc(userId).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userData = userDoc.data();

//     // Search for lead in Odoo CRM
//     let odooLead = null;
//     try {
//       odooLead = await odooService.searchLeadByPhone(phone);
//       console.log('Odoo lead found:', odooLead ? 'Yes' : 'No');
//     } catch (odooError) {
//       console.error('Odoo search error:', odooError);
//       // Continue without Odoo data if service is unavailable
//     }

//     const dashboardData = {
//       user: {
//         id: userId,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         phone: userData.phone,
//         address: userData.address,
//         pincode: userData.pincode
//       },
//       odooLead: odooLead,
//       projectStatus: odooLead ? 'active' : 'not_found'
//     };

//     res.json(dashboardData);
//   } catch (error) {
//     console.error('Dashboard error:', error);
//     res.status(500).json({ message: 'Failed to load dashboard data' });
//   }
// });

// // Get user profile
// router.get('/profile', async (req, res) => {
//   try {
//     const { userId } = req.user;

//     const userDoc = await db.collection('users').doc(userId).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userData = userDoc.data();
    
//     // Remove sensitive data
//     delete userData.isVerified;
//     delete userData.createdAt;
//     delete userData.lastLogin;

//     res.json(userData);
//   } catch (error) {
//     console.error('Profile error:', error);
//     res.status(500).json({ message: 'Failed to load profile data' });
//   }
// });

// // Update user profile
// router.put('/profile', async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { firstName, lastName, address, pincode } = req.body;

//     // Validation
//     if (!firstName || !lastName || !address || !pincode) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     if (!/^[0-9]{6}$/.test(pincode)) {
//       return res.status(400).json({ message: 'Pincode must be exactly 6 digits' });
//     }

//     const updateData = {
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       address: address.trim(),
//       pincode,
//       updatedAt: new Date()
//     };

//     await db.collection('users').doc(userId).update(updateData);

//     res.json({ message: 'Profile updated successfully' });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({ message: 'Failed to update profile' });
//   }
// });

// export default router;


// server/src/routes/customer.js - Updated to use centralized Firebase

import express from 'express';
import { db } from '../config/firebase.js';
import odooService from '../services/external/odoo/odooClient.js';

const router = express.Router();

// Get customer dashboard data
// router.get('/dashboard', async (req, res) => {
//   try {
//     const { userId, phone } = req.user;

//     // Get user data from Firestore
//     const userDoc = await db.collection('users').doc(userId).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     const userData = userDoc.data();

//     // Search for lead in Odoo CRM
//     let odooLead = null;
//     try {
//       odooLead = await odooService.fetchLeadByPhone(phone);
//       console.log('Odoo lead found:', odooLead ? 'Yes' : 'No');
//     } catch (odooError) {
//       console.error('Odoo fetch error:', odooError);
//       // Continue without Odoo data if service is unavailable
//     }

//     const dashboardData = {
//       user: {
//         id: userId,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         phone: userData.phone,
//         address: userData.address,
//         pincode: userData.pincode
//       },
//       odooLead: odooLead,
//       projectStatus: odooLead ? 'active' : 'not_found'
//     };

//     res.json({
//       success: true,
//       data: dashboardData
//     });
//   } catch (error) {
//     console.error('Dashboard error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to load dashboard data' 
//     });
//   }
// });

// Get customer dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { userId, phone } = req.user;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();

    // Search for lead in Odoo CRM
    let odooLead = null;
    try {
      odooLead = await odooService.fetchLeadByPhone(phone);
      console.log('Odoo lead found:', odooLead ? 'Yes' : 'No');
    } catch (odooError) {
      console.error('Odoo search error:', odooError);
      // Continue without Odoo data if service is unavailable
    }

    const dashboardData = {
      user: {
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        pincode: userData.pincode
      },
      odooLead: odooLead,
      projectStatus: odooLead ? 'active' : 'not_found'
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});



// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, address, pincode } = req.body;

    // Validation
    if (!firstName || !lastName || !address || !pincode) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({ 
        success: false,
        message: 'Pincode must be exactly 6 digits' 
      });
    }

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      pincode,
      updatedAt: new Date()
    };

    await db.collection('users').doc(userId).update(updateData);

    res.json({ 
      success: true,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
});

export default router;