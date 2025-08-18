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

// // router.get(
// //   '/reference/:referenceId',
// //   feedbackController.getFeedbackByReference.bind(feedbackController)
// // );

// // router.delete(
// //   '/:feedbackId',
// //   feedbackController.deleteFeedback.bind(feedbackController)
// // );

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

// server/src/routes/feedback.js 
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import FeedbackController from '../controllers/feedbackController.js';

const router = express.Router();
const feedbackController = new FeedbackController();

// ✅ Public route - no auth needed for basic info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'Feedback API Information',
    endpoints: {
      'GET /api/feedback/eligibility': 'Check if user is eligible for feedback',
      'GET /api/feedback/status': 'Get user feedback status',
      'POST /api/feedback/submit': 'Submit feedback form',
      'GET /api/feedback/my-feedbacks': 'Get user feedbacks',
      'GET /api/feedback/:feedbackId': 'Get feedback by ID',
      'GET /api/feedback/reference/:referenceId': 'Get feedback by reference ID'
    },
    note: 'All endpoints except /info require authentication'
  });
});

// ✅ NEW: Check feedback eligibility using boolean flags
router.get('/eligibility', authMiddleware, feedbackController.checkFeedbackEligibility.bind(feedbackController));

// ✅ ENHANCED: Get feedback status using boolean flags
router.get('/status', authMiddleware, feedbackController.getFeedbackStatus.bind(feedbackController));

// ✅ ENHANCED: Submit feedback (no leadId required in token anymore)
router.post('/submit', authMiddleware, feedbackController.submitFeedback.bind(feedbackController));

// ✅ Get user's feedbacks
router.get('/my-feedbacks', authMiddleware, feedbackController.getUserFeedbacks.bind(feedbackController));

// ✅ Get feedback by ID
router.get('/:feedbackId', authMiddleware, feedbackController.getFeedbackById.bind(feedbackController));

// ✅ Get feedback by reference ID
router.get('/reference/:referenceId', authMiddleware, feedbackController.getFeedbackByReference.bind(feedbackController));

// ✅ NEW: Internal route for cron job to mark users eligible
router.post('/internal/mark-eligible', feedbackController.markUserEligibleForFeedback.bind(feedbackController));


export default router;