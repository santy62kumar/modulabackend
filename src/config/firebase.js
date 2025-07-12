// // // server/src/config/firebase.js - Centralized Firebase Configuration

// // import admin from 'firebase-admin';
// // import dotenv from 'dotenv';

// // dotenv.config();

// // /**
// //  * Centralized Firebase Admin SDK Configuration
// //  * Single source of truth for all Firebase operations
// //  */
// // class FirebaseConfig {
// //   constructor() {
// //     this.initialized = false;
// //     this.db = null;
// //     this.auth = null;
// //     this.storage = null;
// //   }

// //   /**
// //    * Initialize Firebase Admin SDK
// //    */
// //   async initialize() {
// //     if (this.initialized) {
// //       console.log('⚠️ Firebase Admin already initialized');
// //       return;
// //     }

// //     try {
// //       // Check if Firebase app already exists
// //       if (admin.apps.length > 0) {
// //         console.log('✅ Using existing Firebase Admin app');
// //         this.initialized = true;
// //         this.db = admin.firestore();
// //         this.auth = admin.auth();
// //         this.storage = admin.storage();
// //         return;
// //       }

// //       // Parse service account from environment variable
// //       let serviceAccount;

// //       if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
// //         try {
// //           serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
// //         } catch (error) {
// //           console.error('❌ Error parsing Firebase service account key:', error);
// //           throw new Error('Invalid Firebase service account key format');
// //         }
// //       } else {
// //         throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
// //       }

// //       // Validate required environment variables
// //       if (!process.env.FIREBASE_DATABASE_URL) {
// //         throw new Error('FIREBASE_DATABASE_URL environment variable is required');
// //       }

// //       if (!process.env.FIREBASE_STORAGE_BUCKET) {
// //         throw new Error('FIREBASE_STORAGE_BUCKET environment variable is required');
// //       }

// //       // Initialize Firebase Admin
// //       admin.initializeApp({
// //         credential: admin.credential.cert(serviceAccount),
// //         databaseURL: process.env.FIREBASE_DATABASE_URL,
// //         storageBucket: process.env.FIREBASE_STORAGE_BUCKET
// //       });

// //       // Initialize service instances
// //       this.db = admin.firestore();
// //       this.auth = admin.auth();
// //       this.storage = admin.storage();

// //       this.initialized = true;
// //       console.log('✅ Firebase Admin SDK initialized successfully');
      
// //       // Test connection
// //       await this.testConnection();
      
// //     } catch (error) {
// //       console.error('❌ Firebase Admin initialization failed:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Test Firebase connection
// //    */
// //   async testConnection() {
// //     try {
// //       // Test Firestore connection
// //       await this.db.collection('_health_check').limit(1).get();
// //       console.log('✅ Firebase Firestore connection verified');
// //     } catch (error) {
// //       console.error('❌ Firebase connection test failed:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get Firestore instance
// //    * @returns {FirebaseFirestore.Firestore} Firestore instance
// //    */
// //   getFirestore() {
// //     if (!this.initialized) {
// //       throw new Error('Firebase not initialized. Call initialize() first.');
// //     }
// //     return this.db;
// //   }

// //   /**
// //    * Get Auth instance
// //    * @returns {admin.auth.Auth} Auth instance
// //    */
// //   getAuth() {
// //     if (!this.initialized) {
// //       throw new Error('Firebase not initialized. Call initialize() first.');
// //     }
// //     return this.auth;
// //   }

// //   /**
// //    * Get Storage instance
// //    * @returns {admin.storage.Storage} Storage instance
// //    */
// //   getStorage() {
// //     if (!this.initialized) {
// //       throw new Error('Firebase not initialized. Call initialize() first.');
// //     }
// //     return this.storage;
// //   }

// //   /**
// //    * Get Realtime Database instance
// //    * @returns {admin.database.Database} Database instance
// //    */
// //   getDatabase() {
// //     if (!this.initialized) {
// //       throw new Error('Firebase not initialized. Call initialize() first.');
// //     }
// //     return admin.database();
// //   }

