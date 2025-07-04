// // server/src/controllers/maintenanceController.js
// import MaintenanceService from '../services/business/maintenanceService.js';

// class MaintenanceController {
//   constructor() {
//     this.maintenanceService = new MaintenanceService();
//   }

//   async submitMaintenanceRequest(req, res) {
//     try {
//       const { userId, leadId } = req.user; // From auth middleware
//       const requestData = req.body;

//       const result = await this.maintenanceService.submitMaintenanceRequest(userId, leadId, requestData);

//       res.status(201).json({
//         success: true,
//         message: result.message,
//         data: {
//           referenceId: result.request.referenceId,
//           submittedAt: result.request.submittedAt,
//           status: result.request.status
//         }
//       });
//     } catch (error) {
//       console.error('Error in submitMaintenanceRequest controller:', error);
      
//       if (error.message.includes('Validation failed')) {
//         return res.status(400).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to submit maintenance request. Please try again.'
//       });
//     }
//   }

//   async getUserMaintenanceRequests(req, res) {
//     try {
//       const { userId } = req.user; // From auth middleware

//       const result = await this.maintenanceService.getMaintenanceRequestsByUser(userId);

//       res.status(200).json({
//         success: true,
//         data: {
//           request: result.request
//         }
//       });
//     } catch (error) {
//       console.error('Error in getMaintenanceRequestByReference controller:', error);
      
//       if (error.message.includes('not found')) {
//         return res.status(404).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve maintenance request'
//       });
//     }
//   }

//   async updateRequestStatus(req, res) {
//     try {
//       const { requestId } = req.params;
//       const { status, notes } = req.body;
//       const { userId, role } = req.user; // From auth middleware

//       if (!status) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status is required'
//         });
//       }

//       // Only allow admin or user who owns the request to update status
//       const userIdToCheck = role === 'admin' ? null : userId;

//       const result = await this.maintenanceService.updateRequestStatus(
//         requestId, 
//         status, 
//         notes || '', 
//         userIdToCheck
//       );

//       res.status(200).json({
//         success: true,
//         message: result.message,
//         data: {
//           request: result.request
//         }
//       });
//     } catch (error) {
//       console.error('Error in updateRequestStatus controller:', error);
      
//       if (error.message.includes('Invalid status') || error.message.includes('not found')) {
//         return res.status(400).json({
//           success: false,
//           message: error.message
//         });
//       }

//       if (error.message.includes('Unauthorized')) {
//         return res.status(403).json({
//           success: false,
//           message: error.message
//         });
//       }

//       res.status(500).json({
//         success: false,
//         message: 'Failed to update request status'
//       });
//     }
//   }
// }

// export default MaintenanceController;

// //   async deleteMaintenanceRequest(req, res) {
// //     try {
// //       const { requestId } = req.params;
// //       const { userId, role } = req.user; // From auth middleware

// //       // Only allow admin or user who owns the request to delete
// //       const userIdToCheck = role === 'admin' ? null : userId;

// //       const result = await this.maintenanceService.deleteMaintenanceRequest(requestId, userIdToCheck);

// //       res.status(200).json({
// //         success: true,
// //         message: result.message
// //       });
// //     } catch (error) {
// //       console.error('Error in deleteMaintenanceRequest controller:', error);
      
// //       if (error.message.includes('not found')) {
// //         return res.status(404).json({
// //           success: false,
// //           message: error.message
// //         });
// //       }

// //       if (error.message.includes('Unauthorized') || error.message.includes('Cannot delete')) {
// //         return res.status(403).json({
// //           success: false,
// //           message: error.message
// //         });
// //       }

// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to delete maintenance request'
// //       });
// //     }
// //   }

// //   // Admin-only endpoints
// //   async getAllMaintenanceRequests(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const filters = {
// //         userId: req.query.userId,
// //         leadId: req.query.leadId,
// //         status: req.query.status,
// //         priority: req.query.priority,
// //         assignedTeam: req.query.assignedTeam,
// //         dateFrom: req.query.dateFrom,
// //         dateTo: req.query.dateTo
// //       };

// //       const pagination = {
// //         limit: req.query.limit ? parseInt(req.query.limit) : 50
// //       };

// //       // Remove undefined values from filters
// //       Object.keys(filters).forEach(key => {
// //         if (filters[key] === undefined) delete filters[key];
// //       });

// //       const result = await this.maintenanceService.getAllMaintenanceRequests(filters, pagination);

// //       res.status(200).json({
// //         success: true,
// //         data: result
// //       });
// //     } catch (error) {
// //       console.error('Error in getAllMaintenanceRequests controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance requests'
// //       });
// //     }
// //   }

// //   async getMaintenanceRequestsByStatus(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const { status } = req.params;
// //       const validStatuses = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];
      
