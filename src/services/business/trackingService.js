// // server/services/business/trackingService.js
// import { StageMapper } from '../utils/stageMapper.js';
// import odooService from '../external/odoo/odooClient.js';
// // import { db } from '../external/firebase/firestore.js';

// // import firestoreService from '../external/firebase/firestore.js';

// import firebaseConfig, { db, auth } from '../../config/firebase.js';
// import notificationService from './notificationService.js';
// import { normalizePhone } from '../utils/phoneUtils.js';
// import { getAllCustomStages, STAGE_FLOW_ORDER } from '../../constants/stageMapping.js';



// class TrackingService {
//   constructor() {
//     this.stageMapper = new StageMapper();
//   }

//   async processLead(leadData) {
//     try {
//       const { id: odooLeadId, name: customerName, phone, stage_id } = leadData;
//       //console.log(`🔍 myyy logg line 21 Processing lead: ${customerName} (${odooLeadId}) - Stage ${stage_id}`);
//       console.log(`🔍 Processing lead: ${customerName} (${odooLeadId}) - Stage ${stage_id}`);

//       const stageIdArray = leadData.stage_id;
//       const stageId = Array.isArray(stageIdArray) ? stageIdArray[0] : stageIdArray;
//       console.log(`🔍 Stage ID extracted: ${stageId}`);
      
//       // ENSURE it's a number, not a string
//       const stageIdNumber = parseInt(stageId);
//       console.log(`🔍 Stage ID as number: ${stageIdNumber}`);

//       if (!phone || !odooLeadId || !stageIdNumber) {
//         console.log('⚠️ Skipping lead with missing data:', {
//           phone: !!phone,
//           odooLeadId: !!odooLeadId, 
//           stageId: stageIdNumber,
//           originalStageId: leadData.stage_id
//         });
//         return { skipped: true, reason: 'Missing required data' };
//       }

//       // LOG with just the number
//       console.log(`📋 Processing lead ${odooLeadId}: "${customerName}" - Stage ${stageIdNumber}`);

//        const normalizedPhone = normalizePhone(phone);
      
//       // Find existing project
//       const existingProject = await firebaseConfig.findProject(normalizedPhone, odooLeadId);
      
//       if (existingProject) {
//         return await this.updateExistingProject(existingProject, stageIdNumber, customerName);
//       } else {
//         return await this.createNewProject({
//           phone: normalizedPhone,
//           odoo_lead_id: odooLeadId,
//           customer_name: customerName,
//           stage_id: stageIdNumber  // Pass ONLY the number
//         });
//       }
      
//     } catch (error) {
//       console.error('❌ Error processing lead:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update existing project with new stage
//    * @param {Object} existingProject - Existing project data
//    * @param {number} newStageId - New stage ID
//    * @param {string} customerName - Customer name
//    * @returns {Promise<Object>} Update result
//    */
//   // async updateExistingProject(existingProject, newStageId, customerName) {
//   //   try {
//   //     // Check if stage actually changed
//   //     if (existingProject.current_stage_id === newStageId) {
//   //       console.log(`⚠️ No stage change for project ${existingProject.id}: ${newStageId}`);
//   //       return { 
//   //         updated: false, 
//   //         reason: 'No stage change',
//   //         project_id: existingProject.id 
//   //       };
//   //     }

//   //     console.log(`🔄 Stage change detected: ${existingProject.current_stage_id} → ${newStageId}`);

//   //     // Create stage history entry
//   //     const customStages = getAllCustomStages(newStageId);
//   //     const stageHistoryEntry = {
//   //       stage_id: newStageId,
//   //       timestamp: new Date(),
//   //       custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
//   //       stage_group: this.determineStageGroup(customStages)
//   //     };

//   //     // Add stage to history
//   //     await firestoreService.addStageToHistory(existingProject.id, stageHistoryEntry);

//   //     // Update customer name if changed
//   //     if (customerName && customerName !== existingProject.customer_name) {
//   //       await firestoreService.updateProject(existingProject.id, {
//   //         customer_name: customerName
//   //       });
//   //     }

