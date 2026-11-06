const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { transcribeAudioFile, extractFirFromTranscript, transcribeAndExtract } = require('../controllers/speechController');

router.post('/transcribe', protect, transcribeAudioFile);
router.post('/extract-fir', protect, extractFirFromTranscript);
router.post('/transcribe-and-extract', protect, transcribeAndExtract);

module.exports = router;