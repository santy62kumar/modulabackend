// server/services/utils/stageMapper.js (Backend version)
export const STAGE_MAPPINGS = {
  // 5 Project Tracking Stages
  PROJECT_STAGES: {
    1: { // Booking Confirmed
      stageIds: [7, 8],
      name: 'Booking Confirmed',
      description: 'Your order has been confirmed',
      color: 'green'
    },
    2: { // In Production
      stageIds: [17, 18, 25, 19, 9],
      name: 'In Production',
      description: 'Your kitchen is being manufactured',
      color: 'blue'
    },
    3: { // Dispatched
      stageIds: [24, 20, 21],
      name: 'Dispatched',
      description: 'Your order is on the way',
      color: 'orange'
    },
    4: { // Installed
      stageIds: [10, 22],
      name: 'Installed',
      description: 'Installation completed',
      color: 'purple'
    },
    5: { // Order Completed
      stageIds: [11, 12, 26, 27],
      name: 'Order Complete',
      description: 'Project successfully completed',
      color: 'primary'
    }
  },

  // 3 Payment Milestones
  PAYMENT_STAGES: {
    1: { // Booking Fees
      stageIds: [4],
      name: 'Booking Amount Received',
      description: 'Initial booking payment'
    },
    2: { // First Installment
      stageIds: [7, 8, 17, 18, 25, 19],
      name: 'First Installment Received',
      description: 'Production milestone payment'
    },
    3: { // Second Installment
      stageIds: [9, 24, 20, 21, 10, 22, 11, 12, 26, 27],
      name: 'Second Installment Received',
      description: 'Final payment completed'
    }
  },

  // 3 Dispatch Sub-stages
  DISPATCH_STAGES: {
    1: { // Ready for Dispatch
      stageIds: [24],
      name: 'Ready for Dispatch',
      description: 'Order prepared for shipping'
    },
    2: { // Order Dispatched
      stageIds: [20],
      name: 'Dispatched',
      description: 'Order shipped from facility'
    },
    3: { // Reached Location
      stageIds: [21],
      name: 'Reached Location',
      description: 'Order delivered to your location'
    }
  }
};

// Hidden stages that show placeholder
export const HIDDEN_STAGES = [1, 2, 23, 13, 3, 14, 5, 6, 15, 16, 28];

export class StageMapper {
  getCurrentProjectStage(stageId) {
    for (const [stageNum, config] of Object.entries(STAGE_MAPPINGS.PROJECT_STAGES)) {
      if (config.stageIds.includes(stageId)) {
        return {
          currentStage: parseInt(stageNum),
          config,
          stageId
        };
      }
    }
    return null;
  }

  getCurrentPaymentStage(stageId) {
    for (const [stageNum, config] of Object.entries(STAGE_MAPPINGS.PAYMENT_STAGES)) {
      if (config.stageIds.includes(stageId)) {
        return {
          currentStage: parseInt(stageNum),
          config,
          stageId
        };
      }
    }
    return null;
  }

  getCurrentDispatchStage(stageId) {
    if (![24, 20, 21].includes(stageId)) {
      return null;
    }

    for (const [stageNum, config] of Object.entries(STAGE_MAPPINGS.DISPATCH_STAGES)) {
      if (config.stageIds.includes(stageId)) {
        return {
          currentStage: parseInt(stageNum),
          config,
          stageId
        };
      }
    }
    return null;
  }

  isStageVisible(stageId) {
    return !HIDDEN_STAGES.includes(stageId);
  }

  getProjectProgress(stageId) {
    const currentStage = this.getCurrentProjectStage(stageId);
    if (!currentStage) return { completed: 0, total: 5, percentage: 0 };

    const completed = currentStage.currentStage;
    const total = Object.keys(STAGE_MAPPINGS.PROJECT_STAGES).length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  getPaymentProgress(stageId) {
    const currentStage = this.getCurrentPaymentStage(stageId);
    if (!currentStage) return { completed: 0, total: 3, percentage: 0 };

    const completed = currentStage.currentStage;
    const total = Object.keys(STAGE_MAPPINGS.PAYMENT_STAGES).length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  shouldShowDispatchTracking(stageId) {
    return [24, 20, 21].includes(stageId);
  }

  shouldTriggerFeedback(stageId) {
    return stageId === 22;
  }

  getAllProjectStages() {
    return Object.entries(STAGE_MAPPINGS.PROJECT_STAGES).map(([num, config]) => ({
      stageNumber: parseInt(num),
      ...config
    }));
  }

  getAllPaymentStages() {
    return Object.entries(STAGE_MAPPINGS.PAYMENT_STAGES).map(([num, config]) => ({
      stageNumber: parseInt(num),
      ...config
    }));
  }

  getAllDispatchStages() {
    return Object.entries(STAGE_MAPPINGS.DISPATCH_STAGES).map(([num, config]) => ({
      stageNumber: parseInt(num),
      ...config
    }));
  }

  getStageInfo(stageId) {
    // Get comprehensive stage information
    const projectStage = this.getCurrentProjectStage(stageId);
    const paymentStage = this.getCurrentPaymentStage(stageId);
    const dispatchStage = this.getCurrentDispatchStage(stageId);

    return {
      stageId,
      isVisible: this.isStageVisible(stageId),
      projectStage,
      paymentStage,
      dispatchStage,
      shouldShowDispatch: this.shouldShowDispatchTracking(stageId),
      shouldTriggerFeedback: this.shouldTriggerFeedback(stageId)
    };
  }
}