//   //     // Check for feedback triggers
//   //     await this.checkFeedbackTriggers(existingProject, newStageId);

//   //     // Process notifications
//   //     const notificationResult = await notificationService.processStageChange(
//   //       { ...existingProject, id: existingProject.id },
//   //       newStageId,
//   //       customerName || existingProject.customer_name
//   //     );

//   //     console.log(`✅ Project updated: ${existingProject.id}, notifications: ${notificationResult.notifications_sent.length}`);

//   //     return {
//   //       updated: true,
//   //       project_id: existingProject.id,
//   //       stage_change: `${existingProject.current_stage_id} → ${newStageId}`,
//   //       notifications_sent: notificationResult.notifications_sent.length,
//   //       notification_errors: notificationResult.errors.length
//   //     };
      
//   //   } catch (error) {
//   //     console.error('❌ Error updating existing project:', error);
//   //     throw error;
//   //   }
//   // }


//   async updateExistingProject(existingProject, newStageId, customerName) {
//     try {
//       // FIXED: Check last stage from stage_history array, not current_stage_id field
//       const stageHistory = existingProject.stage_history || [];
//       const lastStageEntry = stageHistory[stageHistory.length - 1];
//       const lastStageId = lastStageEntry ? lastStageEntry.stage_id?.[0] : null;

//       console.log(`🔍 Checking stage change for project ${existingProject.id}:`);
//       console.log(`   Last stage in history: ${lastStageId}`);
//       console.log(`   New stage from Odoo: ${newStageId}`);

//       // Check if stage actually changed
//       if (lastStageId === newStageId) {
//         console.log(`⚠️ No stage change for project ${existingProject.id}: ${newStageId}`);
//         return { 
//           updated: false, 
//           reason: 'No stage change',
//           project_id: existingProject.id 
//         };
//       }

//       console.log(`🔄 Stage change detected: ${lastStageId} → ${newStageId}`);

//       // Rest of the method remains the same...
//       const customStages = getAllCustomStages(newStageId);
//       const stageHistoryEntry = {
//         stage_id: newStageId,
//         timestamp: new Date(),
//         custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
//         stage_group: this.determineStageGroup(customStages)
//       };

//       // Add stage to history
//       await firebaseConfig.addStageToHistory(existingProject.id, stageHistoryEntry);

//       // Update customer name if changed
//       if (customerName && customerName !== existingProject.customer_name) {
//         await firebaseConfig.updateProject(existingProject.id, {
//           customer_name: customerName
//         });
//       }

//       // Check for feedback triggers
//       await this.checkFeedbackTriggers(existingProject, newStageId);

//       // Process notifications
//       const notificationResult = await notificationService.processStageChange(
//         { ...existingProject, id: existingProject.id },
//         newStageId,
//         customerName || existingProject.customer_name
//       );

//       console.log(`✅ Project updated: ${existingProject.id}, notifications: ${notificationResult.notifications_sent.length}`);

//       return {
//         updated: true,
//         project_id: existingProject.id,
//         stage_change: `${lastStageId} → ${newStageId}`,
//         notifications_sent: notificationResult.notifications_sent.length,
//         notification_errors: notificationResult.errors.length
//       };
      
//     } catch (error) {
//       console.error('❌ Error updating existing project:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create new project tracking record
//    * @param {Object} projectData - New project data
//    * @returns {Promise<Object>} Creation result
//    */
//   async createNewProject(projectData) {
//     try {
//       const { phone, odoo_lead_id, customer_name, stage_id } = projectData;

//       console.log(`📝 Creating new project: ${customer_name} (${phone}) - Stage ${stage_id}`);

//       // Get custom stages for initial stage
//       const customStages = getAllCustomStages(stage_id);
      
//       // Create initial project record
//       const newProjectData = {
//         phone,
//         odoo_lead_id,
//         customer_name,
        
//         // Stage tracking
//         stage_history: [{
//           stage_id,
//           timestamp: new Date(),
//           custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
//           stage_group: this.determineStageGroup(customStages)
//         }],
        
//         current_stage_id: stage_id,
//         current_custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
        
