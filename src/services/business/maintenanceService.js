// server/src/services/business/maintenanceService.js
import MaintenanceRepository from '../data/maintenanceRepository.js';
import { validateMaintenanceRequest, sanitizeMaintenanceData } from '../../validators/maintenanceValidator.js';
import sendSMS  from '../external/twilio/smsService.js';

class MaintenanceService {
  constructor() {
    this.maintenanceRepo = new MaintenanceRepository();
  }

  async submitMaintenanceRequest(userId, leadId, requestData) {
    try {
      // Sanitize input data
      const sanitizedData = sanitizeMaintenanceData(requestData);
      
      // Validate maintenance request data
      const validation = validateMaintenanceRequest(sanitizedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Create maintenance request with user and lead information
      const requestToCreate = {
        ...sanitizedData,
        userId,
        leadId,
        submittedAt: new Date(),
        status: 'pending'
      };

      // Save request to database
      const savedRequest = await this.maintenanceRepo.create(requestToCreate);

      // Send SMS confirmation
      await this.sendRequestConfirmationSMS(savedRequest);

      return {
        success: true,
        request: savedRequest,
        message: 'Maintenance request submitted successfully'
      };
    } catch (error) {
      console.error('Error in submitMaintenanceRequest:', error);
      throw error;
    }
  }

  async getMaintenanceRequestsByUser(userId) {
    try {
      const requests = await this.maintenanceRepo.findByUserId(userId);
      return {
        success: true,
        requests,
        count: requests.length
      };
    } catch (error) {
      console.error('Error in getMaintenanceRequestsByUser:', error);
      throw error;
    }
  }

  async getMaintenanceRequestsByLead(leadId) {
    try {
      const requests = await this.maintenanceRepo.findByLeadId(leadId);
      return {
        success: true,
        requests,
        count: requests.length
      };
    } catch (error) {
      console.error('Error in getMaintenanceRequestsByLead:', error);
      throw error;
    }
  }

  async getMaintenanceRequestById(requestId) {
    try {
      const request = await this.maintenanceRepo.findById(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }

      return {
        success: true,
        request
      };
    } catch (error) {
      console.error('Error in getMaintenanceRequestById:', error);
      throw error;
    }
  }

  async getMaintenanceRequestsByStatus(status) {
    try {
      const requests = await this.maintenanceRepo.findByStatus(status);
      return {
        success: true,
        requests,
        count: requests.length
      };
    } catch (error) {
      console.error('Error in getMaintenanceRequestsByStatus:', error);
      throw error;
    }
  }

  async getAllMaintenanceRequests(filters = {}, pagination = {}) {
    try {
      const result = await this.maintenanceRepo.findAll(filters, pagination);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Error in getAllMaintenanceRequests:', error);
      throw error;
    }
  }

  async updateRequestStatus(requestId, newStatus, notes = '', userId = null) {
    try {
      const request = await this.maintenanceRepo.findById(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }

      // If userId is provided, ensure user owns the request (for customer updates)
      if (userId && request.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own requests');
      }

      const updatedRequest = await this.maintenanceRepo.updateStatus(requestId, newStatus, notes);

      // Send status update SMS
      await this.sendStatusUpdateSMS(updatedRequest, newStatus);

      return {
        success: true,
        request: updatedRequest,
        message: 'Request status updated successfully'
      };
    } catch (error) {
      console.error('Error in updateRequestStatus:', error);
      throw error;
    }
  }

  async assignTeamToRequest(requestId, teamId, scheduledDate = null) {
    try {
      const updatedRequest = await this.maintenanceRepo.assignTeam(requestId, teamId, scheduledDate);

      // Send team assignment SMS
      await this.sendTeamAssignmentSMS(updatedRequest, scheduledDate);

      return {
        success: true,
        request: updatedRequest,
        message: 'Team assigned successfully'
      };
    } catch (error) {
      console.error('Error in assignTeamToRequest:', error);
      throw error;
    }
  }

  async getMaintenanceStatistics() {
    try {
      const stats = await this.maintenanceRepo.getStatistics();
      return {
        success: true,
        statistics: stats
      };
    } catch (error) {
      console.error('Error in getMaintenanceStatistics:', error);
      throw error;
    }
  }

  async getMaintenanceRequestByReference(referenceId) {
    try {
      const request = await this.maintenanceRepo.findByReferenceId(referenceId);
      if (!request) {
        throw new Error('Maintenance request not found with this reference ID');
      }

      return {
        success: true,
        request
      };
    } catch (error) {
      console.error('Error in getMaintenanceRequestByReference:', error);
      throw error;
    }
  }

  async getPendingRequests() {
    try {
      const requests = await this.maintenanceRepo.findPendingRequests();
      return {
        success: true,
        requests,
        count: requests.length
      };
    } catch (error) {
      console.error('Error in getPendingRequests:', error);
      throw error;
    }
  }

  async getOverdueRequests() {
    try {
      const requests = await this.maintenanceRepo.findOverdueRequests();
      return {
        success: true,
        requests,
        count: requests.length
      };
    } catch (error) {
      console.error('Error in getOverdueRequests:', error);
      throw error;
    }
  }

  async deleteMaintenanceRequest(requestId, userId = null) {
    try {
      const request = await this.maintenanceRepo.findById(requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }

      // If userId is provided, ensure user owns the request
      if (userId && request.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own requests');
      }

      // Only allow deletion if request is pending
      if (request.status !== 'pending') {
        throw new Error('Cannot delete request that is already being processed');
      }

      await this.maintenanceRepo.delete(requestId);

      return {
        success: true,
        message: 'Maintenance request deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteMaintenanceRequest:', error);
      throw error;
    }
  }

  async sendRequestConfirmationSMS(request) {
    try {
      const selectedServices = request.getSelectedServices();
      const servicesText = selectedServices.slice(0, 3).join(', ') + 
        (selectedServices.length > 3 ? ` and ${selectedServices.length - 3} more` : '');

      const message = `Hi ${request.customerName},

Your maintenance request has been submitted successfully!

Reference ID: ${request.referenceId}
Services: ${servicesText}
Request Date: ${new Date(request.requestDate).toLocaleDateString()}

Our technical team will contact you within 4-6 hours to schedule a convenient visit time.

– Team Modula`;

      await sendSMS(request.contactNumber, message);
      
      console.log(`Maintenance request confirmation SMS sent to ${request.contactNumber}`);
    } catch (error) {
      console.error('Error sending maintenance request confirmation SMS:', error);
      // Don't throw error as request submission should not fail due to SMS issues
    }
  }

  async sendStatusUpdateSMS(request, newStatus) {
    try {
      let message = '';
      
      switch (newStatus) {
        case 'assigned':
          message = `Hi ${request.customerName},

Your maintenance request (${request.referenceId}) has been assigned to our technical team. They will contact you soon to schedule a visit.

– Team Modula`;
          break;
          
        case 'in-progress':
          message = `Hi ${request.customerName},

Our technician is currently working on your maintenance request (${request.referenceId}). We'll update you once the work is completed.

– Team Modula`;
          break;
          
        case 'completed':
          message = `Hi ${request.customerName},

Great news! Your maintenance request (${request.referenceId}) has been completed successfully. Thank you for choosing Modula!

– Team Modula`;
          break;
          
        case 'cancelled':
          message = `Hi ${request.customerName},

Your maintenance request (${request.referenceId}) has been cancelled. If you have any questions, please contact our support team.

– Team Modula`;
          break;
      }

      if (message) {
        await sendSMS(request.contactNumber, message);
        console.log(`Status update SMS sent to ${request.contactNumber} for status: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error sending status update SMS:', error);
      // Don't throw error as status update should not fail due to SMS issues
    }
  }

  async sendTeamAssignmentSMS(request, scheduledDate) {
    try {
      let message = `Hi ${request.customerName},

Your maintenance request (${request.referenceId}) has been assigned to our expert team.`;

      if (scheduledDate) {
        message += `\n\nScheduled Visit: ${new Date(scheduledDate).toLocaleDateString()}`;
      }

      message += `

Our technician will contact you to confirm the visit time. Please keep your contact number available.

– Team Modula`;

      await sendSMS(request.contactNumber, message);
      console.log(`Team assignment SMS sent to ${request.contactNumber}`);
    } catch (error) {
      console.error('Error sending team assignment SMS:', error);
      // Don't throw error as assignment should not fail due to SMS issues
    }
  }

  async generateMaintenanceReport(filters = {}) {
    try {
      const { requests } = await this.maintenanceRepo.findAll(filters);
      const statistics = await this.maintenanceRepo.getStatistics();

      const report = {
        generatedAt: new Date(),
        filters,
        summary: {
          totalRequests: requests.length,
          pendingRequests: statistics.byStatus.pending,
          completedRequests: statistics.byStatus.completed,
          averageResolutionTime: statistics.averageResolutionTime
        },
        requests: requests.map(request => ({
          referenceId: request.referenceId,
          customerName: request.customerName,
          status: request.status,
          priority: request.priority,
          submittedAt: request.submittedAt,
          selectedServices: request.getSelectedServices(),
          scheduledDate: request.scheduledDate,
          completedDate: request.completedDate
        })),
        statistics
      };

      return {
        success: true,
        report
      };
    } catch (error) {
      console.error('Error in generateMaintenanceReport:', error);
      throw error;
    }
  }
}

export default MaintenanceService;