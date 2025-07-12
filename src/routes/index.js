// // server/src/routes/index.js - Update existing file
// const express = require('express');
// const authRoutes = require('./auth');
// const customerRoutes = require('./customer');
// const dashboardRoutes = require('./dashboard');
// const feedbackRoutes = require('./feedback'); // NEW
// const maintenanceRoutes = require('./maintenance'); // NEW
// const healthRoutes = require('./health');

// const router = express.Router();

// // Health check
// router.use('/health', healthRoutes);

// // Authentication routes
// router.use('/auth', authRoutes);

// // Customer routes
// router.use('/customer', customerRoutes);

// // Dashboard routes
// router.use('/dashboard', dashboardRoutes);

// // Feedback routes (NEW)
// router.use('/feedback', feedbackRoutes);

// // Maintenance routes (NEW)
// router.use('/maintenance', maintenanceRoutes);

// // Default route
// router.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Modula Customer Portal API',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       dashboard: '/api/dashboard',
//       feedback: '/api/feedback',
//       maintenance: '/api/maintenance',
//       health: '/api/health'
//     }
//   });
// });

// module.exports = router;