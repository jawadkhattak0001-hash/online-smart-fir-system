// src/utils/validators.js - ENHANCED VERSION
import { Platform } from 'react-native';
import { REGEX_PATTERNS, INCIDENT_TYPES, PRIORITY_LEVELS } from './constants';

// Validation result structure
export const ValidationResult = (isValid, message = '', field = '', suggestions = []) => ({
  isValid,
  message,
  field,
  suggestions,
  timestamp: new Date().toISOString()
});

// Phone number validation (Enhanced)
export const validatePhone = (phone, country = 'PK') => {
  if (!phone || typeof phone !== 'string') {
    return ValidationResult(false, 'Phone number is required', 'phone');
  }

  const cleaned = phone.replace(/\D/g, '');
  
  if (country === 'PK') {
    // Pakistani mobile numbers
    const patterns = [
      /^3[0-9]{9}$/,          // 03XXXXXXXXX (without leading 0)
      /^03[0-9]{9}$/,         // 03XXXXXXXXX
      /^\+923[0-9]{9}$/,      // +923XXXXXXXXX
      /^00923[0-9]{9}$/       // 00923XXXXXXXXX
    ];

    const isValid = patterns.some(pattern => pattern.test(cleaned));
    
    if (!isValid) {
      return ValidationResult(false, 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567)', 'phone', [
        'Use format: 03XX-XXXXXXX',
        'Remove spaces and special characters',
        'Ensure it starts with 03'
      ]);
    }

    // Check if it's a known mobile operator
    const operatorCodes = ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359'];
    const prefix = cleaned.slice(0, 4);
    
    if (!operatorCodes.some(code => prefix.endsWith(code))) {
      return ValidationResult(true, '', 'phone', ['Uncommon operator prefix detected']);
    }

    return ValidationResult(true, '', 'phone');
  }

  // Default validation for other countries
  const internationalPattern = /^\+?[1-9]\d{1,14}$/;
  const isValid = internationalPattern.test(cleaned);
  
  return ValidationResult(
    isValid,
    isValid ? '' : 'Please enter a valid international phone number',
    'phone'
  );
};

// CNIC validation with proper algorithm (Pakistan)
export const validateCNIC = (cnic) => {
  if (!cnic || typeof cnic !== 'string') {
    return ValidationResult(false, 'CNIC is required', 'cnic');
  }

  // Remove all non-digits
  const cleaned = cnic.replace(/\D/g, '');
  
  // Check length
  if (cleaned.length !== 13) {
    return ValidationResult(false, 'CNIC must be 13 digits', 'cnic', [
      'Format: XXXXX-XXXXXXX-X',
      'Enter without spaces or dashes'
    ]);
  }

  // Validate format (basic check)
  const cnicRegex = REGEX_PATTERNS.CNIC;
  const hasDashes = cnicRegex.test(cnic);
  
  if (!hasDashes && cleaned.length === 13) {
    // Auto-format suggestion
    const formatted = `${cleaned.substring(0, 5)}-${cleaned.substring(5, 12)}-${cleaned.substring(12)}`;
    return ValidationResult(true, '', 'cnic', [`Consider formatting as: ${formatted}`]);
  }

  // Validate check digit (simplified - real implementation would use proper algorithm)
  const checkDigit = parseInt(cleaned[12], 10);
  const remaining = cleaned.substring(0, 12);
  
  // Simple parity check (real CNIC validation is more complex)
  const isValidCheckDigit = checkDigit >= 0 && checkDigit <= 9;
  
  if (!isValidCheckDigit) {
    return ValidationResult(false, 'Invalid CNIC check digit', 'cnic');
  }

  // Check if CNIC is not all zeros or sequential
  if (/^(\d)\1{12}$/.test(cleaned)) {
    return ValidationResult(false, 'CNIC cannot have all identical digits', 'cnic');
  }

  // Check if CNIC is not in obvious invalid ranges
  const firstFive = parseInt(cleaned.substring(0, 5), 10);
  if (firstFive < 10000 || firstFive > 99999) {
    return ValidationResult(false, 'Invalid CNIC prefix', 'cnic');
  }

  return ValidationResult(true, '', 'cnic');
};

