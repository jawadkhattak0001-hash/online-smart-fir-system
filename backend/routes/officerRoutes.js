const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');


// ======================================================
// GET OFFICERS
// GET /api/officers
// ======================================================

router.get('/', protect, async (req, res) => {
  try {

    // Demo/FYP ke liye required SI officers automatically create
    // ho jayenge agar database mein maujood na hon.

    const demoOfficers = [
      {
        name: 'SI Ali Raza',
        cnic: '99999-1111111-1',
        phone: '03009999991'
      },
      {
        name: 'SI Usman Khan',
        cnic: '99999-2222222-2',
        phone: '03009999992'
      },
      {
        name: 'SI Hamza Ahmed',
        cnic: '99999-3333333-3',
        phone: '03009999993'
      }
    ];

    for (const demo of demoOfficers) {

      const existing = await User.findOne({
        name: demo.name
      });

      if (!existing) {

        await User.create({
          name: demo.name,
          cnic: demo.cnic,
          phone: demo.phone,
          email: `${demo.phone}@smartfir.local`,
          password: 'Demo@12345',
          role: 'si',
          badgeNumber: `SI-${demo.phone.slice(-3)}`,
          status: 'active'
        });

      } else if (existing.role !== 'si') {

        existing.role = 'si';
        existing.status = 'active';

        await existing.save();
      }
    }


    // Ab tamam SI officers fetch karo
    const officers = await User.find({
      role: 'si'
    })
      .select('-password')
      .sort({ name: 1 });


    res.status(200).json({
      success: true,
      officers
    });

  } catch (error) {

    console.error('Get Officers Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ======================================================
// ADD OFFICER
// ======================================================

router.post('/', protect, async (req, res) => {
  try {

    const officer = await User.create({
      ...req.body,
      role: 'si'
    });

    res.status(201).json({
      success: true,
      officer: {
        _id: officer._id,
        id: officer._id,
        name: officer.name,
        badgeNumber: officer.badgeNumber,
        role: officer.role,
        stationId: officer.stationId,
        status: officer.status
      }
    });

  } catch (error) {

    console.error('Add Officer Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ======================================================
// UPDATE OFFICER
// ======================================================

router.put('/:id', protect, async (req, res) => {
  try {

    const officer = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    res.json({
      success: true,
      officer
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ======================================================
// DELETE OFFICER
// ======================================================

router.delete('/:id', protect, async (req, res) => {
  try {

    const officer = await User.findByIdAndDelete(
      req.params.id
    );

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    res.json({
      success: true,
      message: 'Officer deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;