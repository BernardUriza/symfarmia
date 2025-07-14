'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from '../app/providers/I18nProvider';

// ---------- Types ----------
export interface TranscriptionResult {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
}
export type TranscriptionStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
export interface UseTranscriptionReturn {
  transcription: TranscriptionResult | null;
  status: TranscriptionStatus;
  isRecording: boolean;
  error: string | null;
  engineStatus: 'ready' | 'loading' | 'error' | 'fallback';
  audioLevel: number;
  recordingTime: number;
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
}

// ----------- Utils -----------
function extractMedicalTerms(text: string): string[] {
  const medicalTerms = [
    'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón', 
    'respiración', 'síntoma', 'diagnóstico', 'tratamiento', 
    'medicamento', 'alergia', 'diabetes', 'hipertensión', 'cefalea'
  ];
  const words = text.toLowerCase().split(/\s+/);
  return medicalTerms.filter(term => words.some(word => word.includes(term)));
}

// ----------- Xenova loader (Singleton) -----------
let xenovaWhisperSingleton: any = null;
async function getXenovaWhisper() {
  if (!xenovaWhisperSingleton) {
    const { pipeline } = await import('@xenova/transformers');
    xenovaWhisperSingleton = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
  }
  return xenovaWhisperSingleton;
}

// ----------- Main hook -----------
export function useTranscription(): UseTranscriptionReturn {
  const { t } = useTranslation();

  // States
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error' | 'fallback'>('loading');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  // --- Effect: keep isRecordingRef synced ---
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // --- Effect: preload Xenova model ---
  useEffect(() => {
    getXenovaWhisper()
      .then(() => setEngineStatus('ready'))
      .catch(() => setEngineStatus('error'));
  }, []);

  // --- Effect: recording timer ---
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // --- Audio Monitoring ---
  const setupAudioMonitoring = useCallback((stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    const analyser = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      if (!isRecordingRef.current) {
        setAudioLevel(0);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      setAudioLevel(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    updateAudioLevel();
  }, []);

  // --- Start Transcription ---
  const startTranscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setStatus('recording');
      setEngineStatus('ready');
      setRecordingTime(0);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecordingRef.current = true;
      setIsRecording(true);
      setupAudioMonitoring(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (audioChunksRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setStatus('processing');
        try {
          // Combine chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          // Convert audio to Float32Array for Whisper
          const audioContext = new AudioContext();
          const audioData = await audioContext.decodeAudioData(arrayBuffer);
          const channelData = audioData.getChannelData(0);
          const audioFloat32 = new Float32Array(channelData);

          setEngineStatus('loading');
          const whisper = await getXenovaWhisper();
          setEngineStatus('ready');
          const start = performance.now();

          const result = await whisper(audioFloat32, { chunk_length_s: 30, return_timestamps: false });
          const end = performance.now();

          setTranscription({
            text: result.text || '',
            confidence: result.score || 0.95,
            medicalTerms: extractMedicalTerms(result.text || ''),
            processingTime: Math.round(end - start),
          });
          setStatus('completed');
        } catch (err: any) {
          setError(err?.message || 'Transcription failed');
          setStatus('error');
          setEngineStatus('error');
        }
        cleanup(stream);
      };

      mediaRecorder.start(1000); // 1 sec chunks
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setStatus('error');
      setEngineStatus('error');
      setIsRecording(false);
      return false;
    }
  }, [setupAudioMonitoring]);

  // --- Stop Transcription ---
  const stopTranscription = useCallback(async (): Promise<boolean> => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return true;
    }
    return false;
  }, [isRecording]);

  // --- Reset Transcription ---
  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    setEngineStatus('ready');
  }, []);

  // --- Cleanup ---
  function cleanup(stream: MediaStream) {
    stream.getTracks().forEach(track => track.stop());
    setAudioLevel(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }

  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription
  };
}

export default useTranscription;
