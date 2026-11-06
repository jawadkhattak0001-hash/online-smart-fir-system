const FIR = require('../models/FIR');
const { getStationByLocation } = require('../utils/stationUtils');

// Helper to transform a Mongoose document to use 'id' instead of '_id'
const transformFir = (fir) => {
  if (!fir) return null;
  const firObj = fir.toObject();
  firObj.id = firObj._id;
  delete firObj._id;
  return firObj;
};

// Create FIR (Citizen)
const createFIR = async (req, res) => {
  try {
    const firData = { ...req.body, citizen: req.user.id };
    
    if (firData.placeOfIncident) {
      const station = await getStationByLocation(firData.placeOfIncident);
      if (station) {
        firData.stationId = station._id;
        firData.policeStation = station.name;
      }
    }
    
    if (!firData.complainantName) {
      firData.complainantName = req.user.name;
    }

    const fir = await FIR.create(firData);
    
    res.status(201).json({
      success: true,
      message: 'FIR submitted successfully',
      fir: {
        id: fir._id,
        firNumber: fir.firNumber,
        status: fir.status,
        policeStation: fir.policeStation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My FIRs (Citizen)
const getMyFIRs = async (req, res) => {
  try {
    const firs = await FIR.find({ citizen: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, firs: firs.map(transformFir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get FIR by ID
const getFIRById = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('citizen', 'name phone')
      .populate('assignedOfficer', 'name badgeNumber');
      
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    res.status(200).json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All FIRs (SHO, DSP, Super Admin)
const getAllFIRs = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'sho') {
      filter.stationId = req.user.stationId;
    } else if (req.user.role === 'si') {
      filter.assignedOfficer = req.user.id;
    }
    
    const firs = await FIR.find(filter)
      .populate('citizen', 'name phone')
      .populate('assignedOfficer', 'name badgeNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, firs: firs.map(transformFir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update General FIR Status / Details (Fixes 500 Error on Status Change)
const updateFIR = async (req, res) => {
  try {
    const firId = req.params.id;
    const updates = req.body;

    const fir = await FIR.findByIdAndUpdate(
      firId,
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    res.status(200).json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign FIR to SI (SHO only)
const assignFIR = async (req, res) => {
  try {
    const { firId, officerId } = req.body;
    
    if (req.user.role !== 'sho') {
      return res.status(403).json({ success: false, message: 'Only SHO can assign cases' });
    }
    
    const fir = await FIR.findByIdAndUpdate(
      firId,
      {
        assignedOfficer: officerId,
        assignedBy: req.user.id,
        assignedDate: new Date(),
        status: 'assigned'
      },
      { new: true }
    );
    
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    
    res.json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Investigation (SI only)
const updateInvestigation = async (req, res) => {
  try {
    const { firId, notes, evidence, status = 'investigating' } = req.body;
    
    if (req.user.role !== 'si') {
      return res.status(403).json({ success: false, message: 'Only SI can update investigation' });
    }
    
    const fir = await FIR.findById(firId);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    
    if (fir.assignedOfficer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your assigned case' });
    }
    
    if (notes) fir.investigationNotes.push(notes);
    if (evidence) fir.evidence.push(evidence);
    fir.status = status;
    await fir.save();
    
    res.json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit to DSP (SI only)
const submitToDSP = async (req, res) => {
  try {
    const { firId } = req.body;
    
    if (req.user.role !== 'si') {
      return res.status(403).json({ success: false, message: 'Only SI can submit to DSP' });
    }
    
    const fir = await FIR.findById(firId);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    
    if (fir.assignedOfficer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your assigned case' });
    }
    
    fir.status = 'submitted_to_dsp';
    await fir.save();
    
    res.json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Review FIR (DSP only)
const reviewFIR = async (req, res) => {
  try {
    const { firId, decision } = req.body;
    
    if (req.user.role !== 'dsp') {
      return res.status(403).json({ success: false, message: 'Only DSP can review cases' });
    }
    
    const fir = await FIR.findById(firId);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    
    if (decision === 'approve' || decision === 'challan') {
      fir.status = 'challan';
    } else if (decision === 'reject' || decision === 'c_report') {
      fir.status = 'c_report';
    } else {
      fir.status = 'closed';
    }
    
    fir.dspReviewDate = new Date();
    fir.dspDecision = decision;
    await fir.save();
    
    res.json({ success: true, fir: transformFir(fir) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFIR,
  getMyFIRs,
  getFIRById,
  getAllFIRs,
  updateFIR,
  assignFIR,
  updateInvestigation,
  submitToDSP,
  reviewFIR
};