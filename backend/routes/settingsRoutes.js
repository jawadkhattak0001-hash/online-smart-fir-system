const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const userSettings = {};

router.get('/', protect, (req, res) => {
  const s = userSettings[req.user.id] || {};
  res.json({
    success: true,
    settings: {
      language: s.language || 'english',
      fontSize: s.fontSize || 'medium',
      soundEffects: s.soundEffects !== false,
      hapticFeedback: s.hapticFeedback !== false,
      pushNotifications: s.pushNotifications !== false,
      emailNotifications: s.emailNotifications || false,
      smsNotifications: s.smsNotifications !== false,
      autoDownload: s.autoDownload || false,
      wifiOnly: s.wifiOnly !== false,
    },
  });
});

router.get('/privacy', protect, (req, res) => {
  const s = userSettings[req.user.id] || {};
  res.json({
    success: true,
    settings: {
      profileVisibility: s.profileVisibility || 'private',
      dataSharing: s.dataSharing || false,
      locationTracking: s.locationTracking !== false,
      biometricLogin: s.biometricLogin || false,
      twoFactorAuth: s.twoFactorAuth || false,
      notificationsEnabled: s.notificationsEnabled !== false,
      offlineAccess: s.offlineAccess !== false,
      analyticsCollection: s.analyticsCollection || false,
      autoSaveDrafts: s.autoSaveDrafts !== false,
      showOnlineStatus: s.showOnlineStatus !== false,
    },
  });
});

router.put('/privacy', protect, (req, res) => {
  const current = userSettings[req.user.id] || {};
  userSettings[req.user.id] = { ...current, ...req.body };
  res.json({ success: true, message: 'Settings updated' });
});

router.post('/export-data', protect, (req, res) => {
  res.json({ success: true, message: 'Data export requested.' });
});

router.put('/:key', protect, (req, res) => {
  const current = userSettings[req.user.id] || {};
  userSettings[req.user.id] = { ...current, [req.params.key]: req.body.value };
  res.json({ success: true, message: 'Setting updated' });
});

// @route   GET /api/emergency-contacts
// @desc    Get emergency contacts
router.get('/emergency', protect, (req, res) => {
  res.json({
    success: true,
    contacts: [
      { id: '1', name: 'Police Emergency', number: '15', category: 'police' },
      { id: '2', name: 'Ambulance', number: '1122', category: 'medical' },
      { id: '3', name: 'Fire Brigade', number: '16', category: 'fire' },
      { id: '4', name: 'Women Helpline', number: '1099', category: 'women' },
      { id: '5', name: 'Highway Police', number: '130', category: 'police' },
    ],
  });
});
module.exports = router;
