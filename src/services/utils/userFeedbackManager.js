// server/src/services/utils/userFeedbackManager.js - NEW SERVICE
import { db } from '../../config/firebase.js';
import { normalizePhone } from './phoneUtils.js';

/**
 * Service to manage user feedback status flags
 * This centralizes all feedback flag operations
 */
class UserFeedbackManager {
  
  /**
   * Mark user as eligible for feedback
   * @param {string} phone - User phone number
   * @returns {Promise<boolean>} Success status
   */
  async markEligible(phone) {
    try {
      const normalizedPhone = normalizePhone(phone);
      const userDoc = await this.findUserByPhone(normalizedPhone);
      
      if (!userDoc) {
        console.log(`⚠️ No user found with phone ${normalizedPhone} to mark as eligible`);
        return false;
      }

      await userDoc.ref.update({
        'feedback_status.is_eligible': true
      });

      console.log(`✅ Marked user ${userDoc.id} as eligible for feedback`);
      return true;
      
    } catch (error) {
      console.error('❌ Error marking user as eligible:', error);
      return false;
    }
  }

  /**
   * Mark user as having submitted feedback
   * @param {string} userId - User ID
   * @param {string} feedbackId - Feedback document ID
   * @returns {Promise<boolean>} Success status
   */
  async markSubmitted(userId, feedbackId) {
    try {
      await db.collection('users').doc(userId).update({
        'feedback_status.is_submitted': true,
        'feedback_status.submitted_at': new Date(),
        'feedback_status.form_id': feedbackId
      });

      console.log(`✅ Marked user ${userId} as having submitted feedback`);
      return true;
      
    } catch (error) {
      console.error('❌ Error marking user as submitted:', error);
      return false;
    }
  }

  /**
   * Reset user's feedback submission status (for admin use)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async resetSubmission(userId) {
    try {
      await db.collection('users').doc(userId).update({
        'feedback_status.is_submitted': false,
        'feedback_status.submitted_at': null,
        'feedback_status.form_id': null
      });

      console.log(`✅ Reset feedback submission status for user ${userId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error resetting user submission status:', error);
      return false;
    }
  }

  /**
   * Get user's feedback status
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Feedback status or null
   */
  async getFeedbackStatus(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      return userData.feedback_status || {
        is_eligible: false,
        is_submitted: false,
        submitted_at: null,
        form_id: null
      };
      
    } catch (error) {
      console.error('❌ Error getting user feedback status:', error);
      return null;
    }
  }

  /**
   * Check if user can submit feedback
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Eligibility status
   */
  async canSubmitFeedback(userId) {
    try {
      const status = await this.getFeedbackStatus(userId);
      
      if (!status) {
        return {
          canSubmit: false,
          reason: 'User not found'
        };
      }

      if (!status.is_eligible) {
        return {
          canSubmit: false,
          reason: 'Not eligible yet - feedback will be available after installation'
        };
      }

      if (status.is_submitted) {
        return {
          canSubmit: false,
          reason: 'Feedback already submitted',
          submitted_at: status.submitted_at
        };
      }

      return {
        canSubmit: true,
        reason: 'Ready to submit feedback'
      };
      
    } catch (error) {
      console.error('❌ Error checking feedback submission eligibility:', error);
      return {
        canSubmit: false,
        reason: 'System error'
      };
    }
  }

  /**
   * Find user by phone number
   * @param {string} phone - Normalized phone number
   * @returns {Promise<DocumentSnapshot|null>} User document or null
   */
  async findUserByPhone(phone) {
    try {
      const userQuery = await db.collection('users').where('phone', '==', phone).get();
      
      if (userQuery.empty) {
        return null;
      }

      return userQuery.docs[0];
      
    } catch (error) {
      console.error('❌ Error finding user by phone:', error);
      return null;
    }
  }

  /**
   * Find user by leadId
   * @param {number} leadId - Odoo lead ID
   * @returns {Promise<DocumentSnapshot|null>} User document or null
   */
  async findUserByLeadId(leadId) {
    try {
      const userQuery = await db.collection('users').where('leadId', '==', leadId).get();
      
      if (userQuery.empty) {
        return null;
      }

      return userQuery.docs[0];
      
    } catch (error) {
      console.error('❌ Error finding user by leadId:', error);
      return null;
    }
  }

  /**
   * Bulk update feedback eligibility for multiple users
   * @param {Array<string>} phoneNumbers - Array of phone numbers
   * @param {boolean} isEligible - Eligibility status
   * @returns {Promise<Object>} Update results
   */
  async bulkUpdateEligibility(phoneNumbers, isEligible = true) {
    try {
      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const phone of phoneNumbers) {
        try {
          const success = await this.markEligible(phone);
          if (success) {
            results.successful++;
          } else {
            results.failed++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ phone, error: error.message });
        }
      }

      console.log(`✅ Bulk update completed: ${results.successful} successful, ${results.failed} failed`);
      return results;
      
    } catch (error) {
      console.error('❌ Error in bulk update:', error);
      throw error;
    }
  }

  /**
   * Get statistics about feedback status across all users
   * @returns {Promise<Object>} Feedback statistics
   */
  async getFeedbackStatistics() {
    try {
      const usersSnapshot = await db.collection('users').get();
      
      const stats = {
        total_users: 0,
        eligible_users: 0,
        submitted_users: 0,
        pending_users: 0,
        not_eligible_users: 0
      };

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const feedbackStatus = userData.feedback_status || {};
        
        stats.total_users++;
        
        if (feedbackStatus.is_eligible) {
          stats.eligible_users++;
          
          if (feedbackStatus.is_submitted) {
            stats.submitted_users++;
          } else {
            stats.pending_users++;
          }
        } else {
          stats.not_eligible_users++;
        }
      });

      return stats;
      
    } catch (error) {
      console.error('❌ Error getting feedback statistics:', error);
      throw error;
    }
  }

  /**
   * Get users who are eligible but haven't submitted feedback
   * @param {number} limit - Limit number of results
   * @returns {Promise<Array>} Users pending feedback submission
   */
  async getPendingFeedbackUsers(limit = 50) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('feedback_status.is_eligible', '==', true)
        .where('feedback_status.is_submitted', '==', false)
        .limit(limit)
        .get();

      const pendingUsers = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        pendingUsers.push({
          userId: doc.id,
          name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          leadId: userData.leadId,
          eligible_since: userData.feedback_status?.eligible_since || 'Unknown'
        });
      });

      return pendingUsers;
      
    } catch (error) {
      console.error('❌ Error getting pending feedback users:', error);
      throw error;
    }
  }
}

// Export singleton instance
const userFeedbackManager = new UserFeedbackManager();
export default userFeedbackManager;