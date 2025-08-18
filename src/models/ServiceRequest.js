// server/src/models/ServiceRequest.js

/**
 * Service Request Model
 * Defines the structure and validation for service requests
 */

export const ServiceRequestStatus = {
  PENDING: 'pending',
  ASSIGNED: 'assigned', 
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ServiceRequestCategory = {
  SERVICES: 'services',
  UPGRADE: 'upgrade',
  SUPPORT: 'support'
};

export const ServiceRequestUrgency = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Service Request Schema Definition
 */
export const ServiceRequestSchema = {
  // Required fields
  id: {
    type: 'string',
    required: true,
    description: 'Unique identifier for the service request'
  },
  project_id: {
    type: 'string',
    required: true,
    description: 'Associated project ID'
  },
  customer_phone: {
    type: 'string',
    required: true,
    description: 'Customer phone number (normalized)'
  },
  category: {
    type: 'string',
    required: true,
    enum: Object.values(ServiceRequestCategory),
    description: 'Service category'
  },
  service_id: {
    type: 'string',
    required: true,
    description: 'Specific service identifier'
  },
  service_name: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 100,
    description: 'Name of the requested service'
  },
  description: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 1000,
    description: 'Detailed description of the service request'
  },
  contact_name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    description: 'Contact person name'
  },
  contact_phone: {
    type: 'string',
    required: true,
    description: 'Contact phone number'
  },
  status: {
    type: 'string',
    required: true,
    enum: Object.values(ServiceRequestStatus),
    default: ServiceRequestStatus.PENDING,
    description: 'Current status of the request'
  },
  urgency: {
    type: 'string',
    required: true,
    enum: Object.values(ServiceRequestUrgency),
    default: ServiceRequestUrgency.NORMAL,
    description: 'Urgency level of the request'
  },
  created_at: {
    type: 'timestamp',
    required: true,
    description: 'Creation timestamp'
  },
  updated_at: {
    type: 'timestamp',
    required: true,
    description: 'Last update timestamp'
  },
  status_updated_at: {
    type: 'timestamp',
    required: true,
    description: 'Status last updated timestamp'
  },

  // Optional fields
  preferred_date: {
    type: 'string',
    required: false,
    description: 'Customer preferred service date (ISO 8601)'
  },
  scheduled_date: {
    type: 'timestamp',
    required: false,
    description: 'Actual scheduled service date'
  },
  completion_date: {
    type: 'timestamp',
    required: false,
    description: 'Service completion date'
  },
  technician_id: {
    type: 'string',
    required: false,
    description: 'Assigned technician ID'
  },
  technician_name: {
    type: 'string',
    required: false,
    description: 'Assigned technician name'
  },
  notes: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Additional notes or comments'
  },
  cancellation_reason: {
    type: 'string',
    required: false,
    maxLength: 200,
    description: 'Reason for cancellation (if cancelled)'
  },
  cancelled_at: {
    type: 'timestamp',
    required: false,
    description: 'Cancellation timestamp'
  },
  estimated_cost: {
    type: 'number',
    required: false,
    description: 'Estimated service cost'
  },
  actual_cost: {
    type: 'number',
    required: false,
    description: 'Actual service cost'
  },
  rating: {
    type: 'number',
    required: false,
    min: 1,
    max: 5,
    description: 'Customer rating (1-5 stars)'
  },
  feedback: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Customer feedback'
  }
};

/**
 * Service Request Class
 */
export class ServiceRequest {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.customer_phone = data.customer_phone;
    this.category = data.category;
    this.service_id = data.service_id;
    this.service_name = data.service_name;
    this.description = data.description;
    this.contact_name = data.contact_name;
    this.contact_phone = data.contact_phone;
    this.status = data.status || ServiceRequestStatus.PENDING;
    this.urgency = data.urgency || ServiceRequestUrgency.NORMAL;
    this.preferred_date = data.preferred_date || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.status_updated_at = data.status_updated_at;