//         // Initialize notification tracking
//         notifications_sent: {
//           project_stages: {},
//           payment_stages: {},
//           dispatch_stages: {}
//         },
        
//         // Initialize feedback tracking
//         feedback_status: {
//           stage_22_reached: stage_id === 22,
//           feedback_sent: false,
//           feedback_submitted: false,
//           fallback_triggered: false
//         },
        
//         is_active: true
//       };

//       // Create project in database
//       const projectId = await firebaseConfig.createProject(newProjectData);

//       // Process initial notifications
//       const notificationResult = await notificationService.processStageChange(
//         { ...newProjectData, id: projectId },
//         stage_id,
//         customer_name
//       );

//       console.log(`✅ New project created: ${projectId}, notifications: ${notificationResult.notifications_sent.length}`);

//       return {
//         created: true,
//         project_id: projectId,
//         initial_stage: stage_id,
//         notifications_sent: notificationResult.notifications_sent.length,
//         notification_errors: notificationResult.errors.length
//       };
      
//     } catch (error) {
//       console.error('❌ Error creating new project:', error);
//       throw error;
//     }
//   }

//   /**
//    * Check for feedback form triggers
//    * @param {Object} projectData - Project data
//    * @param {number} newStageId - New stage ID
//    * @returns {Promise<void>}
//    */
//   async checkFeedbackTriggers(projectData, newStageId) {
//     try {
//       // Update stage 22 reached status
//       if (newStageId === 22) {
//         await firebaseConfig.updateFeedbackStatus(projectData.id, {
//           stage_22_reached: true
//         });

//         // Send feedback form if not already sent
//         if (!projectData.feedback_status?.feedback_sent) {
//           await notificationService.sendFeedbackNotification(
//             projectData.phone,
//             projectData.customer_name,
//             projectData.id
//           );

//           await firebaseConfig.updateFeedbackStatus(projectData.id, {
//             feedback_sent: true
//           });
//         }
//       }

//       // Check for fallback triggers (stage 11 or 12 without stage 22)
//       if ([11, 12].includes(newStageId)) {
//         await this.checkFeedbackFallback(projectData, newStageId);
//       }
      
//     } catch (error) {
//       console.error('❌ Error checking feedback triggers:', error);
//       // Don't throw as this is supplementary functionality
//     }
//   }

//   /**
//    * Check feedback fallback for missed stage 22
//    * @param {Object} projectData - Project data
//    * @param {number} currentStageId - Current stage ID
//    * @returns {Promise<void>}
//    */
//   async checkFeedbackFallback(projectData, currentStageId) {
//     try {
//       const { stage_history = [], feedback_status = {} } = projectData;

//       // Check if stage 22 was reached in history
//       const stage22InHistory = stage_history.some(h => h.stage_id === 22);

//       // If stage 22 was missed and fallback not triggered
//       if (!stage22InHistory && 
//           !feedback_status.stage_22_reached && 
//           !feedback_status.fallback_triggered) {
        
//         console.log(`🔔 Triggering feedback fallback for project ${projectData.id} at stage ${currentStageId}`);
        
//         // Send feedback notification
//         await notificationService.sendFeedbackNotification(
//           projectData.phone,
//           projectData.customer_name,
//           projectData.id
//         );
        
//         // Mark fallback as triggered
//         await firebaseConfig.updateFeedbackStatus(projectData.id, {
//           fallback_triggered: true,
//           feedback_sent: true
//         });
//       }
      
//     } catch (error) {
//       console.error('❌ Error checking feedback fallback:', error);
//     }
//   }

//   /**
//    * Determine stage group from custom stages
//    * @param {Object} customStages - Custom stages object
//    * @returns {string} Stage group
//    */
//   determineStageGroup(customStages) {
//     if (customStages.project) return 'project';
//     if (customStages.payment) return 'payment';
//     if (customStages.dispatch) return 'dispatch';
//     return 'unknown';
//   }

