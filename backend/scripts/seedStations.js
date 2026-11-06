const mongoose = require('mongoose');
require('dotenv').config();

const PoliceStation = require('../models/PoliceStation');

const stations = [
  { name: 'G-10 Police Station', code: 'G-10', city: 'Islamabad', jurisdiction: 'G-10 Sector' },
  { name: 'G-11 Police Station', code: 'G-11', city: 'Islamabad', jurisdiction: 'G-11 Sector' },
  { name: 'F-10 Police Station', code: 'F-10', city: 'Islamabad', jurisdiction: 'F-10 Sector' },
  { name: 'F-11 Police Station', code: 'F-11', city: 'Islamabad', jurisdiction: 'F-11 Sector' },
  { name: 'I-8 Police Station', code: 'I-8', city: 'Islamabad', jurisdiction: 'I-8 Sector' },
  { name: 'I-10 Police Station', code: 'I-10', city: 'Islamabad', jurisdiction: 'I-10 Sector' },
  { name: 'Kohsar Police Station', code: 'Kohsar', city: 'Islamabad', jurisdiction: 'Blue Area' },
  { name: 'Saddar Police Station', code: 'Saddar', city: 'Islamabad', jurisdiction: 'Saddar' },
  { name: 'Tarnol Police Station', code: 'Tarnol', city: 'Islamabad', jurisdiction: 'Tarnol' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await PoliceStation.deleteMany({});
    await PoliceStation.insertMany(stations);
    console.log('✅ Police stations seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding stations:', error);
    process.exit(1);
  }
};

seed();