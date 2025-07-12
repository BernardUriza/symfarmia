import { useState, useRef } from 'react';
import { nodewhisper } from 'nodejs-whisper';

export default function useWhisperTranscription() {
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      setError(err.message);
    }
  };

  const stop = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          setTranscript(result.text || '');
          resolve(result.text || '');
        } catch (err) {
          setError(err.message);
          resolve('');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current.stop();
    });
  };

  return { start, stop, transcript, isLoading, error };
}