//   /**
//    * Get project data for customer dashboard
//    * @param {string} phone - Customer phone number
//    * @returns {Promise<Object|null>} Project data or null
//    */
//   async getProjectForCustomer(phone) {
//     try {
//       return await firebaseConfig.getProjectByPhone(phone);
//     } catch (error) {
//       console.error('❌ Error getting project for customer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get processing statistics
//    * @returns {Promise<Object>} Statistics
//    */
//   async getProcessingStats() {
//     try {
//       const projects = await firebaseConfig.getAllActiveProjects();

//       const stats = {
//         total_projects: projects.length,
//         stage_distribution: {},
//         notification_counts: {
//           project_stages: 0,
//           payment_stages: 0,
//           dispatch_stages: 0
//         }
//       };

//       projects.forEach(project => {
//         // Count stage distribution
//         const stage = project.current_stage_id;
//         stats.stage_distribution[stage] = (stats.stage_distribution[stage] || 0) + 1;
        
//         // Count notifications sent
//         const notifications = project.notifications_sent || {};
//         Object.keys(notifications).forEach(category => {
//           if (stats.notification_counts[category] !== undefined) {
//             const categoryNotifications = notifications[category] || {};
//             const sentCount = Object.values(categoryNotifications).filter(n => n.sent).length;
//             stats.notification_counts[category] += sentCount;
//           }
//         });
//       });

//       return stats;
      
//     } catch (error) {
//       console.error('❌ Error getting processing stats:', error);
//       throw error;
//     }
//   }

//   async getProjectTrackingData(phone) {
//     try {
//       // Get lead from Odoo
//       const odooLead = await odooService.searchLeadByPhone(phone);
//       if (!odooLead) {
//         return {
//           success: false,
//           message: 'No project found for this phone number',
//           data: null
//         };
//       }

//       const currentStageId = odooLead.stage_id?.[0];
      
//       // Check if stage is visible
//       if (!this.stageMapper.isStageVisible(currentStageId)) {
//         return {
//           success: true,
//           message: 'Project details will be available soon',
//           data: {
//             odooLead,
//             stageVisible: false,
//             currentStageId
//           }
//         };
//       }

//       // Get tracking data
//       const trackingData = await this.buildTrackingData(currentStageId, odooLead);
      
//       return {
//         success: true,
//         message: 'Project tracking data retrieved successfully',
//         data: {
//           odooLead,
//           stageVisible: true,
//           currentStageId,
//           ...trackingData
//         }
//       };
//     } catch (error) {
//       console.error('Error getting project tracking data:', error);
//       throw error;
//     }
//   }

//   async buildTrackingData(stageId, odooLead) {
//     const trackingData = {
//       projectStage: this.stageMapper.getCurrentProjectStage(stageId),
//       paymentStage: this.stageMapper.getCurrentPaymentStage(stageId),
//       dispatchStage: this.stageMapper.getCurrentDispatchStage(stageId),
//       projectProgress: this.stageMapper.getProjectProgress(stageId),
//       paymentProgress: this.stageMapper.getPaymentProgress(stageId),
//       shouldShowDispatch: this.stageMapper.shouldShowDispatchTracking(stageId),
//       shouldTriggerFeedback: this.stageMapper.shouldTriggerFeedback(stageId),
//       allProjectStages: this.stageMapper.getAllProjectStages(),
//       allPaymentStages: this.stageMapper.getAllPaymentStages(),
//       allDispatchStages: this.stageMapper.getAllDispatchStages(),
//       estimatedCompletion: this.calculateEstimatedCompletion(stageId),
//       contactInfo: await this.getContactInfo(stageId, odooLead)
//     };

//     return trackingData;
//   }

//   calculateEstimatedCompletion(stageId) {
//     const projectStage = this.stageMapper.getCurrentProjectStage(stageId);
//     if (!projectStage) return null;

//     const remainingStages = 5 - projectStage.currentStage;
//     const daysPerStage = 7; // Average days per stage
//     const estimatedDays = remainingStages * daysPerStage;
    
//     const completionDate = new Date();
//     completionDate.setDate(completionDate.getDate() + estimatedDays);
    
//     return {
//       estimatedDays,
//       completionDate: completionDate.toISOString(),
//       remainingStages
//     };
//   }

