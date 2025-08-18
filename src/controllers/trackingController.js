// server/src/controllers/trackingController.js

// const trackingService = require('../services/business/trackingService');
// const cronJobsManager = require('../jobs/cronJobs');
// const odooClient = require('../services/external/odoo/odooClient');

import trackingService from '../services/business/trackingService.js';
import cronJobsManager from '../jobs/cronJobs.js';
import odooClient from '../services/external/odoo/odooClient.js';


// export const getProjectTracking = async (req, res) => {
//   try {
//     const { phone } = req.user;

//     const result = await trackingService.getProjectTrackingData(phone);

//     if (!result.success) {
//       return res.status(404).json({
//         message: result.message,
//         data: result.data
//       });
//     }

//     res.json({
//       message: result.message,
//       data: result.data
//     });
//   } catch (error) {
//     console.error('Error in getProjectTracking:', error);
//     res.status(500).json({
//       message: 'Failed to fetch project tracking data',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// export const updateProjectStage = async (req, res) => {
//   try {
//     const { leadId, newStageId } = req.body;
//     const { userId } = req.user;

//     if (!leadId || !newStageId) {
//       return res.status(400).json({
//         message: 'Lead ID and new stage ID are required'
//       });
//     }

//     const result = await trackingService.updateProjectStage(leadId, newStageId, userId);

//     res.json(result);
//   } catch (error) {
//     console.error('Error in updateProjectStage:', error);
//     res.status(500).json({
//       message: 'Failed to update project stage',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// export const getStageHistory = async (req, res) => {
//   try {
//     const { leadId } = req.params;

//     if (!leadId) {
//       return res.status(400).json({
//         message: 'Lead ID is required'
//       });
//     }

//     const result = await trackingService.getStageHistory(leadId);

//     res.json(result);
//   } catch (error) {
//     console.error('Error in getStageHistory:', error);
//     res.status(500).json({
//       message: 'Failed to fetch stage history',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


class TrackingController {

  /**
   * Get customer project tracking data
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   */


  async getCustomerProject(req, res) {
    try {
      const { phone } = req.user; // From JWT token
      
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number required'
        });
      }

      const projectData = await trackingService.getProjectForCustomer(phone);
      
      if (!projectData) {
        return res.status(404).json({
          success: false,
          message: 'Project details will be available soon'
        });
      }

      // Format response for frontend
      const response = {
        success: true,
        data: {
          customer_name: projectData.customer_name,
          current_stage_id: projectData.current_stage_id,
          current_custom_stage: projectData.current_custom_stage,
          stage_history: projectData.stage_history || [],
          notifications_sent: projectData.notifications_sent || {},
          feedback_status: projectData.feedback_status || {},
          project_created: projectData.created_at,
          last_updated: projectData.updated_at
        }
      };

      res.json(response);
      
    } catch (error) {
      console.error('❌ Error getting customer project:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get tracking statistics (Admin only)
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   */
  // async getTrackingStats(req, res) {
  //   try {
  //     // TODO: Add admin role check middleware
      
  //     const stats = await trackingService.getProcessingStats();
  //     const cronStatus = cronJobsManager.getStatus();
      
  //     const response = {
  //       success: true,
  //       data: {
  //         project_stats: stats,
  //         cron_status: cronStatus,
  //         system_health: cronJobsManager.getHealthCheck()
  //       }
  //     };

  //     res.json(response);
      
  //   } catch (error) {
  //     console.error('❌ Error getting tracking stats:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to get tracking statistics',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }

  // /**
  //  * Manually trigger Odoo poll (Admin only)
  //  * @param {Request} req - Express request
  //  * @param {Response} res - Express response
  //  */
  // async triggerManualPoll(req, res) {
  //   try {
  //     // TODO: Add admin role check middleware
      
  //     console.log('🔧 Manual poll triggered by admin');
      
  //     const result = await cronJobsManager.runJobManually('odooPoller');
      
  //     res.json({
  //       success: true,
  //       message: 'Manual poll completed',
  //       data: result
  //     });
      
  //   } catch (error) {
  //     console.error('❌ Error triggering manual poll:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to trigger manual poll',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }

  // /**
  //  * Restart cron jobs (Admin only)
  //  * @param {Request} req - Express request
  //  * @param {Response} res - Express response
  //  */
  // async restartCronJobs(req, res) {
  //   try {
  //     // TODO: Add admin role check middleware
      
  //     const { jobName } = req.body;
      
  //     if (jobName) {
  //       cronJobsManager.restartJob(jobName);
  //       res.json({
  //         success: true,
  //         message: `Job ${jobName} restarted successfully`
  //       });
  //     } else {
  //       cronJobsManager.stopAll();
  //       setTimeout(() => {
  //         cronJobsManager.startAll();
  //       }, 2000);
        
  //       res.json({
  //         success: true,
  //         message: 'All cron jobs restarted successfully'
  //       });
  //     }
      
  //   } catch (error) {
  //     console.error('❌ Error restarting cron jobs:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to restart cron jobs',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }

  // /**
  //  * Check Odoo connection health
  //  * @param {Request} req - Express request
  //  * @param {Response} res - Express response
  //  */
  // async checkOdooHealth(req, res) {
  //   try {
  //     // TODO: Add admin role check middleware
      
  //     const isHealthy = await odooClient.checkConnection();
      
  //     res.json({
  //       success: true,
  //       data: {
  //         odoo_connected: isHealthy,
  //         timestamp: new Date().toISOString()
  //       }
  //     });
      
  //   } catch (error) {
  //     console.error('❌ Error checking Odoo health:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to check Odoo connection',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }

  // /**
  //  * Get system health status
  //  * @param {Request} req - Express request
  //  * @param {Response} res - Express response
  //  */
  // async getSystemHealth(req, res) {
  //   try {
  //     const healthCheck = cronJobsManager.getHealthCheck();
  //     const odooHealth = await odooClient.checkConnection();
      
  //     const overallHealth = healthCheck.overall === 'healthy' && odooHealth;
      
  //     res.json({
  //       success: true,
  //       data: {
  //         overall_health: overallHealth ? 'healthy' : 'unhealthy',
  //         cron_jobs: healthCheck,
  //         odoo_connection: odooHealth,
  //         timestamp: new Date().toISOString()
  //       }
  //     });
      
  //   } catch (error) {
  //     console.error('❌ Error getting system health:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to get system health',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }

  // /**
  //  * Test customer phone lookup in Odoo
  //  * @param {Request} req - Express request  
  //  * @param {Response} res - Express response
  //  */
  // async testPhoneLookup(req, res) {
  //   try {
  //     // TODO: Add admin role check middleware
      
  //     const { phone } = req.query;
      
  //     if (!phone) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Phone parameter required'
  //       });
  //     }

  //     const leads = await odooClient.fetchLeadByPhone(phone);
      
  //     res.json({
  //       success: true,
  //       data: {
  //         phone: phone,
  //         leads_found: leads.length,
  //         leads: leads
  //       }
  //     });
      
  //   } catch (error) {
  //     console.error('❌ Error testing phone lookup:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to test phone lookup',
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // }
}

// Create singleton instance
const trackingController = new TrackingController();

export default trackingController;
