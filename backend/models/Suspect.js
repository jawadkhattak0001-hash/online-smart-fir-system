const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  description: { type: String },
  photo: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

const SuspectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String },
  cnic: { type: String },
  district: { type: String },
  description: { type: String },
  photo: { type: String },  // Main suspect photo
  evidence: [EvidenceSchema],  // Array of evidence objects
  firIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FIR' }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['under_investigation', 'wanted', 'captured', 'cleared'],
    default: 'under_investigation'
  },
  lastSeen: { type: Date },
  lastLocation: { type: String },
  stationId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Suspect', SuspectSchema);