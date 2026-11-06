// src/utils/helpers.js
import { Alert, Platform, Linking } from 'react-native';
import { FIR_STATUS, INCIDENT_TYPES, POLICE_STATIONS } from './constants';

// Date & Time Helpers
export const formatDate = (dateString, format = 'en-PK') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (format === 'ur-PK') {
      return date.toLocaleDateString('ur-PK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    if (format === 'short') {
      return date.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short'
      });
    }
    
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateTimeString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return timeString;
  }
};

export const formatToUrduDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    const urduDate = date.toLocaleDateString('ur-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const urduTime = date.toLocaleTimeString('ur-PK', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${urduDate} - ${urduTime}`;
  } catch (error) {
    return dateTimeString;
  }
};

// FIR Status Helpers
export const getStatusText = (status) => {
  const statusMap = {
    [FIR_STATUS.DRAFT]: 'Draft',
    [FIR_STATUS.PENDING]: 'Pending Review',
    [FIR_STATUS.UNDER_REVIEW]: 'Under Review',
    [FIR_STATUS.APPROVED]: 'Approved',
    [FIR_STATUS.REJECTED]: 'Rejected',
    [FIR_STATUS.INVESTIGATION_STARTED]: 'Investigation Started',
    [FIR_STATUS.RESOLVED]: 'Resolved',
    [FIR_STATUS.CLOSED]: 'Closed'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    [FIR_STATUS.DRAFT]: '#6B7280',
    [FIR_STATUS.PENDING]: '#F59E0B',
    [FIR_STATUS.UNDER_REVIEW]: '#3B82F6',
    [FIR_STATUS.APPROVED]: '#10B981',
    [FIR_STATUS.REJECTED]: '#EF4444',
    [FIR_STATUS.INVESTIGATION_STARTED]: '#8B5CF6',
    [FIR_STATUS.RESOLVED]: '#059669',
    [FIR_STATUS.CLOSED]: '#374151'
  };
  return colorMap[status] || '#6B7280';
};

