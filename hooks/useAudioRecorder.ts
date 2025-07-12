import { useState, useCallback, useRef } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  audioLevel: number;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [isRecording]);

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

      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup recording
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current!.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        
        // Stop audio level monitoring
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        try {
          const audioBlob = new Blob(audioChunksRef.current as BlobPart[], {
            type: 'audio/webm'
          });
          
          // Create FormData for upload
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          
          // Send to backend
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();

          if (result.success) {
            setTranscript(result.data.text);
          } else {
            throw new Error(result.error || 'Transcripción falló');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setIsTranscribing(false);
          setAudioLevel(0);
          // Close stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start(1000); // 1 second chunks
      setIsRecording(true);
      
      // Start duration tracking
      startTimeRef.current = Date.now();
      setDuration(0);
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
      
      // Start audio level monitoring
      updateAudioLevel();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accediendo micrófono');
    }
  }, [updateAudioLevel]);

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
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
