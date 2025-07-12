// server/src/middleware/validation.js
import { validateFeedbackSubmission } from '../validators/feedbackValidator.js';
import { validateMaintenanceRequest } from '../validators/maintenanceValidator.js';

const validationSchemas = {
  feedback: (data) => validateFeedbackSubmission(data),
  
  maintenanceRequest: (data) => validateMaintenanceRequest(data),
  
  feedbackStatusUpdate: (data) => {
    const errors = [];
    
    if (!data.status) {
      errors.push({ field: 'status', message: 'Status is required' });
    } else if (!['submitted', 'reviewed', 'processed'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }
    
    if (data.notes && typeof data.notes !== 'string') {
      errors.push({ field: 'notes', message: 'Notes must be a string' });
    }
    
    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notes too long (maximum 1000 characters)' });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  maintenanceStatusUpdate: (data) => {
    const errors = [];
    
    if (!data.status) {
      errors.push({ field: 'status', message: 'Status is required' });
    } else if (!['pending', 'assigned', 'in-progress', 'completed', 'cancelled'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }
    
    if (data.notes && typeof data.notes !== 'string') {
      errors.push({ field: 'notes', message: 'Notes must be a string' });
    }
    
    if (data.notes && data.notes.length > 1000) {
      errors.push({ field: 'notes', message: 'Notes too long (maximum 1000 characters)' });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  teamAssignment: (data) => {
    const errors = [];
    
    if (!data.teamId) {
      errors.push({ field: 'teamId', message: 'Team ID is required' });
    } else if (typeof data.teamId !== 'string') {
      errors.push({ field: 'teamId', message: 'Team ID must be a string' });
    }
    
    if (data.scheduledDate) {
      const scheduledDate = new Date(data.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        errors.push({ field: 'scheduledDate', message: 'Invalid scheduled date format' });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        scheduledDate.setHours(0, 0, 0, 0);
        
        if (scheduledDate < today) {
          errors.push({ field: 'scheduledDate', message: 'Scheduled date cannot be in the past' });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export const validateRequest = (schemaName) => {
  return (req, res, next) => {
    try {
      const schema = validationSchemas[schemaName];
      
      if (!schema) {
        return res.status(500).json({
          success: false,
          message: 'Invalid validation schema'
        });
      }
      
      const validation = schema(req.body);
      
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(error => {
          return error.field ? `${error.field}: ${error.message}` : error.message;
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
          details: errorMessages
        });
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

// Middleware to sanitize request body
export const sanitizeRequestBody = (req, res, next) => {
  try {
    // Remove any null or undefined values
    const cleanBody = {};
    
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          // Trim whitespace and remove potential XSS
          cleanBody[key] = value.trim().substring(0, 10000); // Limit string length
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively clean nested objects
          cleanBody[key] = {};
          Object.keys(value).forEach(nestedKey => {
            const nestedValue = value[nestedKey];
            if (nestedValue !== null && nestedValue !== undefined) {
              if (typeof nestedValue === 'string') {
                cleanBody[key][nestedKey] = nestedValue.trim().substring(0, 1000);
              } else {
                cleanBody[key][nestedKey] = nestedValue;
              }
            }
          });
        } else {
          cleanBody[key] = value;
        }
      }
    });
    
    req.body = cleanBody;
    next();
  } catch (error) {
    console.error('Request sanitization error:', error);
    res.status(500).json({
      success: false,
      message: 'Request processing error'
    });
  }
};

// Middleware to validate required fields
export const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields like 'ratings.overallExperience'
        const fieldParts = field.split('.');
        let current = req.body;
        
        for (const part of fieldParts) {
          if (!current || current[part] === undefined || current[part] === null) {
            missingFields.push(field);
            break;
          }
          current = current[part];
        }
      } else {
        // Handle top-level fields
        if (req.body[field] === undefined || req.body[field] === null || 
            (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
          missingFields.push(field);
        }
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }
    
    next();
  };
};

// Middleware to validate data types
export const validateTypes = (typeMap) => {
  return (req, res, next) => {
    const typeErrors = [];
    
    Object.keys(typeMap).forEach(field => {
      const expectedType = typeMap[field];
      const value = req.body[field];
      
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (expectedType === 'number' && (isNaN(value) || typeof value !== 'number')) {
          typeErrors.push(`${field} must be a valid number`);
        } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
          typeErrors.push(`${field} must be a boolean`);
        } else if (expectedType === 'string' && typeof value !== 'string') {
          typeErrors.push(`${field} must be a string`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          typeErrors.push(`${field} must be an array`);
        } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          typeErrors.push(`${field} must be an object`);
        } else if (expectedType === 'date') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            typeErrors.push(`${field} must be a valid date`);
          }
        }
      }
    });
    
    if (typeErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Type validation failed',
        errors: typeErrors
      });
    }
    
    next();
  };
};

