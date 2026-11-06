const express = require('express');
const router = express.Router();
const Camera = require('../models/Camera');
const { protect } = require('../middleware/authMiddleware');

// GET /api/cameras - Get all cameras
router.get('/', protect, async (req, res) => {
  try {
    const cameras = await Camera.find().sort({ createdAt: -1 });
    res.json({ success: true, cameras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cameras - Add new camera
router.post('/', protect, async (req, res) => {
  try {
    const camera = await Camera.create({ ...req.body, stationId: req.user.stationId });
    res.status(201).json({ success: true, camera });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cameras/:id - Update camera
router.put('/:id', protect, async (req, res) => {
  try {
    const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }
    res.json({ success: true, camera });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cameras/:id - Delete camera
router.delete('/:id', protect, async (req, res) => {
  try {
    const camera = await Camera.findByIdAndDelete(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }
    res.json({ success: true, message: 'Camera deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;