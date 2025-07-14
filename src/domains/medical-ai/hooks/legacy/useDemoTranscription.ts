import { useState, useEffect, useCallback } from 'react';

interface UseDemoTranscriptionProps {
  isRecording: boolean;
  language?: string;
}

export const useDemoTranscription = (props: UseDemoTranscriptionProps) => {
  const { isRecording } = props;
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTranscription = useCallback(() => {
    setIsProcessing(true);
    setError(null);
    // Simulate transcription start
    setTimeout(() => {
      setTranscription('Iniciando transcripción...');
    }, 500);
  }, []);

  const stopTranscription = useCallback(() => {
    setIsProcessing(false);
    // Simulate final transcription
    setTranscription('Transcripción completa: El paciente presenta dolor de cabeza persistente.');
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription('');
    setError(null);
  }, []);

  useEffect(() => {
    if (isRecording) {
      startTranscription();
    } else {
      stopTranscription();
    }
  }, [isRecording, startTranscription, stopTranscription]);

  return {
    transcription,
    isProcessing,
    error,
    clearTranscription
  };
};

export default useDemoTranscription;