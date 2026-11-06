const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const notifications = [
  { id: '1', type: 'STATUS_UPDATE', title: 'FIR Status Updated', message: 'Your FIR has been approved and is now under investigation.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), firId: 'FIR-2024-001', userId: null },
  { id: '2', type: 'OFFICER_ASSIGNED', title: 'Investigation Officer Assigned', message: 'ASI Muhammad Talha has been assigned.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), firId: 'FIR-2024-001', userId: null },
  { id: '3', type: 'FIR_SUBMITTED', title: 'FIR Submitted Successfully', message: 'Your FIR has been submitted.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), firId: 'FIR-2024-001', userId: null },
];

router.get('/', protect, (req, res) => {
  res.json({ success: true, notifications });
});

router.put('/:id/read', protect, (req, res) => {
  const notification = notifications.find((n) => n.id === req.params.id);
  if (notification) notification.read = true;
  res.json({ success: true, message: 'Marked as read' });
});

router.delete('/:id', protect, (req, res) => {
  const index = notifications.findIndex((n) => n.id === req.params.id);
  if (index !== -1) notifications.splice(index, 1);
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = router;

