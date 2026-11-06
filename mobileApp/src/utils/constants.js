// src/utils/constants.js - CORRECTED & ENHANCED VERSION

// FIR Status Constants (Complete State Machine)
export const FIR_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  INVESTIGATION_STARTED: 'investigation_started',
  EVIDENCE_COLLECTION: 'evidence_collection',
  SUSPECT_IDENTIFIED: 'suspect_identified',
  CASE_UNDER_TRIAL: 'case_under_trial',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Status Labels
export const STATUS_LABELS = {
  [FIR_STATUS.DRAFT]: 'Draft',
  [FIR_STATUS.PENDING]: 'Pending',
  [FIR_STATUS.UNDER_REVIEW]: 'Under Review',
  [FIR_STATUS.APPROVED]: 'Approved',
  [FIR_STATUS.REJECTED]: 'Rejected',
  [FIR_STATUS.INVESTIGATION_STARTED]: 'Investigation Started',
  [FIR_STATUS.EVIDENCE_COLLECTION]: 'Evidence Collection',
  [FIR_STATUS.SUSPECT_IDENTIFIED]: 'Suspect Identified',
  [FIR_STATUS.CASE_UNDER_TRIAL]: 'Case Under Trial',
  [FIR_STATUS.RESOLVED]: 'Resolved',
  [FIR_STATUS.CLOSED]: 'Closed'
};

// Status flow in order
export const FIR_STATUS_FLOW = [
  FIR_STATUS.DRAFT,
  FIR_STATUS.PENDING,
  FIR_STATUS.UNDER_REVIEW,
  FIR_STATUS.APPROVED,
  FIR_STATUS.INVESTIGATION_STARTED,
  FIR_STATUS.EVIDENCE_COLLECTION,
  FIR_STATUS.SUSPECT_IDENTIFIED,
  FIR_STATUS.CASE_UNDER_TRIAL,
  FIR_STATUS.RESOLVED,
  FIR_STATUS.CLOSED
];

// For NativeWind v2 compatibility - Using hex colors instead of Tailwind classes
export const STATUS_COLORS = {
  [FIR_STATUS.DRAFT]: { bg: '#F3F4F6', text: '#374151' }, // gray-100, gray-800
  [FIR_STATUS.PENDING]: { bg: '#FEF3C7', text: '#92400E' }, // yellow-100, yellow-800
  [FIR_STATUS.UNDER_REVIEW]: { bg: '#DBEAFE', text: '#1E40AF' }, // blue-100, blue-800
  [FIR_STATUS.APPROVED]: { bg: '#D1FAE5', text: '#065F46' }, // green-100, green-800
  [FIR_STATUS.REJECTED]: { bg: '#FEE2E2', text: '#991B1B' }, // red-100, red-800
  [FIR_STATUS.INVESTIGATION_STARTED]: { bg: '#EDE9FE', text: '#5B21B6' }, // purple-100, purple-800
  [FIR_STATUS.EVIDENCE_COLLECTION]: { bg: '#E0E7FF', text: '#3730A3' }, // indigo-100, indigo-800
  [FIR_STATUS.SUSPECT_IDENTIFIED]: { bg: '#FCE7F3', text: '#9D174D' }, // pink-100, pink-800
  [FIR_STATUS.CASE_UNDER_TRIAL]: { bg: '#FFEDD5', text: '#9A3412' }, // orange-100, orange-800
  [FIR_STATUS.RESOLVED]: { bg: '#CCFBF1', text: '#0F766E' }, // teal-100, teal-800
  [FIR_STATUS.CLOSED]: { bg: '#F3F4F6', text: '#374151' } // gray-100, gray-800
};

