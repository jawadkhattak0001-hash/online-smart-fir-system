const mongoose = require('mongoose');

const FIRSchema = new mongoose.Schema({
  firNumber: { type: String, unique: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complainantName: { type: String, required: true },
  fatherName: { type: String },
  cnic: { type: String },
  contactNumber: { type: String },
  address: { type: String },
  
  incidentType: { type: String, required: true },
  dateOfIncident: { type: String },
  timeOfIncident: { type: String },
  placeOfIncident: { type: String },
  narrative: { type: String, required: true },
  ppcSections: { type: String },
  
  policeStation: { type: String },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedDate: { type: Date },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'assigned', 'investigating', 'submitted_to_dsp', 'challan', 'c_report', 'closed'],
    default: 'pending'
  },

  rejectionReason: { type: String },
  
  investigationNotes: [{ type: String }],
  evidence: [{ type: String }],
  
  dspReviewDate: { type: Date },
  dspDecision: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FIRSchema.pre('save', async function (next) {
  if (!this.firNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('FIR').countDocuments();
    this.firNumber = `FIR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FIR', FIRSchema);