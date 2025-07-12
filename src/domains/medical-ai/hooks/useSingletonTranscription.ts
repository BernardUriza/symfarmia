import { useState, useCallback, useEffect } from 'react';
import useWhisperTranscription from './useWhisperTranscription';

export function useSingletonTranscription() {
  const {
    start: startWhisper,
    stop: stopWhisper,
    transcript: whisperTranscript,
    isLoading: whisperLoading,
    error: whisperError,
  } = useWhisperTranscription();

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  // Cuando cambia el transcript, lo guardas como final.
  useEffect(() => {
    if (whisperTranscript) {
      setTranscription(whisperTranscript);
      setStatus('COMPLETED');
    }
  }, [whisperTranscript]);

  // Manejo de error de whisper
  useEffect(() => {
    if (whisperError) {
      setError(whisperError);
      setStatus('ERROR');
      setIsRecording(false);
    }
  }, [whisperError]);

  const startTranscription = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStatus('RECORDING');
    setIsRecording(true);
    try {
      await startWhisper();
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to start transcription');
      setStatus('ERROR');
      setIsRecording(false);
      return false;
    }
  }, [startWhisper]);

  const stopTranscription = useCallback(async (): Promise<boolean> => {
    setStatus('PROCESSING');
    setIsRecording(false);
    try {
      await stopWhisper();
      setStatus('COMPLETED');
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to stop transcription');
      setStatus('ERROR');
      return false;
    }
  }, [stopWhisper]);

  const resetTranscription = useCallback(() => {
    setTranscription('');
    setStatus('IDLE');
    setIsRecording(false);
    setError(null);
  }, []);

  // Utilidad para obtener el texto final
  const getTranscriptionText = useCallback(() => transcription || '', [transcription]);

  return {
    transcription: transcription ? { text: transcription } : null,
    status,
    isRecording,
    error,
    startTranscription,
    stopTranscription,
    resetTranscription,
    getTranscriptionText,
    isLoading: whisperLoading,
  };
}

export default useSingletonTranscription;
