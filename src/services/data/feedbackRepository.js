
// // server/src/services/data/feedbackRepository.js
// // import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
// import Feedback from '../../models/Feedback.js';
// import { db, getServerTimestamp } from '../../config/firebase.js';

// class FeedbackRepository {
//   constructor() {
//     this.db = db;
//      this.collectionRef = this.db.collection('feedbacks'); 
//   }

//   async create(feedbackData) {
//     try {
//       const feedback = new Feedback(feedbackData);
//       const validation = feedback.validate();
      
//       if (!validation.isValid) {
//         throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
//       }

//       const docRef = await addDoc(collection(this.db, this.collection), feedback.toFirestore());
      
//       return {
//         id: docRef.id,
//         ...feedback.toFirestore()
//       };
//     } catch (error) {
//       console.error('Error creating feedback:', error);
//       throw new Error(`Failed to create feedback: ${error.message}`);
//     }
//   }

//   async findById(feedbackId) {
//     try {
//       const docRef = doc(this.db, this.collection, feedbackId);
//       const docSnap = await getDoc(docRef);
      
//       if (!docSnap.exists()) {
//         return null;
//       }
      
//       return Feedback.fromFirestore(docSnap);
//     } catch (error) {
//       console.error('Error finding feedback by ID:', error);
//       throw new Error(`Failed to find feedback: ${error.message}`);
//     }
//   }

//   async findByUserId(userId) {
//     try {
//       const q = query(
//         collection(this.db, this.collection), 
//         where('userId', '==', userId),
//         orderBy('submittedAt', 'desc')
//       );
      
//       const querySnapshot = await getDocs(q);
//       const feedbacks = [];
      
//       querySnapshot.forEach((doc) => {
//         feedbacks.push(Feedback.fromFirestore(doc));
//       });
      
//       return feedbacks;
//     } catch (error) {
//       console.error('Error finding feedback by user ID:', error);
//       throw new Error(`Failed to find user feedback: ${error.message}`);
//     }
//   }

//   async findByLeadId(leadId) {
//     try {
//       const q = query(
//         collection(this.db, this.collection), 
//         where('leadId', '==', leadId),
//         orderBy('submittedAt', 'desc')
//       );
      
//       const querySnapshot = await getDocs(q);
//       const feedbacks = [];
      
//       querySnapshot.forEach((doc) => {
//         feedbacks.push(Feedback.fromFirestore(doc));
//       });
      
//       return feedbacks;
//     } catch (error) {
//       console.error('Error finding feedback by lead ID:', error);
//       throw new Error(`Failed to find lead feedback: ${error.message}`);
//     }
//   }

//   async checkExistingFeedback(userId, leadId) {
//     try {
//       const q = query(
//         collection(this.db, this.collection),
//         where('userId', '==', userId),
//         where('leadId', '==', leadId),
//         where('isSubmitted', '==', true)
//       );
      
//       const querySnapshot = await getDocs(q);
//       return !querySnapshot.empty;
//     } catch (error) {
//       console.error('Error checking existing feedback:', error);
//       throw new Error(`Failed to check existing feedback: ${error.message}`);
//     }
//   }

//   async update(feedbackId, updateData) {
//     try {
//       const docRef = doc(this.db, this.collection, feedbackId);
//       const docSnap = await getDoc(docRef);
      
//       if (!docSnap.exists()) {
//         throw new Error('Feedback not found');
//       }
      
//       const updatedData = {
//         ...updateData,
//         updatedAt: new Date()
//       };
      
//       await updateDoc(docRef, updatedData);
      
//       // Return updated feedback
//       const updatedDoc = await getDoc(docRef);
//       return Feedback.fromFirestore(updatedDoc);
//     } catch (error) {
//       console.error('Error updating feedback:', error);
//       throw new Error(`Failed to update feedback: ${error.message}`);
//     }
//   }

//   async delete(feedbackId) {
//     try {
//       const docRef = doc(this.db, this.collection, feedbackId);
//       const docSnap = await getDoc(docRef);
      
//       if (!docSnap.exists()) {
//         throw new Error('Feedback not found');
//       }
      
//       await deleteDoc(docRef);
//       return true;
//     } catch (error) {
//       console.error('Error deleting feedback:', error);
//       throw new Error(`Failed to delete feedback: ${error.message}`);
//     }
//   }

//   async findAll(filters = {}, pagination = {}) {
//     try {
//       let q = collection(this.db, this.collection);
//       const conditions = [orderBy('submittedAt', 'desc')];
      
//       // Apply filters
//       if (filters.userId) {
//         conditions.unshift(where('userId', '==', filters.userId));
//       }
      
//       if (filters.leadId) {
//         conditions.unshift(where('leadId', '==', filters.leadId));
//       }
      
