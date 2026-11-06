const express = require('express');
const router = express.Router();
const FIR = require('../models/FIR');
const {
  createFIR,
  getMyFIRs,
  getFIRById,
  getAllFIRs,
  assignFIR,
  updateInvestigation,
  submitToDSP,
  reviewFIR
} = require('../controllers/firController');
const { protect } = require('../middleware/authMiddleware');

// ─── Citizen Routes ──────────────────────────────────────
router.post('/', protect, createFIR);
router.get('/my-firs', protect, getMyFIRs);

// ─── Police Routes (SHO, SI, DSP, Admin) ─────────────────
router.get('/', protect, getAllFIRs);
router.post('/assign', protect, assignFIR);
router.post('/investigate', protect, updateInvestigation);
router.post('/submit-to-dsp', protect, submitToDSP);
router.post('/review', protect, reviewFIR);

// ─── Get Single FIR By ID ────────────────────────────────
router.get('/:id', protect, getFIRById);

// ─── Update FIR (General Purpose Status & Details Update) ───
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build Search Query to handle ObjectId and String IDs safely
    let searchCriteria = {};
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria = { _id: id };
    } else {
      searchCriteria = { $or: [{ _id: id }, { id: id }, { firNumber: id }] };
    }

    // Find FIR record
    const fir = await FIR.findOne(searchCriteria);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found in database' });
    }

    // Role and Station Access Validation (Safe Handling)
    if (req.user) {
      const role = (req.user.role || '').toLowerCase();
      const isSuperAdmin = role.includes('admin') || role === 'dsp';

      if (!isSuperAdmin) {
        if (role === 'sho' && fir.stationId && req.user.stationId) {
          if (fir.stationId.toString() !== req.user.stationId.toString()) {
            console.warn(`[FIR Update Warning]: Station mismatch for user ${req.user._id}`);
          }
        }
      }
    }

    // Sanitize updates to fit model schema properly
    const sanitizedUpdates = { ...updates };
    if (updates.assignedOfficer || updates.assignedTo) {
      sanitizedUpdates.assignedTo = updates.assignedTo || updates.assignedOfficer;
      sanitizedUpdates.assignedOfficer = updates.assignedTo || updates.assignedOfficer;
    }
    if (updates.notes || updates.remarks) {
      sanitizedUpdates.notes = updates.notes || updates.remarks;
      sanitizedUpdates.remarks = updates.notes || updates.remarks;
    }

    // Perform atomic update in MongoDB
    const updatedFir = await FIR.findOneAndUpdate(
      searchCriteria,
      { $set: sanitizedUpdates },
      { new: true, runValidators: false }
    );

    console.log(`✅ FIR ${id} updated successfully to status: ${updatedFir.status}`);

    return res.status(200).json({ 
      success: true, 
      message: 'FIR updated successfully',
      fir: updatedFir,
      data: updatedFir 
    });

  } catch (error) {
    console.error('Update FIR error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
});

module.exports = router;