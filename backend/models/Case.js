const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  firId: { type: mongoose.Schema.Types.ObjectId, ref: 'FIR', required: true },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['under_investigation', 'charges_filed', 'closed'],
    default: 'under_investigation'
  },
  stationId: { type: String },
  investigationNotes: [{ type: String }],
  evidence: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', CaseSchema);