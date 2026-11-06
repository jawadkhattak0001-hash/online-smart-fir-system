const Suspect = require('../models/Suspect');
const Alert = require('../models/Alert');
const FIR = require('../models/FIR');

// ─── Get all suspects (filtered by role) ──────────────
const getSuspects = async (req, res) => {
  try {
    const { status, stationId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (stationId) filter.stationId = stationId;

    if (req.user.role === 'si') {
      filter.stationId = req.user.stationId;
      const myFirs = await FIR.find({ assignedOfficer: req.user.id }).select('_id');
      filter.firIds = { $in: myFirs.map(f => f._id) };
    } else if (req.user.role === 'sho') {
      filter.stationId = req.user.stationId;
    } else if (req.user.role === 'dsp' || req.user.role === 'officer') {
      // DSP and Officer see all relevant suspects
      if (req.user.stationId) filter.stationId = req.user.stationId;
    } else if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const suspects = await Suspect.find(filter)
      .populate('firIds', 'firNumber')
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, suspects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single suspect by ID ──────────────────────────
const getSuspectById = async (req, res) => {
  try {
    const suspect = await Suspect.findById(req.params.id)
      .populate('firIds', 'firNumber complainantName')
      .populate('addedBy', 'name badgeNumber')
      .populate('evidence.uploadedBy', 'name');

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    if (req.user.role === 'si') {
      const myFirs = await FIR.find({ assignedOfficer: req.user.id }).select('_id');
      const hasAccess = suspect.firIds.some(firId =>
        myFirs.some(f => f._id.toString() === firId.toString())
      );
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role === 'sho') {
      if (suspect.stationId.toString() !== req.user.stationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role !== 'super_admin' && req.user.role !== 'dsp' && req.user.role !== 'officer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create suspect (SI & Officer) ─────────────────────
const createSuspect = async (req, res) => {
  try {
    console.log('📤 REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('👤 USER:', req.user.id, req.user.role);

    if (req.user.role !== 'si' && req.user.role !== 'officer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { name, fatherName, cnic, district, status, notes } = req.body;
    const firId = req.body.firId || (req.body.firIds && req.body.firIds[0]);

    if (!name || !firId) {
      return res.status(400).json({ success: false, message: 'Name and FIR ID are required' });
    }

    const suspect = await Suspect.create({
      name,
      fatherName,
      cnic,
      district,
      firIds: [firId],
      stationId: req.user.stationId,
      addedBy: req.user.id,
      notes,
      status: status || 'under_investigation',
    });

    res.status(201).json({ success: true, suspect });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Update suspect ─────────────────────────────────────
const updateSuspect = async (req, res) => {
  try {
    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    if (req.user.role === 'sho') {
      if (suspect.stationId.toString() !== req.user.stationId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role !== 'super_admin' && req.user.role !== 'si' && req.user.role !== 'officer') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowed = ['name', 'fatherName', 'cnic', 'district', 'status', 'notes', 'lastLocation'];
    const updates = { updatedAt: Date.now() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await Suspect.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, suspect: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change suspect status ─────────────────────────────
const updateSuspectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['under_investigation', 'wanted', 'captured', 'cleared'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    suspect.status = status;
    suspect.updatedAt = Date.now();
    await suspect.save();

    if (status === 'wanted') {
      await Alert.create({
        suspectId: suspect._id,
        firId: suspect.firIds[0],
        confidence: 100,
        location: suspect.lastLocation || 'Unknown',
        status: 'new',
        stationId: suspect.stationId,
        timestamp: new Date(),
      });
    }

    res.json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add photo to suspect ───────────────────────────────
const addSuspectPhoto = async (req, res) => {
  try {
    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    const { photo } = req.body;
    if (!photo) {
      return res.status(400).json({ success: false, message: 'Photo is required' });
    }

    suspect.photo = photo;
    suspect.updatedAt = Date.now();
    await suspect.save();

    res.json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add evidence to suspect ───────────────────────────
const addEvidence = async (req, res) => {
  try {
    const { description, photo } = req.body;
    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    suspect.evidence.push({
      description,
      photo,
      uploadedBy: req.user.id,
      uploadedAt: Date.now(),
    });
    suspect.updatedAt = Date.now();
    await suspect.save();

    res.json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuspects,
  getSuspectById,
  createSuspect,
  updateSuspect,
  updateSuspectStatus,
  addSuspectPhoto,
  addEvidence,
};