// //   /**
// //    * Check Firebase connection status
// //    * @returns {Promise<boolean>} Connection status
// //    */
// //   async checkConnection() {
// //     try {
// //       if (!this.initialized) {
// //         await this.initialize();
// //       }

// //       // Test Firestore connection
// //       await this.db.collection('_health_check').limit(1).get();
// //       return true;
// //     } catch (error) {
// //       console.error('❌ Firebase connection check failed:', error);
// //       return false;
// //     }
// //   }

// //   /**
// //    * Get server timestamp
// //    * @returns {admin.firestore.FieldValue} Server timestamp
// //    */
// //   getServerTimestamp() {
// //     return admin.firestore.FieldValue.serverTimestamp();
// //   }

// //   /**
// //    * Get array union helper
// //    * @param {any} elements - Elements to add to array
// //    * @returns {admin.firestore.FieldValue} Array union field value
// //    */
// //   arrayUnion(...elements) {
// //     return admin.firestore.FieldValue.arrayUnion(...elements);
// //   }

// //   /**
// //    * Get array remove helper
// //    * @param {any} elements - Elements to remove from array
// //    * @returns {admin.firestore.FieldValue} Array remove field value
// //    */
// //   arrayRemove(...elements) {
// //     return admin.firestore.FieldValue.arrayRemove(...elements);
// //   }

// //   /**
// //    * Get Firebase configuration info
// //    * @returns {Object} Configuration info
// //    */
// //   getConfigInfo() {
// //     return {
// //       initialized: this.initialized,
// //       hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
// //       hasDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL,
// //       hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
// //       appsCount: admin.apps.length
// //     };
// //   }
// // }

// // // Create singleton instance
// // const firebaseConfig = new FirebaseConfig();

// // // Initialize immediately
// // (async () => {
// //   try {
// //     await firebaseConfig.initialize();
// //   } catch (error) {
// //     console.error('❌ Failed to initialize Firebase on startup:', error);
// //   }
// // })();
// // // Export the singleton instance and common utilities
// // export default firebaseConfig;

// // // Export individual services for convenience
// // export const db = firebaseConfig.getFirestore();
// // export const auth = firebaseConfig.getAuth();
// // export const storage = firebaseConfig.getStorage();

// // // Export Firebase admin for advanced usage
// // export { admin };

// // // Export utility functions
// // export const {
// //   getServerTimestamp,
// //   arrayUnion,
// //   arrayRemove
// // } = firebaseConfig;

// // server/src/config/firebase.js

// import admin from 'firebase-admin';
// import dotenv from 'dotenv';
// import { normalizePhone } from '../services/utils/phoneUtils.js';

// dotenv.config();

// class FirebaseConfig {
//   constructor() {
//     this.initialized = false;
//     this.db = null;
//     this.auth = null;
//     this.storage = null;
//   }

//   async initialize() {
//     if (this.initialized) return;

//     try {
//       if (admin.apps.length > 0) {
//         console.log('✅ Firebase Admin already initialized');
//         this.initialized = true;
//         this.db = admin.firestore();
//         this.auth = admin.auth();
//         this.storage = admin.storage();
//         return;
//       }

//       if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
//         throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env');
//       }

//       let serviceAccount;
//       try {
//         serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
//       } catch (err) {
//         throw new Error('Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY');
//       }

//       if (!process.env.FIREBASE_DATABASE_URL) {
//         throw new Error('Missing FIREBASE_DATABASE_URL in .env');
//       }

//       if (!process.env.FIREBASE_STORAGE_BUCKET) {
//         throw new Error('Missing FIREBASE_STORAGE_BUCKET in .env');
//       }

//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: process.env.FIREBASE_DATABASE_URL,
//         storageBucket: process.env.FIREBASE_STORAGE_BUCKET
//       });

//       this.db = admin.firestore();
//       this.auth = admin.auth();
//       this.storage = admin.storage();

//       this.initialized = true;
//       console.log('✅ Firebase Admin initialized successfully');

//       // Test connection (optional)
//       await this.db.collection('_health_check').limit(1).get();
//       console.log('✅ Firestore connection tested');

