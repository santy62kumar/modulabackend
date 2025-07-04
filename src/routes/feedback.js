// // server/src/routes/feedback.js
// import express from 'express';
// import FeedbackController from '../controllers/feedbackController.js';
// import {authMiddleware}  from '../middleware/auth.js';
// import { validateRequest } from '../middleware/validation.js';
// import { rateLimiter } from '../middleware/rateLimiter.js';

// const router = express.Router();
// const feedbackController = new FeedbackController();

// // Apply authentication middleware to all feedback routes
// router.use(authMiddleware);

// // Customer routes
// router.post(
//   '/submit',
//   rateLimiter.feedbackSubmission, // Rate limit: 1 submission per 10 minutes
//   validateRequest('feedback'),
//   feedbackController.submitFeedback.bind(feedbackController)
// );

// router.get(
//   '/status',
//   feedbackController.getFeedbackStatus.bind(feedbackController)
// );

// router.get(
//   '/my-feedbacks',
//   feedbackController.getUserFeedbacks.bind(feedbackController)
// );

// router.get(
//   '/:feedbackId',
//   feedbackController.getFeedbackById.bind(feedbackController)
// );

// router.get(
//   '/reference/:referenceId',
//   feedbackController.getFeedbackByReference.bind(feedbackController)
// );

// router.delete(
//   '/:feedbackId',
//   feedbackController.deleteFeedback.bind(feedbackController)
// );

// // // Admin routes
// // router.get(
// //   '/admin/all',
// //   feedbackController.getAllFeedbacks.bind(feedbackController)
// // );

// // router.get(
// //   '/admin/statistics',
// //   feedbackController.getFeedbackStatistics.bind(feedbackController)
// // );

// // router.get(
// //   '/admin/trends',
// //   feedbackController.getFeedbackTrends.bind(feedbackController)
// // );

// // router.get(
// //   '/admin/report',
// //   feedbackController.generateFeedbackReport.bind(feedbackController)
// // );

// // router.patch(
// //   '/admin/:feedbackId/status',
// //   validateRequest('feedbackStatusUpdate'),
// //   feedbackController.updateFeedbackStatus.bind(feedbackController)
// // );

// export default router;