    // Optional fields
    this.scheduled_date = data.scheduled_date || null;
    this.completion_date = data.completion_date || null;
    this.technician_id = data.technician_id || null;
    this.technician_name = data.technician_name || null;
    this.notes = data.notes || '';
    this.cancellation_reason = data.cancellation_reason || null;
    this.cancelled_at = data.cancelled_at || null;
    this.estimated_cost = data.estimated_cost || null;
    this.actual_cost = data.actual_cost || null;
    this.rating = data.rating || null;
    this.feedback = data.feedback || null;
  }

  /**
   * Validate service request data
   */
  static validate(data) {
    const errors = [];

    // Required field validation
    const requiredFields = [
      'project_id', 'category', 'service_id', 'service_name', 
      'description', 'contact_name', 'contact_phone'
    ];

    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    // Category validation
    if (data.category && !Object.values(ServiceRequestCategory).includes(data.category)) {
      errors.push('Invalid service category');
    }

    // Status validation
    if (data.status && !Object.values(ServiceRequestStatus).includes(data.status)) {
      errors.push('Invalid status');
    }

    // Urgency validation
    if (data.urgency && !Object.values(ServiceRequestUrgency).includes(data.urgency)) {
      errors.push('Invalid urgency level');
    }

    // Length validations
    if (data.service_name && (data.service_name.length < 3 || data.service_name.length > 100)) {
      errors.push('Service name must be between 3 and 100 characters');
    }

    if (data.description && (data.description.length < 10 || data.description.length > 1000)) {
      errors.push('Description must be between 10 and 1000 characters');
    }

    if (data.contact_name && (data.contact_name.length < 2 || data.contact_name.length > 50)) {
      errors.push('Contact name must be between 2 and 50 characters');
    }

    // Date validation
    if (data.preferred_date) {
      const preferredDate = new Date(data.preferred_date);
      if (isNaN(preferredDate.getTime())) {
        errors.push('Invalid preferred date format');
      } else if (preferredDate < new Date()) {
        errors.push('Preferred date cannot be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if request can be cancelled
   */
  canBeCancelled() {
    return ![ServiceRequestStatus.COMPLETED, ServiceRequestStatus.CANCELLED].includes(this.status);
  }

  /**
   * Check if request can be updated
   */
  canBeUpdated() {
    return this.status !== ServiceRequestStatus.CANCELLED;
  }

  /**
   * Get display status
   */
  getDisplayStatus() {
    const statusMap = {
      [ServiceRequestStatus.PENDING]: 'Pending',
      [ServiceRequestStatus.ASSIGNED]: 'Assigned',
      [ServiceRequestStatus.IN_PROGRESS]: 'In Progress',
      [ServiceRequestStatus.COMPLETED]: 'Completed',
      [ServiceRequestStatus.CANCELLED]: 'Cancelled'
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * Get display urgency
   */
  getDisplayUrgency() {
    const urgencyMap = {
      [ServiceRequestUrgency.LOW]: 'Low Priority',
      [ServiceRequestUrgency.NORMAL]: 'Normal Priority',
      [ServiceRequestUrgency.HIGH]: 'High Priority',
      [ServiceRequestUrgency.URGENT]: 'Urgent'
    };
    return urgencyMap[this.urgency] || this.urgency;
  }

  /**
   * Convert to plain object for API response
   */
  toJSON() {
    return {
      id: this.id,
      project_id: this.project_id,
      customer_phone: this.customer_phone,
      category: this.category,
      service_id: this.service_id,
      service_name: this.service_name,
      description: this.description,
      contact_name: this.contact_name,
      contact_phone: this.contact_phone,
      status: this.status,
      urgency: this.urgency,
      preferred_date: this.preferred_date,
      scheduled_date: this.scheduled_date,
      completion_date: this.completion_date,
      technician_id: this.technician_id,
      technician_name: this.technician_name,
      notes: this.notes,
      cancellation_reason: this.cancellation_reason,
      cancelled_at: this.cancelled_at,
      estimated_cost: this.estimated_cost,
      actual_cost: this.actual_cost,
      rating: this.rating,
      feedback: this.feedback,
      created_at: this.created_at,
      updated_at: this.updated_at,
      status_updated_at: this.status_updated_at,
      display_status: this.getDisplayStatus(),
      display_urgency: this.getDisplayUrgency(),
      can_be_cancelled: this.canBeCancelled(),
      can_be_updated: this.canBeUpdated()
    };
  }
}

export default ServiceRequest;