// Status icons using Lucide react native icons
export const STATUS_ICONS = {
  [FIR_STATUS.DRAFT]: 'FileText',
  [FIR_STATUS.PENDING]: 'Clock',
  [FIR_STATUS.UNDER_REVIEW]: 'Search',
  [FIR_STATUS.APPROVED]: 'CheckCircle',
  [FIR_STATUS.REJECTED]: 'XCircle',
  [FIR_STATUS.INVESTIGATION_STARTED]: 'UserCog',
  [FIR_STATUS.EVIDENCE_COLLECTION]: 'Camera',
  [FIR_STATUS.SUSPECT_IDENTIFIED]: 'UserCheck',
  [FIR_STATUS.CASE_UNDER_TRIAL]: 'Scale',
  [FIR_STATUS.RESOLVED]: 'ThumbsUp',
  [FIR_STATUS.CLOSED]: 'Lock'
};

// Priority Levels with NativeWind v2 compatible colors
export const PRIORITY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low', 
    urdu: 'کم', 
    colors: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' }, // green
    icon: 'ArrowDown',
    severity: 1
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    urdu: 'درمیانہ', 
    colors: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' }, // yellow
    icon: 'Minus',
    severity: 2
  },
  { 
    value: 'high', 
    label: 'High', 
    urdu: 'زیادہ', 
    colors: { bg: '#FFEDD5', text: '#9A3412', border: '#F97316' }, // orange
    icon: 'AlertTriangle',
    severity: 3
  },
  { 
    value: 'emergency', 
    label: 'Emergency', 
    urdu: 'ایمرجنسی', 
    colors: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }, // red
    icon: 'Siren',
    severity: 4
  }
];

