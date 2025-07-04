// server/src/services/business/notificationService.js

import smsService from '../external/twilio/smsService.js';
import firestoreService from '../external/firebase/firestore.js';
import { 
  getNotificationTemplate, 
  shouldSendNotification 
} from '../../constants/notificationTemplates.js';
import { getAllCustomStages } from '../../constants/stageMapping.js';
/**
 * Notification Service
 * Handles business logic for sending notifications
 */

class NotificationService {
  
  /**
   * Process stage change and send notifications if needed
   * @param {Object} projectData - Project data
   * @param {number} newStageId - New Odoo stage ID
   * @param {string} customerName - Customer name
   * @returns {Promise<Object>} Processing result
   */
  // async processStageChange(projectData, newStageId, customerName) {
  //   try {
  //     const result = {
  //       notifications_sent: [],
  //       errors: []
  //     };

  //     // Get custom stages for the new stage ID
  //     const customStages = getAllCustomStages(newStageId);
      
  //     // Check each category for notifications
  //     for (const [category, newStage] of Object.entries(customStages)) {
  //       if (!newStage) continue; // Skip if no stage for this category
        
  //       const shouldNotify = await this.shouldSendCategoryNotification(
  //         projectData, 
  //         category, 
  //         newStage, 
  //         newStageId
  //       );
        
  //       if (shouldNotify) {
  //         const notificationResult = await this.sendCategoryNotification(
  //           projectData,
  //           category,
  //           newStage,
  //           newStageId,
  //           customerName
  //         );
          
  //         if (notificationResult.success) {
  //           result.notifications_sent.push(notificationResult);
  //         } else {
  //           result.errors.push(notificationResult);
  //         }
  //       }
  //     }

  //     return result;
      
  //   } catch (error) {
  //     console.error('❌ Error processing stage change:', error);
  //     throw error;
  //   }
  // }

