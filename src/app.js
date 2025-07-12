// server/src/app.js - ESM Version

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import 'dotenv/config';
import dotenv from 'dotenv';

// Import configurations
import firebaseConfig from './config/firebase.js';
import cronJobsManager from './jobs/cronJobs.js';

// Import routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
//import dashboardRoutes from './routes/dashboard.js';
//import trackingRoutes from './routes/tracking.js'; // NEW: Week 3 routes
//import healthRoutes from './routes/health.js';
import feedbackRoutes from './routes/feedback.js';
import maintenanceRoutes from './routes/maintenance.js';
// Import middleware
import {errorHandler} from './middleware/errorHandler.js';
//import { requestLogger } from './middleware/logging.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiter, addRateLimitHeaders, logRateLimit } from './middleware/rateLimiter.js';
import { sanitizeRequestBody } from './middleware/validation.js';


/**
 * Express App Configuration with Week 3 Integration
 */

dotenv.config();
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Request logging
//app.use(requestLogger);

// Health check endpoint (before auth)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', authMiddleware, customerRoutes);
// app.use('/api/customer', customerRoutes);
//app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/tracking', trackingRoutes); // NEW: Week 3 tracking routes
// //app.use('/api/health', healthRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/maintenance', maintenanceRoutes);
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

/**
 * Start server with cron jobs
 * @param {number} port - Port number
 */
