import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { normalizePhone } from '../../utils/phoneUtils.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
//  else {
//   // ESM: dynamically import JSON file
//   const serviceAccountPath = path.join(__dirname, '../../../../serviceAccountKey.json');
//   const serviceAccountUrl = pathToFileURL(serviceAccountPath);
//   serviceAccount = (await import(serviceAccountUrl, { assert: { type: 'json' } })).default;
// }





class FirestoreService {
  constructor() {
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    this.db = admin.firestore();
  }


   /**
   * Find project by phone and Odoo lead ID
   * @param {string} phone - Customer phone number
   * @param {number} odooLeadId - Odoo lead ID
   * @returns {Promise<Object|null>} Project document or null
   */
  async findProject(phone, odooLeadId) {
    try {
      const normalizedPhone = normalizePhone(phone);
      
      const snapshot = await this.db
        .collection('project_tracking')
        .where('phone', '==', normalizedPhone)
        .where('odoo_lead_id', '==', odooLeadId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('❌ Error finding project:', error);
      throw error;
    }
  }

  /**
   * Create new project tracking record
   * @param {Object} projectData - Project data
   * @returns {Promise<string>} Document ID
   */
  async createProject(projectData) {
    try {
      const docRef = await this.db
        .collection('project_tracking')
        .add({
          ...projectData,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log('✅ Created new project:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update existing project record
   * @param {string} projectId - Project document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateProject(projectId, updateData) {
    try {
      await this.db
        .collection('project_tracking')
        .doc(projectId)
        .update({
          ...updateData,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log('✅ Updated project:', projectId);
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  }

  /**
   * Add stage to project history
   * @param {string} projectId - Project document ID
   * @param {Object} stageData - Stage history entry
   * @returns {Promise<void>}
   */
  // async addStageToHistory(projectId, stageData) {
  //   try {
  //     await this.db
  //       .collection('project_tracking')
  //       .doc(projectId)
  //       .update({
  //         stage_history: admin.firestore.FieldValue.arrayUnion(stageData),
  //         current_stage_id: stageData.stage_id,
  //         current_custom_stage: stageData.custom_stage,
  //         updated_at: admin.firestore.FieldValue.serverTimestamp()
  //       });

  //     console.log('✅ Added stage to history:', stageData.stage_id);
  //   } catch (error) {
  //     console.error('❌ Error adding stage to history:', error);
  //     throw error;
  //   }
  // }

  async addStageToHistory(projectId, stageData) {
    try {
      // FIXED: First get current document to check for duplicates
      const projectDoc = await this.db
        .collection('project_tracking')
        .doc(projectId)
        .get();

      if (!projectDoc.exists) {
        throw new Error(`Project ${projectId} not found`);
      }

      const projectData = projectDoc.data();
      const currentHistory = projectData.stage_history || [];
      
      // Check if last entry has same stage_id (prevent duplicates)
      const lastEntry = currentHistory[currentHistory.length - 1];
      if (lastEntry && lastEntry.stage_id === stageData.stage_id) {
        console.log(`⚠️ Duplicate stage ${stageData.stage_id} detected, skipping database write`);
        return;
      }

      console.log(`📝 Adding stage ${stageData.stage_id} to history for project ${projectId}`);

      await this.db
        .collection('project_tracking')
        .doc(projectId)
        .update({
          stage_history: admin.firestore.FieldValue.arrayUnion(stageData),
          current_stage_id: stageData.stage_id,
          current_custom_stage: stageData.custom_stage,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log('✅ Added stage to history:', stageData.stage_id);
    } catch (error) {
      console.error('❌ Error adding stage to history:', error);
      throw error;
    }
  }

  /**
   * Update notification status
   * @param {string} projectId - Project document ID
   * @param {string} category - Notification category (project, payment, dispatch)
   * @param {string} stage - Stage name
   * @param {Object} notificationData - Notification details
   * @returns {Promise<void>}
   */
  async updateNotificationStatus(projectId, category, stage, notificationData) {
    try {
      const updatePath = `notifications_sent.${category}_stages.${stage}`;
      
      await this.db
        .collection('project_tracking')
        .doc(projectId)
        .update({
          [updatePath]: notificationData,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log('✅ Updated notification status:', category, stage);
    } catch (error) {
      console.error('❌ Error updating notification status:', error);
      throw error;
    }
  }

  /**
   * Log notification attempt
   * @param {Object} logData - Notification log data
   * @returns {Promise<string>} Log document ID
   */
  async logNotification(logData) {
    try {
      const docRef = await this.db
        .collection('notification_logs')
        .add({
          ...logData,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging notification:', error);
      throw error;
    }
  }

  /**
   * Update feedback status
   * @param {string} projectId - Project document ID
   * @param {Object} feedbackStatus - Feedback status updates
   * @returns {Promise<void>}
   */
  async updateFeedbackStatus(projectId, feedbackStatus) {
    try {
      const updateData = {};
      
      // Build update object for nested feedback_status fields
      Object.keys(feedbackStatus).forEach(key => {
        updateData[`feedback_status.${key}`] = feedbackStatus[key];
      });
      
      updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

      await this.db
        .collection('project_tracking')
        .doc(projectId)
        .update(updateData);

      console.log('✅ Updated feedback status:', projectId);
    } catch (error) {
      console.error('❌ Error updating feedback status:', error);
      throw error;
    }
  }

  /**
   * Get all active projects
   * @returns {Promise<Array>} Array of active projects
   */
  async getAllActiveProjects() {
    try {
      const snapshot = await this.db
        .collection('project_tracking')
        .where('is_active', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error getting active projects:', error);
      throw error;
    }
  }

  /**
   * Get project by phone number (for customer login)
   * @param {string} phone - Customer phone number
   * @returns {Promise<Object|null>} Project data or null
   */
  async getProjectByPhone(phone) {
    try {
      const normalizedPhone = normalizePhone(phone);
      
      const snapshot = await this.db
        .collection('project_tracking')
        .where('phone', '==', normalizedPhone)
        .where('is_active', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('❌ Error getting project by phone:', error);
      throw error;
    }
  }
}

const firestoreService = new FirestoreService();
export const db = firestoreService.db;
export default firestoreService;
