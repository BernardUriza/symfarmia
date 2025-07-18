// types.ts - Contratos BRUTALES para hooks de audio/transcripción

// --- Engine y Audio Status ---
export type Status = 'idle' | 'recording' | 'processing' | 'collecting-residues' | 'completed' | 'error';
export type EngineStatus = 'loading' | 'ready' | 'error';

// --- Transcripción y Chunks ---
export interface TranscriptionChunk {
  id: string;
  text: string;
  timestamp: number;
}

export interface Transcription {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
  timestamp?: number;
  chunks?: TranscriptionChunk[];
}

// --- Opciones principales del hook ---
export interface UseSimpleWhisperOptions {
  autoPreload?: boolean;
  processingMode?: 'streaming' | 'direct' | 'enhanced';
  chunkSize?: number;
  sampleRate?: number;
  preloadPriority?: 'high' | 'low' | 'auto';
  preloadDelay?: number;
  retryCount?: number;
  retryDelay?: number;
  logger?: Logger;
  showPreloadStatus?: boolean;
  onChunkProcessed?: (text: string, chunkNumber: number) => void;
  onChunkProgress?: (chunkNumber: number, progress: number) => void;
}

export interface UseSimpleWhisperReturn {
  transcription: Transcription | null;
  status: Status;
  isRecording: boolean;
  error: string | null;
  engineStatus: EngineStatus;
  loadProgress: number;
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  preloadModel: () => Promise<void>;
  getCompleteAudio: () => Float32Array | null;
  preloadStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  preloadProgress: number;
  isPreloaded: boolean;
  setLogger?: (enabled: boolean) => void;
}

// --- Logger universal ---
export interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  setEnabled?: (value: boolean) => void;
}

// --- Opciones del engine (interno) ---
export interface WhisperEngineOptions {
  logger: Logger;
  chunkSize: number;
  sampleRate: number;
  onChunkProcessed?: (text: string, chunkNumber: number) => void;
  onChunkProgress?: (chunkNumber: number, progress: number) => void;
}
