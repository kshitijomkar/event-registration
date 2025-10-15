const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true, uppercase: true },
  year: { type: Number, required: true, enum: [1, 2, 3] },
  section: { type: String, required: true, uppercase: true, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  mobile: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  // --- NEW FIELDS TO TRACK ATTENDANCE ---
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date, default: null },
  // ---
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', RegistrationSchema);