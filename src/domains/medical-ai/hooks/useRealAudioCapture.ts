import { useState, useRef, useCallback } from 'react';

export const useRealAudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Inicia reconocimiento de voz
  const startRealTimeTranscription = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';
    recognition.onresult = (event: any) => {
      setTranscript(
        Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('')
      );
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      startRealTimeTranscription();
    } catch (error) {
      setIsRecording(false);
      setTranscript('');
      recognitionRef.current?.stop();
    }
  }, [startRealTimeTranscription]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  }, []);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
  };
};
