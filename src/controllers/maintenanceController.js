// server/src/controllers/maintenanceController.js
import { v4 as uuidv4 } from 'uuid';
import firebaseConfig from '../config/firebase.js';
import { normalizePhone } from '../services/utils/phoneUtils.js';

class MaintenanceController {
  /**
   * Submit a new service request
   * POST /api/maintenance/request
   */
  async submitServiceRequest(req, res) {
    try {
      const {
        projectId,
        category,
        serviceId,
        serviceName,
        description,
        contactName,
        contactPhone,
        preferredDate,
        urgency = 'normal'
      } = req.body;

      // Validate required fields
      if (!projectId || !category || !serviceId || !serviceName || !description || !contactName || !contactPhone) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Validate category
      const validCategories = ['services', 'upgrade', 'support'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid service category'
        });
      }

      // Validate urgency
      const validUrgencies = ['low', 'normal', 'high', 'urgent'];
      if (!validUrgencies.includes(urgency)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid urgency level'
        });
      }

      // Get user info from token (assuming auth middleware sets req.user)
      const userPhone = req.user?.phone || normalizePhone(contactPhone);

      // Generate unique request ID
      const requestId = uuidv4();

      // Create service request data
      const serviceRequestData = {
        id: requestId,
        project_id: projectId,
        customer_phone: userPhone,
        category,
        service_id: serviceId,
        service_name: serviceName,
        description,
        contact_name: contactName,
        contact_phone: normalizePhone(contactPhone),
        preferred_date: preferredDate || null,
        urgency,
        status: 'pending',
        created_at: firebaseConfig.getServerTimestamp(),
        updated_at: firebaseConfig.getServerTimestamp(),
        status_updated_at: firebaseConfig.getServerTimestamp()
      };

      // Save to Firebase
      await firebaseConfig.db
        .collection('service_requests')
        .doc(requestId)
        .set(serviceRequestData);

      console.log(`✅ Service request created: ${requestId} for category: ${category}`);

      res.status(201).json({
        success: true,
        message: 'Service request submitted successfully',
        data: {
          requestId,
          status: 'pending',
          category,
          serviceName
        }
      });

    } catch (error) {
      console.error('❌ Error submitting service request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit service request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get service requests for a specific project
   * GET /api/maintenance/requests/:projectId
   */
  async getServiceRequestsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const userPhone = req.user?.phone;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }

      // Query service requests for the project and user
      const snapshot = await firebaseConfig.db
        .collection('service_requests')
        .where('project_id', '==', projectId)
        .where('customer_phone', '==', userPhone)
        .orderBy('created_at', 'desc')
        .get();

      const requests = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || data.created_at,
          updated_at: data.updated_at?.toDate?.() || data.updated_at,
          status_updated_at: data.status_updated_at?.toDate?.() || data.status_updated_at
        });
      });

      res.json({
        success: true,
        data: {
          requests,
          total: requests.length,
          projectId
        }
      });

    } catch (error) {
      console.error('❌ Error fetching service requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all service requests for a customer
   * GET /api/maintenance/requests
   */
  async getCustomerServiceRequests(req, res) {
    try {
      const userPhone = req.user?.phone;

      if (!userPhone) {
        return res.status(400).json({
          success: false,
          message: 'User phone number not found'
        });
      }

      // Query all service requests for the customer
      const snapshot = await firebaseConfig.db
        .collection('service_requests')
        .where('customer_phone', '==', userPhone)
        .orderBy('created_at', 'desc')
        .get();

      const requests = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || data.created_at,
          updated_at: data.updated_at?.toDate?.() || data.updated_at,
          status_updated_at: data.status_updated_at?.toDate?.() || data.status_updated_at
        });
      });

      // Group by status for summary
      const statusSummary = requests.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          requests,
          total: requests.length,
          statusSummary
        }
      });

    } catch (error) {
      console.error('❌ Error fetching customer service requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get service request by ID
   * GET /api/maintenance/request/:requestId
   */
  async getServiceRequestById(req, res) {
    try {
      const { requestId } = req.params;
      const userPhone = req.user?.phone;

      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
      }

      // Get service request document
      const doc = await firebaseConfig.db
        .collection('service_requests')
        .doc(requestId)
        .get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }

      const data = doc.data();

      // Verify the request belongs to the user
      if (data.customer_phone !== userPhone) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const request = {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.() || data.created_at,
        updated_at: data.updated_at?.toDate?.() || data.updated_at,
        status_updated_at: data.status_updated_at?.toDate?.() || data.status_updated_at
      };

      res.json({
        success: true,
        data: { request }
      });

    } catch (error) {
      console.error('❌ Error fetching service request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update service request status (Admin/Technician only)
   * PATCH /api/maintenance/request/:requestId/status
   */
  async updateServiceRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { status, notes = '', technician_id = null } = req.body;

      // Validate status
      const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      // Check if request exists
      const requestRef = firebaseConfig.db.collection('service_requests').doc(requestId);
      const doc = await requestRef.get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }

      // Update request
      const updateData = {
        status,
        status_updated_at: firebaseConfig.getServerTimestamp(),
        updated_at: firebaseConfig.getServerTimestamp()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (technician_id) {
        updateData.technician_id = technician_id;
      }

      await requestRef.update(updateData);

      console.log(`✅ Service request ${requestId} status updated to: ${status}`);

      res.json({
        success: true,
        message: 'Service request status updated successfully',
        data: {
          requestId,
          status,
          notes
        }
      });

    } catch (error) {
      console.error('❌ Error updating service request status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service request status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Cancel service request (Customer only)
   * PATCH /api/maintenance/request/:requestId/cancel
   */
  async cancelServiceRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason = '' } = req.body;
      const userPhone = req.user?.phone;

      // Check if request exists and belongs to user
      const requestRef = firebaseConfig.db.collection('service_requests').doc(requestId);
      const doc = await requestRef.get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }

      const data = doc.data();
      if (data.customer_phone !== userPhone) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if request can be cancelled
      if (['completed', 'cancelled'].includes(data.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel request with status: ${data.status}`
        });
      }

      // Update request
      await requestRef.update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: firebaseConfig.getServerTimestamp(),
        status_updated_at: firebaseConfig.getServerTimestamp(),
        updated_at: firebaseConfig.getServerTimestamp()
      });

      console.log(`✅ Service request ${requestId} cancelled by customer`);

      res.json({
        success: true,
        message: 'Service request cancelled successfully',
        data: {
          requestId,
          status: 'cancelled',
          reason
        }
      });

    } catch (error) {
      console.error('❌ Error cancelling service request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel service request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get service request statistics (Admin only)
   * GET /api/maintenance/stats
   */
  async getServiceRequestStats(req, res) {
    try {
      // This would typically have admin authentication
      const snapshot = await firebaseConfig.db
        .collection('service_requests')
        .get();

      const stats = {
        total: 0,
        byStatus: {},
        byCategory: {},
        byUrgency: {},
        recent: []
      };

      const requests = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        stats.total++;
        
        // By status
        stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;
        
        // By category
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
        
        // By urgency
        stats.byUrgency[data.urgency] = (stats.byUrgency[data.urgency] || 0) + 1;
        
        // Add to requests array for recent requests
        requests.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || data.created_at
        });
      });

      // Sort by creation date and get recent 10
      stats.recent = requests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Error fetching service request stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service request statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new MaintenanceController();