//     } catch (error) {
//       console.error('❌ Firebase initialization error:', error.message);
//       throw error;
//     }
//   }

//   async findProject(phone, odooLeadId) {
//     try {
//       const normalizedPhone = normalizePhone(phone);

//       const snapshot = await this.db
//         .collection('project_tracking')
//         .where('phone', '==', normalizedPhone)
//         .where('odoo_lead_id', '==', odooLeadId)
//         .limit(1)
//         .get();

//       if (snapshot.empty) {
//         return null;
//       }

//       const doc = snapshot.docs[0];
//       return {
//         id: doc.id,
//         ...doc.data()
//       };
//     } catch (error) {
//       console.error('❌ Error finding project:', error);
//       throw error;
//     }
//   }

//   async createProject(projectData) {
//     try {
//       const docRef = await this.db
//         .collection('project_tracking')
//         .add({
//           ...projectData,
//           created_at: admin.firestore.FieldValue.serverTimestamp(),
//           updated_at: admin.firestore.FieldValue.serverTimestamp()
//         });

//       console.log('✅ Created new project:', docRef.id);
//       return docRef.id;
//     } catch (error) {
//       console.error('❌ Error creating project:', error);
//       throw error;
//     }
//   }

//   async checkConnection() {
//     try {
//       if (!this.initialized) {
//         await this.initialize();
//       }

//       // Test Firestore connection
//       await this.db.collection('_health_check').limit(1).get();
//       return true;
//     } catch (error) {
//       console.error('❌ Firebase connection check failed:', error);
//       return false;
//     }
//   }

//   getFirestore() {
//     if (!this.initialized) throw new Error('Firebase not initialized.');
//     return this.db;
//   }

//   getAuth() {
//     if (!this.initialized) throw new Error('Firebase not initialized.');
//     return this.auth;
//   }

//   getStorage() {
//     if (!this.initialized) throw new Error('Firebase not initialized.');
//     return this.storage;
//   }

//   getDatabase() {
//     if (!this.initialized) throw new Error('Firebase not initialized.');
//     return admin.database();
//   }

//   getServerTimestamp() {
//     return admin.firestore.FieldValue.serverTimestamp();
//   }

//   arrayUnion(...elements) {
//     return admin.firestore.FieldValue.arrayUnion(...elements);
//   }

//   arrayRemove(...elements) {
//     return admin.firestore.FieldValue.arrayRemove(...elements);
//   }
// }

// // Singleton instance
// const firebaseConfig = new FirebaseConfig();

// // ✅ Initialize Firebase in a safe async block (no top-level await)
// (async () => {
//   try {
//     await firebaseConfig.initialize();
//   } catch (err) {
//     console.error('⚠️ Firebase failed to initialize at startup:', err.message);
//   }
// })();



// export default firebaseConfig;

// // Recommended: export actual initialized instances
// export const db = firebaseConfig.getFirestore();
// export const auth = firebaseConfig.getAuth();
// export const storage = firebaseConfig.getStorage();

// export const {
//   getServerTimestamp,
//   arrayUnion,
//   arrayRemove
// } = firebaseConfig;

// export { admin };


// server/src/config/firebase.js - COMPLETE VERSION WITH ALL METHODS

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { normalizePhone } from '../services/utils/phoneUtils.js';

dotenv.config();

class FirebaseConfig {
  constructor() {
    this.initialized = false;
    this.db = null;
    this.auth = null;
    this.storage = null;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      if (admin.apps.length > 0) {
        console.log('✅ Firebase Admin already initialized');
        this.initialized = true;
        this.db = admin.firestore();
        this.auth = admin.auth();
        this.storage = admin.storage();
        return;
      }

      if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env');
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (err) {
        throw new Error('Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY');
      }

      if (!process.env.FIREBASE_DATABASE_URL) {
        throw new Error('Missing FIREBASE_DATABASE_URL in .env');
      }

      if (!process.env.FIREBASE_STORAGE_BUCKET) {
        throw new Error('Missing FIREBASE_STORAGE_BUCKET in .env');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });

