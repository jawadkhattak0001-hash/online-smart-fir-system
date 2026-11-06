const express = require('express');
const router = express.Router();
const PoliceStation = require('../models/PoliceStation');
const { protect } = require('../middleware/authMiddleware');
const { getAllStations } = require('../utils/stationUtils');

// Get all stations
router.get('/', protect, async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json({ success: true, stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get station by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const station = await PoliceStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create station (Super Admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const station = await PoliceStation.create(req.body);
    res.status(201).json({ success: true, station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;