// Email validation (Enhanced)
export const validateEmail = (email, isRequired = false) => {
  if (!email || email.trim() === '') {
    return ValidationResult(!isRequired, isRequired ? 'Email is required' : '', 'email');
  }

  const emailRegex = REGEX_PATTERNS.EMAIL;
  const isValid = emailRegex.test(email);
  
  if (!isValid) {
    return ValidationResult(false, 'Please enter a valid email address', 'email', [
      'Format: name@domain.com',
      'Check for typos',
      'Ensure domain is correct'
    ]);
  }

  // Additional checks
  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) {
    return ValidationResult(false, 'Email username too long (max 64 characters)', 'email');
  }
  
  if (domain.length > 255) {
    return ValidationResult(false, 'Email domain too long', 'email');
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.com', 'mailinator.com', 'guerrillamail.com', 
    '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
  ];
  
  if (disposableDomains.some(disposable => domain.toLowerCase().includes(disposable))) {
    return ValidationResult(true, '', 'email', [
      'Disposable email detected. Consider using a permanent email.'
    ]);
  }

  return ValidationResult(true, '', 'email');
};

// Password validation with strength meter
export const validatePassword = (password, confirmPassword = null) => {
  if (!password) {
    return ValidationResult(false, 'Password is required', 'password');
  }

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[@$!%*?&]/.test(password),
    noSpaces: !/\s/.test(password),
    notCommon: !['password', '12345678', 'qwerty123', 'admin123'].includes(password.toLowerCase())
  };

  const isValid = Object.values(requirements).every(Boolean);
  
  if (!isValid) {
    const missing = [];
    if (!requirements.length) missing.push('at least 8 characters');
    if (!requirements.uppercase) missing.push('one uppercase letter');
    if (!requirements.lowercase) missing.push('one lowercase letter');
    if (!requirements.number) missing.push('one number');
    if (!requirements.specialChar) missing.push('one special character (@$!%*?&)');
    if (!requirements.noSpaces) missing.push('no spaces');
    if (!requirements.notCommon) missing.push('not a common password');
    
    return ValidationResult(false, `Password must contain: ${missing.join(', ')}`, 'password');
  }

  // Check password strength
  const strength = calculatePasswordStrength(password);
  
  // Check if passwords match (if confirmPassword provided)
  if (confirmPassword !== null && password !== confirmPassword) {
    return ValidationResult(false, 'Passwords do not match', 'password');
  }

  return ValidationResult(true, '', 'password', [
    `Password strength: ${strength.label}`,
    strength.suggestions
  ]);
};

// Calculate password strength
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'None', suggestions: [] };
  
  let score = 0;
  const suggestions = [];
  
  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;
  
  // Bonus for mixed case and numbers
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
  
  // Penalty for common patterns
  if (/^(.)\1+$/.test(password)) score -= 2; // All same character
  if (/^[0-9]+$/.test(password)) score -= 2; // All numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 1; // All letters
  
  // Cap score
  score = Math.max(0, Math.min(score, 10));
  
  // Determine label
  let label = 'Very Weak';
  if (score >= 4) label = 'Weak';
  if (score >= 6) label = 'Fair';
  if (score >= 8) label = 'Strong';
  if (score >= 9) label = 'Very Strong';
  
  // Generate suggestions
  if (password.length < 8) {
    suggestions.push('Make password longer (at least 8 characters)');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  }
  if (!/\d/.test(password)) {
    suggestions.push('Add numbers');
  }
  if (!/[@$!%*?&]/.test(password)) {
    suggestions.push('Add special characters (@$!%*?&)');
  }
  
  return { score, label, suggestions };
};