//       if (filters.isSubmitted !== undefined) {
//         conditions.unshift(where('isSubmitted', '==', filters.isSubmitted));
//       }
      
//       if (filters.dateFrom) {
//         conditions.unshift(where('submittedAt', '>=', new Date(filters.dateFrom)));
//       }
      
//       if (filters.dateTo) {
//         conditions.unshift(where('submittedAt', '<=', new Date(filters.dateTo)));
//       }
      
//       // Apply pagination
//       if (pagination.limit) {
//         conditions.push(limit(pagination.limit));
//       }
      
//       q = query(q, ...conditions);
      
//       const querySnapshot = await getDocs(q);
//       const feedbacks = [];
      
//       querySnapshot.forEach((doc) => {
//         feedbacks.push(Feedback.fromFirestore(doc));
//       });
      
//       return {
//         feedbacks,
//         count: feedbacks.length,
//         hasMore: feedbacks.length === (pagination.limit || feedbacks.length)
//       };
//     } catch (error) {
//       console.error('Error finding all feedback:', error);
//       throw new Error(`Failed to find feedback: ${error.message}`);
//     }
//   }

//   async getStatistics() {
//     try {
//       const querySnapshot = await getDocs(collection(this.db, this.collection));
      
//       let totalFeedback = 0;
//       let avgRatings = {
//         installationBehavior: 0,
//         punctuality: 0,
//         cleanliness: 0,
//         installationQuality: 0,
//         productQuality: 0,
//         deliveryExperience: 0,
//         communication: 0,
//         overallExperience: 0
//       };
//       let recommendationCounts = { Yes: 0, No: 0, Maybe: 0 };
      
//       querySnapshot.forEach((doc) => {
//         const feedback = Feedback.fromFirestore(doc);
//         totalFeedback++;
        
//         // Calculate average ratings
//         Object.keys(avgRatings).forEach(key => {
//           avgRatings[key] += feedback.ratings[key] || 0;
//         });
        
//         // Count recommendations
//         if (recommendationCounts.hasOwnProperty(feedback.wouldRecommend)) {
//           recommendationCounts[feedback.wouldRecommend]++;
//         }
//       });
      
//       // Calculate averages
//       if (totalFeedback > 0) {
//         Object.keys(avgRatings).forEach(key => {
//           avgRatings[key] = (avgRatings[key] / totalFeedback).toFixed(2);
//         });
//       }
      
//       return {
//         totalFeedback,
//         averageRatings: avgRatings,
//         recommendations: recommendationCounts,
//         recommendationPercentage: {
//           Yes: totalFeedback > 0 ? ((recommendationCounts.Yes / totalFeedback) * 100).toFixed(1) : 0,
//           No: totalFeedback > 0 ? ((recommendationCounts.No / totalFeedback) * 100).toFixed(1) : 0,
//           Maybe: totalFeedback > 0 ? ((recommendationCounts.Maybe / totalFeedback) * 100).toFixed(1) : 0
//         }
//       };
//     } catch (error) {
//       console.error('Error getting feedback statistics:', error);
//       throw new Error(`Failed to get feedback statistics: ${error.message}`);
//     }
//   }

//   async findByReferenceId(referenceId) {
//     try {
//       const q = query(
//         collection(this.db, this.collection),
//         where('referenceId', '==', referenceId)
//       );
      
//       const querySnapshot = await getDocs(q);
      
//       if (querySnapshot.empty) {
//         return null;
//       }
      
//       return Feedback.fromFirestore(querySnapshot.docs[0]);
//     } catch (error) {
//       console.error('Error finding feedback by reference ID:', error);
//       throw new Error(`Failed to find feedback by reference: ${error.message}`);
//     }
//   }
// }

// export default FeedbackRepository;

// server/src/services/data/feedbackRepository.js
import Feedback from '../../models/Feedback.js';
import { db, getServerTimestamp } from '../../config/firebase.js';

class FeedbackRepository {
  constructor() {
    this.db = db;
    this.collectionRef = this.db.collection('feedbacks');
  }

  async create(feedbackData) {
    try {
      const feedback = new Feedback(feedbackData);
      const validation = feedback.validate();

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const docRef = await this.collectionRef.add(feedback.toFirestore());
      return {
        id: docRef.id,
        ...feedback.toFirestore()
      };
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new Error(`Failed to create feedback: ${error.message}`);
    }
  }

