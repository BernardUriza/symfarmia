// Medical Type Definitions for SYMFARMIA

export interface MedicalTranscription {
  text: string;
  confidence: number;
  timestamp: number;
  medicalTerms: string[];
  isInterim: boolean;
  duration?: number;
}

export interface PatientInfo {
  id?: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    unit: 'mmHg';
  };
  heartRate?: {
    value: number;
    unit: 'bpm';
  };
  temperature?: {
    value: number;
    unit: 'C' | 'F';
  };
  respiratoryRate?: {
    value: number;
    unit: '/min';
  };
  oxygenSaturation?: {
    value: number;
    unit: '%';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  height?: {
    value: number;
    unit: 'cm' | 'inches';
  };
}

export interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  timestamp?: Date;
  generatedBy?: 'ai' | 'manual' | 'hybrid';
  confidence?: number;
}

export interface ClinicalAlert {
  id: string;
  type: 'warning' | 'info' | 'critical' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  category: 'drug_interaction' | 'contraindication' | 'red_flag' | 'guideline' | 'screening';
  source?: string;
  actionRequired?: boolean;
  dismissed?: boolean;
}

export interface MedicalSymptom {
  name: string;
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
  onset?: string;
  triggers?: string[];
  alleviatingFactors?: string[];
  associatedSymptoms?: string[];
  confidence?: number;
}

export interface DiagnosisCandidate {
  name: string;
  icd10Code?: string;
  probability: number;
  reasoning: string[];
  supportingEvidence: string[];
  contraindications?: string[];
  differentialDiagnoses?: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export interface TreatmentPlan {
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    contraindications?: string[];
  }[];
  procedures?: {
    name: string;
    urgency: 'routine' | 'urgent' | 'emergent';
    instructions?: string;
  }[];
  followUp?: {
    timeframe: string;
    instructions: string;
    specialist?: string;
  };
  lifestyle?: {
    diet?: string[];
    exercise?: string[];
    restrictions?: string[];
  };
  monitoring?: {
    parameters: string[];
    frequency: string;
    alertCriteria?: string[];
  };
}

export interface ConsultationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  patientInfo?: PatientInfo;
  vitalSigns?: VitalSigns;
  chiefComplaint?: string;
  transcript: MedicalTranscription[];
  liveTranscript?: string;
  symptoms: MedicalSymptom[];
  aiSuggestions: AIMessage[];
  clinicalAlerts: ClinicalAlert[];
  diagnosisCandidates: DiagnosisCandidate[];
  treatmentPlan?: TreatmentPlan;
  soapNotes?: SOAPNotes;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  metadata?: {
    userId?: string;
    deviceInfo?: string;
    audioQuality?: 'low' | 'medium' | 'high';
    transcriptionService?: 'browser' | 'whisper' | 'custom';
    aiModel?: string;
    version?: string;
  };
}

export interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
  confidence?: number;
  suggestions?: string[];
  context?: 'symptom_analysis' | 'diagnosis' | 'treatment' | 'general' | 'alert';
  metadata?: {
    model?: string;
    processingTime?: number;
    tokens?: number;
  };
  isInternal?: boolean;
  sender?: 'user' | 'ai';
  mode?: string;
}

export interface MedicalResponse {
  response: string;
  confidence: number;
  reasoning: string[];
  suggestions: string[];
  disclaimer: string;
  sources: string[];
  clinicalAlerts?: ClinicalAlert[];
  diagnosisCandidates?: DiagnosisCandidate[];
  recommendedActions?: string[];
}

export interface TranscriptionConfig {
  language: string;
  service: 'browser' | 'whisper' | 'custom';
  realTime: boolean;
  confidenceThreshold: number;
  medicalTermsOnly?: boolean;
  autoCorrection?: boolean;
}

export interface AIConfig {
  mode: 'basic' | 'advanced' | 'disabled';
  autoSuggestions: boolean;
  clinicalAlerts: boolean;
  proactiveAnalysis: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface SOAPConfig {
  autoGenerate: boolean;
  style: 'concise' | 'detailed' | 'comprehensive';
  includeTimestamps: boolean;
  includeConfidence: boolean;
  medicalTerminology: 'simple' | 'technical' | 'mixed';
}

export interface ExportConfig {
  format: 'pdf' | 'docx' | 'txt' | 'json';
  includeTranscript: boolean;
  includeMetadata: boolean;
  includeAIAnalysis: boolean;
  template?: string;
  branding?: boolean;
}

export interface ConsultationSettings {
  audio: {
    quality: 'low' | 'medium' | 'high';
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
  };
  transcription: TranscriptionConfig;
  ai: AIConfig;
  soap: SOAPConfig;
  export: ExportConfig;
  privacy: {
    dataRetention: number; // days
    shareWithAI: boolean;
    anonymizeExports: boolean;
  };
}

export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  data: Record<string, unknown>;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Utility types
export type ConsultationMode = 'basic' | 'advanced';
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export type TranscriptionState = 'idle' | 'listening' | 'processing' | 'completed' | 'error';
export type AIState = 'idle' | 'thinking' | 'responding' | 'error';
export type SOAPGenerationState = 'idle' | 'generating' | 'completed' | 'error';

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

export interface MedicalAPIResponse extends APIResponse<MedicalResponse> {
  data?: MedicalResponse;
}

// Error types
export interface MedicalError extends Error {
  code: 'TRANSCRIPTION_ERROR' | 'AI_ERROR' | 'MEDICAL_VALIDATION_ERROR' | 'API_ERROR' | 'PERMISSION_ERROR';
  category: 'technical' | 'medical' | 'user' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  timestamp: Date;
}