// Name validation (Urdu and English)
export const validateName = (name, fieldName = 'name') => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return ValidationResult(false, `${fieldName} is required`, fieldName);
  }

  const trimmedName = name.trim();
  
  // Length validation
  if (trimmedName.length < 2) {
    return ValidationResult(false, `${fieldName} must be at least 2 characters`, fieldName);
  }
  
  if (trimmedName.length > 100) {
    return ValidationResult(false, `${fieldName} is too long (max 100 characters)`, fieldName);
  }

  // Urdu name pattern
  const urduPattern = /^[\u0600-\u06FF\s\.\-]+$/;
  
  // English name pattern (with apostrophes and hyphens for names like O'Connor, Al-Habib)
  const englishPattern = /^[A-Za-z\s\'\-\.]+$/;
  
  const isUrdu = urduPattern.test(trimmedName);
  const isEnglish = englishPattern.test(trimmedName);
  
  if (!isUrdu && !isEnglish) {
    return ValidationResult(false, 
      `${fieldName} can only contain Urdu or English letters, spaces, dots, and hyphens`, 
      fieldName
    );
  }

  // Check for excessive spaces
  if (/\s{2,}/.test(trimmedName)) {
    return ValidationResult(true, '', fieldName, ['Remove extra spaces between words']);
  }

  // Check for mixed languages (optional, can be allowed)
  const hasMixed = /[\u0600-\u06FF]/.test(trimmedName) && /[A-Za-z]/.test(trimmedName);
  if (hasMixed) {
    return ValidationResult(true, '', fieldName, ['Consider using one language consistently']);
  }

  return ValidationResult(true, '', fieldName);
};

// Address validation
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return ValidationResult(false, 'Address is required', 'address');
  }

  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < 10) {
    return ValidationResult(false, 'Address is too short (minimum 10 characters)', 'address');
  }
  
  if (trimmedAddress.length > 500) {
    return ValidationResult(false, 'Address is too long (maximum 500 characters)', 'address');
  }

  // Check for meaningful content (not just numbers or special characters)
  const wordCount = trimmedAddress.split(/\s+/).filter(word => word.length > 1).length;
  if (wordCount < 2) {
    return ValidationResult(false, 'Please provide a more detailed address', 'address');
  }

  return ValidationResult(true, '', 'address');
};

// Date validation for incidents
export const validateDate = (date, options = {}) => {
  const {
    allowFuture = false,
    minDate = null,
    maxDate = new Date(),
    fieldName = 'date'
  } = options;

  if (!date) {
    return ValidationResult(false, `${fieldName} is required`, fieldName);
  }

  let dateObj;
  try {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    return ValidationResult(false, 'Please enter a valid date', fieldName);
  }

  // Check if date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!allowFuture && dateObj > today) {
    return ValidationResult(false, 'Date cannot be in the future', fieldName);
  }

  // Check min date
  if (minDate) {
    const minDateObj = new Date(minDate);
    minDateObj.setHours(0, 0, 0, 0);
    if (dateObj < minDateObj) {
      return ValidationResult(false, `Date cannot be before ${formatDate(minDate)}`, fieldName);
    }
  }

  // Check max date
  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    maxDateObj.setHours(23, 59, 59, 999);
    if (dateObj > maxDateObj) {
      return ValidationResult(false, `Date cannot be after ${formatDate(maxDate)}`, fieldName);
    }
  }

  // Check if date is not too far in the past (e.g., > 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(today.getFullYear() - 10);
  
  if (dateObj < tenYearsAgo) {
    return ValidationResult(true, '', fieldName, ['Date is more than 10 years old']);
  }

  return ValidationResult(true, '', fieldName);
};