  async processStageChange(projectData, newStageId, customerName) {
    try {
      console.log(`🔔 Processing notifications for stage ${newStageId} (Customer: ${customerName})`);
      
      const result = {
        notifications_sent: [],
        errors: []
      };

      // Get custom stages for the new stage ID
      const customStages = getAllCustomStages(newStageId);
      console.log(`📋 Custom stages for ${newStageId}:`, customStages);
      
      // Check each category for notifications
      for (const [category, newStage] of Object.entries(customStages)) {
        if (!newStage) {
          console.log(`⚠️ No ${category} stage for stage_id ${newStageId}`);
          continue; // Skip if no stage for this category
        }
        
        console.log(`🔍 Checking ${category} notification for stage: ${newStage}`);
        
        const shouldNotify = await this.shouldSendCategoryNotification(
          projectData, 
          category, 
          newStage, 
          newStageId
        );
        
        console.log(`📊 Should send ${category} notification: ${shouldNotify}`);
        
        if (shouldNotify) {
          console.log(`📱 Sending ${category} notification for stage: ${newStage}`);
          
          const notificationResult = await this.sendCategoryNotification(
            projectData,
            category,
            newStage,
            newStageId,
            customerName
          );
          
          if (notificationResult.success) {
            result.notifications_sent.push(notificationResult);
            console.log(`✅ ${category} notification sent successfully`);
          } else {
            result.errors.push(notificationResult);
            console.error(`❌ ${category} notification failed:`, notificationResult.error);
          }
        }
      }

      console.log(`📈 Notification summary: ${result.notifications_sent.length} sent, ${result.errors.length} errors`);
      return result;
      
    } catch (error) {
      console.error('❌ Error processing stage change:', error);
      throw error;
    }
  }
  /**
   * Check if notification should be sent for a category
   * @param {Object} projectData - Project data
   * @param {string} category - Notification category
   * @param {string} newStage - New stage name
   * @param {number} newStageId - New stage ID
   * @returns {Promise<boolean>} Should send notification
   */
  async shouldSendCategoryNotification(projectData, category, newStage, newStageId) {
    try {
      // Check if template exists for this stage
      if (!shouldSendNotification(category, newStage)) {
        return false;
      }

      // Get notification history for this category
      const categoryKey = `${category}_stages`;
      const notificationHistory = projectData.notifications_sent?.[categoryKey] || {};
      
      // Check if already sent for this stage
      if (notificationHistory[newStage]?.sent) {
        console.log(`⚠️ Notification already sent for ${category}:${newStage}`);
        return false;
      }

      // Determine previous stage for this category
      const previousStage = this.getPreviousStageForCategory(
        projectData.stage_history || [], 
        category
      );

      // Only send if stage actually changed for this category
      if (previousStage === newStage) {
        console.log(`⚠️ Stage ${category}:${newStage} unchanged, skipping notification`);
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error checking notification requirement:', error);
      return false;
    }
  }

  /**
   * Send notification for a specific category
   * @param {Object} projectData - Project data
   * @param {string} category - Notification category
   * @param {string} stage - Stage name
   * @param {number} stageId - Stage ID
   * @param {string} customerName - Customer name
   * @returns {Promise<Object>} Notification result
   */
  async sendCategoryNotification(projectData, category, stage, stageId, customerName) {
    try {
      const template = getNotificationTemplate(category, stage);
      
      if (!template) {
        return {
          success: false,
          error: 'No template found',
          category,
          stage
        };
      }

      // Send SMS
      const smsResult = await smsService.sendStageNotification(
        projectData.phone,
        customerName,
        template
      );

      // Log notification attempt
      await this.logNotificationAttempt({
        phone: projectData.phone,
        odoo_lead_id: projectData.odoo_lead_id,
        notification_type: `${category}_stage`,
        custom_stage: stage,
        triggered_by_stage_id: stageId,
        message_template: template,
        message_content: smsResult.message || '',
        sms_status: smsResult.success ? 'sent' : 'failed',
        sms_sid: smsResult.sid || null,
        error_message: smsResult.error || null,
        delivery_timestamp: smsResult.success ? new Date() : null
      });

      // Update notification status in project
      if (smsResult.success) {
        await firestoreService.updateNotificationStatus(
          projectData.id,
          category,
          stage,
          {
            sent: true,
            timestamp: new Date(),
            triggered_by_stage: stageId,
            sms_sid: smsResult.sid
          }
        );
      }

      return {
        success: smsResult.success,
        category,
        stage,
        sms_sid: smsResult.sid,
        error: smsResult.error
      };
      
    } catch (error) {
      console.error(`❌ Error sending ${category} notification:`, error);
      return {
        success: false,
        category,
        stage,
        error: error.message
      };
    }
  }

  /**
   * Get previous stage for a category from stage history
   * @param {Array} stageHistory - Stage history array
   * @param {string} category - Category to check
   * @returns {string|null} Previous stage name
   */
  getPreviousStageForCategory(stageHistory, category) {
    // Find the last entry for this category (excluding the current one)
    for (let i = stageHistory.length - 2; i >= 0; i--) {
      const historyEntry = stageHistory[i];
      const customStages = getAllCustomStages(historyEntry.stage_id);
      
      if (customStages[category]) {
        return customStages[category];
      }
    }
    
    return null;
  }

  /**
   * Log notification attempt
   * @param {Object} logData - Notification log data
   * @returns {Promise<void>}
   */
  async logNotificationAttempt(logData) {
    try {
      await firestoreService.logNotification(logData);
    } catch (error) {
      console.error('❌ Error logging notification:', error);
      // Don't throw here as it's just logging
    }
  }

  /**
   * Send feedback form notification
   * @param {string} phone - Customer phone
   * @param {string} customerName - Customer name
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Result
   */
  async sendFeedbackNotification(phone, customerName, projectId) {
    try {
      // Generate feedback token
      const feedbackToken = this.generateFeedbackToken();
      
      // Store feedback token in database
      await this.storeFeedbackToken(projectId, feedbackToken);
      
      // Send SMS
      const smsResult = await smsService.sendFeedbackSMS(
        phone,
        customerName,
        feedbackToken
      );

      // Log notification
      await this.logNotificationAttempt({
        phone,
        notification_type: 'feedback_form',
        custom_stage: 'feedback_request',
        triggered_by_stage_id: 22,
        message_content: smsResult.message || '',
        sms_status: smsResult.success ? 'sent' : 'failed',
        sms_sid: smsResult.sid || null,
        error_message: smsResult.error || null,
        delivery_timestamp: smsResult.success ? new Date() : null
      });

      return smsResult;
      
    } catch (error) {
      console.error('❌ Error sending feedback notification:', error);
      throw error;
    }
  }

  /**
   * Generate feedback token
   * @returns {string} Random token
   */
  generateFeedbackToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Store feedback token for later verification
   * @param {string} projectId - Project ID
   * @param {string} token - Feedback token
   * @returns {Promise<void>}
   */
  async storeFeedbackToken(projectId, token) {
    try {
      await firestoreService.db.collection('feedback_tokens').add({
        project_id: projectId,
        token,
        used: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        created_at: new Date()
      });
    } catch (error) {
      console.error('❌ Error storing feedback token:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;