// server/src/routes/maintenance.js
import express from 'express';
import MaintenanceController from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const maintenanceController = new MaintenanceController();

// Apply authentication middleware to all maintenance routes
router.use(authMiddleware);

// Customer routes
router.post(
  '/submit',
  rateLimiter.maintenanceSubmission, // Rate limit: 3 submissions per day
  validateRequest('maintenanceRequest'),
  maintenanceController.submitMaintenanceRequest.bind(maintenanceController)
);

router.get(
  '/my-requests',
  maintenanceController.getUserMaintenanceRequests.bind(maintenanceController)
);

// router.get(
//   '/:requestId',
//   maintenanceController.getMaintenanceRequestById.bind(maintenanceController)
// );

// router.get(
//   '/reference/:referenceId',
//   maintenanceController.getMaintenanceRequestByReference.bind(maintenanceController)
// );

router.patch(
  '/:requestId/status',
  validateRequest('maintenanceStatusUpdate'),
  maintenanceController.updateRequestStatus.bind(maintenanceController)
);

router.delete(
  '/:requestId',
  maintenanceController.deleteMaintenanceRequest.bind(maintenanceController)
);

// Admin routes
// router.get(
//   '/admin/all',
//   maintenanceController.getAllMaintenanceRequests.bind(maintenanceController)
// );

// router.get(
//   '/admin/status/:status',
//   maintenanceController.getMaintenanceRequestsByStatus.bind(maintenanceController)
// );

// router.get(
//   '/admin/pending',
//   maintenanceController.getPendingRequests.bind(maintenanceController)
// );

// router.get(
//   '/admin/overdue',
//   maintenanceController.getOverdueRequests.bind(maintenanceController)
// );

// router.get(
//   '/admin/statistics',
//   maintenanceController.getMaintenanceStatistics.bind(maintenanceController)
// );

// router.get(
//   '/admin/report',
//   maintenanceController.generateMaintenanceReport.bind(maintenanceController)
// );

// router.post(
//   '/admin/:requestId/assign-team',
//   validateRequest('teamAssignment'),
//   maintenanceController.assignTeamToRequest.bind(maintenanceController)
// );

export default router;