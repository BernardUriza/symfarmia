import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/utils/api';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current!.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current as BlobPart[], {
            type: 'audio/webm'
          });
          
          // Enviar al backend
          const response = await apiClient.upload('/api/transcribe', 
            new File([audioBlob], 'recording.webm', { type: 'audio/webm' }),
            { language: 'es' }
          );

          if ((response as any).success) {
            setTranscript((response as any).data.text);
          } else {
            throw new Error(response.error || 'Transcripción falló');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setIsTranscribing(false);
          // Cerrar stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start(1000); // 1 segundo chunks
      setIsRecording(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accediendo micrófono');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
