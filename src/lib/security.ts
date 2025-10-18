/**
 * Enhanced security utilities for input validation, sanitization, and XSS protection
 */

// Enhanced security patterns with more comprehensive validation
const PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  name: /^[a-zA-Z\s\-'\.]{1,100}$/,
  alphanumeric: /^[a-zA-Z0-9\s\-_]{1,100}$/,
  text: /^[a-zA-Z0-9\s\-_.,!?()&'"@#$%]{1,2000}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  // Dangerous pattern detection
  scriptTag: /<script[^>]*>.*?<\/script>/gi,
  jsProtocol: /javascript:/gi,
  vbsProtocol: /vbscript:/gi,
  dataUrl: /data:text\/html/gi,
  eventHandler: /on\w+\s*=/gi,
};

// Enhanced XSS protection with comprehensive content security validation
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, 10000) // Prevent extremely long inputs
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove potentially dangerous Unicode characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload/gi, '')
    .replace(/onerror/gi, '')
    .replace(/onclick/gi, '')
    .replace(/onmouseover/gi, '');
};

// Content security validation to detect malicious content
export const validateContentSecurity = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const dangerousPatterns = [
    PATTERNS.scriptTag,
    PATTERNS.jsProtocol,
    PATTERNS.vbsProtocol,
    PATTERNS.dataUrl,
    PATTERNS.eventHandler,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /\.innerHTML/gi,
    /document\./gi,
    /window\./gi,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

// Enhanced input validation functions with security checks
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const sanitized = sanitizeInput(email);
  const isValidFormat = PATTERNS.email.test(sanitized);
  const isReasonableLength = sanitized.length >= 5 && sanitized.length <= 254;
  const hasNoDangerousContent = validateContentSecurity(sanitized);
  
  return isValidFormat && isReasonableLength && hasNoDangerousContent;
};

export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  const sanitized = sanitizeInput(phone).replace(/\s/g, '');
  const isValidFormat = PATTERNS.phone.test(sanitized);
  const isReasonableLength = sanitized.length >= 8 && sanitized.length <= 20;
  const hasNoDangerousContent = validateContentSecurity(phone);
  
  return isValidFormat && isReasonableLength && hasNoDangerousContent;
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeInput(name);
  const isValidFormat = PATTERNS.name.test(sanitized);
  const isReasonableLength = sanitized.length >= 1 && sanitized.length <= 100;
  const hasNoDangerousContent = validateContentSecurity(name);
  const hasNoRepeatedChars = !(/(.)\1{4,}/).test(name); // No more than 4 repeated chars
  
  return isValidFormat && isReasonableLength && hasNoDangerousContent && hasNoRepeatedChars;
};

export const validateText = (text: string, maxLength: number = 2000): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  const sanitized = sanitizeInput(text);
  const hasNoDangerousContent = validateContentSecurity(text);
  const isReasonableLength = sanitized.length <= maxLength && sanitized.length > 0;
  const hasNoExcessiveWhitespace = !/\s{10,}/.test(text);
  
  return hasNoDangerousContent && isReasonableLength && hasNoExcessiveWhitespace;
};

export const validateRequired = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const sanitized = sanitizeInput(value);
  return sanitized.length > 0;
};

// Enhanced form validation schema
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>; // Changed from string[] to Record for better field-specific errors
  sanitizedData: Record<string, string>;
}

