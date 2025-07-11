/**
 * Medical AI Domain - Public API
 * 
 * This domain handles all medical AI functionality including:
 * - Medical transcription
 * - AI analysis and validation
 * - Audio processing
 * - Medical terminology processing
 * - Confidence calculation
 */

// Components
export { TranscriptionPanel } from './components/TranscriptionPanel';
export { AIAnalysisDisplay } from './components/AIAnalysisDisplay';
export { MedicalConfidenceIndicator } from './components/MedicalConfidenceIndicator';
export { StrategySelector } from './components/StrategySelector';

// Hooks
export { useTranscription } from './hooks/useTranscription';
export { useMedicalAI } from './hooks/useMedicalAI';
export { useAudioCapture } from './hooks/useAudioCapture';
export { useMedicalValidation } from './hooks/useMedicalValidation';

// Services
export { transcriptionService } from './services/transcriptionService';
export { medicalAIService } from './services/medicalAIService';
export { audioProcessingService } from './services/audioProcessingService';
export { medicalValidationService } from './services/medicalValidationService';

// Types - Export all types and enums
export {
  // Enums
  TranscriptionStatus,
  ModelStatus,
  UrgencyLevel,
  ConfidenceLevel,
  AudioFormat,
  // Type guards
  isTranscriptionError,
  isMedicalAIError
} from './types';

export type {
  // Core interfaces
  TranscriptionResult,
  TranscriptionSegment,
  TranscriptionError,
  MedicalAnalysis,
  MedicalStrategy,
  MedicalContext,
  MedicalSpecialty,
  MedicalTerm,
  MedicalCategory,
  MedicalReport,
  // Configuration types
  AudioConfig,
  MedicalAIServiceConfig,
  // Error types
  MedicalAIError,
  // Callback types
  SessionCallbacks,
  ProgressData,
  MessageData,
  ErrorData,
  // Response types
  ServiceResponse,
  MedicalAIResponse,
  TranscriptionResponse,
  AnalysisResponse,
  // Entity types
  PatientDemographics,
  Practitioner,
  Appointment
} from './types';

// Re-export medical constants
export * from './types/medical-constants';

// Utils
export { medicalTerminology } from './utils/medicalTerminology';
export { confidenceCalculation } from './utils/confidenceCalculation';
export { strategyEngine } from './utils/strategyEngine';

// Domain Configuration
export const medicalAIConfig = {
  supportedLanguages: ['es-MX', 'es-ES', 'en-US'],
  confidenceThreshold: 0.75,
  specialties: ['general', 'cardiology', 'pediatrics', 'emergency', 'obstetrics'],
  maxAudioDuration: 3600, // 1 hour max
  transcriptionSettings: {
    realTimeMode: true,
    medicalTerminologyEnabled: true,
    confidenceReporting: true,
    autoValidation: true
  }
} as const;
