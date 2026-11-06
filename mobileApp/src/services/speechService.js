// src/services/speechService.js
// Handles audio upload to backend for transcription + AI FIR extraction
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's IP address
const BASE_URL = 'http://http://localhost:5000/api/api';

/**
 * Generic API fetch helper with token
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('@smartfir_token');
  
  const headers = {
    ...options.headers,
  };
  
  // Don't set Content-Type for FormData (browser sets it automatically with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const speechService = {
  
  /**
   * Step 1: Send audio file to backend for transcription only
   * @param {string} audioUri - Local file URI of the recording
   * @param {string} language - 'english' or 'urdu'
   * @returns {object} { success, transcript, confidence, language }
   */
  transcribeAudio: async (audioUri, language = 'english') => {
    const formData = new FormData();
    
    // Append the audio file
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: `recording_${Date.now()}.m4a`,
    });
    formData.append('language', language);

    const response = await apiFetch('/speech/transcribe', {
      method: 'POST',
      body: formData,
    });

    return response;
  },

  /**
   * Step 2: Send transcript text to AI for FIR data extraction
   * @param {string} transcript - The transcribed text
   * @param {string} language - 'english' or 'urdu'
   * @returns {object} { success, data: { incidentType, narrative, ppcSections, ... } }
   */
  extractFirData: async (transcript, language = 'english') => {
    const response = await apiFetch('/speech/extract-fir', {
      method: 'POST',
      body: JSON.stringify({ transcript, language }),
    });

    return response;
  },

  /**
   * All-in-one: Audio → Transcript → FIR Data
   * Sends audio, backend transcribes then extracts FIR in one request
   * @param {string} audioUri - Local file URI of the recording
   * @param {string} language - 'english' or 'urdu'
   * @returns {object} { success, transcript, confidence, extractedData, language }
   */
  transcribeAndExtract: async (audioUri, language = 'english') => {
    const formData = new FormData();
    
    // Append the audio file
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: `recording_${Date.now()}.m4a`,
    });
    formData.append('language', language);

    console.log('📤 Sending audio to backend...');
    console.log('   URI:', audioUri);
    console.log('   Language:', language);

    const response = await apiFetch('/speech/transcribe-and-extract', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Received response:', response.success ? 'Success' : 'Failed');
    
    return response;
  },

  /**
   * Quick test to check if backend is reachable
   * @returns {object} { success, message }
   */
  healthCheck: async () => {
    try {
      const response = await apiFetch('/speech/test', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      throw new Error('Backend not reachable. Make sure the server is running.');
    }
  },
};