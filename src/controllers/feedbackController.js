// // server/src/controllers/feedbackController.js
// import FeedbackService from '../services/business/feedbackService.js';

// class FeedbackController {
//   constructor() {
//     this.feedbackService = new FeedbackService();
//   }

//   async submitFeedback(req, res) {
//     try {
//       const { userId, leadId } = req.user; // From auth middleware
//       const feedbackData = req.body;

//       const result = await this.feedbackService.submitFeedback(userId, leadId, feedbackData);

//       res.status(201).json({
//         success: true,
//         message: result.message,
//         data: {
//           referenceId: result.feedback.referenceId,
//           submittedAt: result.feedback.submittedAt
//         }
//       });
//     } catch (error) {
//       console.error('Error in submitFeedback controller:', error);
      
//       if (error.message.includes('already been submitted')) {
//         return res.status(409).json({
//           success: false,
//           message: error.message
//         });
//       }
      
//       if (error.message.includes('Validation failed')) {
//         return res.status(400).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to submit feedback. Please try again.'
//       });
//     }
//   }

//   async getFeedbackStatus(req, res) {
//     try {
//       const { userId, leadId } = req.user; // From auth middleware

//       const result = await this.feedbackService.checkFeedbackExists(userId, leadId);

//       res.status(200).json({
//         success: true,
//         data: {
//           canSubmit: result.canSubmit,
//           hasSubmitted: result.exists
//         }
//       });
//     } catch (error) {
//       console.error('Error in getFeedbackStatus controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to check feedback status'
//       });
//     }
//   }

//   async getUserFeedbacks(req, res) {
//     try {
//       const { userId } = req.user; // From auth middleware

//       const result = await this.feedbackService.getFeedbackByUser(userId);

//       res.status(200).json({
//         success: true,
//         data: {
//           feedbacks: result.feedbacks,
//           count: result.count
//         }
//       });
//     } catch (error) {
//       console.error('Error in getUserFeedbacks controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve user feedbacks'
//       });
//     }
//   }

//   async getFeedbackById(req, res) {
//     try {
//       const { feedbackId } = req.params;
//       const { userId, role } = req.user; // From auth middleware

//       const result = await this.feedbackService.getFeedbackById(feedbackId);

//       // Check if user has permission to view this feedback
//       if (role !== 'admin' && result.feedback.userId !== userId) {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. You can only view your own feedback.'
//         });
//       }

//       res.status(200).json({
//         success: true,
//         data: {
//           feedback: result.feedback
//         }
//       });
//     } catch (error) {
//       console.error('Error in getFeedbackById controller:', error);
      
//       if (error.message.includes('not found')) {
//         return res.status(404).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feedback'
//       });
//     }
//   }

//   async getFeedbackByReference(req, res) {
//     try {
//       const { referenceId } = req.params;
//       const { userId, role } = req.user; // From auth middleware

//       const result = await this.feedbackService.getFeedbackByReference(referenceId);

//       // Check if user has permission to view this feedback
//       if (role !== 'admin' && result.feedback.userId !== userId) {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. You can only view your own feedback.'
//         });
//       }

//       res.status(200).json({
//         success: true,
//         data: {
//           feedback: result.feedback
//         }
//       });
//     } catch (error) {
//       console.error('Error in getFeedbackByReference controller:', error);
      
//       if (error.message.includes('not found')) {
//         return res.status(404).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feedback'
//       });
//     }
//   }

//   // Admin-only endpoints
//   async getAllFeedbacks(req, res) {
//     try {
//       const { role } = req.user; // From auth middleware
      
//       if (role !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. Admin privileges required.'
//         });
//       }

//       const filters = {
//         userId: req.query.userId,
//         leadId: req.query.leadId,
//         isSubmitted: req.query.isSubmitted !== undefined ? req.query.isSubmitted === 'true' : undefined,
//         dateFrom: req.query.dateFrom,
//         dateTo: req.query.dateTo
//       };

