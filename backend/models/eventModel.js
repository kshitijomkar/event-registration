// backend/models/eventModel.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'An event must have a description'],
  },
  date: {
    type: Date,
    required: [true, 'An event must have a date'],
  },
  venue: {
    type: String,
    required: [true, 'An event must have a venue'],
  },
  registrationFee: {
    type: Number,
    required: [true, 'An event must have a registration fee'],
    default: 0,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED'],
    default: 'ACTIVE',
  },
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;