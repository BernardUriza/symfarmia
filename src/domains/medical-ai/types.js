/**
 * Medical AI Types and Constants
 */

export const TranscriptionStatus = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

export const ModelStatus = {
  NOT_LOADED: 'not_loaded',
  DOWNLOADING: 'downloading',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

export const AudioFormat = {
  WAV: 'audio/wav',
  MP3: 'audio/mp3',
  WEBM: 'audio/webm',
  OGG: 'audio/ogg'
};