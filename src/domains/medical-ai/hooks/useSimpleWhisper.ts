"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';
import { DefaultLogger } from '../utils/LoggerStrategy';
import { loadWhisperModel } from '../services/audioProcessingService';
import { useAudioChunkManager } from './useAudioChunkManager';
import { useWhisperStreamingProcessor } from './useWhisperStreamingProcessor';

interface Transcription {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
}

type Status = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

type EngineStatus = 'loading' | 'ready' | 'error';

interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  setEnabled?: (value: boolean) => void;
}

interface UseSimpleWhisperOptions {
  autoPreload?: boolean;
  retryCount?: number;
  retryDelay?: number;
  logger?: Logger;
}

interface UseSimpleWhisperReturn {
  transcription: Transcription | null;
  status: Status;
  isRecording: boolean;
  error: string | null;
  engineStatus: EngineStatus;
  loadProgress: number;
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  preloadModel: () => Promise<void>;
  setLogger?: (enabled: boolean) => void;
}

export function useSimpleWhisper({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000,
  logger = DefaultLogger,
}: UseSimpleWhisperOptions = {}): UseSimpleWhisperReturn {
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { processChunk, getTranscript, reset: resetProcessor } =
    useWhisperStreamingProcessor();

  const {
    start: startChunks,
    stop: stopChunks,
  } = useAudioChunkManager({
    onChunkReady: (chunk) => {
      processChunk(chunk);
    },
  });

  const log = useCallback((...args: unknown[]) => logger.log(...args), [logger]);
  const errorLog = useCallback((...args: unknown[]) => logger.error(...args), [logger]);

  const preloadModel = useCallback(async () => {
    try {
      setEngineStatus('loading');
      await loadWhisperModel({
        retryCount,
        retryDelay,
        progress_callback: (p) => setLoadProgress(p?.progress || 0),
      });
      setEngineStatus('ready');
    } catch (err) {
      setEngineStatus('error');
      setError('Error cargando el modelo de transcripción');
      errorLog(err);
    }
  }, [retryCount, retryDelay, errorLog]);

  useEffect(() => {
    if (autoPreload) {
      preloadModel();
    }
  }, [autoPreload, preloadModel]);

  const setupAudioMonitoring = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!isRecording) {
        setAudioLevel(0);
        return;
      }
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.round(average));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, [isRecording]);

  const startTranscription = async (): Promise<boolean> => {
    try {
      setError(null);
      setStatus('recording');
      const stream = await startChunks();
      if (!stream) return false;
      setupAudioMonitoring(stream);
      setIsRecording(true);
      return true;
    } catch (err) {
      errorLog(err);
      setError('Error al iniciar la grabación');
      setStatus('error');
      setEngineStatus('error');
      return false;
    }
  };

  const stopTranscription = async (): Promise<boolean> => {
    try {
      stopChunks();
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setStatus('processing');
      const text = await getTranscript();
      const medicalTerms = extractMedicalTermsFromText(text).map((t) => t.term);
      setTranscription({ text, confidence: 0.95, medicalTerms, processingTime: 0 });
      setStatus('completed');
      return true;
    } catch (err) {
      errorLog(err);
      setError('Error al detener la grabación');
      setStatus('error');
      return false;
    }
  };

  const resetTranscription = () => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    resetProcessor();
  };

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    audioUrl: null,
    audioBlob: null,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel,
    setLogger: logger.setEnabled ? logger.setEnabled.bind(logger) : undefined,
  };
}