// Incident Types with icons and categories
export const INCIDENT_TYPES = [
  { 
    value: 'theft', 
    label: 'Theft', 
    urdu: 'چوری', 
    icon: 'Package',
    category: 'property',
    colors: { bg: '#FEF3C7', text: '#92400E' }
  },
  { 
    value: 'robbery', 
    label: 'Robbery', 
    urdu: 'ڈاکہ', 
    icon: 'ShieldAlert',
    category: 'violent',
    colors: { bg: '#FEE2E2', text: '#991B1B' }
  },
  { 
    value: 'burglary', 
    label: 'Burglary', 
    urdu: 'سینہ زوری', 
    icon: 'House',
    category: 'property',
    colors: { bg: '#FEF3C7', text: '#92400E' }
  },
  { 
    value: 'assault', 
    label: 'Assault', 
    urdu: 'مار پیٹ', 
    icon: 'Hand',
    category: 'violent',
    colors: { bg: '#FEE2E2', text: '#991B1B' }
  },
  { 
    value: 'harassment', 
    label: 'Harassment', 
    urdu: 'ہراسانی', 
    icon: 'PhoneOff',
    category: 'personal',
    colors: { bg: '#E0E7FF', text: '#3730A3' }
  },
  { 
    value: 'fraud', 
    label: 'Fraud', 
    urdu: 'دھوکہ دہی', 
    icon: 'CreditCard',
    category: 'financial',
    colors: { bg: '#DBEAFE', text: '#1E40AF' }
  },
  { 
    value: 'cyber_crime', 
    label: 'Cyber Crime', 
    urdu: 'سائبر جرائم', 
    icon: 'Monitor',
    category: 'digital',
    colors: { bg: '#C7D2FE', text: '#4F46E5' }
  },
  { 
    value: 'drug_offense', 
    label: 'Drug Offense', 
    urdu: 'منشیات', 
    icon: 'Pill',
    category: 'drugs',
    colors: { bg: '#FCE7F3', text: '#9D174D' }
  },
  { 
    value: 'traffic_violation', 
    label: 'Traffic Violation', 
    urdu: 'ٹریفک قوانین کی خلاف ورزی', 
    icon: 'Car',
    category: 'traffic',
    colors: { bg: '#CCFBF1', text: '#0F766E' }
  },
  { 
    value: 'property_dispute', 
    label: 'Property Dispute', 
    urdu: 'جائیداد کا تنازع', 
    icon: 'Home',
    category: 'property',
    colors: { bg: '#FEF3C7', text: '#92400E' }
  },
  { 
    value: 'domestic_violence', 
    label: 'Domestic Violence', 
    urdu: 'گھریلو تشدد', 
    icon: 'Users',
    category: 'violent',
    colors: { bg: '#FEE2E2', text: '#991B1B' }
  },
  { 
    value: 'missing_person', 
    label: 'Missing Person', 
    urdu: 'لاپتہ شخص', 
    icon: 'UserX',
    category: 'personal',
    colors: { bg: '#E0E7FF', text: '#3730A3' }
  },
  { 
    value: 'kidnapping', 
    label: 'Kidnapping', 
    urdu: 'اغوا', 
    icon: 'UserMinus',
    category: 'violent',
    colors: { bg: '#FEE2E2', text: '#991B1B' }
  },
  { 
    value: 'accident', 
    label: 'Accident', 
    urdu: 'حادثہ', 
    icon: 'CarCrash',
    category: 'traffic',
    colors: { bg: '#CCFBF1', text: '#0F766E' }
  },
  { 
    value: 'murder', 
    label: 'Murder', 
    urdu: 'قتل', 
    icon: 'Skull',
    category: 'violent',
    colors: { bg: '#FEE2E2', text: '#991B1B' }
  },
  { 
    value: 'extortion', 
    label: 'Extortion', 
    urdu: 'بھتہ', 
    icon: 'Banknote',
    category: 'financial',
    colors: { bg: '#DBEAFE', text: '#1E40AF' }
  },
  { 
    value: 'other', 
    label: 'Other', 
    urdu: 'دیگر', 
    icon: 'FileQuestion',
    category: 'other',
    colors: { bg: '#F3F4F6', text: '#374151' }
  }
];

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  SPLASH: 'Splash',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  VERIFY_OTP: 'VerifyOTP',
  
  // Main Stack
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  
  // FIR Stack
  RECORD_FIR: 'RecordFIR',
  TRANSCRIPTION: 'Transcription',
  DRAFT_FIR: 'DraftFIR',
  FIR_DETAILS: 'FIRDetails',
  TRACK_FIR: 'TrackFIR',
  MY_FIRS: 'MyFirs',
  SEARCH_FIRS: 'SearchFirs',
  
  // Settings Stack
  CHANGE_PASSWORD: 'ChangePassword',
  NOTIFICATION_SETTINGS: 'NotificationSettings',
  PRIVACY_POLICY: 'PrivacyPolicy',
  TERMS_CONDITIONS: 'TermsConditions',
  HELP_CENTER: 'HelpCenter',
  CONTACT_US: 'ContactUs',
  ABOUT: 'About',
  
  // Emergency
  EMERGENCY_CONTACTS: 'EmergencyContacts',
  QUICK_DIAL: 'QuickDial',
  
  // Admin (if applicable)
  ADMIN_DASHBOARD: 'AdminDashboard',
  MANAGE_FIRS: 'ManageFirs',
  REPORTS: 'Reports',
  ANALYTICS: 'Analytics'
};

// Updated API Configuration for Local Physical Mobile Device
export const API_CONFIG = {
  BASE_URL: 'http://10.173.111.232:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// NativeWind v2 Theme Configuration
export const THEME = {
  COLORS: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D'
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F'
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D'
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  FONT_SIZES: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40
  },
  BORDER_RADIUS: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999
  },
  SHADOWS: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8
    }
  }
};

// Form Validation Regex Patterns
export const REGEX_PATTERNS = {
  CNIC: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
  PHONE: /^(?:\+92|0)?3[0-9]{2}[-\s]?[0-9]{7}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  VEHICLE_NUMBER: /^[A-Z]{2,3}-\d{1,4}$/,
  POSTAL_CODE: /^\d{5}$/
};

