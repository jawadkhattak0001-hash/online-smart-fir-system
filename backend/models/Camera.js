const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  feedUrl: { type: String },
  type: { type: String, default: 'CCTV' },
  status: { type: String, enum: ['active', 'offline'], default: 'active' },
  stationId: { type: String },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Camera', CameraSchema);