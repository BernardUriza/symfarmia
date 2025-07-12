/**
 * Medical AI Types and Interfaces
 * 
 * Core type definitions for the Medical AI domain supporting Spanish medical
 * terminology and HIPAA compliance requirements.
 */

/**
 * Transcription status enum for tracking the state of medical transcriptions
 */
export enum TranscriptionStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

/**
 * Model loading status for AI models
 */
export enum ModelStatus {
  NOT_LOADED = 'not_loaded',
  DOWNLOADING = 'downloading',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Medical urgency levels for prioritizing patient care
 */
export enum UrgencyLevel {
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
  URGENT = 'urgent',
  ROUTINE = 'routine',
  LOW = 'low'
}

export type UrgencyLevelString = 'critical' | 'emergency' | 'urgent' | 'routine' | 'low';

/**
 * Confidence levels for medical AI predictions
 */
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNCERTAIN = 'uncertain'
}

/**
 * Audio formats supported by the system
 */
export enum AudioFormat {
  WAV = 'audio/wav',
  MP3 = 'audio/mp3',
  WEBM = 'audio/webm',
  OGG = 'audio/ogg'
}

/**
 * Medical specialties supported by the system
 */
export type MedicalSpecialty = 'general' | 'cardiology' | 'pediatrics' | 'emergency' | 'obstetrics' | string;

/**
 * Medical specialty details
 */
export interface MedicalSpecialtyDetails {
  code: string;
  name: string;
  nameEs: string; // Spanish name
  description?: string;
  descriptionEs?: string; // Spanish description
  terminology?: MedicalTerm[];
}

/**
 * Medical term definition with multilingual support
 */
export interface MedicalTerm {
  id: string;
  term: string;
  termEs: string; // Spanish term
  definition: string;
  definitionEs: string; // Spanish definition
  category: MedicalCategory;
  confidence?: number;
  synonyms?: string[];
  abbreviations?: string[];
  icd10Code?: string;
  snomedCode?: string;
}

/**
 * Medical category enum
 */
export enum MedicalCategory {
  SYMPTOM = 'symptom',
  DIAGNOSIS = 'diagnosis',
  MEDICATION = 'medication',
  TREATMENT = 'treatment',
  PROCEDURE = 'procedure'
}

/**
 * Medical category details for organizing terms and conditions
 */
export interface MedicalCategoryDetails {
  id: string;
  name: string;
  nameEs: string; // Spanish name
  parentId?: string;
  level: number;
  color?: string;
  icon?: string;
}

/**
 * Transcription segment with medical metadata
 */
export interface TranscriptionSegment {
  id: string;
  start: number;
  end: number;
  startTime?: number;
  endTime?: number;
  text: string;
  confidence: number;
  speaker?: string;
  language: string;
  medicalTerms?: MedicalTerm[];
  urgencyLevel?: UrgencyLevel;
  timestamp: number;
  alternatives?: Array<{
    text: string;
    confidence: number;
  }>;
}

/**
 * Complete transcription result with medical analysis
 */
export interface TranscriptionResult {
  id?: string;
  sessionId: string;
  text: string;
  fullText: string;
  segments: TranscriptionSegment[];
  duration: number;
  language: string;
  engine: string;
  confidence: number;
  medicalTerms: MedicalTerm[];
  status?: TranscriptionStatus;
  error?: string;
  medicalAnalysis?: MedicalAnalysis;
  createdAt: Date;
  updatedAt?: Date;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Medical analysis result from AI processing
 */
export interface MedicalAnalysis {
  id: string;
  patientId?: string;
  transcriptionId: string;
  consultationId?: string;
  chiefComplaint: string;
  symptoms: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration?: string;
    onset?: string;
  }>;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  diagnoses: Array<{
    code: string;
    description: string;
    confidence: ConfidenceLevel;
    icd10Code?: string;
  }>;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    duration?: string;
  }>;
  allergies?: string[];
  medicalHistory?: string[];
  recommendations: string[];
  urgencyLevel: UrgencyLevel;
  confidenceLevel: ConfidenceLevel;
  confidence?: number;
  strategy?: MedicalStrategy;
  analysis?: {
    symptoms: string[];
    potentialDiagnoses: string[];
    recommendedActions: string[];
    urgencyLevel: string;
    specialty: string;
  };
  createdAt: Date;
  createdBy: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  timestamp?: Date;
  aiModel?: string;
  medicalContext?: MedicalContext;
}

/**
 * Medical strategy for patient care
 */
export interface MedicalStrategy {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    order: number;
    action: string;
    responsible: string;
    timeline: string;
    required: boolean;
  }>;
  followUpRequired: boolean;
  followUpInterval?: string;
  specialtyReferrals?: string[];
}

/**
 * Medical context for AI processing
 */
