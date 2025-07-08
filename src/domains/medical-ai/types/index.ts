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
  patientId?: string;
  consultationId?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  emergencyContact?: string;
  specialty: MedicalSpecialty;
  urgencyLevel: UrgencyLevel;
}

export interface ConfidenceMetrics {
  overall: number;
  transcription: number;
  medicalAnalysis: number;
  termRecognition: number;
  contextAccuracy: number;
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
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
  SYMPTOM = 'symptom',
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  ANATOMY = 'anatomy',
  PROCEDURE = 'procedure',
  LABORATORY = 'laboratory'
}

export type UrgencyLevel = 'routine' | 'urgent' | 'emergency' | 'critical';

export type MedicalSpecialty = 
  | 'general'
  | 'cardiology'
  | 'pediatrics'
  | 'emergency'
  | 'obstetrics'
  | 'neurology'
  | 'psychiatry'
  | 'dermatology'
  | 'orthopedics'
  | 'oncology';

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