/**
 * Medical AI Domain Types
 * 
 * Core type definitions for medical AI functionality
 */

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  language: string;
  medicalTerms: MedicalTerm[];
  segments: TranscriptionSegment[];
  status: TranscriptionStatus;
}

export interface TranscriptionSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speaker?: string;
}

export interface MedicalTerm {
  term: string;
  definition: string;
  category: MedicalCategory;
  confidence: number;
  synonyms: string[];
}

export interface MedicalAnalysis {
  patientId?: string;
  consultationId?: string;
  analysis: {
    symptoms: string[];
    potentialDiagnoses: string[];
    recommendedActions: string[];
    urgencyLevel: UrgencyLevel;
    specialty: MedicalSpecialty;
  };
  confidence: ConfidenceLevel;
  timestamp: Date;
  aiModel: string;
  medicalContext: MedicalContext;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: AudioFormat;
  noiseReduction: boolean;
  medicalOptimization: boolean;
  realTimeProcessing: boolean;
  maxDuration: number;
}

export interface MedicalContext {
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  emergencyContact?: string;
  specialty: MedicalSpecialty;
}

export interface ConfidenceLevel {
  overall: number;
  transcription: number;
  medicalAnalysis: number;
  termRecognition: number;
  contextAccuracy: number;
}

export interface MedicalStrategy {
  id: string;
  name: string;
  description: string;
  specialty: MedicalSpecialty;
  optimizations: StrategyOptimization[];
  threshold: number;
  enabled: boolean;
}

export interface StrategyOptimization {
  type: 'vocabulary' | 'context' | 'confidence' | 'speed';
  value: string | number;
  description: string;
}

// Enums
export enum TranscriptionStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum MedicalCategory {
  SYMPTOMS = 'symptoms',
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  ANATOMY = 'anatomy',
  PROCEDURE = 'procedure',
  LABORATORY = 'laboratory'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MedicalSpecialty {
  GENERAL = 'general',
  CARDIOLOGY = 'cardiology',
  PEDIATRICS = 'pediatrics',
  EMERGENCY = 'emergency',
  OBSTETRICS = 'obstetrics',
  NEUROLOGY = 'neurology',
  PSYCHIATRY = 'psychiatry',
  DERMATOLOGY = 'dermatology',
  ORTHOPEDICS = 'orthopedics',
  ONCOLOGY = 'oncology'
}

export enum AudioFormat {
  WAV = 'wav',
  MP3 = 'mp3',
  OGG = 'ogg',
  WEBM = 'webm'
}

// Error Types
export class MedicalAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MedicalAIError';
  }
}

export class TranscriptionError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TRANSCRIPTION_ERROR', context);
    this.name = 'TranscriptionError';
  }
}

export class MedicalValidationError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MEDICAL_VALIDATION_ERROR', context);
    this.name = 'MedicalValidationError';
  }
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface MedicalAIServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  medicalModel: string;
  specialty: MedicalSpecialty;
}