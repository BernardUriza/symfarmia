import { useState, useCallback, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export function useSingletonTranscription() {
  const {
    startRecording,
    stopRecording,
    transcript,
    isRecording,
    isTranscribing,
    error: recorderError,
  } = useAudioRecorder();

  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  // Cuando cambia el transcript, lo guardas como final.
  useEffect(() => {
    if (transcript) {
      setTranscription(transcript);
      setStatus('COMPLETED');
    }
  }, [transcript]);

  // Manejo de error de grabación
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
      setStatus('ERROR');
    }
  }, [recorderError]);

  const startTranscription = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStatus('RECORDING');
    try {
      await startRecording();
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to start transcription');
      setStatus('ERROR');
      return false;
    }
  }, [startRecording]);

  const stopTranscription = useCallback(async (): Promise<boolean> => {
    setStatus('PROCESSING');
    try {
      await stopRecording();
      setStatus('COMPLETED');
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to stop transcription');
      setStatus('ERROR');
      return false;
    }
  }, [stopRecording]);

  const resetTranscription = useCallback(() => {
    setTranscription('');
    setStatus('IDLE');
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
    isLoading: isTranscribing,
  };
}

export default useSingletonTranscription;