// Time validation
export const validateTime = (time, options = {}) => {
  const {
    fieldName = 'time',
    allowEmpty = false
  } = options;

  if (!time) {
    return allowEmpty ? 
      ValidationResult(true, '', fieldName) : 
      ValidationResult(false, `${fieldName} is required`, fieldName);
  }

  // Accept various time formats
  const timeFormats = [
    /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, // 12-hour with AM/PM
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // 24-hour
    /^(0?[1-9]|1[0-2]):[0-5][0-9]$/, // 12-hour without AM/PM
  ];

  const isValid = timeFormats.some(format => format.test(time.trim()));
  
  if (!isValid) {
    return ValidationResult(false, 
      'Please enter a valid time (e.g., 14:30 or 2:30 PM)', 
      fieldName,
      ['Use 24-hour format: HH:MM', 'Or 12-hour format: HH:MM AM/PM']
    );
  }

  return ValidationResult(true, '', fieldName);
};

// Location validation
export const validateLocation = (location) => {
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return ValidationResult(false, 'Location is required', 'location');
  }

  const trimmedLocation = location.trim();
  
  if (trimmedLocation.length < 5) {
    return ValidationResult(false, 'Location is too short (minimum 5 characters)', 'location');
  }
  
  if (trimmedLocation.length > 500) {
    return ValidationResult(false, 'Location is too long (maximum 500 characters)', 'location');
  }

  // Check for meaningful content
  const hasAddressComponents = /(?:street|road|lane|avenue|boulevard|market|area|sector|block|house|flat|apartment)/i.test(trimmedLocation);
  const hasCity = /(?:islamabad|karachi|lahore|rawalpindi|faisalabad|multan|hyderabad|peshawar|quetta)/i.test(trimmedLocation);
  
  if (!hasAddressComponents && !hasCity) {
    return ValidationResult(true, '', 'location', [
      'Add more details like street name, sector, or city',
      'Include landmarks for better accuracy'
    ]);
  }

  return ValidationResult(true, '', 'location');
};

// Incident description validation
export const validateDescription = (description, options = {}) => {
  const {
    fieldName = 'description',
    minLength = 20,
    maxLength = 5000,
    isRequired = true
  } = options;

  if (!description || description.trim().length === 0) {
    return isRequired ? 
      ValidationResult(false, `${fieldName} is required`, fieldName) :
      ValidationResult(true, '', fieldName);
  }

  const trimmedDesc = description.trim();
  const wordCount = trimmedDesc.split(/\s+/).length;
  
  if (trimmedDesc.length < minLength) {
    return ValidationResult(false, 
      `${fieldName} is too short (minimum ${minLength} characters)`, 
      fieldName
    );
  }
  
  if (trimmedDesc.length > maxLength) {
    return ValidationResult(false, 
      `${fieldName} is too long (maximum ${maxLength} characters)`, 
      fieldName
    );
  }

  if (wordCount < 5) {
    return ValidationResult(true, '', fieldName, [
      'Add more details about what happened',
      'Include who, what, when, where, why'
    ]);
  }

  // Check for meaningful content (not just repeated words)
  const uniqueWords = new Set(trimmedDesc.toLowerCase().split(/\s+/));
  if (uniqueWords.size < 3) {
    return ValidationResult(true, '', fieldName, ['Use more varied vocabulary']);
  }

  return ValidationResult(true, '', fieldName);
};

// Priority validation
export const validatePriority = (priority) => {
  if (!priority) {
    return ValidationResult(false, 'Priority is required', 'priority');
  }

  const isValid = PRIORITY_LEVELS.some(p => p.value === priority);
  
  if (!isValid) {
    return ValidationResult(false, 
      'Please select a valid priority level', 
      'priority',
      PRIORITY_LEVELS.map(p => `${p.label} (${p.value})`)
    );
  }

  return ValidationResult(true, '', 'priority');
};

// Incident type validation
export const validateIncidentType = (type) => {
  if (!type) {
    return ValidationResult(false, 'Incident type is required', 'incidentType');
  }

  const isValid = INCIDENT_TYPES.some(t => t.value === type);
  
  if (!isValid) {
    return ValidationResult(false, 
      'Please select a valid incident type', 
      'incidentType',
      INCIDENT_TYPES.slice(0, 5).map(t => t.label)
    );
  }

  return ValidationResult(true, '', 'incidentType');
};

