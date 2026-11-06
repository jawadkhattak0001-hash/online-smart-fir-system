const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');

// GET /api/alerts - Get all alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('suspectId')
      .populate('firId')
      .sort({ timestamp: -1 });
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/alerts/new - Get only new alerts
router.get('/new', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'new' })
      .populate('suspectId')
      .populate('firId')
      .sort({ timestamp: -1 });
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/alerts/:id/acknowledge - Acknowledge alert
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', acknowledgedBy: req.user.id },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;