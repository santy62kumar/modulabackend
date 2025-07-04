// // server/server.js
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';

// // Import routes
// import authRoutes from './routes/auth.js';
// import customerRoutes from './routes/customer.js';

// // Import middleware
// import { errorHandler } from './middleware/errorHandler.js';
// import { authMiddleware } from './middleware/auth.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Security middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://yourapp.com'] 
//     : ['http://localhost:3000'],
//   credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/customer', authMiddleware, customerRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Error handling
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
// });


// server/server.js - Updated Entry Point (ESM)

import {startServer} from './app.js';

/**
 * Server Entry Point
 * Starts the application with all Week 3 functionality
 */

async function main() {
  try {
    console.log('🌟 Modula Project Tracking System');
    console.log('📅 Week 3: Cron Job + Notification System');
    console.log('═'.repeat(50));
    
    // Start server with all services
    const server = await startServer();
    
    console.log('═'.repeat(50));
    console.log('🎉 System ready for operation!');
    console.log('📊 Features enabled:');
    console.log('   ✅ Customer Authentication (Week 1)');
    console.log('   ✅ Project Dashboard (Week 2)');
    console.log('   ✅ Automated Stage Tracking (Week 3)');
    console.log('   ✅ SMS Notifications (Week 3)');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
