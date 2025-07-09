import { useState, useCallback, useRef } from 'react';
import { pipeline } from '@xenova/transformers';

interface UseWhisperReturn {
  transcript: string;
  isRecording: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useWhisperTranscription(model = 'Xenova/whisper-small'): UseWhisperReturn {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const modelRef = useRef<any>(null);

  const loadModel = useCallback(async () => {
    if (!modelRef.current) {
      setIsLoading(true);
      try {
        modelRef.current = await pipeline('automatic-speech-recognition', model);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [model]);

  const start = useCallback(async () => {
    try {
      await loadModel();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      recorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      recorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const buffer = await blob.arrayBuffer();
        const result = await modelRef.current(buffer);
        setTranscript(result.text);
        stream.getTracks().forEach(t => t.stop());
      };
      recorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message);
    }
  }, [loadModel]);

  const stop = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { transcript, isRecording, isLoading, error, start, stop };
}

export default useWhisperTranscription;
