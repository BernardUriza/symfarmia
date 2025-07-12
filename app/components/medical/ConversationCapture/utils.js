// Utilidades para ConversationCapture

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (date) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const calculateAudioLevel = (value) => {
  return Math.min(100, Math.max(0, value * 100));
};

export const createTranscriptionSegment = (text, speaker = 'patient') => {
  return {
    id: Date.now(),
    speaker,
    text,
    startTime: new Date(),
    confidence: 0.9,
    timestamp: Date.now()
  };
};