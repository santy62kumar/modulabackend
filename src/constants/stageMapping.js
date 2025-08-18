// // server/src/constants/stageMapping.js

// /**
//  * Odoo Stage Mappings and Constants
//  * Maps Odoo stage_ids to custom app stages
//  */

// // Hidden stages that should not be tracked
// const HIDDEN_STAGES = [1, 2, 23, 13, 3, 14, 5, 6, 15, 16, 28];

// // Stage mapping for different categories
// const STAGE_MAPPING = {
//   // Project Stages (5 stages)
//   project: {
//     "booking_confirmed": [7, 8],
//     "in_production": [17, 18, 25, 19, 9],
//     "dispatched": [24, 20, 21],
//     "installed": [10, 22],
//     "order_completed": [11, 12, 26, 27]
//   },
  
//   // Payment Stages (3 stages)
//   payment: {
//     "booking_fees": [4],
//     "first_installment": [7, 8, 17, 18, 25, 19],
//     "second_installment": [9, 24, 20, 21, 10, 22, 11, 12, 26, 27]
//   },
  
//   // Dispatch Stages (3 substages)
//   dispatch: {
//     "ready_for_dispatch": [24],
//     "order_dispatched": [20], 
//     "order_delivered": [21]
//   }
// };

// // Complete stage flow order for fallback detection
// const STAGE_FLOW_ORDER = [
//   4, 7, 8, 17, 18, 25, 19, // BEFORE STAGE 9
//   9,                        // INSTALLATION SCHEDULING TRIGGER
//   24, 20, 21, 10,          // DISPATCH AND INSTALLATION
//   22,                      // FEEDBACK TRIGGER
//   11, 12, 26, 27           // FINAL STAGES
// ];

// /**
//  * Get custom stage name from Odoo stage_id
//  * @param {number} stageId - Odoo stage ID
//  * @param {string} category - Category: 'project', 'payment', 'dispatch'
//  * @returns {string|null} Custom stage name or null
//  */
// function getCustomStage(stageId, category) {
//   const categoryMapping = STAGE_MAPPING[category];
//   if (!categoryMapping) return null;
  
//   for (const [customStage, stageIds] of Object.entries(categoryMapping)) {
//     if (stageIds.includes(stageId)) {
//       return customStage;
//     }
//   }
//   return null;
// }

// /**
//  * Get all custom stages for a given Odoo stage_id
//  * @param {number} stageId - Odoo stage ID
//  * @returns {Object} Object with project, payment, and dispatch stages
//  */
// function getAllCustomStages(stageId) {
//   return {
//     project: getCustomStage(stageId, 'project'),
//     payment: getCustomStage(stageId, 'payment'),
//     dispatch: getCustomStage(stageId, 'dispatch')
//   };
// }

// /**
//  * Check if stage is hidden
//  * @param {number} stageId - Odoo stage ID
//  * @returns {boolean}
//  */
// function isHiddenStage(stageId) {
//   return HIDDEN_STAGES.includes(stageId);
// }

// /**
//  * Get stage category and name
//  * @param {number} stageId - Odoo stage ID
//  * @returns {Object} {category, stage} or null
//  */
// function getStageInfo(stageId) {
//   // Check each category
//   for (const [category, stages] of Object.entries(STAGE_MAPPING)) {
//     for (const [stageName, stageIds] of Object.entries(stages)) {
//       if (stageIds.includes(stageId)) {
//         return { category, stage: stageName };
//       }
//     }
//   }
//   return null;
// }

// export {
//   HIDDEN_STAGES,
//   STAGE_MAPPING,
//   STAGE_FLOW_ORDER,
//   getCustomStage,
//   getAllCustomStages,
//   isHiddenStage,
//   getStageInfo
// };

// server/src/constants/stageMapping.js

