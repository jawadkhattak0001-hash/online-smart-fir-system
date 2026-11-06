const mongoose = require('mongoose');

const PoliceStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  city: { type: String, default: 'Islamabad' },
  jurisdiction: { type: String },
  shos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  si: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PoliceStation', PoliceStationSchema);