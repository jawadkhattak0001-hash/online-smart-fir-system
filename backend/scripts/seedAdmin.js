const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const createAdminUser = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected Successfully!');

    const db = mongoose.connection.db;
    const myPhone = '03178874681';
    
    // Naya Encrypted Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Mongoose Model ke baghair Direct Native Mongo Insert/Update
    await db.collection('users').updateOne(
      { phone: myPhone },
      { 
        $set: { 
          name: 'Police Admin',
          cnic: '1234567890123',
          phone: myPhone,
          password: hashedPassword,
          role: 'admin',
          badgeNumber: 'POL-001'
        } 
      },
      { upsert: true }
    );

    console.log('SUCCESS: Admin User Created/Updated Directly in Database!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();