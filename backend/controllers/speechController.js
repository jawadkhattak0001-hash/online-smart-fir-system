const { transcribeAudio } = require('../services/googleSpeechService');
const { extractFirData } = require('../services/nlpFirService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single('audio');

const transcribeAudioFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file' });
    try {
      const result = await transcribeAudio(req.file.buffer, req.body.language || 'english');
      res.json(result);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
};

const extractFirFromTranscript = async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript || transcript.length < 10) return res.status(400).json({ success: false, message: 'Transcript too short' });
    const result = await extractFirData(transcript, language);
    res.json(result);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const transcribeAndExtract = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file' });
    try {
      const lang = req.body.language || 'english';
      const transcriptResult = await transcribeAudio(req.file.buffer, lang);
      if (!transcriptResult.success) return res.status(400).json({ success: false, message: 'Transcription failed' });
      const firResult = await extractFirData(transcriptResult.transcript, lang);
      res.json({
        success: true,
        transcript: transcriptResult.transcript,
        confidence: transcriptResult.confidence,
        extractedData: firResult.data,
        language: lang,
        isMock: transcriptResult.isMock || false,
      });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
};

module.exports = { transcribeAudioFile, extractFirFromTranscript, transcribeAndExtract };