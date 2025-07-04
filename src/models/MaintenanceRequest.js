// // server/src/models/MaintenanceRequest.js
// class MaintenanceRequest {
//   constructor(data) {
//     this.id = data.id || null;
//     this.userId = data.userId;
//     this.leadId = data.leadId;
//     this.customerName = data.customerName;
//     this.projectName = data.projectName;
//     this.contactNumber = data.contactNumber;
//     this.requestDate = data.requestDate || new Date();
    
//     // Service requests (checkboxes)
//     this.services = {
//       fixDrawerAlignment: data.services?.fixDrawerAlignment || false,
//       channelHingeServicing: data.services?.channelHingeServicing || false,
//       replaceDamagedHardware: data.services?.replaceDamagedHardware || false,
//       fixLooseHinges: data.services?.fixLooseHinges || false,
//       kitchenDeepClean: data.services?.kitchenDeepClean || false,
//       addCoatingShutters: data.services?.addCoatingShutters || false,
//       fixApplianceIssues: data.services?.fixApplianceIssues || false,
//       addKitchenAccessories: data.services?.addKitchenAccessories || false,
//       upgradeShutters: data.services?.upgradeShutters || false,
//       remodelKitchen: data.services?.remodelKitchen || false,
//       addMoreUnits: data.services?.addMoreUnits || false,
//       upgradeAppliances: data.services?.upgradeAppliances || false,
//       repairMinorDamages: data.services?.repairMinorDamages || false,
//       fixUnderCabinetLighting: data.services?.fixUnderCabinetLighting || false,
//       changeHoodFilter: data.services?.changeHoodFilter || false,
//       other: data.services?.other || ''
//     };
    
//     // System fields
//     this.status = data.status || 'pending'; // pending, assigned, in-progress, completed, cancelled
//     this.priority = data.priority || 'standard'; // urgent, high, standard, low
//     this.submittedAt = data.submittedAt || new Date();
//     this.referenceId = data.referenceId || this.generateReferenceId();
//     this.assignedTeam = data.assignedTeam || null;
//     this.scheduledDate = data.scheduledDate || null;
//     this.completedDate = data.completedDate || null;
//     this.notes = data.notes || '';
//   }

//   generateReferenceId() {
//     const date = new Date();
//     const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
//     const timeStr = date.getTime().toString().slice(-6);
//     return `SR-${dateStr}-${timeStr}`;
//   }

//   getSelectedServices() {
//     const selected = [];
    
//     // Standard services
//     Object.keys(this.services).forEach(key => {
//       if (key !== 'other' && this.services[key]) {
//         selected.push(this.getServiceLabel(key));
//       }
//     });
    
//     // Other service
//     if (this.services.other?.trim()) {
//       selected.push(`Other: ${this.services.other}`);
//     }
    
//     return selected;
//   }

//   getServiceLabel(key) {
//     const labels = {
//       fixDrawerAlignment: 'Fix Drawer / Shutter Alignment',
//       channelHingeServicing: 'Channel and Hinge Servicing',
//       replaceDamagedHardware: 'Replace Damaged Hardware',
//       fixLooseHinges: 'Fix Loose Hinges / Screws / Handles',
//       kitchenDeepClean: 'Kitchen Deep Clean',
//       addCoatingShutters: 'Add Coating on Shutters (Teflon / Ceramic)',
//       fixApplianceIssues: 'Fix Appliance Issues',
//       addKitchenAccessories: 'Add Kitchen Accessories (e.g. Corner Unit)',
//       upgradeShutters: 'Upgrade Shutters',
//       remodelKitchen: 'Remodel/Renovate my Kitchen',
//       addMoreUnits: 'Add More Units (LC / UC)',
//       upgradeAppliances: 'Upgrade Appliances',
//       repairMinorDamages: 'Repair Minor Damages (Peel-off / Scratches)',
//       fixUnderCabinetLighting: 'Fix Under-Cabinet Lighting',
//       changeHoodFilter: 'Change Hood Filter'
//     };
//     return labels[key] || key;
//   }

//   toFirestore() {
//     return {
//       userId: this.userId,
//       leadId: this.leadId,
//       customerName: this.customerName,
//       projectName: this.projectName,
//       contactNumber: this.contactNumber,
//       requestDate: this.requestDate,
//       services: this.services,
//       status: this.status,
//       priority: this.priority,
//       submittedAt: this.submittedAt,
//       referenceId: this.referenceId,
//       assignedTeam: this.assignedTeam,
//       scheduledDate: this.scheduledDate,
//       completedDate: this.completedDate,
//       notes: this.notes
//     };
//   }

//   static fromFirestore(doc) {
//     const data = doc.data();
//     return new MaintenanceRequest({
//       id: doc.id,
//       ...data
//     });
//   }

//   validate() {
//     const errors = [];

//     // Required fields validation
//     if (!this.userId) errors.push('User ID is required');
//     if (!this.customerName?.trim()) errors.push('Customer name is required');
//     if (!this.projectName?.trim()) errors.push('Project name is required');
//     if (!this.contactNumber?.trim()) errors.push('Contact number is required');
//     if (!this.requestDate) errors.push('Request date is required');

//     // At least one service must be selected
//     const hasSelectedService = Object.keys(this.services).some(key => {
//       if (key === 'other') {
//         return this.services[key]?.trim();
//       }
//       return this.services[key];
//     });

//     if (!hasSelectedService) {
//       errors.push('At least one service must be selected');
//     }

//     // Validate request date is not in the past (allow today)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const requestDate = new Date(this.requestDate);
//     requestDate.setHours(0, 0, 0, 0);
    
//     if (requestDate < today) {
//       errors.push('Request date cannot be in the past');
//     }

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }

//   updateStatus(newStatus, notes = '') {
//     const validStatuses = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];
//     if (!validStatuses.includes(newStatus)) {
//       throw new Error('Invalid status');
//     }
    
//     this.status = newStatus;
//     if (notes) this.notes = notes;
    
//     if (newStatus === 'completed') {
//       this.completedDate = new Date();
//     }
//   }

//   assignTeam(teamId, scheduledDate = null) {
//     this.assignedTeam = teamId;
//     this.status = 'assigned';
//     if (scheduledDate) {
//       this.scheduledDate = scheduledDate;
//     }
//   }
// }

// export default MaintenanceRequest;