// server/src/services/external/twilio/smsService.js
import twilio from 'twilio';
import { formatPhoneForSMS } from '../../utils/phoneUtils.js';
import { processTemplate } from '../../../constants/notificationTemplates.js';
import dotenv from 'dotenv';

dotenv.config();


/**
 * SMS Service using Twilio
 * Handles all SMS sending operations
 */

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  /**
   * Send SMS message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} Result object with success status and details
   */
  // async sendSMS(to, message) {
  //   try {
  //     const formattedPhone = formatPhoneForSMS(to);
      
  //     console.log(`📱 Sending SMS to ${formattedPhone}`);
      
  //     const result = await this.client.messages.create({
  //       body: message,
  //       from: this.fromNumber,
  //       to: formattedPhone
  //     });

  //     console.log(`✅ SMS sent successfully. SID: ${result.sid}`);
      
  //     return {
  //       success: true,
  //       sid: result.sid,
  //       status: result.status,
  //       to: formattedPhone,
  //       message: message
  //     };
      
  //   } catch (error) {
  //     console.error(`❌ SMS failed for ${to}:`, error.message);
      
  //     return {
  //       success: false,
  //       error: error.message,
  //       to: to,
  //       message: message
  //     };
  //   }
  // }

  async sendSMS(to, message) {
    try {
      const formattedPhone = formatPhoneForSMS(to);
      
      console.log(`📱 Attempting SMS to ${formattedPhone}`);
      console.log(`📝 Message: ${message.substring(0, 50)}...`);
      console.log(`🔧 Twilio Config Check:`);
      console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing'}`);
      console.log(`   Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing'}`);
      console.log(`   From Number: ${this.fromNumber || 'Missing'}`);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`✅ SMS sent successfully to ${formattedPhone}`);
      console.log(`   SID: ${result.sid}`);
      console.log(`   Status: ${result.status}`);
      
      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: formattedPhone,
        message: message
      };
      
    } catch (error) {
      console.error(`❌ SMS FAILED for ${to}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   More Info: ${error.moreInfo}`);
      console.error(`   Status: ${error.status}`);
      
      return {
        success: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
        to: to,
        message: message
      };
    }
  }

  /**
   * Send stage notification SMS
   * @param {string} phone - Customer phone number
   * @param {string} customerName - Customer name
   * @param {string} template - Message template
   * @param {Object} additionalData - Additional template data
   * @returns {Promise<Object>} Result object
   */
  async sendStageNotification(phone, customerName, template, additionalData = {}) {
    try {
      // Process template with customer data
      const templateData = {
        customerName,
        ...additionalData
      };
      
      const message = processTemplate(template, templateData);
      
      if (!message) {
        console.log(`⚠️ No message template processed for ${phone}`);
        return {
          success: false,
          error: 'No message template processed'
        };
      }

      return await this.sendSMS(phone, message);
      
    } catch (error) {
      console.error(`❌ Error sending feedback SMS to ${phone}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send OTP SMS
   * @param {string} phone - Customer phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Result object
   */
  async sendOTP(phone, otp) {
    try {
      const message = `Your Modula verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone. – Team Modula`;
      
      return await this.sendSMS(phone, message);
      
    } catch (error) {
      console.error(`❌ Error sending OTP to ${phone}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check Twilio service health
   * @returns {Promise<boolean>} Service health status
   */
  async checkHealth() {
    try {
      // Test Twilio connection by fetching account details
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      return true;
    } catch (error) {
      console.error('❌ Twilio health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get SMS delivery status
   * @param {string} messageSid - Twilio message SID
   * @returns {Promise<Object>} Message status
   */
  async getMessageStatus(messageSid) {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error(`❌ Error fetching message status for ${messageSid}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendFeedbackSMS(phone, customerName, feedbackToken) {
    try {
      const websiteUrl = process.env.FRONTEND_URL || 'https://yourapp.com';
      const feedbackUrl = `${websiteUrl}/feedback?token=${feedbackToken}`;
      
      const message = `Hi ${customerName}, Your Modula project is complete! We'd love your feedback! Share your thoughts here: ${feedbackUrl} – Team Modula`;
      
      return await this.sendSMS(phone, message);
     } catch (error) {
      console.error(`❌ Error sending stage notification to ${phone}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const smsService = new SMSService();

export default smsService;