// //       if (!validStatuses.includes(status)) {
// //         return res.status(400).json({
// //           success: false,
// //           message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
// //         });
// //       }

// //       const result = await this.maintenanceService.getMaintenanceRequestsByStatus(status);

// //       res.status(200).json({
// //         success: true,
// //         data: {
// //           requests: result.requests,
// //           count: result.count
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getMaintenanceRequestsByStatus controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance requests by status'
// //       });
// //     }
// //   }

// //   async assignTeamToRequest(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const { requestId } = req.params;
// //       const { teamId, scheduledDate } = req.body;

// //       if (!teamId) {
// //         return res.status(400).json({
// //           success: false,
// //           message: 'Team ID is required'
// //         });
// //       }

// //       const result = await this.maintenanceService.assignTeamToRequest(
// //         requestId, 
// //         teamId, 
// //         scheduledDate
// //       );

// //       res.status(200).json({
// //         success: true,
// //         message: result.message,
// //         data: {
// //           request: result.request
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in assignTeamToRequest controller:', error);
      
// //       if (error.message.includes('not found')) {
// //         return res.status(404).json({
// //           success: false,
// //           message: error.message
// //         });
// //       }

// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to assign team to request'
// //       });
// //     }
// //   }

// //   async getMaintenanceStatistics(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const result = await this.maintenanceService.getMaintenanceStatistics();

// //       res.status(200).json({
// //         success: true,
// //         data: result.statistics
// //       });
// //     } catch (error) {
// //       console.error('Error in getMaintenanceStatistics controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance statistics'
// //       });
// //     }
// //   }

// //   async getPendingRequests(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const result = await this.maintenanceService.getPendingRequests();

// //       res.status(200).json({
// //         success: true,
// //         data: {
// //           requests: result.requests,
// //           count: result.count
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getPendingRequests controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve pending requests'
// //       });
// //     }
// //   }

// //   async getOverdueRequests(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const result = await this.maintenanceService.getOverdueRequests();

// //       res.status(200).json({
// //         success: true,
// //         data: {
// //           requests: result.requests,
// //           count: result.count
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getOverdueRequests controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve overdue requests'
// //       });
// //     }
// //   }

// //   async generateMaintenanceReport(req, res) {
// //     try {
// //       const { role } = req.user; // From auth middleware
      
// //       if (role !== 'admin') {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. Admin privileges required.'
// //         });
// //       }

// //       const filters = {
// //         dateFrom: req.query.dateFrom,
// //         dateTo: req.query.dateTo,
// //         status: req.query.status,
// //         priority: req.query.priority,
// //         assignedTeam: req.query.assignedTeam
// //       };

// //       // Remove undefined values from filters
// //       Object.keys(filters).forEach(key => {
// //         if (filters[key] === undefined) delete filters[key];
// //       });

// //       const result = await this.maintenanceService.generateMaintenanceReport(filters);

// //       res.status(200).json({
// //         success: true,
// //         data: result.report
// //       });
// //     } catch (error) {
// //       console.error('Error in generateMaintenanceReport controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to generate maintenance report'
// //       });
// //     }
// //   }
// // }

// // export default MaintenanceController;({
// //         success: true,
// //         data: {
// //           requests: result.requests,
// //           count: result.count
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getUserMaintenanceRequests controller:', error);
// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance requests'
// //       });
// //     }
// //   }

// //   async getMaintenanceRequestById(req, res) {
// //     try {
// //       const { requestId } = req.params;
// //       const { userId, role } = req.user; // From auth middleware

// //       const result = await this.maintenanceService.getMaintenanceRequestById(requestId);

// //       // Check if user has permission to view this request
// //       if (role !== 'admin' && result.request.userId !== userId) {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. You can only view your own requests.'
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         data: {
// //           request: result.request
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getMaintenanceRequestById controller:', error);
      
// //       if (error.message.includes('not found')) {
// //         return res.status(404).json({
// //           success: false,
// //           message: error.message
// //         });
// //       }

// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance request'
// //       });
// //     }
// //   }

// //   async getMaintenanceRequestByReference(req, res) {
// //     try {
// //       const { referenceId } = req.params;
// //       const { userId, role } = req.user; // From auth middleware

// //       const result = await this.maintenanceService.getMaintenanceRequestByReference(referenceId);

// //       // Check if user has permission to view this request
// //       if (role !== 'admin' && result.request.userId !== userId) {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Access denied. You can only view your own requests.'
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         data: {
// //           request: result.request
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error in getMaintenanceRequestByReference controller:', error);

// //       if (error.message.includes('not found')) {
// //         return res.status(404).json({
// //           success: false,
// //           message: error.message
// //         });
// //       }

// //       res.status(500).json({
// //         success: false,
// //         message: 'Failed to retrieve maintenance request'
// //       });
// //     }
// //     }

