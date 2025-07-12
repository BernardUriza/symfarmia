// Constantes para ConversationCapture
export const MAX_RECORDING_DURATION = 300; // 5 minutos en segundos
export const AUDIO_LEVEL_UPDATE_INTERVAL = 100; // ms
export const SPEAKER_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  AI: 'AI'
};

export const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error'
};