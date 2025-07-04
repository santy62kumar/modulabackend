// // server/src/validators/feedbackValidator.js
// const validateFeedbackSubmission = (data) => {
//   const errors = [];

//   // Basic Information Validation
//   if (!data.customerName?.trim()) {
//     errors.push({ field: 'customerName', message: 'Customer name is required' });
//   }

//   if (!data.projectName?.trim()) {
//     errors.push({ field: 'projectName', message: 'Project name is required' });
//   }

//   if (!data.location?.trim()) {
//     errors.push({ field: 'location', message: 'Location is required' });
//   }

//   if (!data.handoverDate) {
//     errors.push({ field: 'handoverDate', message: 'Handover date is required' });
//   } else {
//     // Validate date format
//     const date = new Date(data.handoverDate);
//     if (isNaN(date.getTime())) {
//       errors.push({ field: 'handoverDate', message: 'Invalid handover date format' });
//     }
//   }

//   if (!data.contactNumber?.trim()) {
//     errors.push({ field: 'contactNumber', message: 'Contact number is required' });
//   } else if (!/^\d{10}$/.test(data.contactNumber.replace(/\D/g, ''))) {
//     errors.push({ field: 'contactNumber', message: 'Contact number must be 10 digits' });
//   }

//   // Ratings Validation (1-4 scale)
//   const ratingFields = [
//     'installationBehavior',
//     'punctuality', 
//     'cleanliness',
//     'installationQuality',
//     'productQuality',
//     'deliveryExperience',
//     'communication',
//     'overallExperience'
//   ];

//   if (!data.ratings || typeof data.ratings !== 'object') {
//     errors.push({ field: 'ratings', message: 'Ratings are required' });
//   } else {
//     ratingFields.forEach(field => {
//       const rating = data.ratings[field];
//       if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 4) {
//         errors.push({ 
//           field: `ratings.${field}`, 
//           message: `${field} rating must be between 1 and 4` 
//         });
//       }
//     });
//   }

//   // Text Feedback Validation
//   if (!data.likedMost?.trim()) {
//     errors.push({ field: 'likedMost', message: 'Please share what you liked most' });
//   } else if (data.likedMost.trim().length < 10) {
//     errors.push({ field: 'likedMost', message: 'Please provide more detailed feedback (minimum 10 characters)' });
//   } else if (data.likedMost.trim().length > 1000) {
//     errors.push({ field: 'likedMost', message: 'Feedback too long (maximum 1000 characters)' });
//   }

//   if (!data.improvements?.trim()) {
//     errors.push({ field: 'improvements', message: 'Please share improvement suggestions' });
//   } else if (data.improvements.trim().length < 5) {
//     errors.push({ field: 'improvements', message: 'Please provide more detailed feedback (minimum 5 characters)' });
//   } else if (data.improvements.trim().length > 1000) {
//     errors.push({ field: 'improvements', message: 'Feedback too long (maximum 1000 characters)' });
//   }

//   if (!['Yes', 'No', 'Maybe'].includes(data.wouldRecommend)) {
//     errors.push({ field: 'wouldRecommend', message: 'Please select if you would recommend Modula' });
//   }

//   // Acknowledgement Validation
//   if (!data.customerConfirmation) {
//     errors.push({ field: 'customerConfirmation', message: 'Customer confirmation is required' });
//   }

//   if (!data.projectManager?.trim()) {
//     errors.push({ field: 'projectManager', message: 'Project manager name is required' });
//   } else if (data.projectManager.trim().length < 2) {
//     errors.push({ field: 'projectManager', message: 'Project manager name too short' });
//   } else if (data.projectManager.trim().length > 100) {
//     errors.push({ field: 'projectManager', message: 'Project manager name too long' });
//   }

//   if (!data.installerNames?.trim()) {
//     errors.push({ field: 'installerNames', message: 'Installer names are required' });
//   } else if (data.installerNames.trim().length < 2) {
//     errors.push({ field: 'installerNames', message: 'Installer names too short' });
//   } else if (data.installerNames.trim().length > 200) {
//     errors.push({ field: 'installerNames', message: 'Installer names too long' });
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// };

// const validateFeedbackUpdate = (data) => {
//   const errors = [];

//   // Only allow updating certain fields after submission
//   const allowedFields = ['notes', 'status'];
//   const providedFields = Object.keys(data);
  
//   const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
//   if (invalidFields.length > 0) {
//     errors.push({ 
//       field: 'general', 
//       message: `Cannot update fields: ${invalidFields.join(', ')}` 
//     });
//   }

//   if (data.status && !['submitted', 'reviewed', 'processed'].includes(data.status)) {
//     errors.push({ field: 'status', message: 'Invalid status value' });
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// };

// const sanitizeFeedbackData = (data) => {
//   return {
//     customerName: data.customerName?.trim(),
//     projectName: data.projectName?.trim(),
//     location: data.location?.trim(),
//     handoverDate: data.handoverDate,
//     contactNumber: data.contactNumber?.replace(/\D/g, ''),
//     ratings: {
//       installationBehavior: parseInt(data.ratings?.installationBehavior),
//       punctuality: parseInt(data.ratings?.punctuality),
//       cleanliness: parseInt(data.ratings?.cleanliness),
//       installationQuality: parseInt(data.ratings?.installationQuality),
//       productQuality: parseInt(data.ratings?.productQuality),
//       deliveryExperience: parseInt(data.ratings?.deliveryExperience),
//       communication: parseInt(data.ratings?.communication),
//       overallExperience: parseInt(data.ratings?.overallExperience)
//     },
//     likedMost: data.likedMost?.trim(),
//     improvements: data.improvements?.trim(),
//     wouldRecommend: data.wouldRecommend,
//     customerConfirmation: Boolean(data.customerConfirmation),
//     projectManager: data.projectManager?.trim(),
//     installerNames: data.installerNames?.trim()
//   };
// };

// export {
//   validateFeedbackSubmission,
//   validateFeedbackUpdate,
//   sanitizeFeedbackData
// };