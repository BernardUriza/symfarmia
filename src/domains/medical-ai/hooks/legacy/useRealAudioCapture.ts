import { useState } from 'react';

export const useRealAudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const enableTextInputMode = () => {
    setIsRecording(false);
    setTranscript('');
    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
    }
  };

  const startRealTimeTranscription = (_stream: MediaStream) => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';
    recognition.onresult = event => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(text);
    };
    recognition.start();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      setAudioStream(stream);
      setIsRecording(true);
      startRealTimeTranscription(stream);
    } catch (error) {
      console.error('Audio access denied:', error);
      enableTextInputMode();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
    }
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  };
};
