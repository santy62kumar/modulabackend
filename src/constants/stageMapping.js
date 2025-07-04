// server/src/constants/stageMapping.js

/**
 * Odoo Stage Mappings and Constants
 * Maps Odoo stage_ids to custom app stages
 */

// Hidden stages that should not be tracked
const HIDDEN_STAGES = [1, 2, 23, 13, 3, 14, 5, 6, 15, 16, 28];

// Stage mapping for different categories
const STAGE_MAPPING = {
  // Project Stages (5 stages)
  project: {
    "booking_confirmed": [7, 8],
    "in_production": [17, 18, 25, 19, 9],
    "dispatched": [24, 20, 21],
    "installed": [10, 22],
    "order_completed": [11, 12, 26, 27]
  },
  
  // Payment Stages (3 stages)
  payment: {
    "booking_fees": [4],
    "first_installment": [7, 8, 17, 18, 25, 19],
    "second_installment": [9, 24, 20, 21, 10, 22, 11, 12, 26, 27]
  },
  
  // Dispatch Stages (3 substages)
  dispatch: {
    "ready_for_dispatch": [24],
    "order_dispatched": [20], 
    "order_delivered": [21]
  }
};

// Complete stage flow order for fallback detection
const STAGE_FLOW_ORDER = [
  4, 7, 8, 17, 18, 25, 19, // BEFORE STAGE 9
  9,                        // INSTALLATION SCHEDULING TRIGGER
  24, 20, 21, 10,          // DISPATCH AND INSTALLATION
  22,                      // FEEDBACK TRIGGER
  11, 12, 26, 27           // FINAL STAGES
];

/**
 * Get custom stage name from Odoo stage_id
 * @param {number} stageId - Odoo stage ID
 * @param {string} category - Category: 'project', 'payment', 'dispatch'
 * @returns {string|null} Custom stage name or null
 */
function getCustomStage(stageId, category) {
  const categoryMapping = STAGE_MAPPING[category];
  if (!categoryMapping) return null;
  
  for (const [customStage, stageIds] of Object.entries(categoryMapping)) {
    if (stageIds.includes(stageId)) {
      return customStage;
    }
  }
  return null;
}

/**
 * Get all custom stages for a given Odoo stage_id
 * @param {number} stageId - Odoo stage ID
 * @returns {Object} Object with project, payment, and dispatch stages
 */
function getAllCustomStages(stageId) {
  return {
    project: getCustomStage(stageId, 'project'),
    payment: getCustomStage(stageId, 'payment'),
    dispatch: getCustomStage(stageId, 'dispatch')
  };
}

/**
 * Check if stage is hidden
 * @param {number} stageId - Odoo stage ID
 * @returns {boolean}
 */
function isHiddenStage(stageId) {
  return HIDDEN_STAGES.includes(stageId);
}

/**
 * Get stage category and name
 * @param {number} stageId - Odoo stage ID
 * @returns {Object} {category, stage} or null
 */
function getStageInfo(stageId) {
  // Check each category
  for (const [category, stages] of Object.entries(STAGE_MAPPING)) {
    for (const [stageName, stageIds] of Object.entries(stages)) {
      if (stageIds.includes(stageId)) {
        return { category, stage: stageName };
      }
    }
  }
  return null;
}

export {
  HIDDEN_STAGES,
  STAGE_MAPPING,
  STAGE_FLOW_ORDER,
  getCustomStage,
  getAllCustomStages,
  isHiddenStage,
  getStageInfo
};