const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  suspectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Suspect' },
  firId: { type: mongoose.Schema.Types.ObjectId, ref: 'FIR' },
  confidence: { type: Number, min: 0, max: 100 },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'acknowledged', 'resolved'],
    default: 'new'
  },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  stationId: { type: String },
  cameraId: { type: String }
});

module.exports = mongoose.model('Alert', AlertSchema);