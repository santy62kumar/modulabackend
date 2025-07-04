// // // server/routes/tracking.js
// // import express from 'express';
// // import { 
// //   getProjectTracking, 
// //   updateProjectStage, 
// //   getStageHistory 
// // } from '../controllers/trackingController.js';
// // import { authMiddleware } from '../middleware/auth.js';



// // server/src/routes/tracking.js

// const express = require('express');
// const router = express.Router();
// const trackingController = require('../controllers/trackingController');
// const { authenticateToken } = require('../middleware/auth'); // JWT middleware


// //const router = express.Router();

// // Apply auth middleware to all routes
// router.use(authMiddleware);

// // Get project tracking data
// router.get('/', getProjectTracking);

// // Update project stage (admin only)
// router.put('/stage', updateProjectStage);

// // Get stage change history
// router.get('/history/:leadId', getStageHistory);

// // Customer routes (authenticated)
// router.get('/project', authenticateToken, trackingController.getCustomerProject);

// // Admin routes (TODO: Add admin role middleware)
// router.get('/stats', authenticateToken, trackingController.getTrackingStats);
// router.post('/poll/manual', authenticateToken, trackingController.triggerManualPoll);
// router.post('/cron/restart', authenticateToken, trackingController.restartCronJobs);

// // Health check routes
// router.get('/health', trackingController.getSystemHealth);
// router.get('/health/odoo', authenticateToken, trackingController.checkOdooHealth);

// // Debug routes (Admin only)
// router.get('/test/phone', authenticateToken, trackingController.testPhoneLookup);


// export default router;

// server/src/routes/tracking.js

import express from 'express';
import * as trackingController from '../controllers/trackingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// // Get project tracking data
// router.get('/', trackingController.getProjectTracking);

// // Update project stage (admin only)
// router.put('/stage', trackingController.updateProjectStage);

// // Get stage change history
// router.get('/history/:leadId', trackingController.getStageHistory);

// // Customer routes (authenticated)
// router.get('/project', authenticateToken, trackingController.getCustomerProject);

// Admin routes (TODO: Add admin role middleware)
// router.get('/stats', authenticateToken, trackingController.getTrackingStats);
// router.post('/poll/manual', authenticateToken, trackingController.triggerManualPoll);
// router.post('/cron/restart', authenticateToken, trackingController.restartCronJobs);

// Health check routes
// router.get('/health', trackingController.getSystemHealth);
// router.get('/health/odoo', authenticateToken, trackingController.checkOdooHealth);

// Debug routes (Admin only)
//router.get('/test/phone', authenticateToken, trackingController.testPhoneLookup);

export default router;
