const fs = require('fs');
const path = require('path');

const MOCK_TRANSCRIPTS = {
  english: [
    "I want to report a theft at Main Market yesterday around 6 PM. My iPhone was stolen by an unknown person wearing a blue shirt. The phone is worth about 200,000 rupees. There are CCTV cameras at nearby shops.",
    "My name is Ahmed. My CNIC is 37405-1234567-1. I live at House 123, G-10/4, Islamabad. Two men on a red motorcycle snatched my wallet near F-10 Markaz at 8 PM. They had a gun.",
  ],
  urdu: [
    "میں چوری کی رپورٹ درج کرانا چاہتا ہوں جو کل شام 6 بجے مین مارکیٹ میں ہوئی۔ میرا موبائل فون چوری ہو گیا جس کی قیمت 2 لاکھ روپے ہے۔",
    "میرا نام محمد احمد ہے۔ میرا شناختی کارڈ نمبر 37405-1234567-1 ہے۔ میں اسلام آباد میں رہتا ہوں۔",
  ],
};

let mockIndex = 0;

const transcribeAudio = async (audioBuffer, language = 'english') => {
  const languageCode = language === 'urdu' ? 'ur' : 'en';
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // If Groq API key is set, use it (free tier)
  if (GROQ_API_KEY) {
    try {
      const tempPath = path.join(__dirname, '..', 'temp_audio.mp3');
      fs.writeFileSync(tempPath, audioBuffer);
      
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(tempPath)], { type: 'audio/mpeg' });
      formData.append('file', fileBlob, 'recording.mp3');
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', languageCode);

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: formData,
      });

      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          transcript: data.text,
          confidence: 92,
          language,
          isMock: false,
          source: 'groq-whisper',
        };
      }
    } catch (err) {
      console.warn('Groq API error, using mock:', err.message);
    }
  }

  // Fallback to mock transcripts
  const transcripts = MOCK_TRANSCRIPTS[language] || MOCK_TRANSCRIPTS.english;
  const transcript = transcripts[mockIndex % transcripts.length];
  mockIndex++;

  return {
    success: true,
    transcript,
    confidence: 85,
    language,
    isMock: true,
    source: 'mock',
  };
};

module.exports = { transcribeAudio };