// server/src/constants/notificationTemplates.js

/**
 * SMS Notification Templates
 * Templates for different stage notifications
 */

const PROJECT_STAGE_TEMPLATES = {
  "booking_confirmed": "Hi [Customer Name], Your Modula order is confirmed! Access it anytime to track your project: [link to website] – Team Modula",
  
  "in_production": "Hi [Customer Name], Your project is on track! Check the latest updates on your dashboard: [link] – Team Modula",
  
  "dispatched": "Hi [Customer Name], Your Modula order is on the way! Track it here: [link] – Team Modula",
  
  "installed": "Hi [Customer Name] Your Modula project is complete! We'd love your feedback! Share your thoughts here: [link] – Team Modula",
  
  "order_completed": "Hi [Customer Name], Your Modula project is complete! We'd love your feedback! Share your thoughts here: [link] – Team Modula"
};

const PAYMENT_STAGE_TEMPLATES = {
  "booking_fees": null, // No notification for booking fees
  
  "first_installment": "Hi [Customer Name], We've received your first installment payment of ₹[Amount]. Thank you for completing this step! You can view your payment receipts in your dashboard anytime: [Link] – Team Modula",
  
  "second_installment": "Hi [Customer Name], We've received your final payment of ₹[Amount]. Thank you for completing this step! You can view your payment receipts in your dashboard anytime: [Link] – Team Modula"
};

const DISPATCH_STAGE_TEMPLATES = {
  "ready_for_dispatch": null, // No SMS for ready for dispatch
  
  "order_dispatched": "Hi [Customer Name], Your Modula order is on the way! Track it here: [link] – Team Modula",
  
  "order_delivered": "Hi [Customer Name], Your Modula order has been delivered! Our team will connect with you soon! – Team Modula"
};

/**
 * Get notification template
 * @param {string} category - Category: 'project', 'payment', 'dispatch'
 * @param {string} stage - Stage name
 * @returns {string|null} Template string or null if no notification
 */
function getNotificationTemplate(category, stage) {
  switch (category) {
    case 'project':
      return PROJECT_STAGE_TEMPLATES[stage] || null;
    case 'payment':
      return PAYMENT_STAGE_TEMPLATES[stage] || null;
    case 'dispatch':
      return DISPATCH_STAGE_TEMPLATES[stage] || null;
    default:
      return null;
  }
}

/**
 * Process template with customer data
 * @param {string} template - Template string
 * @param {Object} data - Customer data
 * @returns {string} Processed message
 */
function processTemplate(template, data) {
  if (!template) return null;
  
  let message = template;
  
  // Replace customer name
  if (data.customerName) {
    message = message.replace(/\[Customer Name\]/g, data.customerName);
  }
  
  // Replace amount (for payment notifications)
  if (data.amount) {
    message = message.replace(/\[Amount\]/g, data.amount);
  }
  
  // Replace links (for now using placeholder, can be dynamic later)
  const websiteLink = process.env.FRONTEND_URL || 'https://yourapp.com';
  message = message.replace(/\[link to website\]/g, websiteLink);
  message = message.replace(/\[link\]/g, websiteLink);
  message = message.replace(/\[Link\]/g, websiteLink);
  
  return message;
}

/**
 * Check if stage should send notification
 * @param {string} category - Category: 'project', 'payment', 'dispatch'
 * @param {string} stage - Stage name
 * @returns {boolean}
 */
function shouldSendNotification(category, stage) {
  const template = getNotificationTemplate(category, stage);
  return template !== null;
}

export {
  PROJECT_STAGE_TEMPLATES,
  PAYMENT_STAGE_TEMPLATES,
  DISPATCH_STAGE_TEMPLATES,
  getNotificationTemplate,
  processTemplate,
  shouldSendNotification
};