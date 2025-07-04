// // server/src/models/Feedback.js
// class Feedback {
//   constructor(data) {
//     this.id = data.id || null;
//     this.userId = data.userId;
//     this.leadId = data.leadId;
//     this.customerName = data.customerName;
//     this.projectName = data.projectName;
//     this.location = data.location;
//     this.handoverDate = data.handoverDate;
//     this.contactNumber = data.contactNumber;
    
//     // Rating fields (1-4 scale)
//     this.ratings = {
//       installationBehavior: data.ratings?.installationBehavior || 0,
//       punctuality: data.ratings?.punctuality || 0,
//       cleanliness: data.ratings?.cleanliness || 0,
//       installationQuality: data.ratings?.installationQuality || 0,
//       productQuality: data.ratings?.productQuality || 0,
//       deliveryExperience: data.ratings?.deliveryExperience || 0,
//       communication: data.ratings?.communication || 0,
//       overallExperience: data.ratings?.overallExperience || 0
//     };
    
//     // Text feedback
//     this.likedMost = data.likedMost || '';
//     this.improvements = data.improvements || '';
//     this.wouldRecommend = data.wouldRecommend || ''; // Yes/No/Maybe
    
//     // Acknowledgements
//     this.customerConfirmation = data.customerConfirmation || false;
//     this.projectManager = data.projectManager || '';
//     this.installerNames = data.installerNames || '';
    
//     // System fields
//     this.submittedAt = data.submittedAt || new Date();
//     this.isSubmitted = data.isSubmitted !== undefined ? data.isSubmitted : true;
//     this.referenceId = data.referenceId || this.generateReferenceId();
//   }

//   generateReferenceId() {
//     const date = new Date();
//     const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
//     const timeStr = date.getTime().toString().slice(-6);
//     return `FB-${dateStr}-${timeStr}`;
//   }

//   toFirestore() {
//     return {
//       userId: this.userId,
//       leadId: this.leadId,
//       customerName: this.customerName,
//       projectName: this.projectName,
//       location: this.location,
//       handoverDate: this.handoverDate,
//       contactNumber: this.contactNumber,
//       ratings: this.ratings,
//       likedMost: this.likedMost,
//       improvements: this.improvements,
//       wouldRecommend: this.wouldRecommend,
//       customerConfirmation: this.customerConfirmation,
//       projectManager: this.projectManager,
//       installerNames: this.installerNames,
//       submittedAt: this.submittedAt,
//       isSubmitted: this.isSubmitted,
//       referenceId: this.referenceId
//     };
//   }

//   static fromFirestore(doc) {
//     const data = doc.data();
//     return new Feedback({
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
//     if (!this.location?.trim()) errors.push('Location is required');
//     if (!this.handoverDate) errors.push('Handover date is required');
//     if (!this.contactNumber?.trim()) errors.push('Contact number is required');

//     // Rating validation (all ratings must be between 1-4)
//     const ratingFields = Object.keys(this.ratings);
//     for (const field of ratingFields) {
//       const rating = this.ratings[field];
//       if (!rating || rating < 1 || rating > 4) {
//         errors.push(`${field} rating must be between 1 and 4`);
//       }
//     }

//     // Text feedback validation
//     if (!this.likedMost?.trim()) errors.push('Liked most feedback is required');
//     if (!this.improvements?.trim()) errors.push('Improvements feedback is required');
//     if (!['Yes', 'No', 'Maybe'].includes(this.wouldRecommend)) {
//       errors.push('Would recommend must be Yes, No, or Maybe');
//     }

//     // Acknowledgement validation
//     if (!this.customerConfirmation) errors.push('Customer confirmation is required');
//     if (!this.projectManager?.trim()) errors.push('Project manager name is required');
//     if (!this.installerNames?.trim()) errors.push('Installer names are required');

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }
// }

// export default Feedback;