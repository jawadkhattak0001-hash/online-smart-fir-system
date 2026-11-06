const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'sho', 'si', 'dsp', 'super_admin'],
    default: 'citizen',
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PoliceStation',
  },
  badgeNumber: {
    type: String,
  },
  // ✅ ADDED: Required for user registration (present in your controller)
  fatherName: {
    type: String,
  },
  address: {
    type: String,
  },
  // ✅ ADDED: Enables the status toggle switch functionality
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active', // ✅ Newly created officers will be active by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);