//   async getContactInfo(stageId, odooLead) {
//     // Mock contact data - in production, this could come from Odoo or a separate contacts system
//     return {
//       mainContact: {
//         name: 'Rajesh Kumar',
//         designation: 'Project Manager',
//         phone: '+91 98765 43210',
//         email: 'rajesh.kumar@modula.com',
//         assigned: true
//       },
//       installationSupervisor: {
//         name: stageId >= 10 ? 'Amit Singh' : 'To be assigned',
//         designation: 'Fitter Installation Partner',
//         phone: stageId >= 10 ? '+91 87654 32109' : null,
//         email: stageId >= 10 ? 'amit.singh@partner.com' : null,
//         assigned: stageId >= 10,
//         scheduledDate: stageId >= 10 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
//       }
//     };
//   }

//   async updateProjectStage(leadId, newStageId, updatedBy) {
//     try {
//       // Update in Odoo (if needed)
//       // await odooService.updateLeadStage(leadId, newStageId);

//       // Log stage change in Firebase
//       await this.logStageChange(leadId, newStageId, updatedBy);

//       return {
//         success: true,
//         message: 'Project stage updated successfully'
//       };
//     } catch (error) {
//       console.error('Error updating project stage:', error);
//       throw error;
//     }
//   }

//   async logStageChange(leadId, newStageId, updatedBy) {
//     const stageChangeLog = {
//       leadId,
//       newStageId,
//       updatedBy,
//       timestamp: new Date(),
//       stageInfo: this.stageMapper.getStageInfo(newStageId)
//     };

//     await db.collection('stageChanges').add(stageChangeLog);
//   }

//   async getStageHistory(leadId) {
//     try {
//       const stageChanges = await db.collection('stageChanges')
//         .where('leadId', '==', leadId)
//         .orderBy('timestamp', 'desc')
//         .get();

//       const history = stageChanges.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         timestamp: doc.data().timestamp.toDate()
//       }));

//       return {
//         success: true,
//         data: history
//       };
//     } catch (error) {
//       console.error('Error getting stage history:', error);
//       throw error;
//     }
//   }
// }

// const trackingService = new TrackingService();

// export default trackingService;

// server/src/services/business/trackingService.js - ENHANCED VERSION
import { StageMapper } from '../utils/stageMapper.js';
import odooService from '../external/odoo/odooClient.js';
import firebaseConfig, { db, auth } from '../../config/firebase.js';
import notificationService from './notificationService.js';
import { normalizePhone } from '../utils/phoneUtils.js';
import { getAllCustomStages, STAGE_FLOW_ORDER } from '../../constants/stageMapping.js';

class TrackingService {
  constructor() {
    this.stageMapper = new StageMapper();
  }