export const validateContactForm = (formData: Record<string, string>): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, string> = {};

  // Security checks before processing - validate all inputs for malicious content
  for (const [key, value] of Object.entries(formData)) {
    if (!validateContentSecurity(value)) {
      errors[key] = 'Invalid content detected - please remove any potentially harmful characters';
      continue;
    }
    sanitizedData[key] = sanitizeInput(value);
  }

  // Enhanced field validation with better error messages
  const requiredFields = ['firstName', 'lastName', 'email', 'message'];
  requiredFields.forEach(field => {
    if (!validateRequired(sanitizedData[field])) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });

  // Specific validations with comprehensive checks
  if (sanitizedData.firstName && !validateName(sanitizedData.firstName)) {
    errors.firstName = 'First name must contain only letters, spaces, hyphens, and apostrophes (1-100 characters)';
  }

  if (sanitizedData.lastName && !validateName(sanitizedData.lastName)) {
    errors.lastName = 'Last name must contain only letters, spaces, hyphens, and apostrophes (1-100 characters)';
  }

  if (sanitizedData.email && !validateEmail(sanitizedData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (sanitizedData.phone && sanitizedData.phone.length > 0 && !validatePhone(sanitizedData.phone)) {
    errors.phone = 'Please enter a valid phone number (8-20 digits)';
  }

  if (sanitizedData.message && !validateText(sanitizedData.message, 2000)) {
    errors.message = 'Message must be between 1 and 2000 characters and contain no harmful content';
  }

  // Enhanced spam detection
  if (sanitizedData.message && !errors.message) {
    const spamPatterns = [
      /(.)\1{20,}/gi, // Excessive character repetition
      /(https?:\/\/[^\s]+.*){3,}/gi, // Multiple URLs
      /[A-Z]{30,}/g, // Excessive caps (increased threshold)
      /(free|win|prize|urgent|act now|limited time|click here|guarantee)/gi // Common spam words
    ];
    
    const hasSpamContent = spamPatterns.some(pattern => pattern.test(sanitizedData.message));
    if (hasSpamContent) {
      errors.message = 'Message content appears to be spam - please use normal language';
    }
    
    // Check for suspicious patterns
    const wordCount = sanitizedData.message.split(/\s+/).length;
    const linkCount = (sanitizedData.message.match(/https?:\/\//gi) || []).length;
    
    if (linkCount > 2) {
      errors.message = 'Please limit the number of links in your message';
    }
    
    if (wordCount < 3) {
      errors.message = 'Please provide a more detailed message';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Enhanced rate limiting with better security and tracking
const RATE_LIMIT_STORAGE_KEY = 'form_submissions';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes (more secure)
const MAX_SUBMISSIONS = 5; // 5 submissions per 15 minutes
const MAX_RAPID_SUBMISSIONS = 2; // Max 2 submissions per minute

export const checkRateLimit = (formType: string): boolean => {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const submissions = stored ? JSON.parse(stored) : {};
    
    // Clean old entries more aggressively
    Object.keys(submissions).forEach(key => {
      const entries = submissions[key];
      if (Array.isArray(entries)) {
        // Remove entries older than 2 hours
        submissions[key] = entries.filter((timestamp: number) => 
          now - timestamp < RATE_LIMIT_WINDOW * 8
        );
        
        // Remove empty arrays
        if (submissions[key].length === 0) {
          delete submissions[key];
        }
      }
    });

    const formKey = `${formType}_submissions`;
    const currentSubmissions = submissions[formKey] || [];
    
    // Check recent submissions in the window
    const recentSubmissions = currentSubmissions.filter(
      (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW
    );
    
    // Check for rapid submissions (more than 2 per minute)
    const oneMinuteAgo = now - 60000;
    const rapidSubmissions = recentSubmissions.filter(
      (timestamp: number) => timestamp > oneMinuteAgo
    );
    
    if (rapidSubmissions.length >= MAX_RAPID_SUBMISSIONS) {
      console.warn(`Suspicious rapid form submission detected for ${formType}`);
      return false;
    }
    
    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
      console.warn(`Rate limit exceeded for ${formType}`);
      return false;
    }

    // Add current submission
    const updatedSubmissions = [...recentSubmissions, now];
    submissions[formKey] = updatedSubmissions;
    
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(submissions));
    
    return true;
  } catch (error) {
    console.warn('Rate limiting check failed:', error);
    return false; // Fail securely - deny submission if rate limiting fails
  }
};

// Enhanced form token generation with better entropy
export const generateFormToken = (): string => {
  try {
    // Use crypto.getRandomValues if available for better security
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return Date.now().toString(36) + randomPart;
    }
    // Fallback for older browsers
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  } catch {
    // Final fallback
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Enhanced form token validation with stricter checks
export const validateFormToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    // Extract timestamp from token
    const timestampPart = token.slice(0, 8);
    const timestamp = parseInt(timestampPart, 36);
    
    if (isNaN(timestamp)) return false;
    
    const age = Date.now() - timestamp;
    
    // Token should be between 5 seconds and 30 minutes old (tighter window)
    const minAge = 5 * 1000; // 5 seconds
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    return age >= minAge && age <= maxAge;
  } catch (error) {
    console.warn('Token validation failed:', error);
    return false;
  }
};

// Additional security utilities
export const detectSuspiciousActivity = (formData: Record<string, string>): string[] => {
  const suspiciousFlags: string[] = [];
  
  // Check for honeypot fields (fields that should be empty)
  if (formData.website || formData.url || formData.link) {
    suspiciousFlags.push('honeypot_filled');
  }
  
  // Check for extremely fast form completion
  const formToken = formData._token;
  if (formToken && validateFormToken(formToken)) {
    const timestampPart = formToken.slice(0, 8);
    const timestamp = parseInt(timestampPart, 36);
    const completionTime = Date.now() - timestamp;
    
    // Suspiciously fast completion (less than 3 seconds)
    if (completionTime < 3000) {
      suspiciousFlags.push('too_fast_completion');
    }
  }
  
  // Check for duplicate content across fields
  const values = Object.values(formData).filter(v => v && v.length > 3);
  const duplicates = values.filter((value, index) => 
    values.indexOf(value) !== index
  );
  
  if (duplicates.length > 0) {
    suspiciousFlags.push('duplicate_content');
  }
  
  return suspiciousFlags;
};