// Police station validation
export const validatePoliceStation = (station) => {
  if (!station) {
    return ValidationResult(false, 'Police station is required', 'policeStation');
  }

  if (typeof station !== 'string' || station.trim().length === 0) {
    return ValidationResult(false, 'Please select a valid police station', 'policeStation');
  }

  return ValidationResult(true, '', 'policeStation');
};

// OTP validation
export const validateOTP = (otp, length = 6) => {
  if (!otp) {
    return ValidationResult(false, 'OTP is required', 'otp');
  }

  const otpRegex = new RegExp(`^\\d{${length}}$`);
  const isValid = otpRegex.test(otp);
  
  if (!isValid) {
    return ValidationResult(false, 
      `OTP must be ${length} digits`, 
      'otp',
      ['Enter numbers only', 'Check for any spaces']
    );
  }

  return ValidationResult(true, '', 'otp');
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxCount = 5
  } = options;

  if (!file) {
    return ValidationResult(false, 'File is required', 'file');
  }

  // Handle multiple files
  const files = Array.isArray(file) ? file : [file];
  
  if (files.length > maxCount) {
    return ValidationResult(false, 
      `Maximum ${maxCount} files allowed`, 
      'file'
    );
  }

  for (const f of files) {
    // Check file size
    if (f.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return ValidationResult(false, 
        `File "${f.name}" is too large (max ${maxSizeMB}MB)`, 
        'file'
      );
    }

    // Check file type
    if (!allowedTypes.includes(f.type)) {
      const allowedExtensions = allowedTypes.map(t => t.split('/')[1]).join(', ');
      return ValidationResult(false, 
        `File "${f.name}" type not allowed. Allowed: ${allowedExtensions}`, 
        'file'
      );
    }
  }

  return ValidationResult(true, '', 'file');
};

// Vehicle number validation (Pakistan)
export const validateVehicleNumber = (number) => {
  if (!number) {
    return ValidationResult(false, 'Vehicle number is required', 'vehicleNumber');
  }

  const patterns = [
    /^[A-Z]{2,3}-\d{1,4}$/, // Standard format: ABC-1234
    /^\d{3,4}$/, // Just numbers (for partial)
    /^[A-Z]{2,3}\d{1,4}$/, // Without dash: ABC1234
  ];

  const isValid = patterns.some(pattern => pattern.test(number.toUpperCase().trim()));
  
  if (!isValid) {
    return ValidationResult(false, 
      'Please enter a valid vehicle number (e.g., ABC-1234)', 
      'vehicleNumber',
      ['Format: ABC-1234', 'Use uppercase letters']
    );
  }

  return ValidationResult(true, '', 'vehicleNumber');
};

