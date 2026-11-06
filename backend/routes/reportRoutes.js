const express = require('express');
const router = express.Router();
const FIR = require('../models/FIR');
const Alert = require('../models/Alert');
const Suspect = require('../models/Suspect');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reports/overview - Get dashboard stats
router.get('/overview', protect, async (req, res) => {
  try {
    const firs = await FIR.find();
    const alerts = await Alert.find();
    const suspects = await Suspect.find();

    const stats = {
      totalFIRs: firs.length,
      pendingFIRs: firs.filter(f => f.status === 'pending').length,
      totalAlerts: alerts.length,
      newAlerts: alerts.filter(a => a.status === 'new').length,
      totalSuspects: suspects.length,
      wantedSuspects: suspects.filter(s => s.status === 'wanted').length,
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/crime-distribution - Get crime types
router.get('/crime-distribution', protect, async (req, res) => {
  try {
    const firs = await FIR.find();
    const distribution = {};
    
    firs.forEach(fir => {
      const type = fir.incidentType || 'Other';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    // Convert to percentages
    const total = firs.length || 1;
    const result = {};
    Object.keys(distribution).forEach(key => {
      result[key] = Math.round((distribution[key] / total) * 100);
    });

    res.json({ success: true, distribution: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;