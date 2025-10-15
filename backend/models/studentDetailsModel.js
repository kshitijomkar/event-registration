// backend/models/studentDetailsModel.js
const mongoose = require('mongoose');

const studentDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.ObjectId, ref: 'Event', required: true },
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  year: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  collegeName: { type: String, required: true },
  teamName: { type: String }, // Optional
}, { timestamps: true });

const StudentDetails = mongoose.model('StudentDetails', studentDetailsSchema);
module.exports = StudentDetails;