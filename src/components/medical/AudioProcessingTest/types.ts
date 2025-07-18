// Domain types for AudioProcessingTest
export interface ChunkData {
  text: string;
  chunkNumber: number;
  timestamp?: number;
}

export interface ChunkWithProgress {
  text: string;
  number: number;
  progress?: number;
}

export interface ChunkProgressMap {
  [key: number]: number;
}

export interface AudioProcessingTestProps {
  className?: string;
  maxHeight?: string;
  onTranscriptionComplete?: (transcription: any) => void;
  onAudioRecorded?: (audioUrl: string, audioBlob: Blob) => void;
}

export interface AudioProcessingConfig {
  autoPreload: boolean;
  processingMode: 'direct' | 'streaming';
  chunkSize: number;
  sampleRate: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioProcessingConfig = {
  autoPreload: true,
  processingMode: 'direct',
  chunkSize: 16384,
  sampleRate: 16000,
};