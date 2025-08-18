

// server/src/controllers/feedbackController.js - ENHANCED VERSION
import FeedbackService from '../services/business/feedbackService.js';

class FeedbackController {
  constructor() {
    this.feedbackService = new FeedbackService();
  }

  // ✅ ENHANCED: Submit feedback using stored leadId from user document
  async submitFeedback(req, res) {
    try {
      const { userId } = req.user; // From auth middleware
      const feedbackData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId in request.'
        });
      }

      // ✅ Get leadId from user document instead of token
      const { db } = await import('../config/firebase.js');
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const userData = userDoc.data();
      const leadId = userData.leadId;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: 'No project found for your account. Contact support if this is an error.'
        });
      }

      const result = await this.feedbackService.submitFeedback(userId, leadId, feedbackData);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          referenceId: result.feedback.referenceId,
          submittedAt: result.feedback.submittedAt
        }
      });
    } catch (error) {
      console.error('Error in submitFeedback controller:', error);

      if (error.message.includes('not available yet')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('already been submitted')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback. Please try again.'
      });
    }
  }

  // ✅ NEW: Check feedback eligibility using boolean flags
  async checkFeedbackEligibility(req, res) {
    try {
      const { userId } = req.user;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId in request.'
        });
      }

      const result = await this.feedbackService.checkFeedbackEligibility(userId);

      res.status(200).json({
        success: true,
        data: {
          eligible: result.eligible,
          submitted: result.submitted,
          submitted_at: result.submitted_at,
          message: result.message
        }
      });
    } catch (error) {
      console.error('Error in checkFeedbackEligibility controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feedback eligibility'
      });
    }
  }

  // ✅ ENHANCED: Get feedback status using boolean flags
  async getFeedbackStatus(req, res) {
    try {
      const { userId } = req.user;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId in request.'
        });
      }

      const result = await this.feedbackService.getUserFeedbackStatus(userId);

      res.status(200).json({
        success: true,
        data: {
          status: result.status,
          feedback: result.feedback,
          message: result.message,
          canSubmit: result.status.is_eligible && !result.status.is_submitted,
          hasSubmitted: result.status.is_submitted
        }
      });
    } catch (error) {
      console.error('Error in getFeedbackStatus controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feedback status'
      });
    }
  }

  // ✅ ENHANCED: Get user feedbacks
  async getUserFeedbacks(req, res) {
    try {
      const { userId } = req.user;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId in request.'
        });
      }

      const result = await this.feedbackService.getFeedbackByUser(userId);

      res.status(200).json({
        success: true,
        data: {
          feedbacks: result.feedbacks,
          count: result.count
        }
      });
    } catch (error) {
      console.error('Error in getUserFeedbacks controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user feedbacks'
      });
    }
  }

  async getFeedbackById(req, res) {
    try {
      const { feedbackId } = req.params;
      const { userId, role } = req.user;

      const result = await this.feedbackService.getFeedbackById(feedbackId);

      // Check if user has permission to view this feedback
      if (role !== 'admin' && result.feedback.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own feedback.'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          feedback: result.feedback
        }
      });
    } catch (error) {
      console.error('Error in getFeedbackById controller:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve feedback'
      });
    }
  }

  async getFeedbackByReference(req, res) {
    try {
      const { referenceId } = req.params;
      const { userId, role } = req.user;

      const result = await this.feedbackService.getFeedbackByReference(referenceId);

      // Check if user has permission to view this feedback
      if (role !== 'admin' && result.feedback.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own feedback.'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          feedback: result.feedback
        }
      });
    } catch (error) {
      console.error('Error in getFeedbackByReference controller:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve feedback'
      });
    }
  }

  // Admin-only endpoints would go here but are commented out as per your original file
  // ...

  // ✅ NEW: Endpoint for cron job to mark users eligible for feedback
  async markUserEligibleForFeedback(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const result = await this.feedbackService.markUserEligibleForFeedback(userId);

      res.status(200).json({
        success: true,
        message: 'User marked as eligible for feedback successfully'
      });
    } catch (error) {
      console.error('Error in markUserEligibleForFeedback controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark user as eligible for feedback'
      });
    }
  }
}

export default FeedbackController;