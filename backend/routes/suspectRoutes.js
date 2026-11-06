// backend/routes/suspectRoutes.js (ya routes/suspectRoutes.js)
const express = require('express');
const router = express.Router();
const {
  getSuspects,
  getSuspectById,
  createSuspect,
  updateSuspect,
  updateSuspectStatus,
  addSuspectPhoto,
  addEvidence
} = require('../controllers/suspectController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ─── Suspect Routes ──────────────────────────────────────

// GET /api/suspects -> Protect + Allow all relevant roles (admin, sho, si, dsp)
router.get(
  '/', 
  protect, 
  authorize ? authorize('admin', 'sho', 'si', 'dsp', 'superadmin') : (req, res, next) => next(), 
  getSuspects
);

router.get('/:id', protect, getSuspectById);
router.post('/', protect, createSuspect);
router.put('/:id', protect, updateSuspect);
router.patch('/:id/status', protect, updateSuspectStatus);
router.post('/:id/photo', protect, addSuspectPhoto);
router.post('/:id/evidence', protect, addEvidence);

module.exports = router;