// server/src/services/data/maintenanceRepository.js
//import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import MaintenanceRequest from '../../models/MaintenanceRequest.js';
import { db, getServerTimestamp } from '../../config/firebase.js';

class MaintenanceRepository {
  constructor() {
    this.db = db;
    this.collectionRef = this.db.collection('maintenanceRequests');
  }

  async create(requestData) {
    try {
      const request = new MaintenanceRequest(requestData);
      const validation = request.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const docRef = await addDoc(collection(this.db, this.collection), request.toFirestore());
      
      return {
        id: docRef.id,
        ...request.toFirestore()
      };
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw new Error(`Failed to create maintenance request: ${error.message}`);
    }
  }

  async findById(requestId) {
    try {
      const docRef = doc(this.db, this.collection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return MaintenanceRequest.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error finding maintenance request by ID:', error);
      throw new Error(`Failed to find maintenance request: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const q = query(
        collection(this.db, this.collection), 
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push(MaintenanceRequest.fromFirestore(doc));
      });
      
      return requests;
    } catch (error) {
      console.error('Error finding maintenance requests by user ID:', error);
      throw new Error(`Failed to find user maintenance requests: ${error.message}`);
    }
  }

  async findByLeadId(leadId) {
    try {
      const q = query(
        collection(this.db, this.collection), 
        where('leadId', '==', leadId),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push(MaintenanceRequest.fromFirestore(doc));
      });
      
      return requests;
    } catch (error) {
      console.error('Error finding maintenance requests by lead ID:', error);
      throw new Error(`Failed to find lead maintenance requests: ${error.message}`);
    }
  }

  async findByStatus(status) {
    try {
      const q = query(
        collection(this.db, this.collection),
        where('status', '==', status),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push(MaintenanceRequest.fromFirestore(doc));
      });
      
      return requests;
    } catch (error) {
      console.error('Error finding maintenance requests by status:', error);
      throw new Error(`Failed to find maintenance requests by status: ${error.message}`);
    }
  }

  async update(requestId, updateData) {
    try {
      const docRef = doc(this.db, this.collection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Maintenance request not found');
      }
      
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(docRef, updatedData);
      
      // Return updated request
      const updatedDoc = await getDoc(docRef);
      return MaintenanceRequest.fromFirestore(updatedDoc);
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw new Error(`Failed to update maintenance request: ${error.message}`);
    }
  }

  async updateStatus(requestId, newStatus, notes = '') {
    try {
      const docRef = doc(this.db, this.collection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Maintenance request not found');
      }
      
      const currentRequest = MaintenanceRequest.fromFirestore(docSnap);
      currentRequest.updateStatus(newStatus, notes);
      
      await updateDoc(docRef, {
        status: currentRequest.status,
        notes: currentRequest.notes,
        completedDate: currentRequest.completedDate,
        updatedAt: new Date()
      });
      
      return currentRequest;
    } catch (error) {
      console.error('Error updating maintenance request status:', error);
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  async assignTeam(requestId, teamId, scheduledDate = null) {
    try {
      const docRef = doc(this.db, this.collection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Maintenance request not found');
      }
      
      const currentRequest = MaintenanceRequest.fromFirestore(docSnap);
      currentRequest.assignTeam(teamId, scheduledDate);
      
      await updateDoc(docRef, {
        assignedTeam: currentRequest.assignedTeam,
        status: currentRequest.status,
        scheduledDate: currentRequest.scheduledDate,
        updatedAt: new Date()
      });
      
      return currentRequest;
    } catch (error) {
      console.error('Error assigning team to maintenance request:', error);
      throw new Error(`Failed to assign team: ${error.message}`);
    }
  }

  async delete(requestId) {
    try {
      const docRef = doc(this.db, this.collection, requestId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Maintenance request not found');
      }
      
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      throw new Error(`Failed to delete maintenance request: ${error.message}`);
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      let q = collection(this.db, this.collection);
      const conditions = [orderBy('submittedAt', 'desc')];
      
      // Apply filters
      if (filters.userId) {
        conditions.unshift(where('userId', '==', filters.userId));
      }
      
      if (filters.leadId) {
        conditions.unshift(where('leadId', '==', filters.leadId));
      }
      
      if (filters.status) {
        conditions.unshift(where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        conditions.unshift(where('priority', '==', filters.priority));
      }
      
      if (filters.assignedTeam) {
        conditions.unshift(where('assignedTeam', '==', filters.assignedTeam));
      }
      
      if (filters.dateFrom) {
        conditions.unshift(where('submittedAt', '>=', new Date(filters.dateFrom)));
      }
      
      if (filters.dateTo) {
        conditions.unshift(where('submittedAt', '<=', new Date(filters.dateTo)));
      }
      
      // Apply pagination
      if (pagination.limit) {
        conditions.push(limit(pagination.limit));
      }
      
      q = query(q, ...conditions);
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push(MaintenanceRequest.fromFirestore(doc));
      });
      
      return {
        requests,
        count: requests.length,
        hasMore: requests.length === (pagination.limit || requests.length)
      };
    } catch (error) {
      console.error('Error finding all maintenance requests:', error);
      throw new Error(`Failed to find maintenance requests: ${error.message}`);
    }
  }

  async getStatistics() {
    try {
      const querySnapshot = await getDocs(collection(this.db, this.collection));
      
      const stats = {
        total: 0,
        byStatus: {
          pending: 0,
          assigned: 0,
          'in-progress': 0,
          completed: 0,
          cancelled: 0
        },
        byPriority: {
          urgent: 0,
          high: 0,
          standard: 0,
          low: 0
        },
        serviceTypes: {},
        averageResolutionTime: 0
      };
      
      let totalResolutionTime = 0;
      let completedRequests = 0;
      
      querySnapshot.forEach((doc) => {
        const request = MaintenanceRequest.fromFirestore(doc);
        stats.total++;
        
        // Count by status
        if (stats.byStatus.hasOwnProperty(request.status)) {
          stats.byStatus[request.status]++;
        }
        
        // Count by priority
        if (stats.byPriority.hasOwnProperty(request.priority)) {
          stats.byPriority[request.priority]++;
        }
        
        // Count service types
        const selectedServices = request.getSelectedServices();
        selectedServices.forEach(service => {
          stats.serviceTypes[service] = (stats.serviceTypes[service] || 0) + 1;
        });
        
        // Calculate resolution time for completed requests
        if (request.status === 'completed' && request.completedDate) {
          const resolutionTime = request.completedDate - request.submittedAt;
          totalResolutionTime += resolutionTime;
          completedRequests++;
        }
      });
      
      // Calculate average resolution time in days
      if (completedRequests > 0) {
        stats.averageResolutionTime = Math.round(
          (totalResolutionTime / completedRequests) / (1000 * 60 * 60 * 24)
        );
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting maintenance statistics:', error);
      throw new Error(`Failed to get maintenance statistics: ${error.message}`);
    }
  }

  async findByReferenceId(referenceId) {
    try {
      const q = query(
        collection(this.db, this.collection),
        where('referenceId', '==', referenceId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return MaintenanceRequest.fromFirestore(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error finding maintenance request by reference ID:', error);
      throw new Error(`Failed to find maintenance request by reference: ${error.message}`);
    }
  }

  async findPendingRequests() {
    try {
      return await this.findByStatus('pending');
    } catch (error) {
      console.error('Error finding pending maintenance requests:', error);
      throw new Error(`Failed to find pending requests: ${error.message}`);
    }
  }

  async findOverdueRequests() {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const q = query(
        collection(this.db, this.collection),
        where('status', 'in', ['pending', 'assigned']),
        where('submittedAt', '<=', threeDaysAgo),
        orderBy('submittedAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push(MaintenanceRequest.fromFirestore(doc));
      });
      
      return requests;
    } catch (error) {
      console.error('Error finding overdue maintenance requests:', error);
      throw new Error(`Failed to find overdue requests: ${error.message}`);
    }
  }
}

export default MaintenanceRepository;