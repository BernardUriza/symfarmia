/**
 * Enhanced Transcription Types
 */

export interface Word {
  text: string;
  confidence: number;
  startTime?: number;
  endTime?: number;
}

export interface EnhancedTranscriptionResult {
  words: Word[];
  currentWord: string;
  finalTranscript: string;
  liveTranscript: string;
  totalWords: number;
  confidence: number;
  medicalTerms: string[];
}

export type TranscriptionStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
export type TranscriptionService = 'browser' | 'whisper' | 'deepgram';

export interface UseEnhancedTranscriptionProps {
  autoStart?: boolean;
  realTimeUpdates?: boolean;
  medicalOptimization?: boolean;
  language?: string;
  service?: TranscriptionService;
}

export interface TranscriptionModelInfo {
  name: string;
  provider: string;
  language: string;
  latency: string;
  color: string;
  model?: string;
}