export interface MedicalContext {
  patientId?: string;
  practitionerId: string;
  facilityId?: string;
  specialty: MedicalSpecialty;
  consultationId?: string;
  appointmentType: 'consultation' | 'followup' | 'emergency' | 'routine';
  previousVisits?: Array<{
    date: Date;
    diagnosis: string;
    treatment: string;
  }>;
  currentMedications?: string[];
  allergies?: string[];
  chronicConditions?: string[];
  language: 'es' | 'en';
  culturalConsiderations?: string;
  insuranceType?: string;
  urgencyLevel?: string;
}

/**
 * Audio configuration for recording
 */
export interface AudioConfig {
  sampleRate: number;
  channelCount?: number;
  channels?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  noiseReduction?: boolean;
  autoGainControl?: boolean;
  deviceId?: string;
  mimeType?: AudioFormat;
  format?: string;
  audioBitsPerSecond?: number;
  medicalOptimization?: boolean;
  bitDepth?: number;
  realTimeProcessing?: boolean;
  maxDuration?: number;
}

/**
 * Medical AI service configuration
 */
export interface MedicalAIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  baseUrl?: string;
  model: string;
  language: string;
  medicalMode: boolean;
  medicalModel?: string;
  maxRetries: number;
  retries?: number;
  timeout: number;
  enableCache: boolean;
  cacheExpiration?: number;
  hipaaCompliant: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  specialty?: string;
}

/**
 * Base error class for Medical AI errors
 */
export interface MedicalAIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  userMessage?: string;
  userMessageEs?: string; // Spanish user message
}

/**
 * Transcription error class
 */
export class TranscriptionError extends Error implements MedicalAIError {
  code: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  userMessage?: string;
  userMessageEs?: string;
  sessionId?: string;
  stage?: 'initialization' | 'recording' | 'processing' | 'analysis';
  audioData?: {
    duration?: number;
    format?: string;
    size?: number;
  };

  constructor(message: string, options?: Partial<TranscriptionError>) {
    super(message);
    this.name = 'TranscriptionError';
    this.code = options?.code || 'TRANSCRIPTION_ERROR';
    this.timestamp = new Date();
    this.recoverable = options?.recoverable ?? true;
    Object.assign(this, options);
  }
}

/**
 * Generic service response type
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: MedicalAIError | string;
  timestamp?: Date;
  metadata?: {
    requestId: string;
    timestamp: Date;
    duration: number;
    version: string;
  };
}

/**
 * Progress callback data
 */
export interface ProgressData {
  stage: 'model_loading' | 'initialization' | 'recording' | 'processing' | 'analysis';
  progress: number;
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Message callback data
 */
export interface MessageData {
  stage: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: Date;
}

/**
 * Error callback data
 */
export interface ErrorData {
  error: string | Error;
  recoverable: boolean;
  errorCount?: number;
  fatal?: boolean;
  suggestion?: string;
}

/**
 * Session callbacks for real-time updates
 */
export interface SessionCallbacks {
  onStart?: (data: { sessionId: string; status: TranscriptionStatus }) => void;
  onProgress?: (data: ProgressData) => void;
  onMessage?: (data: MessageData) => void;
  onError?: (data: ErrorData) => void;
  onTranscriptionUpdate?: (data: {
    text: string;
    fullText: string;
    segments: TranscriptionSegment[];
    confidence: number;
    engine: string;
  }) => void;
  onComplete?: (result: TranscriptionResult) => void | Promise<void>;
}

/**
 * Medical report data structure
 */
export interface MedicalReport {
  id: string;
  patientId: string;
  practitionerId: string;
  transcriptionId?: string;
  type: 'consultation' | 'procedure' | 'laboratory' | 'imaging' | 'other';
  title: string;
  content: string;
  findings?: string;
  diagnosis?: string;
  treatment?: string;
  recommendations?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt?: Date;
  signedBy?: string;
  signedAt?: Date;
  isConfidential: boolean;
}

/**
 * Patient demographic data (HIPAA compliant)
 */
export interface PatientDemographics {
  id: string;
  mrn?: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

/**
 * Practitioner information
 */
export interface Practitioner {
  id: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: MedicalSpecialtyDetails;
  languages: string[];
  facilities: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  isActive: boolean;
}

/**
 * Appointment data
 */
export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  facilityId?: string;
  scheduledAt: Date;
  duration: number; // minutes
  type: 'consultation' | 'followup' | 'procedure' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  transcriptionId?: string;
  reportId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Export type guards
export const isTranscriptionError = (error: any): error is TranscriptionError => {
  return error && 'code' in error && 'sessionId' in error;
};

export const isMedicalAIError = (error: any): error is MedicalAIError => {
  return error && 'code' in error && 'message' in error && 'recoverable' in error;
};

// Export utility types
export type MedicalAIResponse<T> = Promise<ServiceResponse<T>>;
export type TranscriptionResponse = MedicalAIResponse<TranscriptionResult>;
export type AnalysisResponse = MedicalAIResponse<MedicalAnalysis>;