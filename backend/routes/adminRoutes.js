const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all officers (filtered by role)
router.get('/officers', protect, async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
    
    if (role) {
      filter.role = role;
    } else {
      filter.role = { $in: ['sho', 'si', 'dsp'] };
    }
    
    // If SHO, only show SIs in their station
    if (req.user.role === 'sho') {
      filter.stationId = req.user.stationId;
      filter.role = 'si';
    }
    
    const officers = await User.find(filter)
      .select('-password')
      .populate('stationId', 'name');
    
    res.json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create officer - SHO can create SI, Super Admin and DSP can create any officer
router.post('/create-officer', protect, async (req, res) => {
  try {
    const { name, cnic, phone, password, role, stationId, badgeNumber } = req.body;
    
    // Check if CNIC already exists
    const existingUser = await User.findOne({ cnic });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user with this CNIC already exists' 
      });
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user with this phone number already exists' 
      });
    }
    
    // Allow SHO to create SI
    if (req.user.role === 'sho') {
      // SHO can only create SI
      if (role !== 'si') {
        return res.status(403).json({ success: false, message: 'SHO can only create SI' });
      }
      // SHO can only assign SI to their own station
      if (stationId !== req.user.stationId.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot assign to different station' });
      }
    } 
    // Allow Super Admin and DSP to create any officer
    else if (!['super_admin', 'dsp'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Validate role
    if (!['sho', 'si', 'dsp'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const officer = await User.create({
      name, cnic, phone, password, role, stationId, badgeNumber
    });
    
    res.status(201).json({
      success: true,
      officer: {
        id: officer._id,
        name: officer.name,
        role: officer.role,
        badgeNumber: officer.badgeNumber,
        stationId: officer.stationId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update officer
router.put('/officers/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const officer = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }
    
    res.json({ success: true, officer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ NEW: DELETE officer (SHO can delete SI in their station, Super Admin can delete any)
router.delete('/officers/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const officer = await User.findById(id);
    
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }
    
    // Permission checks
    if (req.user.role === 'sho') {
      // SHO can only delete SI in their station
      if (officer.role !== 'si') {
        return res.status(403).json({ success: false, message: 'SHO can only delete SI' });
      }
      if (officer.stationId.toString() !== req.user.stationId.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot delete officer from different station' });
      }
    } else if (req.user.role !== 'super_admin') {
      // Super Admin can delete any officer
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Officer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;