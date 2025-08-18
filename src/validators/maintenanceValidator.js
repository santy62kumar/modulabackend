// server/src/validators/maintenanceValidator.js
import { body, param, validationResult } from 'express-validator';

// Validation middleware to check results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Service request validation
export const validateServiceRequest = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isString()
    .withMessage('Project ID must be a string'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['services', 'upgrade', 'support'])
    .withMessage('Category must be one of: services, upgrade, support'),
    
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isString()
    .withMessage('Service ID must be a string'),
    
  body('serviceName')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Service name must be between 3 and 100 characters'),
    
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
    
  body('contactName')
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),
    
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
    
  body('preferredDate')
    .optional()
    .isISO8601()
    .withMessage('Preferred date must be in valid date format')
    .custom((value) => {
      if (value && new Date(value) < new Date()) {
        throw new Error('Preferred date cannot be in the past');
      }
      return true;
    }),
    
  body('urgency')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Urgency must be one of: low, normal, high, urgent'),
    
  handleValidationErrors
];

// Status update validation
export const validateStatusUpdate = [
  param('requestId')
    .notEmpty()
    .withMessage('Request ID is required')
    .isUUID()
    .withMessage('Request ID must be a valid UUID'),
    
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, assigned, in_progress, completed, cancelled'),
    
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
    
  body('technician_id')
    .optional()
    .isString()
    .withMessage('Technician ID must be a string'),
    
  handleValidationErrors
];

// Cancel request validation
export const validateCancelRequest = [
  param('requestId')
    .notEmpty()
    .withMessage('Request ID is required')
    .isUUID()
    .withMessage('Request ID must be a valid UUID'),
    
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason must be less than 200 characters'),
    
  handleValidationErrors
];

// Get request validation
export const validateGetRequest = [
  param('requestId')
    .notEmpty()
    .withMessage('Request ID is required')
    .isUUID()
    .withMessage('Request ID must be a valid UUID'),
    
  handleValidationErrors
];

// Project requests validation
export const validateProjectRequests = [
  param('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isString()
    .withMessage('Project ID must be a string'),
    
  handleValidationErrors
];

export default {
  validateServiceRequest,
  validateStatusUpdate,
  validateCancelRequest,
  validateGetRequest,
  validateProjectRequests
};