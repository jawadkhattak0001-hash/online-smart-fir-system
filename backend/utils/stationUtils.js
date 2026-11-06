const PoliceStation = require('../models/PoliceStation');

const getStationByLocation = async (location) => {
  if (!location) return null;
  
  const loc = location.toLowerCase();
  
  if (loc.includes('g-10') || loc.includes('g10')) {
    return await PoliceStation.findOne({ code: 'G-10' });
  }
  if (loc.includes('g-11') || loc.includes('g11')) {
    return await PoliceStation.findOne({ code: 'G-11' });
  }
  if (loc.includes('f-10') || loc.includes('f10')) {
    return await PoliceStation.findOne({ code: 'F-10' });
  }
  if (loc.includes('f-11') || loc.includes('f11')) {
    return await PoliceStation.findOne({ code: 'F-11' });
  }
  if (loc.includes('i-8') || loc.includes('i8')) {
    return await PoliceStation.findOne({ code: 'I-8' });
  }
  if (loc.includes('i-10') || loc.includes('i10')) {
    return await PoliceStation.findOne({ code: 'I-10' });
  }
  if (loc.includes('kohsar') || loc.includes('blue area')) {
    return await PoliceStation.findOne({ code: 'Kohsar' });
  }
  if (loc.includes('saddar')) {
    return await PoliceStation.findOne({ code: 'Saddar' });
  }
  if (loc.includes('tarnol')) {
    return await PoliceStation.findOne({ code: 'Tarnol' });
  }
  
  // Default to G-10
  return await PoliceStation.findOne({ code: 'G-10' });
};

const getAllStations = async () => {
  return await PoliceStation.find().sort({ name: 1 });
};

module.exports = { getStationByLocation, getAllStations };