  async findById(feedbackId) {
    try {
      const docRef = this.collectionRef.doc(feedbackId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return null;
      }

      return Feedback.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error finding feedback by ID:', error);
      throw new Error(`Failed to find feedback: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const snapshot = await this.collectionRef
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .get();

      const feedbacks = snapshot.docs.map(doc => Feedback.fromFirestore(doc));
      return feedbacks;
    } catch (error) {
      console.error('Error finding feedback by user ID:', error);
      throw new Error(`Failed to find user feedback: ${error.message}`);
    }
  }

  async findByLeadId(leadId) {
    try {
      const snapshot = await this.collectionRef
        .where('leadId', '==', leadId)
        .orderBy('submittedAt', 'desc')
        .get();

      const feedbacks = snapshot.docs.map(doc => Feedback.fromFirestore(doc));
      return feedbacks;
    } catch (error) {
      console.error('Error finding feedback by lead ID:', error);
      throw new Error(`Failed to find lead feedback: ${error.message}`);
    }
  }

  async checkExistingFeedback(userId, leadId) {
    console.log('Checking feedback with:', { userId, leadId });
    try {
      if (!userId || !leadId) {
        throw new Error(`Missing required parameters: userId=${userId}, leadId=${leadId}`);
      }

      const querySnapshot = await this.collectionRef
        .where('userId', '==', userId)
        .where('leadId', '==', leadId)
        .where('isSubmitted', '==', true)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      throw new Error(`Failed to check existing feedback: ${error.message}`);
    }
  }


  async update(feedbackId, updateData) {
    try {
      const docRef = this.collectionRef.doc(feedbackId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error('Feedback not found');
      }

      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };

      await docRef.update(updatedData);
      const updatedDoc = await docRef.get();
      return Feedback.fromFirestore(updatedDoc);
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw new Error(`Failed to update feedback: ${error.message}`);
    }
  }

  async delete(feedbackId) {
    try {
      const docRef = this.collectionRef.doc(feedbackId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error('Feedback not found');
      }

      await docRef.delete();
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      let queryRef = this.collectionRef;

      if (filters.userId) {
        queryRef = queryRef.where('userId', '==', filters.userId);
      }
      if (filters.leadId) {
        queryRef = queryRef.where('leadId', '==', filters.leadId);
      }
      if (filters.isSubmitted !== undefined) {
        queryRef = queryRef.where('isSubmitted', '==', filters.isSubmitted);
      }
      if (filters.dateFrom) {
        queryRef = queryRef.where('submittedAt', '>=', new Date(filters.dateFrom));
      }
      if (filters.dateTo) {
        queryRef = queryRef.where('submittedAt', '<=', new Date(filters.dateTo));
      }

      queryRef = queryRef.orderBy('submittedAt', 'desc');

      if (pagination.limit) {
        queryRef = queryRef.limit(pagination.limit);
      }

      const snapshot = await queryRef.get();
      const feedbacks = snapshot.docs.map(doc => Feedback.fromFirestore(doc));

      return {
        feedbacks,
        count: feedbacks.length,
        hasMore: feedbacks.length === (pagination.limit || feedbacks.length)
      };
    } catch (error) {
      console.error('Error finding all feedback:', error);
      throw new Error(`Failed to find feedback: ${error.message}`);
    }
  }

  async getStatistics() {
    try {
      const snapshot = await this.collectionRef.get();

      let totalFeedback = 0;
      let avgRatings = {
        installationBehavior: 0,
        punctuality: 0,
        cleanliness: 0,
        installationQuality: 0,
        productQuality: 0,
        deliveryExperience: 0,
        communication: 0,
        overallExperience: 0
      };
      let recommendationCounts = { Yes: 0, No: 0, Maybe: 0 };

      snapshot.forEach((doc) => {
        const feedback = Feedback.fromFirestore(doc);
        totalFeedback++;

        Object.keys(avgRatings).forEach(key => {
          avgRatings[key] += feedback.ratings[key] || 0;
        });

        if (recommendationCounts.hasOwnProperty(feedback.wouldRecommend)) {
          recommendationCounts[feedback.wouldRecommend]++;
        }
      });

      if (totalFeedback > 0) {
        Object.keys(avgRatings).forEach(key => {
          avgRatings[key] = (avgRatings[key] / totalFeedback).toFixed(2);
        });
      }

      return {
        totalFeedback,
        averageRatings: avgRatings,
        recommendations: recommendationCounts,
        recommendationPercentage: {
          Yes: totalFeedback > 0 ? ((recommendationCounts.Yes / totalFeedback) * 100).toFixed(1) : 0,
          No: totalFeedback > 0 ? ((recommendationCounts.No / totalFeedback) * 100).toFixed(1) : 0,
          Maybe: totalFeedback > 0 ? ((recommendationCounts.Maybe / totalFeedback) * 100).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Error getting feedback statistics:', error);
      throw new Error(`Failed to get feedback statistics: ${error.message}`);
    }
  }

  async findByReferenceId(referenceId) {
    try {
      const snapshot = await this.collectionRef
        .where('referenceId', '==', referenceId)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return Feedback.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding feedback by reference ID:', error);
      throw new Error(`Failed to find feedback by reference: ${error.message}`);
    }
  }
}

export default FeedbackRepository;