export const getStatusBadgeColor = (status) => {
  const colorMap = {
    [FIR_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [FIR_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [FIR_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
    [FIR_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [FIR_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [FIR_STATUS.INVESTIGATION_STARTED]: 'bg-purple-100 text-purple-800',
    [FIR_STATUS.RESOLVED]: 'bg-teal-100 text-teal-800',
    [FIR_STATUS.CLOSED]: 'bg-gray-100 text-gray-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status) => {
  const iconMap = {
    [FIR_STATUS.DRAFT]: '📝',
    [FIR_STATUS.PENDING]: '⏳',
    [FIR_STATUS.UNDER_REVIEW]: '🔍',
    [FIR_STATUS.APPROVED]: '✅',
    [FIR_STATUS.REJECTED]: '❌',
    [FIR_STATUS.INVESTIGATION_STARTED]: '🕵️',
    [FIR_STATUS.RESOLVED]: '✅',
    [FIR_STATUS.CLOSED]: '🔒'
  };
  return iconMap[status] || '📄';
};

// Text Formatting
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

export const formatIncidentType = (type) => {
  const typeMap = {
    theft: 'Theft',
    robbery: 'Robbery',
    assault: 'Assault',
    accident: 'Accident',
    harassment: 'Harassment',
    fraud: 'Fraud',
    cyber_crime: 'Cyber Crime',
    domestic_violence: 'Domestic Violence',
    missing_person: 'Missing Person',
    kidnapping: 'Kidnapping',
    property_damage: 'Property Damage',
    drug_offense: 'Drug Offense',
    other: 'Other'
  };
  return typeMap[type] || capitalizeWords(type.replace('_', ' '));
};

export const formatPriority = (priority) => {
  const emojiMap = {
    Low: '🟢',
    Medium: '🟡',
    High: '🔴',
    Emergency: '🚨'
  };
  return `${emojiMap[priority] || ''} ${priority}`;
};

// Validation Helpers (Enhanced)
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  const re = /^(?:\+92|0)?3[0-9]{2}[-\s]?[0-9]{7}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validateCNIC = (cnic) => {
  if (!cnic) return false;
  const re = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
  return re.test(cnic);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('923')) {
    return `0${cleaned.substring(2, 5)}-${cleaned.substring(5)}`;
  }
  
  return phone;
};

export const formatCNIC = (cnic) => {
  if (!cnic) return '';
  
  const cleaned = cnic.replace(/\D/g, '');
  
  if (cleaned.length === 13) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 12)}-${cleaned.substring(12)}`;
  }
  
  return cnic;
};

// Alert Helpers
export const showAlert = (title, message) => {
  Alert.alert(title, message);
};

export const showConfirmation = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', onPress: onConfirm, style: 'destructive' }
    ]
  );
};

export const showSuccessAlert = (message, title = 'Success') => {
  Alert.alert(title, message);
};

export const showErrorAlert = (message, title = 'Error') => {
  Alert.alert(title, message);
};

export const showInfoAlert = (message, title = 'Info') => {
  Alert.alert(title, message);
};

// Platform & Device Helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const openURL = async (url) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      showErrorAlert('Cannot open this URL');
    }
  } catch (error) {
    showErrorAlert('Failed to open URL');
  }
};

export const callNumber = async (phoneNumber) => {
  const url = `tel:${phoneNumber}`;
  await openURL(url);
};

export const sendSMS = async (phoneNumber, message = '') => {
  const url = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
  await openURL(url);
};

export const openMaps = (location) => {
  const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  openURL(url);
};

// FIR Specific Helpers
export const generateFirId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FIR-${year}-${randomNum}`;
};

export const calculateEstimatedResolutionTime = (priority) => {
  const daysMap = {
    Low: 30,
    Medium: 15,
    High: 7,
    Emergency: 3
  };
  
  const days = daysMap[priority] || 15;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  
  return formatDate(estimatedDate.toISOString());
};

export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    [FIR_STATUS.DRAFT]: FIR_STATUS.PENDING,
    [FIR_STATUS.PENDING]: FIR_STATUS.UNDER_REVIEW,
    [FIR_STATUS.UNDER_REVIEW]: FIR_STATUS.APPROVED,
    [FIR_STATUS.APPROVED]: FIR_STATUS.INVESTIGATION_STARTED,
    [FIR_STATUS.INVESTIGATION_STARTED]: FIR_STATUS.RESOLVED,
    [FIR_STATUS.RESOLVED]: FIR_STATUS.CLOSED
  };
  
  return statusFlow[currentStatus] || currentStatus;
};

// Police Station Helpers
export const getPoliceStationsByDistrict = (district = 'Islamabad') => {
  return POLICE_STATIONS.filter(station => 
    station.district.toLowerCase() === district.toLowerCase()
  );
};

export const getOfficersByStation = (stationId) => {
  // This would come from your API/mock data
  const officers = {
    'ps_1': ['ASI Muhammad Talha', 'SI Ahmed Raza'],
    'ps_2': ['ASI Ali Khan', 'SI Sara Ahmed'],
    'ps_3': ['ASI Usman Khan', 'SI Fatima Ali']
  };
  
  return officers[stationId] || [];
};

// Incident Type Helpers
export const getIncidentTypeIcon = (type) => {
  const iconMap = {
    theft: '💰',
    robbery: '🔫',
    assault: '👊',
    accident: '🚗',
    harassment: '📞',
    fraud: '🎭',
    cyber_crime: '💻',
    domestic_violence: '🏠',
    missing_person: '👤',
    kidnapping: '🚨',
    property_damage: '🏚️',
    drug_offense: '💊',
    other: '📝'
  };
  
  return iconMap[type] || '📄';
};

export const getIncidentTypeColor = (type) => {
  const colorMap = {
    theft: '#F59E0B',
    robbery: '#DC2626',
    assault: '#EF4444',
    accident: '#3B82F6',
    harassment: '#8B5CF6',
    fraud: '#10B981',
    cyber_crime: '#06B6D4',
    domestic_violence: '#EC4899',
    missing_person: '#6366F1',
    kidnapping: '#DC2626',
    property_damage: '#D97706',
    drug_offense: '#059669',
    other: '#6B7280'
  };
  
  return colorMap[type] || '#6B7280';
};

// String Manipulation
export const extractFirstSentence = (text, maxLength = 200) => {
  if (!text) return '';
  
  // Find first sentence ending with punctuation
  const sentenceMatch = text.match(/^.*?[.!?]/);
  const firstSentence = sentenceMatch ? sentenceMatch[0] : text;
  
  return truncateText(firstSentence, maxLength);
};

export const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

export const estimateReadingTime = (text) => {
  const words = countWords(text);
  const wordsPerMinute = 200; // Average reading speed
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

// Debounce function for search/input
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// File Size Formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export all utilities
export default {
  // Date & Time
  formatDate,
  formatDateTime,
  formatTime,
  formatToUrduDateTime,
  
  // FIR Status
  getStatusText,
  getStatusColor,
  getStatusBadgeColor,
  getStatusIcon,
  
  // Text Formatting
  truncateText,
  capitalizeWords,
  formatIncidentType,
  formatPriority,
  
  // Validation
  validateEmail,
  validatePhone,
  validateCNIC,
  formatPhoneNumber,
  formatCNIC,
  
  // Alerts
  showAlert,
  showConfirmation,
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
  
  // Platform
  isIOS,
  isAndroid,
  openURL,
  callNumber,
  sendSMS,
  openMaps,
  
  // FIR Specific
  generateFirId,
  calculateEstimatedResolutionTime,
  getNextStatus,
  
  // Police & Incident
  getPoliceStationsByDistrict,
  getOfficersByStation,
  getIncidentTypeIcon,
  getIncidentTypeColor,
  
  // String Manipulation
  extractFirstSentence,
  countWords,
  estimateReadingTime,
  
  // Utilities
  debounce,
  formatFileSize
};