/**
 * Validation utility functions
 * Pure functions for data validation
 */

import { VALIDATION } from '@/types/constants';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return VALIDATION.EMAIL_REGEX.test(email.trim());
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  return VALIDATION.PHONE_REGEX.test(phone.trim());
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong';
  score: number;
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  if (!password || typeof password !== 'string') {
    return {
      level: 'weak',
      score: 0,
      requirements: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
      },
    };
  }

  const requirements = {
    length: password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  
  let level: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    level = 'weak';
  } else if (score <= 4) {
    level = 'medium';
  } else {
    level = 'strong';
  }

  return {
    level,
    score,
    requirements,
  };
}

/**
 * Validate name format
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return (
    trimmedName.length >= VALIDATION.NAME_MIN_LENGTH &&
    trimmedName.length <= VALIDATION.NAME_MAX_LENGTH
  );
}

/**
 * Validate required field
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
}

/**
 * Validate string length
 */
export function isValidLength(
  value: string,
  min: number,
  max?: number
): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  const length = value.trim().length;
  
  if (max !== undefined) {
    return length >= min && length <= max;
  }
  
  return length >= min;
}

/**
 * Validate number range
 */
export function isValidNumber(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  
  if (min !== undefined && value < min) {
    return false;
  }
  
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
}

/**
 * Validate date
 */
export function isValidDate(date: Date | string): boolean {
  if (!date) {
    return false;
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(
  startDate: Date | string,
  endDate: Date | string
): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return start <= end;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file type
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  if (!file || !allowedTypes || allowedTypes.length === 0) {
    return false;
  }
  
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(
  file: File,
  maxSizeInBytes: number
): boolean {
  if (!file || typeof maxSizeInBytes !== 'number') {
    return false;
  }
  
  return file.size <= maxSizeInBytes;
}

/**
 * Validate JSON string
 */
export function isValidJson(jsonString: string): boolean {
  if (!jsonString || typeof jsonString !== 'string') {
    return false;
  }
  
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate ID (positive integer)
 */
export function isValidId(id: number | string): boolean {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0;
  }
  
  return typeof id === 'number' && id > 0 && Number.isInteger(id);
}

/**
 * Validate array of IDs
 */
export function isValidIdArray(ids: (number | string)[]): boolean {
  if (!Array.isArray(ids) || ids.length === 0) {
    return false;
  }
  
  return ids.every(id => isValidId(id));
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }
  
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate postal code (flexible format)
 */
export function isValidPostalCode(postalCode: string): boolean {
  if (!postalCode || typeof postalCode !== 'string') {
    return false;
  }
  
  // Basic validation - adjust regex based on country requirements
  return /^[A-Za-z0-9\s\-]{3,10}$/.test(postalCode.trim());
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s\-]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }
  
  // Check length
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate social security number (basic format)
 */
export function isValidSSN(ssn: string): boolean {
  if (!ssn || typeof ssn !== 'string') {
    return false;
  }
  
  // Remove dashes and spaces
  const cleaned = ssn.replace(/[\s\-]/g, '');
  
  // Check if it's 9 digits
  return /^\d{9}$/.test(cleaned);
}

/**
 * Validate IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  const parts = ip.split('.');
  
  if (parts.length !== 4) {
    return false;
  }
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

/**
 * Validate MAC address
 */
export function isValidMACAddress(mac: string): boolean {
  if (!mac || typeof mac !== 'string') {
    return false;
  }
  
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**
 * Validate base64 string
 */
export function isValidBase64(base64: string): boolean {
  if (!base64 || typeof base64 !== 'string') {
    return false;
  }
  
  try {
    return btoa(atob(base64)) === base64;
  } catch {
    return false;
  }
}

/**
 * Validate JWT token format (basic structure check)
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Sanitize string for XSS prevention
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize HTML
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Generic validation function
 */
export function validate<T>(
  value: T,
  rules: Array<{
    validator: (val: T) => boolean;
    message: string;
  }>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validator(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T) => boolean>
): (value: T) => boolean {
  return (value: T) => validators.every(validator => validator(value));
}