  async processLead(leadData) {
    try {
      const { id: odooLeadId, name: customerName, phone, stage_id } = leadData;
      console.log(`🔍 Processing lead: ${customerName} (${odooLeadId}) - Stage ${stage_id}`);

      const stageIdArray = leadData.stage_id;
      const stageId = Array.isArray(stageIdArray) ? stageIdArray[0] : stageIdArray;
      console.log(`🔍 Stage ID extracted: ${stageId}`);
      
      const stageIdNumber = parseInt(stageId);
      console.log(`🔍 Stage ID as number: ${stageIdNumber}`);

      if (!phone || !odooLeadId || !stageIdNumber) {
        console.log('⚠️ Skipping lead with missing data:', {
          phone: !!phone,
          odooLeadId: !!odooLeadId, 
          stageId: stageIdNumber,
          originalStageId: leadData.stage_id
        });
        return { skipped: true, reason: 'Missing required data' };
      }

      console.log(`📋 Processing lead ${odooLeadId}: "${customerName}" - Stage ${stageIdNumber}`);

      const normalizedPhone = normalizePhone(phone);
      
      // Find existing project
      const existingProject = await firebaseConfig.findProject(normalizedPhone, odooLeadId);
      
      if (existingProject) {
        return await this.updateExistingProject(existingProject, stageIdNumber, customerName);
      } else {
        return await this.createNewProject({
          phone: normalizedPhone,
          odoo_lead_id: odooLeadId,
          customer_name: customerName,
          stage_id: stageIdNumber
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing lead:', error);
      throw error;
    }
  }

  async updateExistingProject(existingProject, newStageId, customerName) {
    try {
      const stageHistory = existingProject.stage_history || [];
      const lastStageEntry = stageHistory[stageHistory.length - 1];
      const lastStageId = lastStageEntry ? lastStageEntry.stage_id?.[0] : null;

      console.log(`🔍 Checking stage change for project ${existingProject.id}:`);
      console.log(`   Last stage in history: ${lastStageId}`);
      console.log(`   New stage from Odoo: ${newStageId}`);

      if (lastStageId === newStageId) {
        console.log(`⚠️ No stage change for project ${existingProject.id}: ${newStageId}`);
        return { 
          updated: false, 
          reason: 'No stage change',
          project_id: existingProject.id 
        };
      }

      console.log(`🔄 Stage change detected: ${lastStageId} → ${newStageId}`);

      const customStages = getAllCustomStages(newStageId);
      const stageHistoryEntry = {
        stage_id: newStageId,
        timestamp: new Date(),
        custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
        stage_group: this.determineStageGroup(customStages)
      };

      await firebaseConfig.addStageToHistory(existingProject.id, stageHistoryEntry);

      if (customerName && customerName !== existingProject.customer_name) {
        await firebaseConfig.updateProject(existingProject.id, {
          customer_name: customerName
        });
      }

      // ✅ ENHANCED: Check for feedback triggers and update user flags
      await this.checkFeedbackTriggers(existingProject, newStageId);

      const notificationResult = await notificationService.processStageChange(
        { ...existingProject, id: existingProject.id },
        newStageId,
        customerName || existingProject.customer_name
      );

      console.log(`✅ Project updated: ${existingProject.id}, notifications: ${notificationResult.notifications_sent.length}`);

      return {
        updated: true,
        project_id: existingProject.id,
        stage_change: `${lastStageId} → ${newStageId}`,
        notifications_sent: notificationResult.notifications_sent.length,
        notification_errors: notificationResult.errors.length
      };
      
    } catch (error) {
      console.error('❌ Error updating existing project:', error);
      throw error;
    }
  }

  async createNewProject(projectData) {
    try {
      const { phone, odoo_lead_id, customer_name, stage_id } = projectData;

      console.log(`📝 Creating new project: ${customer_name} (${phone}) - Stage ${stage_id}`);

      const customStages = getAllCustomStages(stage_id);
      
      const newProjectData = {
        phone,
        odoo_lead_id,
        customer_name,
        
        stage_history: [{
          stage_id,
          timestamp: new Date(),
          custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
          stage_group: this.determineStageGroup(customStages)
        }],
        
        current_stage_id: stage_id,
        current_custom_stage: customStages.project || customStages.payment || customStages.dispatch || 'unknown',
        
        notifications_sent: {
          project_stages: {},
          payment_stages: {},
          dispatch_stages: {}
        },
        
        feedback_status: {
          stage_22_reached: stage_id === 22,
          feedback_sent: false,
          feedback_submitted: false,
          fallback_triggered: false
        },
        
        is_active: true
      };

      const projectId = await firebaseConfig.createProject(newProjectData);

      // ✅ ENHANCED: Check for feedback triggers and update user flags
      await this.checkFeedbackTriggers(newProjectData, stage_id);

      const notificationResult = await notificationService.processStageChange(
        { ...newProjectData, id: projectId },
        stage_id,
        customer_name
      );

      console.log(`✅ New project created: ${projectId}, notifications: ${notificationResult.notifications_sent.length}`);

      return {
        created: true,
        project_id: projectId,
        initial_stage: stage_id,
        notifications_sent: notificationResult.notifications_sent.length,
        notification_errors: notificationResult.errors.length
      };
      
    } catch (error) {
      console.error('❌ Error creating new project:', error);
      throw error;
    }
  }

  // ✅ ENHANCED: Check feedback triggers and update user boolean flags
  async checkFeedbackTriggers(projectData, newStageId) {
    try {
      // Update stage 22 reached status in project
      if (newStageId === 22) {
        await firebaseConfig.updateFeedbackStatus(projectData.id, {
          stage_22_reached: true
        });

        // ✅ NEW: Update user's feedback eligibility flag
        await this.updateUserFeedbackEligibility(projectData.phone, true);

        // Send feedback form if not already sent
        if (!projectData.feedback_status?.feedback_sent) {
          await notificationService.sendFeedbackNotification(
            projectData.phone,
            projectData.customer_name,
            projectData.id
          );

          await firebaseConfig.updateFeedbackStatus(projectData.id, {
            feedback_sent: true
          });
        }
      }

      // Check for fallback triggers (stage 11 or 12 without stage 22)
      if ([11, 12].includes(newStageId)) {
        await this.checkFeedbackFallback(projectData, newStageId);
      }
      
    } catch (error) {
      console.error('❌ Error checking feedback triggers:', error);
      // Don't throw as this is supplementary functionality
    }
  }

  // ✅ NEW: Update user's feedback eligibility flag
  async updateUserFeedbackEligibility(phone, isEligible) {
    try {
      const normalizedPhone = normalizePhone(phone);
      
      // Find user by phone number
      const userQuery = await db.collection('users').where('phone', '==', normalizedPhone).get();
      
      if (userQuery.empty) {
        console.log(`⚠️ No user found with phone ${normalizedPhone} to update feedback eligibility`);
        return;
      }

      const userDoc = userQuery.docs[0];
      
      // Update user's feedback eligibility
      await userDoc.ref.update({
        'feedback_status.is_eligible': isEligible
      });

      console.log(`✅ Updated feedback eligibility for user ${userDoc.id} (${normalizedPhone}): ${isEligible}`);
      
    } catch (error) {
      console.error('❌ Error updating user feedback eligibility:', error);
    }
  }

  async checkFeedbackFallback(projectData, currentStageId) {
    try {
      const { stage_history = [], feedback_status = {} } = projectData;

      // Check if stage 22 was reached in history
      const stage22InHistory = stage_history.some(h => h.stage_id === 22);

      // If stage 22 was missed and fallback not triggered
      if (!stage22InHistory && 
          !feedback_status.stage_22_reached && 
          !feedback_status.fallback_triggered) {
        
        console.log(`🔔 Triggering feedback fallback for project ${projectData.id} at stage ${currentStageId}`);
        
        // ✅ NEW: Update user's feedback eligibility flag (fallback)
        await this.updateUserFeedbackEligibility(projectData.phone, true);
        
        // Send feedback notification
        await notificationService.sendFeedbackNotification(
          projectData.phone,
          projectData.customer_name,
          projectData.id
        );
        
        // Mark fallback as triggered
        await firebaseConfig.updateFeedbackStatus(projectData.id, {
          fallback_triggered: true,
          feedback_sent: true
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking feedback fallback:', error);
    }
  }

  determineStageGroup(customStages) {
    if (customStages.project) return 'project';
    if (customStages.payment) return 'payment';
    if (customStages.dispatch) return 'dispatch';
    return 'unknown';
  }

  async getProjectForCustomer(phone) {
    try {
      return await firebaseConfig.getProjectByPhone(phone);
    } catch (error) {
      console.error('❌ Error getting project for customer:', error);
      throw error;
    }
  }

  async getProcessingStats() {
    try {
      const projects = await firebaseConfig.getAllActiveProjects();

      const stats = {
        total_projects: projects.length,
        stage_distribution: {},
        notification_counts: {
          project_stages: 0,
          payment_stages: 0,
          dispatch_stages: 0
        }
      };

      projects.forEach(project => {
        const stage = project.current_stage_id;
        stats.stage_distribution[stage] = (stats.stage_distribution[stage] || 0) + 1;
        
        const notifications = project.notifications_sent || {};
        Object.keys(notifications).forEach(category => {
          if (stats.notification_counts[category] !== undefined) {
            const categoryNotifications = notifications[category] || {};
            const sentCount = Object.values(categoryNotifications).filter(n => n.sent).length;
            stats.notification_counts[category] += sentCount;
          }
        });
      });

      return stats;
      
    } catch (error) {
      console.error('❌ Error getting processing stats:', error);
      throw error;
    }
  }

  async getProjectTrackingData(phone) {
    try {
      const odooLead = await odooService.fetchLeadByPhone(phone);
      if (!odooLead) {
        return {
          success: false,
          message: 'No project found for this phone number',
          data: null
        };
      }

      const currentStageId = odooLead.stage_id?.[0];
      
      if (!this.stageMapper.isStageVisible(currentStageId)) {
        return {
          success: true,
          message: 'Project details will be available soon',
          data: {
            odooLead,
            stageVisible: false,
            currentStageId
          }
        };
      }

      const trackingData = await this.buildTrackingData(currentStageId, odooLead);
      
      return {
        success: true,
        message: 'Project tracking data retrieved successfully',
        data: {
          odooLead,
          stageVisible: true,
          currentStageId,
          ...trackingData
        }
      };
    } catch (error) {
      console.error('Error getting project tracking data:', error);
      throw error;
    }
  }

  async buildTrackingData(stageId, odooLead) {
    const trackingData = {
      projectStage: this.stageMapper.getCurrentProjectStage(stageId),
      paymentStage: this.stageMapper.getCurrentPaymentStage(stageId),
      dispatchStage: this.stageMapper.getCurrentDispatchStage(stageId),
      projectProgress: this.stageMapper.getProjectProgress(stageId),
      paymentProgress: this.stageMapper.getPaymentProgress(stageId),
      shouldShowDispatch: this.stageMapper.shouldShowDispatchTracking(stageId),
      shouldTriggerFeedback: this.stageMapper.shouldTriggerFeedback(stageId),
      allProjectStages: this.stageMapper.getAllProjectStages(),
      allPaymentStages: this.stageMapper.getAllPaymentStages(),
      allDispatchStages: this.stageMapper.getAllDispatchStages(),
      estimatedCompletion: this.calculateEstimatedCompletion(stageId),
      contactInfo: await this.getContactInfo(stageId, odooLead)
    };

    return trackingData;
  }

  calculateEstimatedCompletion(stageId) {
    const projectStage = this.stageMapper.getCurrentProjectStage(stageId);
    if (!projectStage) return null;

    const remainingStages = 5 - projectStage.currentStage;
    const daysPerStage = 7;
    const estimatedDays = remainingStages * daysPerStage;
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedDays);
    
    return {
      estimatedDays,
      completionDate: completionDate.toISOString(),
      remainingStages
    };
  }

  async getContactInfo(stageId, odooLead) {
    return {
      mainContact: {
        name: 'Rajesh Kumar',
        designation: 'Project Manager',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@modula.com',
        assigned: true
      },
      installationSupervisor: {
        name: stageId >= 10 ? 'Amit Singh' : 'To be assigned',
        designation: 'Fitter Installation Partner',
        phone: stageId >= 10 ? '+91 87654 32109' : null,
        email: stageId >= 10 ? 'amit.singh@partner.com' : null,
        assigned: stageId >= 10,
        scheduledDate: stageId >= 10 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
      }
    };
  }

  async updateProjectStage(leadId, newStageId, updatedBy) {
    try {
      await this.logStageChange(leadId, newStageId, updatedBy);

      return {
        success: true,
        message: 'Project stage updated successfully'
      };
    } catch (error) {
      console.error('Error updating project stage:', error);
      throw error;
    }
  }

  async logStageChange(leadId, newStageId, updatedBy) {
    const stageChangeLog = {
      leadId,
      newStageId,
      updatedBy,
      timestamp: new Date(),
      stageInfo: this.stageMapper.getStageInfo(newStageId)
    };

    await db.collection('stageChanges').add(stageChangeLog);
  }

  async getStageHistory(leadId) {
    try {
      const stageChanges = await db.collection('stageChanges')
        .where('leadId', '==', leadId)
        .orderBy('timestamp', 'desc')
        .get();

      const history = stageChanges.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      return {
        success: true,
        data: history
      };
    } catch (error) {
      console.error('Error getting stage history:', error);
      throw error;
    }
  }
}

const trackingService = new TrackingService();

export default trackingService;


