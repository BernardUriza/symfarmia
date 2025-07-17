// Conversation Capture Types and Interfaces
// Following Interface Segregation Principle

import type { SOAPNotes } from '@/src/types/medical';
import type { DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';

// Transcription Types
export interface MinuteTranscription {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
  minuteNumber: number;
}

// State Interfaces (segregated by concern)
export interface UIState {
  showPermissionDialog: boolean;
  showDenoisingDashboard: boolean;
  copySuccess: boolean;
  isManualMode: boolean;
}

export interface TranscriptionState {
  liveTranscript: string;
  manualTranscript: string;
  webSpeechText: string;
  minuteTranscriptions: MinuteTranscription[];
  currentChunkTexts: string[];
}

export interface DiarizationState {
  diarizationResult: DiarizationResult | null;
  isDiarizationProcessing: boolean;
  diarizationError: string | null;
}

// Service Interfaces (Dependency Inversion)
export interface TranscriptionService {
  transcription: any;
  status: string;
  error: string | null;
  engineStatus: string;
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
}

export interface WebSpeechService {
  transcript: string;
  isAvailable: boolean;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
}

export interface DiarizationService {
  diarizeAudio: (audioData: Float32Array) => Promise<DiarizationResult>;
}

// Component Props Interfaces
export interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  onSoapGenerated?: (notes: SOAPNotes) => void;
  className?: string;
}

export interface TranscriptionHandlers {
  onStartRecording: () => Promise<boolean>;
  onStopRecording: () => Promise<boolean>;
  onToggleRecording: () => Promise<void>;
  onReset: () => void;
  onCopy: () => Promise<void>;
  onToggleMode: () => void;
}

// Configuration Types
export interface TranscriptionConfig {
  autoPreload: boolean;
  processingMode: 'direct' | 'batch';
  chunkSize: number;
  onChunkProcessed?: (text: string, chunkNumber: number) => void;
}

export interface SOAPConfig {
  autoGenerate: boolean;
  style: 'concise' | 'detailed' | 'comprehensive';
  includeTimestamps: boolean;
  includeConfidence: boolean;
  medicalTerminology: 'simple' | 'technical' | 'mixed';
}

// Engine Status Type
export interface EngineStatus {
  whisper: string;
  webSpeech: string;
}