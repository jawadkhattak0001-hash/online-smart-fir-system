const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const register = async (req, res) => {
  try {
    const { name, cnic, phone, password, address, fatherName, role, stationId, badgeNumber } = req.body;
    
    // Validate required fields
    if (!name || !cnic || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, CNIC, Phone, and Password are required' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ cnic }, { phone }] });
    if (existing) {
      if (existing.cnic === cnic) {
        return res.status(409).json({ 
          success: false, 
          message: 'An account with this CNIC already exists' 
        });
      }
      return res.status(409).json({ 
        success: false, 
        message: 'An account with this phone number already exists' 
      });
    }

    // Create user with all fields
    const user = await User.create({ 
      name, 
      cnic, 
      phone, 
      password, 
      address, 
      fatherName, 
      role: role || 'citizen',
      stationId, 
      badgeNumber 
    });
    
    const token = generateToken(user._id);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        phone: user.phone, 
        cnic: user.cnic,
        role: user.role
      } 
    });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and Password are required' 
      });
    }

    // ✅ Populate stationId to get station name
    const user = await User.findOne({ phone })
      .select('+password')
      .populate('stationId', 'name');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this phone number' 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    const token = generateToken(user._id);
    
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        phone: user.phone, 
        cnic: user.cnic,
        role: user.role,
        badgeNumber: user.badgeNumber,
        stationId: user.stationId?._id,
        stationName: user.stationId?.name || 'Unknown Station'  // ✅ Station name added
      } 
    });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
};

const getMe = async (req, res) => {
  try {
    // ✅ Populate stationId to get station name
    const user = await User.findById(req.user.id).populate('stationId', 'name');
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        cnic: user.cnic,
        role: user.role,
        badgeNumber: user.badgeNumber,
        stationId: user.stationId?._id,
        stationName: user.stationId?.name || 'Unknown Station'  // ✅ Station name added
      } 
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
};

module.exports = { register, login, getMe, changePassword };