      this.db = admin.firestore();
      this.auth = admin.auth();
      this.storage = admin.storage();

      this.initialized = true;
      console.log('✅ Firebase Admin initialized successfully');

      // Test connection (optional)
      await this.db.collection('_health_check').limit(1).get();
      console.log('✅ Firestore connection tested');

    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      throw error;
    }
  }

  // ✅ EXISTING METHODS

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

  // ✅ NEW METHODS NEEDED BY TRACKING SERVICE

  /**
   * Add stage to project history
   * @param {string} projectId - Project document ID
   * @param {Object} stageHistoryEntry - Stage history entry
   * @returns {Promise<void>}
   */
  async addStageToHistory(projectId, stageHistoryEntry) {
    try {
      const projectRef = this.db.collection('project_tracking').doc(projectId);
      
      await projectRef.update({
        stage_history: admin.firestore.FieldValue.arrayUnion(stageHistoryEntry),
        current_stage_id: stageHistoryEntry.stage_id,
        current_custom_stage: stageHistoryEntry.custom_stage,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Added stage ${stageHistoryEntry.stage_id} to project ${projectId} history`);
    } catch (error) {
      console.error('❌ Error adding stage to history:', error);
      throw error;
    }
  }

  /**
   * Update project data
   * @param {string} projectId - Project document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateProject(projectId, updateData) {
    try {
      const projectRef = this.db.collection('project_tracking').doc(projectId);
      
      await projectRef.update({
        ...updateData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Updated project ${projectId}:`, Object.keys(updateData));
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  }

  /**
   * Update feedback status for a project
   * @param {string} projectId - Project document ID
   * @param {Object} feedbackStatusUpdates - Feedback status updates
   * @returns {Promise<void>}
   */
  async updateFeedbackStatus(projectId, feedbackStatusUpdates) {
    try {
      const projectRef = this.db.collection('project_tracking').doc(projectId);
      
      // Build the update object for nested feedback_status
      const updateData = {
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      Object.keys(feedbackStatusUpdates).forEach(key => {
        updateData[`feedback_status.${key}`] = feedbackStatusUpdates[key];
      });

      await projectRef.update(updateData);

      console.log(`✅ Updated feedback status for project ${projectId}:`, feedbackStatusUpdates);
    } catch (error) {
      console.error('❌ Error updating feedback status:', error);
      throw error;
    }
  }
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
   * Get project by customer phone number
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
        console.log(`⚠️ No active project found for phone: ${normalizedPhone}`);
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

      const projects = [];
      snapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Retrieved ${projects.length} active projects`);
      return projects;
    } catch (error) {
      console.error('❌ Error getting all active projects:', error);
      throw error;
    }
  }

  /**
   * Get projects by stage ID
   * @param {number} stageId - Odoo stage ID
   * @returns {Promise<Array>} Array of projects in this stage
   */
  async getProjectsByStage(stageId) {
    try {
      const snapshot = await this.db
        .collection('project_tracking')
        .where('current_stage_id', '==', stageId)
        .where('is_active', '==', true)
        .get();

      const projects = [];
      snapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return projects;
    } catch (error) {
      console.error('❌ Error getting projects by stage:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStatistics() {
    try {
      const snapshot = await this.db
        .collection('project_tracking')
        .where('is_active', '==', true)
        .get();

      const stats = {
        totalActiveProjects: 0,
        stageDistribution: {},
        feedbackStats: {
          eligible: 0,
          submitted: 0,
          pending: 0
        }
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.totalActiveProjects++;

        // Stage distribution
        const stage = data.current_stage_id;
        stats.stageDistribution[stage] = (stats.stageDistribution[stage] || 0) + 1;

        // Feedback statistics
        const feedbackStatus = data.feedback_status || {};
        if (feedbackStatus.stage_22_reached) {
          stats.feedbackStats.eligible++;
          if (feedbackStatus.feedback_submitted) {
            stats.feedbackStats.submitted++;
          } else {
            stats.feedbackStats.pending++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting project statistics:', error);
      throw error;
    }
  }

  /**
   * Archive a project (set is_active to false)
   * @param {string} projectId - Project document ID
   * @param {string} reason - Reason for archiving
   * @returns {Promise<void>}
   */
  async archiveProject(projectId, reason = 'Completed') {
    try {
      await this.updateProject(projectId, {
        is_active: false,
        archived_at: admin.firestore.FieldValue.serverTimestamp(),
        archive_reason: reason
      });

      console.log(`✅ Archived project ${projectId} - Reason: ${reason}`);
    } catch (error) {
      console.error('❌ Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Clean up old projects (for maintenance)
   * @param {number} daysOld - Number of days old to consider for cleanup
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupOldProjects(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await this.db
        .collection('project_tracking')
        .where('is_active', '==', false)
        .where('archived_at', '<', cutoffDate)
        .get();

      const results = {
        found: snapshot.size,
        deleted: 0,
        errors: 0
      };

      const batch = this.db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        results.deleted++;
      });

      if (results.deleted > 0) {
        await batch.commit();
        console.log(`✅ Cleaned up ${results.deleted} old projects`);
      }

      return results;
    } catch (error) {
      console.error('❌ Error cleaning up old projects:', error);
      throw error;
    }
  }

  // ✅ UTILITY METHODS

  async checkConnection() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Test Firestore connection
      await this.db.collection('_health_check').limit(1).get();
      return true;
    } catch (error) {
      console.error('❌ Firebase connection check failed:', error);
      return false;
    }
  }

  getFirestore() {
    if (!this.initialized) throw new Error('Firebase not initialized.');
    return this.db;
  }

  getAuth() {
    if (!this.initialized) throw new Error('Firebase not initialized.');
    return this.auth;
  }

  getStorage() {
    if (!this.initialized) throw new Error('Firebase not initialized.');
    return this.storage;
  }

  getDatabase() {
    if (!this.initialized) throw new Error('Firebase not initialized.');
    return admin.database();
  }

  getServerTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  arrayUnion(...elements) {
    return admin.firestore.FieldValue.arrayUnion(...elements);
  }

  arrayRemove(...elements) {
    return admin.firestore.FieldValue.arrayRemove(...elements);
  }

  increment(value = 1) {
    return admin.firestore.FieldValue.increment(value);
  }

  /**
   * Get Firebase configuration info for debugging
   * @returns {Object} Configuration info
   */
  getConfigInfo() {
    return {
      initialized: this.initialized,
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      hasDatabaseUrl: !!process.env.FIREBASE_DATABASE_URL,
      hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
      appsCount: admin.apps.length,
      collections: [
        'project_tracking',
        'users', 
        'feedbacks',
        'notification_logs',
        'stage_changes'
      ]
    };
  }

  /**
   * Test all Firebase services
   * @returns {Promise<Object>} Test results
   */
  async testAllServices() {
    const results = {
      firestore: false,
      auth: false,
      storage: false,
      errors: []
    };

    try {
      // Test Firestore
      await this.db.collection('_health_check').limit(1).get();
      results.firestore = true;
    } catch (error) {
      results.errors.push(`Firestore: ${error.message}`);
    }

    try {
      // Test Auth
      await this.auth.listUsers(1);
      results.auth = true;
    } catch (error) {
      results.errors.push(`Auth: ${error.message}`);
    }

    try {
      // Test Storage
      await this.storage.bucket().getFiles({ maxResults: 1 });
      results.storage = true;
    } catch (error) {
      results.errors.push(`Storage: ${error.message}`);
    }

    return results;
  }
}

// Singleton instance
const firebaseConfig = new FirebaseConfig();

// ✅ Initialize Firebase in a safe async block (no top-level await)
(async () => {
  try {
    await firebaseConfig.initialize();
  } catch (err) {
    console.error('⚠️ Firebase failed to initialize at startup:', err.message);
  }
})();

export default firebaseConfig;

// Recommended: export actual initialized instances
export const db = firebaseConfig.getFirestore();
export const auth = firebaseConfig.getAuth();
export const storage = firebaseConfig.getStorage();

export const {
  getServerTimestamp,
  arrayUnion,
  arrayRemove
} = firebaseConfig;

export { admin };