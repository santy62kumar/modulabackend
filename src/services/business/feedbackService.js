// // server/src/services/business/feedbackService.js
// import FeedbackRepository from '../data/feedbackRepository.js';
// import { validateFeedbackSubmission, sanitizeFeedbackData } from '../../validators/feedbackValidator.js';
// import sendSMS  from '../external/twilio/smsService.js';

// class FeedbackService {
//   constructor() {
//     this.feedbackRepo = new FeedbackRepository();
//   }

//   async submitFeedback(userId, leadId, feedbackData) {
//     try {
//       // Check if user has already submitted feedback for this lead
//       const existingFeedback = await this.feedbackRepo.checkExistingFeedback(userId, leadId);
//       if (existingFeedback) {
//         throw new Error('Feedback has already been submitted for this project');
//       }

//       // Sanitize input data
//       const sanitizedData = sanitizeFeedbackData(feedbackData);
      
//       // Validate feedback data
//       const validation = validateFeedbackSubmission(sanitizedData);
//       if (!validation.isValid) {
//         throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
//       }

//       // Create feedback with user and lead information
//       const feedbackToCreate = {
//         ...sanitizedData,
//         userId,
//         leadId,
//         submittedAt: new Date(),
//         isSubmitted: true
//       };

//       // Save feedback to database
//       const savedFeedback = await this.feedbackRepo.create(feedbackToCreate);

//       // Send SMS confirmation
//       await this.sendFeedbackConfirmationSMS(savedFeedback);

//       return {
//         success: true,
//         feedback: savedFeedback,
//         message: 'Feedback submitted successfully'
//       };
//     } catch (error) {
//       console.error('Error in submitFeedback:', error);
//       throw error;
//     }
//   }

//   async getFeedbackByUser(userId) {
//     try {
//       const feedbacks = await this.feedbackRepo.findByUserId(userId);
//       return {
//         success: true,
//         feedbacks,
//         count: feedbacks.length
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackByUser:', error);
//       throw error;
//     }
//   }

//   async getFeedbackByLead(leadId) {
//     try {
//       const feedbacks = await this.feedbackRepo.findByLeadId(leadId);
//       return {
//         success: true,
//         feedbacks,
//         count: feedbacks.length
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackByLead:', error);
//       throw error;
//     }
//   }

//   async getFeedbackById(feedbackId) {
//     try {
//       const feedback = await this.feedbackRepo.findById(feedbackId);
//       if (!feedback) {
//         throw new Error('Feedback not found');
//       }

//       return {
//         success: true,
//         feedback
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackById:', error);
//       throw error;
//     }
//   }

//   async checkFeedbackExists(userId, leadId) {
//     try {
//       const exists = await this.feedbackRepo.checkExistingFeedback(userId, leadId);
//       return {
//         success: true,
//         exists,
//         canSubmit: !exists
//       };
//     } catch (error) {
//       console.error('Error in checkFeedbackExists:', error);
//       throw error;
//     }
//   }

//   async getAllFeedbacks(filters = {}, pagination = {}) {
//     try {
//       const result = await this.feedbackRepo.findAll(filters, pagination);
//       return {
//         success: true,
//         ...result
//       };
//     } catch (error) {
//       console.error('Error in getAllFeedbacks:', error);
//       throw error;
//     }
//   }

//   async getFeedbackStatistics() {
//     try {
//       const stats = await this.feedbackRepo.getStatistics();
//       return {
//         success: true,
//         statistics: stats
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackStatistics:', error);
//       throw error;
//     }
//   }

//   async getFeedbackByReference(referenceId) {
//     try {
//       const feedback = await this.feedbackRepo.findByReferenceId(referenceId);
//       if (!feedback) {
//         throw new Error('Feedback not found with this reference ID');
//       }

//       return {
//         success: true,
//         feedback
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackByReference:', error);
//       throw error;
//     }
//   }

//   async updateFeedbackStatus(feedbackId, status, notes = '') {
//     try {
//       const validStatuses = ['submitted', 'reviewed', 'processed'];
//       if (!validStatuses.includes(status)) {
//         throw new Error('Invalid status');
//       }

//       const updatedFeedback = await this.feedbackRepo.update(feedbackId, {
//         status,
//         notes,
//         processedAt: status === 'processed' ? new Date() : null
//       });

//       return {
//         success: true,
//         feedback: updatedFeedback,
//         message: 'Feedback status updated successfully'
//       };
//     } catch (error) {
//       console.error('Error in updateFeedbackStatus:', error);
//       throw error;
//     }
//   }

//   async sendFeedbackConfirmationSMS(feedback) {
//     try {
//       const message = `Hi ${feedback.customerName},

// Thank you for your valuable feedback! Your feedback has been submitted successfully.