/**
 * Stage mappings for project tracking
 * Based on PDF: New flow: 1->2->23->13->3->14->5->6->15->16->28->4->18->7->8->25->19->24->9->31->20->21->10->22->11->12->26->27
 */

// Updated project stages based on PDF
export const PROJECT_STAGES = {
  // 1. Booking Confirmed [7,8]
  BOOKING_CONFIRMED: [7, 8],
  
  // 2. In Production [18,25,19,9] - Updated to include 18 based on new flow
  IN_PRODUCTION: [18, 25, 19, 9],
  
  // 3. Ready for Dispatch [24,31,20,21] - Updated to include 31
  READY_FOR_DISPATCH: [24, 31, 20, 21],
  
  // 4. Ready for Installation [10]
  READY_FOR_INSTALLATION: [10],
  
  // 5. Order Completed [22,11,12,26,27]
  ORDER_COMPLETED: [22, 11, 12, 26, 27]
};

// Updated payment stages
export const PAYMENT_STAGES = {
  // Booking Fees received [4]
  BOOKING_FEES: [4],
  
  // First installment received [7,8,17,18,25,19] - Updated to include 18
  FIRST_INSTALLMENT: [7, 8, 17, 18, 25, 19],
  
  // Second installment received [9,24,31,20,21,10,22,11,12,26,27] - Updated to include 31
  SECOND_INSTALLMENT: [9, 24, 31, 20, 21, 10, 22, 11, 12, 26, 27]
};

// Hidden stages - Updated based on new flow
// New flow: 1->2->23->13->3->14->5->6->15->16->28->4->...
// Hidden stages are initial processing stages before stage 4
export const HIDDEN_STAGES = [1, 2, 23, 13, 3, 14, 5, 6, 15, 16, 28];

// Contact POC stage visibility
// As per PDF: supervisor available after stages [21,10,22,11,12,26,27]
export const SUPERVISOR_VISIBLE_STAGES = [21, 10, 22, 11, 12, 26, 27];

// Feedback trigger stage
export const FEEDBACK_TRIGGER_STAGE = 22;

// Stage flow order (complete flow from PDF)
export const STAGE_FLOW_ORDER = [
  1, 2, 23, 13, 3, 14, 5, 6, 15, 16, 28, // Hidden stages
  4,                                        // Booking fees
  18, 7, 8, 25, 19, 24, 9,                // Production & first installment
  31, 20, 21,                              // Dispatch
  10,                                       // Installation
  22,                                       // Feedback trigger
  11, 12, 26, 27                          // Final stages
];

// Utility functions
export const isStageVisible = (stageId) => {
  return !HIDDEN_STAGES.includes(stageId);
};

export const shouldShowSupervisor = (stageId) => {
  return SUPERVISOR_VISIBLE_STAGES.includes(stageId);
};

export const shouldTriggerFeedback = (stageId) => {
  return stageId === FEEDBACK_TRIGGER_STAGE;
};

// Helper function to get custom stage names
export const getAllCustomStages = (stageId) => {
  const result = {
    project: null,
    payment: null,
    dispatch: null
  };

  // Check project stages
  for (const [key, stages] of Object.entries(PROJECT_STAGES)) {
    if (stages.includes(stageId)) {
      result.project = key.toLowerCase().replace('_', ' ');
      break;
    }
  }

  // Check payment stages
  for (const [key, stages] of Object.entries(PAYMENT_STAGES)) {
    if (stages.includes(stageId)) {
      result.payment = key.toLowerCase().replace('_', ' ');
      break;
    }
  }

  return result;
};

// Export all constants
export default {
  PROJECT_STAGES,
  PAYMENT_STAGES,
  HIDDEN_STAGES,
  SUPERVISOR_VISIBLE_STAGES,
  FEEDBACK_TRIGGER_STAGE,
  STAGE_FLOW_ORDER,
  isStageVisible,
  shouldShowSupervisor,
  shouldTriggerFeedback,
  getAllCustomStages
};