//       const pagination = {
//         limit: req.query.limit ? parseInt(req.query.limit) : 50
//       };

//       // Remove undefined values from filters
//       Object.keys(filters).forEach(key => {
//         if (filters[key] === undefined) delete filters[key];
//       });

//       const result = await this.feedbackService.getAllFeedbacks(filters, pagination);

//       res.status(200).json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Error in getAllFeedbacks controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feedbacks'
//       });
//     }
//   }

//   async getFeedbackStatistics(req, res) {
//     try {
//       const { role } = req.user; // From auth middleware
      
//       if (role !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. Admin privileges required.'
//         });
//       }

//       const result = await this.feedbackService.getFeedbackStatistics();

//       res.status(200).json({
//         success: true,
//         data: result.statistics
//       });
//     } catch (error) {
//       console.error('Error in getFeedbackStatistics controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feedback statistics'
//       });
//     }
//   }

//   async updateFeedbackStatus(req, res) {
//     try {
//       const { role } = req.user; // From auth middleware
      
//       if (role !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. Admin privileges required.'
//         });
//       }

//       const { feedbackId } = req.params;
//       const { status, notes } = req.body;

//       if (!status) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status is required'
//         });
//       }

//       const result = await this.feedbackService.updateFeedbackStatus(feedbackId, status, notes);

//       res.status(200).json({
//         success: true,
//         message: result.message,
//         data: {
//           feedback: result.feedback
//         }
//       });
//     } catch (error) {
//       console.error('Error in updateFeedbackStatus controller:', error);
      
//       if (error.message.includes('Invalid status') || error.message.includes('not found')) {
//         return res.status(400).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to update feedback status'
//       });
//     }
//   }

//   async generateFeedbackReport(req, res) {
//     try {
//       const { role } = req.user; // From auth middleware
      
//       if (role !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. Admin privileges required.'
//         });
//       }

//       const filters = {
//         dateFrom: req.query.dateFrom,
//         dateTo: req.query.dateTo,
//         userId: req.query.userId,
//         leadId: req.query.leadId
//       };

//       // Remove undefined values from filters
//       Object.keys(filters).forEach(key => {
//         if (filters[key] === undefined) delete filters[key];
//       });

//       const result = await this.feedbackService.generateFeedbackReport(filters);

//       res.status(200).json({
//         success: true,
//         data: result.report
//       });
//     } catch (error) {
//       console.error('Error in generateFeedbackReport controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to generate feedback report'
//       });
//     }
//   }

//   async getFeedbackTrends(req, res) {
//     try {
//       const { role } = req.user; // From auth middleware
      
//       if (role !== 'admin') {
//         return res.status(403).json({
//           success: false,
//           message: 'Access denied. Admin privileges required.'
//         });
//       }

//       const period = req.query.period || '30days';
//       const validPeriods = ['7days', '30days', '90days', '1year'];
      
//       if (!validPeriods.includes(period)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid period. Valid periods are: ' + validPeriods.join(', ')
//         });
//       }

//       const result = await this.feedbackService.getFeedbackTrends(period);

//       res.status(200).json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Error in getFeedbackTrends controller:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feedback trends'
//       });
//     }
//   }

//   async deleteFeedback(req, res) {
//     try {
//       const { feedbackId } = req.params;
//       const { userId, role } = req.user; // From auth middleware

//       // Only allow admin or user who owns the feedback to delete
//       const userIdToCheck = role === 'admin' ? null : userId;

//       const result = await this.feedbackService.deleteFeedback(feedbackId, userIdToCheck);

//       res.status(200).json({
//         success: true,
//         message: result.message
//       });
//     } catch (error) {
//       console.error('Error in deleteFeedback controller:', error);
      
//       if (error.message.includes('not found')) {
//         return res.status(404).json({
//           success: false,
//           message: error.message
//         });
//       }

//       if (error.message.includes('Unauthorized')) {
//         return res.status(403).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete feedback'
//       });
//     }
//   }
// }

// export default FeedbackController;