// server/src/services/utils/helpers.js

import crypto from 'crypto';

/**
 * Utility Helper Functions
 */

/**
 * Generate unique ID with prefix
 * @param {string} prefix - Prefix for the ID (e.g., 'FEEDBACK', 'MAINT')
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = 'ID') => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${timestamp}_${randomPart}`;
};

/**
 * Generate random string of specified length
 * @param {number} length - Length of the string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export const generateRandomString = (length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Format phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Take last 10 digits
  const last10 = digitsOnly.slice(-10);
  
  // Return with +91 prefix for Indian numbers
  return `+91${last10}`;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    iso: undefined
  };
  
  if (format === 'iso') {
    return dateObj.toISOString();
  }
  
  return dateObj.toLocaleDateString('en-IN', options[format] || options.short);
};

/**
 * Calculate time difference in human readable format
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (default: now)
 * @returns {string} Time difference
 */
export const getTimeDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Sanitize string for database storage
 * @param {string} str - String to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, maxLength);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate OTP (One Time Password)
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} OTP
 */
export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

/**
 * Convert object to query string
 * @param {Object} obj - Object to convert
 * @returns {string} Query string
 */
export const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Mask sensitive data for logging
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of characters to keep visible
 * @returns {string} Masked string
 */
export const maskSensitiveData = (str, visibleChars = 4) => {
  if (!str || str.length <= visibleChars) return str;
  
  const visible = str.substring(0, visibleChars);
  const masked = '*'.repeat(str.length - visibleChars);
  return visible + masked;
};

/**
 * Check if a date is within business hours
 * @param {Date|string} date - Date to check
 * @param {Object} businessHours - Business hours config
 * @returns {boolean} True if within business hours
 */
export const isWithinBusinessHours = (date, businessHours = { start: 9, end: 18 }) => {
  const dateObj = new Date(date);
  const hour = dateObj.getHours();
  const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a weekend (Saturday or Sunday)
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Check if within business hours
  return hour >= businessHours.start && hour < businessHours.end;
};

/**
 * Generate hash for data integrity
 * @param {string} data - Data to hash
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} Hash
 */
export const generateHash = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

/**
 * Parse and validate JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed JSON or default value
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return defaultValue;
  }
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Generate a slug from a string
 * @param {string} str - String to convert to slug
 * @returns {string} Slug
 */
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};