// server/src/config/firebase.js

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for server-side operations
 */
class FirebaseConfig {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initialize() {
    if (this.initialized) {
      console.log('⚠️ Firebase Admin already initialized');
      return;
    }

    try {
      // Parse service account from environment variable or file
      let serviceAccount;

      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (error) {
          console.error('❌ Error parsing Firebase service account key:', error);
          throw new Error('Invalid Firebase service account key format');
        }
      } else {
        // Use dynamic import for JSON in ESM
        const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
        const serviceAccountUrl = pathToFileURL(serviceAccountPath);
        serviceAccount = (await import(serviceAccountUrl, { assert: { type: 'json' } })).default;
      }

      //Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });

      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get Firestore instance
   * @returns {FirebaseFirestore.Firestore} Firestore instance
   */
  async getFirestore() {
    if (!this.initialized) {
      await this.initialize();
    }
    return admin.firestore();
  }

  /**
   * Get Realtime Database instance
   * @returns {admin.database.Database} Database instance
   */
  async getDatabase() {
    if (!this.initialized) {
      await this.initialize();
    }
    return admin.database();
  }

  /**
   * Get Storage instance
   * @returns {admin.storage.Storage} Storage instance
   */
  async getStorage() {
    if (!this.initialized) {
      await this.initialize();
    }
    return admin.storage();
  }

  /**
   * Get Auth instance
   * @returns {admin.auth.Auth} Auth instance
   */
  async getAuth() {
    if (!this.initialized) {
      await this.initialize();
    }
    return admin.auth();
  }

  /**
   * Check Firebase connection
   * @returns {Promise<boolean>} Connection status
   */
  async checkConnection() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Test Firestore connection
      const db = await this.getFirestore();
      await db.collection('_health_check').limit(1).get();

      return true;
    } catch (error) {
      console.error('❌ Firebase connection check failed:', error);
      return false;
    }
  }

  /**
   * Get server timestamp
   * @returns {admin.firestore.FieldValue} Server timestamp
   */
  getServerTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Get array union helper
   * @param {any} elements - Elements to add to array
   * @returns {admin.firestore.FieldValue} Array union field value
   */
  arrayUnion(...elements) {
    return admin.firestore.FieldValue.arrayUnion(...elements);
  }

  /**
   * Get array remove helper
   * @param {any} elements - Elements to remove from array
   * @returns {admin.firestore.FieldValue} Array remove field value
   */
  arrayRemove(...elements) {
    return admin.firestore.FieldValue.arrayRemove(...elements);
  }
}

// Create singleton instance
const firebaseConfig = new FirebaseConfig();

// Initialize on module load
await firebaseConfig.initialize();

export default firebaseConfig;