// Reference ID: ${feedback.referenceId}
// Submitted: ${new Date(feedback.submittedAt).toLocaleDateString()}

// Our team will review your feedback and take necessary actions. We appreciate your time and trust in Modula.

// – Team Modula`;

//       await sendSMS(feedback.contactNumber, message);
      
//       console.log(`Feedback confirmation SMS sent to ${feedback.contactNumber}`);
//     } catch (error) {
//       console.error('Error sending feedback confirmation SMS:', error);
//       // Don't throw error as feedback submission should not fail due to SMS issues
//     }
//   }

//   async generateFeedbackReport(filters = {}) {
//     try {
//       const { feedbacks } = await this.feedbackRepo.findAll(filters);
//       const statistics = await this.feedbackRepo.getStatistics();

//       const report = {
//         generatedAt: new Date(),
//         filters,
//         summary: {
//           totalFeedbacks: feedbacks.length,
//           averageOverallRating: statistics.averageRatings.overallExperience,
//           recommendationRate: statistics.recommendationPercentage.Yes
//         },
//         feedbacks: feedbacks.map(feedback => ({
//           referenceId: feedback.referenceId,
//           customerName: feedback.customerName,
//           submittedAt: feedback.submittedAt,
//           overallRating: feedback.ratings.overallExperience,
//           wouldRecommend: feedback.wouldRecommend,
//           likedMost: feedback.likedMost.substring(0, 100) + (feedback.likedMost.length > 100 ? '...' : ''),
//           improvements: feedback.improvements.substring(0, 100) + (feedback.improvements.length > 100 ? '...' : '')
//         })),
//         statistics
//       };

//       return {
//         success: true,
//         report
//       };
//     } catch (error) {
//       console.error('Error in generateFeedbackReport:', error);
//       throw error;
//     }
//   }

//   async deleteFeedback(feedbackId, userId = null) {
//     try {
//       const feedback = await this.feedbackRepo.findById(feedbackId);
//       if (!feedback) {
//         throw new Error('Feedback not found');
//       }

//       // If userId is provided, ensure user owns the feedback
//       if (userId && feedback.userId !== userId) {
//         throw new Error('Unauthorized: You can only delete your own feedback');
//       }

//       await this.feedbackRepo.delete(feedbackId);

//       return {
//         success: true,
//         message: 'Feedback deleted successfully'
//       };
//     } catch (error) {
//       console.error('Error in deleteFeedback:', error);
//       throw error;
//     }
//   }

//   async getFeedbackTrends(period = '30days') {
//     try {
//       const endDate = new Date();
//       let startDate = new Date();

//       switch (period) {
//         case '7days':
//           startDate.setDate(endDate.getDate() - 7);
//           break;
//         case '30days':
//           startDate.setDate(endDate.getDate() - 30);
//           break;
//         case '90days':
//           startDate.setDate(endDate.getDate() - 90);
//           break;
//         case '1year':
//           startDate.setFullYear(endDate.getFullYear() - 1);
//           break;
//         default:
//           startDate.setDate(endDate.getDate() - 30);
//       }

//       const { feedbacks } = await this.feedbackRepo.findAll({
//         dateFrom: startDate,
//         dateTo: endDate
//       });

//       // Group feedbacks by date
//       const trends = {};
//       feedbacks.forEach(feedback => {
//         const date = new Date(feedback.submittedAt).toISOString().split('T')[0];
//         if (!trends[date]) {
//           trends[date] = {
//             count: 0,
//             totalRatings: {
//               installationBehavior: 0,
//               punctuality: 0,
//               cleanliness: 0,
//               installationQuality: 0,
//               productQuality: 0,
//               deliveryExperience: 0,
//               communication: 0,
//               overallExperience: 0
//             },
//             recommendations: { Yes: 0, No: 0, Maybe: 0 }
//           };
//         }

//         trends[date].count++;
//         Object.keys(trends[date].totalRatings).forEach(key => {
//           trends[date].totalRatings[key] += feedback.ratings[key] || 0;
//         });

//         if (trends[date].recommendations.hasOwnProperty(feedback.wouldRecommend)) {
//           trends[date].recommendations[feedback.wouldRecommend]++;
//         }
//       });

//       // Calculate daily averages
//       Object.keys(trends).forEach(date => {
//         const dayData = trends[date];
//         if (dayData.count > 0) {
//           Object.keys(dayData.totalRatings).forEach(key => {
//             dayData.totalRatings[key] = (dayData.totalRatings[key] / dayData.count).toFixed(2);
//           });
//         }
//       });

//       return {
//         success: true,
//         period,
//         startDate,
//         endDate,
//         trends,
//         totalFeedbacks: feedbacks.length
//       };
//     } catch (error) {
//       console.error('Error in getFeedbackTrends:', error);
//       throw error;
//     }
//   }
// }

// export default FeedbackService;