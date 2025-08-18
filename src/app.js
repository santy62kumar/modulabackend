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
import feedbackRoutes from './routes/feedback.js';
import maintenanceRoutes from './routes/maintenance.js';
// Import middleware
import {errorHandler} from './middleware/errorHandler.js';
//import { requestLogger } from './middleware/logging.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiter, addRateLimitHeaders, logRateLimit } from './middleware/rateLimiter.js';
import { sanitizeRequestBody } from './middleware/validation.js';



dotenv.config();
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

