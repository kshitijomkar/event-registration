// backend/models/registrationModel.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  paymentScreenshot: {
    type: String,
    required: [true, 'Payment proof is required.'],
  },
  transactionId: {
    type: String,
  },
  qrUsed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;