// utils/pdfGenerator.js - WORKING VERSION (NO react-native-print)
import { Alert, Platform } from 'react-native';
import { FIR_STATUS, APP_CONFIG } from './constants';
import { formatDate, formatTime, validateCNIC, formatCNIC } from './helpers';

// Punjabi/Pakistan Penal Codes
export const PUNJAB_POLICE_CODES = {
  THEFT: [
    { code: '379', description: 'Punishment for theft', urdu: 'چوری کی سزا', section: 'PPC' },
    { code: '380', description: 'Theft in dwelling house', urdu: 'گھر میں چوری', section: 'PPC' },
    { code: '382', description: 'Theft after preparation for death/hurt', urdu: 'موت یا زخمی کرنے کی تیاری کے بعد چوری', section: 'PPC' }
  ],
  // ... keep your other codes
};

// Generate QR code text for FIR
export const generateFirQrCode = (firNumber, station, date) => {
  const qrData = {
    fir: firNumber,
    station: station,
    date: date,
    url: `${APP_CONFIG.WEBSITE_URL || 'https://fironix.gov.pk'}/verify/${firNumber}`,
    timestamp: Date.now()
  };
  
  return JSON.stringify(qrData);
};

// Enhanced PDF HTML generator - REMOVED problematic module calls
export const generateFirPdfHtml = (firData, options = {}) => {
  // ... (keep your existing HTML generation code as is) ...
  // Just make sure it doesn't call getPrintModule() or similar
  // Return the HTML string as before
};

// ⚠️ REPLACE THESE FUNCTIONS WITH SIMPLIFIED VERSIONS:

export const printFirPdf = async (firData, options = {}) => {
  try {
    const html = generateFirPdfHtml(firData, options);
    
    // Web platform - open in new window
    if (Platform.OS === 'web') {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
        newWindow.print();
        return { success: true, message: 'Opened in browser for printing' };
      }
    }
    
    // Mobile - show HTML for manual handling
    Alert.alert(
      'Print FIR',
      'HTML document generated. Please:\n1. Copy the HTML below\n2. Open in browser\n3. Print from there',
      [{ text: 'OK' }]
    );
    
    return { 
      success: true, 
      message: 'HTML ready for printing',
      html: html 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Print failed' 
    };
  }
};

export const saveFirPdf = async (firData, options = {}) => {
  try {
    const html = options.html || generateFirPdfHtml(firData);
    const fileName = `FIR_${firData.id || 'document'}_${Date.now()}.html`;
    
    // Web platform - download as HTML file
    if (Platform.OS === 'web') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        fileName,
        message: 'HTML file downloaded'
      };
    }
    
    // Mobile - provide HTML for manual save
    Alert.alert(
      'Save FIR',
      'HTML document generated. You can:\n1. Copy the HTML\n2. Save as .html file\n3. Convert to PDF later',
      [{ text: 'OK' }]
    );
    
    return {
      success: true,
      fileName,
      html,
      message: 'HTML ready for saving'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Save failed' 
    };
  }
};

export const shareFirPdf = async (firData, options = {}) => {
  try {
    const html = options.html || generateFirPdfHtml(firData);
    const shareText = `FIR Document - ${firData.id || 'FIR Document'}\n\nView the attached HTML file or copy the content.`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          const blob = new Blob([html], { type: 'text/html' });
          const file = new File([blob], `FIR_${firData.id}.html`, { type: 'text/html' });
          await navigator.share({
            files: [file],
            title: `FIR ${firData.id}`,
            text: shareText
          });
          return { success: true, message: 'Shared via Web Share API' };
        } catch (e) {
          // Fallback to opening in new window
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
          }
        }
      }
    }
    
    // Mobile - use React Native's Share
    if (Platform.OS !== 'web') {
      const Share = require('react-native').Share;
      await Share.share({
        message: `FIR Document\n\n${shareText}\n\nHTML Content (truncated):\n${html.substring(0, 200)}...`,
        title: `FIR ${firData.id}`
      });
    }
    
    return { success: true, message: 'Shared successfully' };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Share failed' 
    };
  }
};

// REMOVE OR COMMENT OUT THESE PROBLEMATIC HELPER FUNCTIONS:
// const getPrintModule = () => { ... } // REMOVE THIS
// const getSharingModule = () => { ... } // REMOVE THIS
// const getFileSystemModule = () => { ... } // REMOVE THIS
// const getMediaLibraryModule = () => { ... } // REMOVE THIS

// Keep other helper functions but make sure they don't call removed modules
export const formatFirForPdf = (firData, userData) => {
  // Validate required fields
  const requiredFields = ['id', 'title', 'incidentType', 'location', 'description', 'date'];
  const missingFields = requiredFields.filter(field => !firData[field]);
  
  if (missingFields.length > 0) {
    console.warn('Missing required fields for PDF:', missingFields);
  }
  
  return {
    id: firData.id || `FIR-${Date.now()}`,
    status: firData.status || FIR_STATUS.PENDING,
    title: firData.title || 'Incident Report',
    incidentType: firData.incidentType || 'Other',
    location: firData.location || 'Not specified',
    description: firData.description || 'No description provided',
    date: firData.date || new Date().toISOString().split('T')[0],
    time: firData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    policeStation: firData.policeStation || 'Islamabad - Tarnol',
    district: firData.district || 'Islamabad',
    assignedOfficer: firData.assignedOfficer || 'ASI Muhammad Talha',
    officerRank: firData.officerRank || 'Assistant Sub Inspector',
    priority: firData.priority || 'Medium',
    contactInfo: firData.contactInfo || 'Not provided',
    involvedParties: firData.involvedParties || 'Unknown',
    evidence: firData.evidence || 'No evidence provided',
    witnesses: firData.witnesses || 'No witnesses',
    penalCodes: firData.penalCodes || ['379', '382'],
    user: {
      name: userData?.name || 'محمد احمد',
      fatherName: userData?.fatherName || 'محمود احمد',
      cnic: validateCNIC(userData?.cnic).valid ? formatCNIC(userData.cnic) : '37405-1234567-1',
      address: userData?.address || 'اسلام آباد',
      phone: userData?.phone || '0300-1234567',
      email: userData?.email || ''
    }
  };
};

// Simple check function
export const checkPrintCapabilities = async () => {
  return {
    canPrint: Platform.OS === 'web',
    canShare: true,
    platform: Platform.OS,
    isWeb: Platform.OS === 'web'
  };
};

// Export everything
export default {
  generateFirPdfHtml,
  printFirPdf,
  saveFirPdf,
  shareFirPdf,
  formatFirForPdf,
  checkPrintCapabilities,
  PUNJAB_POLICE_CODES,
  generateFirQrCode
};