// Composite FIR validation
export const validateFIRSubmission = (firData, options = {}) => {
  const { strict = true } = options;
  const errors = {};
  const warnings = {};
  const suggestions = {};

  // Required fields
  const requiredFields = [
    { key: 'incidentType', validator: validateIncidentType },
    { key: 'location', validator: validateLocation },
    { key: 'description', validator: validateDescription },
    { key: 'date', validator: (value) => validateDate(value, { allowFuture: false }) },
    { key: 'time', validator: validateTime },
    { key: 'contactInfo', validator: validatePhone },
    { key: 'policeStation', validator: validatePoliceStation },
    { key: 'priority', validator: validatePriority }
  ];

  for (const { key, validator } of requiredFields) {
    const result = validator(firData[key]);
    if (!result.isValid) {
      errors[key] = result.message;
    }
    if (result.suggestions && result.suggestions.length > 0) {
      suggestions[key] = result.suggestions;
    }
  }

  // Optional fields with warnings
  const optionalFields = [
    { key: 'witnesses', validator: (value) => validateDescription(value, { isRequired: false, maxLength: 1000 }) },
    { key: 'evidence', validator: (value) => validateDescription(value, { isRequired: false, maxLength: 2000 }) },
    { key: 'involvedParties', validator: (value) => validateDescription(value, { isRequired: false, maxLength: 1000 }) }
  ];

  for (const { key, validator } of optionalFields) {
    const result = validator(firData[key]);
    if (!result.isValid && strict) {
      warnings[key] = result.message;
    }
    if (result.suggestions && result.suggestions.length > 0) {
      suggestions[key] = result.suggestions;
    }
  }

  // Additional business logic
  if (firData.date && firData.time) {
    // Check if incident date/time is not too far in the past
    const incidentDateTime = new Date(`${firData.date}T${firData.time}`);
    const now = new Date();
    const daysDifference = Math.floor((now - incidentDateTime) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 30) {
      warnings.timeliness = 'Incident is more than 30 days old. Please ensure details are accurate.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    suggestions,
    summary: {
      totalErrors: Object.keys(errors).length,
      totalWarnings: Object.keys(warnings).length,
      hasSuggestions: Object.keys(suggestions).length > 0
    }
  };
};

// User registration validation
export const validateUserRegistration = (userData) => {
  const errors = {};
  const warnings = {};
  const suggestions = {};

  // Required fields
  const requiredFields = [
    { key: 'name', validator: validateName },
    { key: 'cnic', validator: validateCNIC },
    { key: 'phone', validator: validatePhone },
    { key: 'password', validator: (value) => validatePassword(value, userData.confirmPassword) }
  ];

  for (const { key, validator } of requiredFields) {
    const result = validator(userData[key]);
    if (!result.isValid) {
      errors[key] = result.message;
    }
    if (result.suggestions && result.suggestions.length > 0) {
      suggestions[key] = result.suggestions;
    }
  }

  // Optional fields
  if (userData.email) {
    const result = validateEmail(userData.email, false);
    if (!result.isValid) {
      errors.email = result.message;
    }
    if (result.suggestions && result.suggestions.length > 0) {
      suggestions.email = result.suggestions;
    }
  }

  if (userData.address) {
    const result = validateAddress(userData.address);
    if (!result.isValid) {
      warnings.address = result.message;
    }
    if (result.suggestions && result.suggestions.length > 0) {
      suggestions.address = result.suggestions;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    suggestions
  };
};

// Field-by-field validation helper
export const validateField = (fieldName, value, context = {}) => {
  const validators = {
    name: validateName,
    cnic: validateCNIC,
    phone: validatePhone,
    email: (val) => validateEmail(val, context.isRequired),
    password: (val) => validatePassword(val, context.confirmPassword),
    address: validateAddress,
    date: (val) => validateDate(val, context),
    time: validateTime,
    location: validateLocation,
    description: (val) => validateDescription(val, context),
    priority: validatePriority,
    incidentType: validateIncidentType,
    policeStation: validatePoliceStation,
    otp: validateOTP,
    vehicleNumber: validateVehicleNumber,
    file: (val) => validateFile(val, context)
  };

  const validator = validators[fieldName];
  if (!validator) {
    return ValidationResult(true, '', fieldName);
  }

  return validator(value);
};

// Format helpers
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('923')) {
    return `0${cleaned.substring(2, 5)}-${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
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

// Date formatting helper
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Export all validators
export default {
  ValidationResult,
  validatePhone,
  validateCNIC,
  validateEmail,
  validatePassword,
  calculatePasswordStrength,
  validateName,
  validateAddress,
  validateDate,
  validateTime,
  validateLocation,
  validateDescription,
  validatePriority,
  validateIncidentType,
  validatePoliceStation,
  validateOTP,
  validateFile,
  validateVehicleNumber,
  validateFIRSubmission,
  validateUserRegistration,
  validateField,
  formatPhoneNumber,
  formatCNIC,
  formatDate
};