// Middleware to validate string lengths
export const validateStringLengths = (lengthMap) => {
  return (req, res, next) => {
    const lengthErrors = [];
    
    Object.keys(lengthMap).forEach(field => {
      const constraints = lengthMap[field];
      const value = req.body[field];
      
      if (value && typeof value === 'string') {
        const trimmedValue = value.trim();
        
        if (constraints.min && trimmedValue.length < constraints.min) {
          lengthErrors.push(`${field} must be at least ${constraints.min} characters long`);
        }
        
        if (constraints.max && trimmedValue.length > constraints.max) {
          lengthErrors.push(`${field} must be no more than ${constraints.max} characters long`);
        }
      }
    });
    
    if (lengthErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'String length validation failed',
        errors: lengthErrors
      });
    }
    
    next();
  };
};

// Middleware to validate phone numbers
export const validatePhoneNumber = (phoneField = 'contactNumber') => {
  return (req, res, next) => {
    const phoneNumber = req.body[phoneField];
    
    if (phoneNumber) {
      const digits = phoneNumber.replace(/\D/g, '');
      
      if (digits.length !== 10) {
        return res.status(400).json({
          success: false,
          message: `${phoneField} must be exactly 10 digits`
        });
      }
      
      // Update the phone number to just digits
      req.body[phoneField] = digits;
    }
    
    next();
  };
};

// Middleware to validate rating values (1-4 scale)
export const validateRatings = (ratingsField = 'ratings') => {
  return (req, res, next) => {
    const ratings = req.body[ratingsField];
    
    if (ratings && typeof ratings === 'object') {
      const ratingErrors = [];
      
      Object.keys(ratings).forEach(key => {
        const rating = ratings[key];
        
        if (rating !== undefined && rating !== null) {
          const numRating = parseInt(rating);
          
          if (isNaN(numRating) || numRating < 1 || numRating > 4) {
            ratingErrors.push(`${key} rating must be between 1 and 4`);
          } else {
            // Convert to integer
            ratings[key] = numRating;
          }
        }
      });
      
      if (ratingErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Rating validation failed',
          errors: ratingErrors
        });
      }
    }
    
    next();
  };
};

// Combined validation middleware for feedback
export const validateFeedbackRequest = [
  sanitizeRequestBody,
  requireFields([
    'customerName', 
    'projectName', 
    'location', 
    'handoverDate', 
    'contactNumber',
    'ratings.installationBehavior',
    'ratings.punctuality', 
    'ratings.cleanliness',
    'ratings.installationQuality',
    'ratings.productQuality',
    'ratings.deliveryExperience',
    'ratings.communication',
    'ratings.overallExperience',
    'likedMost',
    'improvements',
    'wouldRecommend',
    'customerConfirmation',
    'projectManager',
    'installerNames'
  ]),
  validateTypes({
    customerName: 'string',
    projectName: 'string',
    location: 'string',
    handoverDate: 'date',
    contactNumber: 'string',
    ratings: 'object',
    likedMost: 'string',
    improvements: 'string',
    wouldRecommend: 'string',
    customerConfirmation: 'boolean',
    projectManager: 'string',
    installerNames: 'string'
  }),
  validateStringLengths({
    customerName: { min: 2, max: 100 },
    projectName: { min: 2, max: 100 },
    location: { min: 2, max: 200 },
    likedMost: { min: 10, max: 1000 },
    improvements: { min: 5, max: 1000 },
    projectManager: { min: 2, max: 100 },
    installerNames: { min: 2, max: 200 }
  }),
  validatePhoneNumber('contactNumber'),
  validateRatings('ratings'),
  validateRequest('feedback')
];

// Combined validation middleware for maintenance requests
export const validateMaintenanceRequestMiddleware = [
  sanitizeRequestBody,
  requireFields([
    'customerName',
    'projectName', 
    'contactNumber',
    'requestDate',
    'services'
  ]),
  validateTypes({
    customerName: 'string',
    projectName: 'string',
    contactNumber: 'string',
    requestDate: 'date',
    services: 'object'
  }),
  validateStringLengths({
    customerName: { min: 2, max: 100 },
    projectName: { min: 2, max: 100 }
  }),
  validatePhoneNumber('contactNumber'),
  validateRequest('maintenanceRequest')
];

export default {
  validateRequest,
  sanitizeRequestBody,
  requireFields,
  validateTypes,
  validateStringLengths,
  validatePhoneNumber,
  validateRatings,
  validateFeedbackRequest,
  validateMaintenanceRequestMiddleware
};