// Storage Keys for AsyncStorage
export const STORAGE_KEYS = {
  AUTH: {
    ACCESS_TOKEN: '@smartfir_access_token',
    REFRESH_TOKEN: '@smartfir_refresh_token',
    USER: '@smartfir_user',
    SESSION: '@smartfir_session'
  },
  APP: {
    SETTINGS: '@smartfir_settings',
    LANGUAGE: '@smartfir_language',
    THEME: '@smartfir_theme',
    ONBOARDING: '@smartfir_onboarding'
  },
  DATA: {
    FIR_DRAFTS: '@smartfir_fir_drafts',
    INCIDENT_TYPES: '@smartfir_incident_types',
    PRIORITIES: '@smartfir_priorities'
  }
};

// App Config
export const APP_CONFIG = {
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@smartfir.gov.pk',
  SUPPORT_PHONE: '+92 300 1234567',
  WEBSITE: 'https://smartfir.gov.pk',
  FEATURES: {
    VOICE_RECOGNITION: true,
    BIOMETRIC_LOGIN: true,
    OFFLINE_MODE: true,
    AUTO_SAVE_DRAFT: true
  },
  UPLOAD_LIMITS: {
    IMAGE_MB: 5,
    AUDIO_MB: 10,
    MAX_DRAFTS: 50
  }
};

// Emergency Contacts
export const EMERGENCY_CONTACTS = [
  { id: 1, name: 'Police', number: '15', description: 'Immediate police help', icon: 'Shield', action: 'call', priority: 4 },
  { id: 2, name: 'Ambulance', number: '115', description: 'Medical emergency', icon: 'Heart', action: 'call', priority: 4 },
  { id: 3, name: 'Fire Brigade', number: '16', description: 'Fire emergencies', icon: 'Fire', action: 'call', priority: 4 },
  { id: 4, name: 'Helpline', number: '109', description: 'Citizen support', icon: 'Headset', action: 'call', priority: 3 }
];

// Localization (English & Urdu)
export const LOCALE = {
  EN: {
    COMMON: { SUBMIT: 'Submit', CANCEL: 'Cancel', OK: 'OK', YES: 'Yes', NO: 'No' },
    FIR_FIELDS: { TITLE: 'Title', DESCRIPTION: 'Description', LOCATION: 'Location', DATE: 'Date', TIME: 'Time' },
    ERROR_MESSAGES: { REQUIRED: 'This field is required', INVALID_EMAIL: 'Invalid email format', INVALID_PHONE: 'Invalid phone number' },
    SUCCESS_MESSAGES: { FIR_SUBMITTED: 'FIR submitted successfully', PROFILE_UPDATED: 'Profile updated successfully' }
  },
  UR: {
    COMMON: { SUBMIT: 'جمع کریں', CANCEL: 'منسوخ', OK: 'ٹھیک ہے', YES: 'ہاں', NO: 'نہیں' },
    FIR_FIELDS: { TITLE: 'عنوان', DESCRIPTION: 'تفصیل', LOCATION: 'مقام', DATE: 'تاریخ', TIME: 'وقت' },
    ERROR_MESSAGES: { REQUIRED: 'یہ خانہ ضروری ہے', INVALID_EMAIL: 'غلط ای میل', INVALID_PHONE: 'غلط فون نمبر' },
    SUCCESS_MESSAGES: { FIR_SUBMITTED: 'FIR کامیابی سے جمع کر دی گئی', PROFILE_UPDATED: 'پروفائل کامیابی سے اپڈیٹ ہوا' }
  }
};

// Utility Functions
export const getStatusConfig = (status) => {
  return {
    label: STATUS_LABELS[status] || 'Unknown',
    color: STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' },
    icon: STATUS_ICONS[status] || 'FileText'
  };
};

export const getIncidentTypeConfig = (type) => {
  return INCIDENT_TYPES.find((t) => t.value === type) || INCIDENT_TYPES.find((t) => t.value === 'other');
};

export const getPriorityConfig = (priority) => {
  return PRIORITY_LEVELS.find((p) => p.value === priority) || PRIORITY_LEVELS.find((p) => p.value === 'low');
};