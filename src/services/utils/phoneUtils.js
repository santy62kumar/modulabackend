// server/src/utils/phoneUtils.js

/**
 * Phone number utility functions
 * Handles phone number formatting and validation
 */

/**
 * Clean and normalize phone number to 10 digits
 * @param {string} phone - Input phone number
 * @returns {string} Normalized 10-digit phone number
 */
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Get last 10 digits
  const last10 = digits.slice(-10);
  
  return last10;
}

/**
 * Get different phone number formats for search
 * @param {string} phone - Input phone number
 * @returns {Array<string>} Array of phone formats
 */
function getPhoneFormats(phone) {
  const normalized = normalizePhone(phone);
  
  if (normalized.length !== 10) {
    return [phone]; // Return original if can't normalize
  }
  
  return [
    normalized,                                           // 6205281574
    `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`, // +91 62052 81574
    // `+91${normalized}`,                                   // +916205281574
    // `91${normalized}`,                                    // 916205281574
    // `0${normalized}`                                      // 06205281574
  ];
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  
  // Check if exactly 10 digits and starts with valid Indian mobile prefixes
  if (normalized.length !== 10) return false;
  
  // Indian mobile numbers start with 6, 7, 8, or 9
  const firstDigit = normalized.charAt(0);
  return ['6', '7', '8', '9'].includes(firstDigit);
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneForDisplay(phone) {
  const normalized = normalizePhone(phone);
  
  if (normalized.length === 10) {
    return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Format phone number for SMS sending (with country code)
 * @param {string} phone - Phone number to format
 * @returns {string} Phone number with country code
 */
function formatPhoneForSMS(phone) {
  const normalized = normalizePhone(phone);
  
  if (normalized.length === 10) {
    return `+91${normalized}`;
  }
  
  // If already has country code, return as is
  if (phone.startsWith('+91')) {
    return phone;
  }
  
  return `+91${phone}`;
}

/**
 * Extract phone number from various formats
 * @param {string} phone - Phone number in any format
 * @returns {string} Clean 10-digit phone number
 */
function extractPhoneNumber(phone) {
  return normalizePhone(phone);
}

/**
 * Compare two phone numbers for equality
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} Are phones equal
 */
function arePhoneNumbersEqual(phone1, phone2) {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  return normalized1 === normalized2;
}

export {
  normalizePhone, 
  getPhoneFormats,
  isValidPhone,
  formatPhoneForDisplay,
  formatPhoneForSMS,
  extractPhoneNumber,
  arePhoneNumbersEqual
};