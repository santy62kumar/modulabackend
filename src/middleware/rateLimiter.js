// // server/src/middleware/rateLimiter.js
// import rateLimit from 'express-rate-limit';

// // General API rate limiter
// export const generalRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.',
//     retryAfter: '15 minutes'
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   skipSuccessfulRequests: false,
//   skipFailedRequests: false,
//   keyGenerator: (req) => {
//     // Use user ID if authenticated, otherwise IP
//     return req.user?.userId || req.ip;
//   }
// });

// // Strict rate limiter for sensitive operations
// export const strictRateLimit = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 10, // Limit each IP to 10 requests per hour
//   message: {
//     success: false,
//     message: 'Too many attempts from this IP, please try again after an hour.',
//     retryAfter: '1 hour'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   }
// });

// // Feedback submission rate limiter
// export const feedbackSubmission = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 1, // Only 1 feedback submission per 10 minutes per user
//   message: {
//     success: false,
//     message: 'You can only submit feedback once every 10 minutes. Please wait before submitting again.',
//     retryAfter: '10 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     // Use user ID for feedback submissions to prevent duplicate submissions
//     return req.user?.userId || req.ip;
//   },
//   skip: (req) => {
//     // Skip rate limiting for admin users
//     return req.user?.role === 'admin';
//   }
// });

// // Maintenance request submission rate limiter
// export const maintenanceSubmission = rateLimit({
//   windowMs: 24 * 60 * 60 * 1000, // 24 hours
//   max: 3, // Max 3 maintenance requests per day per user
//   message: {
//     success: false,
//     message: 'You can only submit 3 maintenance requests per day. Please try again tomorrow.',
//     retryAfter: '24 hours'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   },
//   skip: (req) => {
//     // Skip rate limiting for admin users
//     return req.user?.role === 'admin';
//   }
// });

// // Login attempt rate limiter
// export const loginAttempts = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Max 5 login attempts per 15 minutes
//   message: {
//     success: false,
//     message: 'Too many login attempts from this IP, please try again after 15 minutes.',
//     retryAfter: '15 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     // Use phone number + IP for login attempts
//     const phone = req.body?.phone || '';
//     return `${req.ip}-${phone}`;
//   }
// });

// // OTP request rate limiter
// export const otpRequests = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 3, // Max 3 OTP requests per 5 minutes
//   message: {
//     success: false,
//     message: 'Too many OTP requests. Please wait 5 minutes before requesting another OTP.',
//     retryAfter: '5 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     const phone = req.body?.phone || '';
//     return `otp-${req.ip}-${phone}`;
//   }
// });

// // Registration rate limiter
// export const registration = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 3, // Max 3 registrations per hour per IP
//   message: {
//     success: false,
//     message: 'Too many registration attempts from this IP, please try again after an hour.',
//     retryAfter: '1 hour'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// // Admin operations rate limiter
// export const adminOperations = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 30, // Max 30 admin operations per minute
//   message: {
//     success: false,
//     message: 'Too many admin operations, please slow down.',
//     retryAfter: '1 minute'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   },
//   skip: (req) => {
//     // Only apply to admin users
//     return req.user?.role !== 'admin';
//   }
// });

// // File upload rate limiter
// export const fileUpload = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 10, // Max 10 file uploads per hour
//   message: {
//     success: false,
//     message: 'Too many file uploads, please try again later.',
//     retryAfter: '1 hour'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   }
// });

// // API reporting rate limiter
// export const reporting = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 5, // Max 5 report generations per 5 minutes
//   message: {
//     success: false,
//     message: 'Too many report requests, please wait before generating another report.',
//     retryAfter: '5 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   },
//   skip: (req) => {
//     // Only apply to non-admin users
//     return req.user?.role === 'admin';
//   }
// });

// // SMS sending rate limiter (for admin operations)
// export const smsOperations = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 50, // Max 50 SMS operations per hour
//   message: {
//     success: false,
//     message: 'SMS sending limit reached, please try again later.',
//     retryAfter: '1 hour'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user?.userId || req.ip;
//   }
// });

// // Create a custom rate limiter factory
// export const createCustomRateLimit = (options) => {
//   const defaultOptions = {
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100,
//     message: {
//       success: false,
//       message: 'Rate limit exceeded, please try again later.'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     keyGenerator: (req) => req.user?.userId || req.ip
//   };

//   return rateLimit({ ...defaultOptions, ...options });
// };

// // Export all rate limiters as an object
// export const rateLimiter = {
//   general: generalRateLimit,
//   strict: strictRateLimit,
//   feedbackSubmission,
//   maintenanceSubmission,
//   loginAttempts,
//   otpRequests,
//   registration,
//   adminOperations,
//   fileUpload,
//   reporting,
//   smsOperations,
//   createCustom: createCustomRateLimit
// };

// // Middleware to add rate limit headers even when not rate limited
// export const addRateLimitHeaders = (req, res, next) => {
//   // Add custom headers for client-side handling
//   res.set({
//     'X-RateLimit-Service': 'Modula-API',
//     'X-RateLimit-Version': '1.0.0'
//   });
  
//   next();
// };

// // Middleware to log rate limit events
// export const logRateLimit = (req, res, next) => {
//   const originalSend = res.send;
  
//   res.send = function(body) {
//     // Check if this is a rate limit response
//     if (res.statusCode === 429) {
//       console.warn(`Rate limit exceeded for ${req.user?.userId || req.ip} on ${req.method} ${req.path}`, {
//         userId: req.user?.userId,
//         ip: req.ip,
//         method: req.method,
//         path: req.path,
//         userAgent: req.get('User-Agent'),
//         timestamp: new Date().toISOString()
//       });
//     }
    
//     return originalSend.call(this, body);
//   };
  
//   next();
// };

// export default rateLimiter;