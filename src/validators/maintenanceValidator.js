// server/src/validators/maintenanceValidator.js
const validateMaintenanceRequest = (data) => {
  const errors = [];

  // Basic Information Validation
  if (!data.customerName?.trim()) {
    errors.push({ field: 'customerName', message: 'Customer name is required' });
  }

  if (!data.projectName?.trim()) {
    errors.push({ field: 'projectName', message: 'Project name is required' });
  }

  if (!data.contactNumber?.trim()) {
    errors.push({ field: 'contactNumber', message: 'Contact number is required' });
  } else if (!/^\d{10}$/.test(data.contactNumber.replace(/\D/g, ''))) {
    errors.push({ field: 'contactNumber', message: 'Contact number must be 10 digits' });
  }

  if (!data.requestDate) {
    errors.push({ field: 'requestDate', message: 'Request date is required' });
  } else {
    // Validate date format and not in past
    const requestDate = new Date(data.requestDate);
    if (isNaN(requestDate.getTime())) {
      errors.push({ field: 'requestDate', message: 'Invalid request date format' });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      requestDate.setHours(0, 0, 0, 0);
      
      if (requestDate < today) {
        errors.push({ field: 'requestDate', message: 'Request date cannot be in the past' });
      }
    }
  }

  // Services Validation
  if (!data.services || typeof data.services !== 'object') {
    errors.push({ field: 'services', message: 'Services selection is required' });
  } else {
    const validServiceKeys = [
      'fixDrawerAlignment',
      'channelHingeServicing',
      'replaceDamagedHardware',
      'fixLooseHinges',
      'kitchenDeepClean',
      'addCoatingShutters',
      'fixApplianceIssues',
      'addKitchenAccessories',
      'upgradeShutters',
      'remodelKitchen',
      'addMoreUnits',
      'upgradeAppliances',
      'repairMinorDamages',
      'fixUnderCabinetLighting',
      'changeHoodFilter',
      'other'
    ];

    // Check for invalid service keys
    const providedKeys = Object.keys(data.services);
    const invalidKeys = providedKeys.filter(key => !validServiceKeys.includes(key));
    if (invalidKeys.length > 0) {
      errors.push({ 
        field: 'services', 
        message: `Invalid service keys: ${invalidKeys.join(', ')}` 
      });
    }

    // Check if at least one service is selected
    const hasSelectedService = validServiceKeys.some(key => {
      if (key === 'other') {
        return data.services[key]?.trim();
      }
      return Boolean(data.services[key]);
    });

    if (!hasSelectedService) {
      errors.push({ field: 'services', message: 'At least one service must be selected' });
    }

    // Validate 'other' field if provided
    if (data.services.other && typeof data.services.other === 'string') {
      if (data.services.other.trim().length > 500) {
        errors.push({ 
          field: 'services.other', 
          message: 'Other service description too long (maximum 500 characters)' 
        });
      }
      if (data.services.other.trim().length > 0 && data.services.other.trim().length < 5) {
        errors.push({ 
          field: 'services.other', 
          message: 'Other service description too short (minimum 5 characters)' 
        });
      }
    }

    // Validate boolean values for standard services
    validServiceKeys.slice(0, -1).forEach(key => { // Exclude 'other'
      if (data.services.hasOwnProperty(key) && typeof data.services[key] !== 'boolean') {
        errors.push({ 
          field: `services.${key}`, 
          message: `${key} must be a boolean value` 
        });
      }
    });
  }

  // Priority validation (if provided)
  if (data.priority && !['urgent', 'high', 'standard', 'low'].includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority value' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMaintenanceUpdate = (data) => {
  const errors = [];

  // Fields that can be updated after submission
  const allowedFields = [
    'status', 
    'priority', 
    'assignedTeam', 
    'scheduledDate', 
    'completedDate', 
    'notes'
  ];
  
  const providedFields = Object.keys(data);
  const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
  
  if (invalidFields.length > 0) {
    errors.push({ 
      field: 'general', 
      message: `Cannot update fields: ${invalidFields.join(', ')}` 
    });
  }

  // Status validation
  if (data.status && !['pending', 'assigned', 'in-progress', 'completed', 'cancelled'].includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid status value' });
  }

  // Priority validation
  if (data.priority && !['urgent', 'high', 'standard', 'low'].includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority value' });
  }

  // Date validations
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

  if (data.completedDate) {
    const completedDate = new Date(data.completedDate);
    if (isNaN(completedDate.getTime())) {
      errors.push({ field: 'completedDate', message: 'Invalid completed date format' });
    }
  }

  // Notes validation
  if (data.notes && typeof data.notes === 'string' && data.notes.length > 1000) {
    errors.push({ field: 'notes', message: 'Notes too long (maximum 1000 characters)' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeMaintenanceData = (data) => {
  const sanitizedServices = {};
  
  // Sanitize service selections
  const validServiceKeys = [
    'fixDrawerAlignment',
    'channelHingeServicing', 
    'replaceDamagedHardware',
    'fixLooseHinges',
    'kitchenDeepClean',
    'addCoatingShutters',
    'fixApplianceIssues',
    'addKitchenAccessories',
    'upgradeShutters',
    'remodelKitchen',
    'addMoreUnits',
    'upgradeAppliances',
    'repairMinorDamages',
    'fixUnderCabinetLighting',
    'changeHoodFilter',
    'other'
  ];

  validServiceKeys.forEach(key => {
    if (key === 'other') {
      sanitizedServices[key] = data.services?.[key]?.trim() || '';
    } else {
      sanitizedServices[key] = Boolean(data.services?.[key]);
    }
  });

  return {
    customerName: data.customerName?.trim(),
    projectName: data.projectName?.trim(),
    contactNumber: data.contactNumber?.replace(/\D/g, ''),
    requestDate: data.requestDate,
    services: sanitizedServices,
    priority: data.priority || 'standard',
    notes: data.notes?.trim() || ''
  };
};

const validateServiceSelection = (services) => {
  if (!services || typeof services !== 'object') {
    return { isValid: false, message: 'Services must be an object' };
  }

  const selectedCount = Object.keys(services).filter(key => {
    if (key === 'other') {
      return services[key]?.trim();
    }
    return Boolean(services[key]);
  }).length;

  if (selectedCount === 0) {
    return { isValid: false, message: 'At least one service must be selected' };
  }

  if (selectedCount > 10) {
    return { isValid: false, message: 'Too many services selected (maximum 10)' };
  }

  return { isValid: true };
};

export {
  validateMaintenanceRequest,
  validateMaintenanceUpdate,
  sanitizeMaintenanceData,
  validateServiceSelection
};