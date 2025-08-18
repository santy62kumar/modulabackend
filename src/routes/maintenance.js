// // server/src/routes/maintenance.js
import express from 'express';
import maintenanceController from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  validateMaintenanceRequestMiddleware,
  validateMaintenanceStatusUpdateMiddleware 
} from '../middleware/validation.js';
import { 
  validateServiceRequest, 
  validateStatusUpdate,
  validateCancelRequest,
  validateGetRequest,
  validateProjectRequests
} from '../validators/maintenanceValidator.js';

const router = express.Router();

/**
 * @route   POST /api/maintenance/request
 * @desc    Submit a new service request
 * @access  Private (Customer)
 */
router.post('/request', 
  authMiddleware,
  validateServiceRequest,
  maintenanceController.submitServiceRequest
);

/**
 * @route   GET /api/maintenance/requests/:projectId
 * @desc    Get service requests for a specific project
 * @access  Private (Customer)
 */
router.get('/requests/:projectId',
  authMiddleware,
  validateProjectRequests,
  maintenanceController.getServiceRequestsByProject
);

/**
 * @route   GET /api/maintenance/requests
 * @desc    Get all service requests for authenticated customer
 * @access  Private (Customer)
 */
router.get('/requests',
  authMiddleware,
  maintenanceController.getCustomerServiceRequests
);
// Use in routes
router.post('/request', authMiddleware, validateMaintenanceRequestMiddleware, maintenanceController.submitServiceRequest);
router.patch('/request/:id/status', authMiddleware, validateMaintenanceStatusUpdateMiddleware, maintenanceController.updateServiceRequestStatus);
/**
 * @route   GET /api/maintenance/request/:requestId
 * @desc    Get service request by ID
 * @access  Private (Customer)
 */
router.get('/request/:requestId',
  authMiddleware,
  validateGetRequest,
  maintenanceController.getServiceRequestById
);

/**
 * @route   PATCH /api/maintenance/request/:requestId/status
 * @desc    Update service request status
 * @access  Private (Admin/Technician)
 */
router.patch('/request/:requestId/status',
  authMiddleware,
  validateStatusUpdate,
  maintenanceController.updateServiceRequestStatus
);

/**
 * @route   PATCH /api/maintenance/request/:requestId/cancel
 * @desc    Cancel service request
 * @access  Private (Customer)
 */
router.patch('/request/:requestId/cancel',
  authMiddleware,
  validateCancelRequest,
  maintenanceController.cancelServiceRequest
);

/**
 * @route   GET /api/maintenance/stats
 * @desc    Get service request statistics
 * @access  Private (Admin)
 */
router.get('/stats',
  authMiddleware,
  // Note: In production, add admin role check middleware here
  maintenanceController.getServiceRequestStats
);

export default router;