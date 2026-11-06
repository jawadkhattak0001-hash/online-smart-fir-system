const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('firId')
      .populate('assignedOfficer')
      .sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const caseItem = await Case.create({ ...req.body, stationId: req.user.stationId });
    res.status(201).json({ success: true, case: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const caseItem = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, case: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;