export function startServer(port = process.env.PORT || 5000) {
  return new Promise((resolve, reject) => {
    try {
      // Test Firebase connection before starting
      firebaseConfig.checkConnection()
        .then(connected => {
          if (!connected) {
            throw new Error('Firebase connection failed');
          }

          // Start HTTP server
          const server = app.listen(port, () => {
            console.log('🚀 Server started successfully');
            console.log(`📡 Server running on port ${port}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            
            // Start cron jobs after server is ready
            console.log('🔄 Starting background jobs...');
            cronJobsManager.startAll();
            
            console.log('✅ Application fully initialized');
            resolve(server);
          });

          // Graceful shutdown handlers
          setupGracefulShutdown(server);
          
        })
        .catch(error => {
          console.error('❌ Failed to start server:', error);
          reject(error);
        });
        
    } catch (error) {
      console.error('❌ Server startup error:', error);
      reject(error);
    }
  });
}

/**
 * Setup graceful shutdown handlers
 * @param {Server} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    console.log(`\n🔄 Received ${signal}, starting graceful shutdown...`);
    
    try {
      // Stop accepting new requests
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        // Stop cron jobs gracefully
        await cronJobsManager.gracefulShutdown();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.log('⚠️ Forcing shutdown after timeout');
        process.exit(1);
      }, 30000);
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
}

/**
 * Get application status
 * @returns {Object} Application status
 */
// export function getAppStatus() {
//   return {
//     server: 'running',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     cron_jobs: cronJobsManager.getStatus(),
//     environment: process.env.NODE_ENV || 'development'
//   };
// }

export function getAppStatus() {
  return {
    server: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    modules: {
      auth: 'active',
      tracking: 'active',
      feedback: 'active',
      maintenance: 'active',
      notifications: 'active'
    },
    cron_jobs: cronJobsManager.getStatus(),
    environment: process.env.NODE_ENV || 'development'
  };
}

export { app };

// // server/src/app.js
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import dotenv from 'dotenv';

// // Import middleware
// import { errorHandler } from './middleware/errorHandler.js';
// import { authMiddleware } from './middleware/auth.js';
// import { rateLimiter, addRateLimitHeaders, logRateLimit } from './middleware/rateLimiter.js';
// import { sanitizeRequestBody } from './middleware/validation.js';

// // Import configurations
// //import cronJobsManager from './jobs/cronJobs.js';
// // Import routes
// import authRoutes from './routes/auth.js';
// import customerRoutes from './routes/customer.js';
// //import dashboardRoutes from './routes/dashboard.js';
// import feedbackRoutes from './routes/feedback.js';
// import maintenanceRoutes from './routes/maintenance.js';
// //import healthRoutes from './routes/health.js';

// // Load environment variables
// dotenv.config();

// const app = express();

// // Security middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   },
//   crossOriginEmbedderPolicy: false
// }));

// // CORS configuration
// const corsOptions = {
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://your-production-domain.com'] // Replace with your actual domain
//     : ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   maxAge: 86400 // 24 hours
// };

// app.use(cors(corsOptions));

// // Request logging
// if (process.env.NODE_ENV !== 'test') {
//   app.use(morgan('combined'));
// }

// // Body parsing middleware
// app.use(express.json({ 
//   limit: '10mb',
//   verify: (req, res, buf) => {
//     try {
//       JSON.parse(buf);
//     } catch (e) {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid JSON format'
//       });
//       throw new Error('Invalid JSON');
//     }
//   }
// }));

// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: '10mb' 
// }));

// // Rate limiting and security middleware
// app.use(addRateLimitHeaders);
// app.use(logRateLimit);
// app.use(rateLimiter.general);

// // Request sanitization
// app.use(sanitizeRequestBody);

// // Health check route (before authentication)
// app.use('/api/health', healthRoutes);

// // API routes
// app.use('/api/auth', rateLimiter.loginAttempts, authRoutes);
// app.use('/api/customer', authMiddleware, customerRoutes);
// //app.use('/api/dashboard', authMiddleware, dashboardRoutes);
// app.use('/api/feedback', feedbackRoutes); // Authentication is handled within the route
// app.use('/api/maintenance', maintenanceRoutes); // Authentication is handled within the route

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Modula API Server',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // API documentation endpoint
// app.get('/api', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Modula API Documentation',
//     version: '1.0.0',
//     endpoints: {
//       auth: {
//         'POST /api/auth/register': 'Register a new customer',
//         'POST /api/auth/send-otp': 'Send OTP for login',
//         'POST /api/auth/verify-otp': 'Verify OTP and login',
//         'POST /api/auth/logout': 'Logout user',
//         'GET /api/auth/me': 'Get current user info'
//       },
//       customer: {
//         'GET /api/customer/profile': 'Get customer profile',
//         'PUT /api/customer/profile': 'Update customer profile'
//       },
//       dashboard: {
//         'GET /api/dashboard': 'Get customer dashboard data',
//         'GET /api/dashboard/project-status': 'Get project status'
//       },
//       feedback: {
//         'POST /api/feedback/submit': 'Submit customer feedback',
//         'GET /api/feedback/status': 'Check feedback submission status',
//         'GET /api/feedback/my-feedbacks': 'Get user feedbacks',
//         'GET /api/feedback/:feedbackId': 'Get feedback by ID',
//         'GET /api/feedback/reference/:referenceId': 'Get feedback by reference ID',
//         'DELETE /api/feedback/:feedbackId': 'Delete feedback',
//         // 'GET /api/feedback/admin/all': 'Get all feedbacks (Admin only)',
//         // 'GET /api/feedback/admin/statistics': 'Get feedback statistics (Admin only)',
//         // 'GET /api/feedback/admin/trends': 'Get feedback trends (Admin only)',
//         // 'GET /api/feedback/admin/report': 'Generate feedback report (Admin only)',
//         // 'PATCH /api/feedback/admin/:feedbackId/status': 'Update feedback status (Admin only)'
//       },
//       maintenance: {
//         'POST /api/maintenance/submit': 'Submit maintenance request',
//         'GET /api/maintenance/my-requests': 'Get user maintenance requests',
//         'GET /api/maintenance/:requestId': 'Get maintenance request by ID',
//         'GET /api/maintenance/reference/:referenceId': 'Get maintenance request by reference ID',
//         'PATCH /api/maintenance/:requestId/status': 'Update request status',
//         'DELETE /api/maintenance/:requestId': 'Delete maintenance request',
//         // 'GET /api/maintenance/admin/all': 'Get all maintenance requests (Admin only)',
//         // 'GET /api/maintenance/admin/status/:status': 'Get requests by status (Admin only)',
//         // 'GET /api/maintenance/admin/pending': 'Get pending requests (Admin only)',
//         // 'GET /api/maintenance/admin/overdue': 'Get overdue requests (Admin only)',
//         // 'GET /api/maintenance/admin/statistics': 'Get maintenance statistics (Admin only)',
//         // 'GET /api/maintenance/admin/report': 'Generate maintenance report (Admin only)',
//         // 'POST /api/maintenance/admin/:requestId/assign-team': 'Assign team to request (Admin only)'
//       },
//       health: {
//         'GET /api/health': 'Health check endpoint',
//         'GET /api/health/detailed': 'Detailed health check'
//       }
//     },
//     authentication: {
//       type: 'JWT Bearer Token',
//       header: 'Authorization: Bearer <token>',
//       note: 'Include the JWT token in the Authorization header for protected routes'
//     },
//     rateLimit: {
//       general: '100 requests per 15 minutes',
//       feedback: '1 submission per 10 minutes',
//       maintenance: '3 submissions per 24 hours',
//       login: '5 attempts per 15 minutes',
//       otp: '3 requests per 5 minutes'
//     }
//   });
// });

// // 404 handler for API routes
// app.use('/api/*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found',
//     path: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });
// });

// // Global error handler (must be last)
// app.use(errorHandler);

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Promise Rejection:', err);
//   // Don't exit in production, just log the error
//   if (process.env.NODE_ENV !== 'production') {
//     process.exit(1);
//   }
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err);
//   // Exit gracefully
//   process.exit(1);
// });

// // Graceful shutdown
// const gracefulShutdown = (signal) => {
//   console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
//   // Close server
//   const server = app.listen();
//   server.close(() => {
//     console.log('HTTP server closed.');
    
//     // Close database connections, cleanup resources, etc.
//     // Add any cleanup logic here
    
//     process.exit(0);
//   });
  
//   // Force close after 10 seconds
//   setTimeout(() => {
//     console.error('Could not close connections in time, forcefully shutting down');
//     process.exit(1);
//   }, 10000);
// };

// // Listen for termination signals
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// export default app;