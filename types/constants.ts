// Application Constants

// Status Values
export const PATIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  ARCHIVED: 'archived',
} as const;

export const MEDICAL_REPORT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const STUDY_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING_REVIEW: 'pending_review',
} as const;

// Gender Values
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Modal Variants
export const MODAL_VARIANT = {
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
} as const;

// Button Variants
export const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Button Sizes
export const BUTTON_SIZE = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const;

// Modal Sizes
export const MODAL_SIZE = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
} as const;

// Input Types
export const INPUT_TYPE = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  DATETIME: 'datetime-local',
  TIME: 'time',
} as const;

// Sort Directions
export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Table Alignment
export const TABLE_ALIGN = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  PATIENTS: '/api/patients',
  MEDICAL_REPORTS: '/api/medicalReports',
  STUDIES: '/api/studies',
  STUDY_TYPES: '/api/study-types',
  CATEGORIES: '/api/categories',
  AUTH: '/api/auth',
  MAILER: '/api/mailerHelper',
  MERGE_PDFS: '/api/mergePdfs',
  EDGESTORE: '/api/edgestore',
} as const;

// Default Values
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const DEFAULT_DEBOUNCE_DELAY = 300; // milliseconds

export const DEFAULT_TOAST_DURATION = 5000; // milliseconds

export const DEFAULT_MODAL_ANIMATION_DURATION = 200; // milliseconds

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILES: 5,
} as const;

// Date Formats
export const DATE_FORMAT = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  INFORMATION_MAX_LENGTH: 2000,
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#06b6d4',
  LIGHT: '#f8fafc',
  DARK: '#1f2937',
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Z-Index Values
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_SETTINGS: 'table_settings',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check the form for errors.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SAVED: 'Saved successfully.',
  SENT: 'Sent successfully.',
  UPLOADED: 'Uploaded successfully.',
} as const;

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  DELETE: 'Are you sure you want to delete this item? This action cannot be undone.',
  CANCEL: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
  LEAVE: 'You have unsaved changes. Are you sure you want to leave?',
} as const;

// App Modes
export const APP_MODE = {
  LIVE: 'live',
  DEMO: 'demo',
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  SERVER_ERROR: 'Internal server error',
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  MEDICAL_REPORT_SHARE: 'medical_report_share',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
} as const;

// User Roles (if applicable)
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PATIENT: 'patient',
  VIEWER: 'viewer',
} as const;

// Type definitions for the constants
export type PatientStatus = typeof PATIENT_STATUS[keyof typeof PATIENT_STATUS];
export type MedicalReportStatus = typeof MEDICAL_REPORT_STATUS[keyof typeof MEDICAL_REPORT_STATUS];
export type StudyStatus = typeof STUDY_STATUS[keyof typeof STUDY_STATUS];
export type Gender = typeof GENDER[keyof typeof GENDER];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type ModalVariant = typeof MODAL_VARIANT[keyof typeof MODAL_VARIANT];
export type ButtonVariant = typeof BUTTON_VARIANT[keyof typeof BUTTON_VARIANT];
export type ButtonSize = typeof BUTTON_SIZE[keyof typeof BUTTON_SIZE];
export type ModalSize = typeof MODAL_SIZE[keyof typeof MODAL_SIZE];
export type InputType = typeof INPUT_TYPE[keyof typeof INPUT_TYPE];
export type SortDirection = typeof SORT_DIRECTION[keyof typeof SORT_DIRECTION];
export type TableAlign = typeof TABLE_ALIGN[keyof typeof TABLE_ALIGN];
export type AppMode = typeof APP_MODE[keyof typeof APP_MODE];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];