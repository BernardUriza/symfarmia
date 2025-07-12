/**
 * TypeScript interfaces and types for transcription engines
 */

import { TranscriptionStatus } from '../types';

// Configuration interfaces
export interface TranscriptionEngineConfig {
  language?: string;
  medicalMode?: boolean;
  sampleRate?: number;
  [key: string]: any;
}

export interface OpenAIWhisperConfig extends TranscriptionEngineConfig {
  apiKey?: string | null;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
  costOptimization?: boolean;
  apiEndpoint?: string;
  budgetLimit?: number;
}

export interface WhisperClientConfig extends TranscriptionEngineConfig {
  modelName?: string;
  task?: string;
  backend?: string;
  chunkLengthS?: number;
  strideLengthS?: number;
  n_threads?: number;
}

export interface WhisperWASMConfig extends TranscriptionEngineConfig {
  modelName?: string;
  chunkSize?: number;
  translate?: boolean;
  maxAudioLength?: number;
  n_threads?: number;
}

export interface WebSpeechConfig extends TranscriptionEngineConfig {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

// Audio data types
export type AudioData = Float32Array | ArrayBuffer | Blob | AudioBuffer;

export interface AudioChunk {
  data: AudioData;
  timestamp: number;
  config?: any;
}

// Session interfaces
export interface TranscriptionSession {
  id: string;
  startTime: number;
  endTime?: number | null;
  status: TranscriptionStatus;
  audioConfig?: any;
  callbacks: TranscriptionCallbacks;
  segments: TranscriptionSegment[];
  fullText: string;
  medicalTerms?: string[];
  language?: string;
  medicalMode?: boolean;
  totalCost?: number;
  apiCalls?: number;
}

export interface TranscriptionSegment {
  id?: string;
  text: string;
  start?: number;
  end?: number;
  startTime?: number;
  endTime?: number;
  confidence?: number;
  speaker?: string | null;
  language?: string;
  timestamp?: number;
  sessionId?: string;
  engine?: string;
}

// Callback interfaces
export interface TranscriptionCallbacks {
  onStart?: (data: TranscriptionStartEvent) => void;
  onTranscriptionUpdate?: (data: TranscriptionUpdateEvent) => void;
  onComplete?: (data: TranscriptionCompleteEvent) => void | Promise<void>;
  onError?: (error: TranscriptionErrorEvent) => void;
  onEngineSwitch?: (data: EngineSwitchEvent) => void;
}

export interface TranscriptionStartEvent {
  sessionId: string;
  status: TranscriptionStatus;
}

export interface TranscriptionUpdateEvent {
  text?: string;
  segment?: TranscriptionSegment;
  fullText: string;
  segments?: TranscriptionSegment[];
  confidence?: number;
  engine?: string;
  medicalTerms?: string[];
  cost?: number;
}

export interface TranscriptionCompleteEvent {
  id?: string;
  sessionId?: string;
  text: string;
  fullText?: string;
  segments: TranscriptionSegment[];
  duration?: number;
  language: string;
  engine: string;
  confidence?: number;
  medicalTerms?: string[];
  processingTime?: number;
  totalCost?: number;
  apiCalls?: number;
  status?: TranscriptionStatus;
  timestamp?: Date;
}

export interface TranscriptionErrorEvent {
  error: string;
  recoverable: boolean;
  errorCount?: number;
  fatal?: boolean;
}

export interface EngineSwitchEvent {
  previousEngine: string;
  newEngine: string;
  reason: any;
}

// Result interfaces
export interface TranscriptionResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  engine?: string;
}

export interface InitializationResult {
  success: boolean;
  message?: string;
  config?: any;
  apiKeyConfigured?: boolean;
  recoverable?: boolean;
}

export interface EngineStats {
  backend?: string;
  model?: string;
  modelName?: string;
  language?: string;
  sampleRate?: number;
  isInitialized: boolean;
  isTranscribing: boolean;
  errorCount?: number;
  audioBufferLength?: number;
  bufferLength?: number;
  medicalMode?: boolean;
  costOptimization?: boolean;
  currentCost?: number;
  apiCalls?: number;
  currentSession?: {
    id: string;
    status: TranscriptionStatus;
    segments: number;
  } | null;
}

// Engine interface
export interface TranscriptionEngine {
  initialize(): Promise<InitializationResult>;
  isReady(): Promise<boolean>;
  startTranscription(audioConfig?: any, callbacks?: TranscriptionCallbacks): Promise<TranscriptionResult>;
  stopTranscription(): Promise<TranscriptionResult>;
  processAudioChunk(audioData: AudioData, config?: any): Promise<TranscriptionResult>;
  setMedicalContext(context: any): void;
  getEngineStats(): EngineStats;
  cleanup(): Promise<void>;
}

// Additional types
export interface ModelCacheManager {
  initialize(): Promise<void>;
  getCacheDir(): string;
}

export interface AudioProcessor {
  processChunk(audioData: AudioData): Promise<AudioData>;
}

export interface CompressionManager {
  initialize(): Promise<void>;
  compressForAPI(audioData: AudioData): Promise<AudioData>;
  cleanup(): Promise<void>;
}

export interface CostOptimizer {
  initialize(): Promise<void>;
  shouldProcessBuffer(buffer: AudioChunk[]): Promise<boolean>;
  cleanup(): Promise<void>;
}

export interface MedicalContext {
  specialty?: string;
  patientInfo?: any;
  previousTerms?: string[];
}