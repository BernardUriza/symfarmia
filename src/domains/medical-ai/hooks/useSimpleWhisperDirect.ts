"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';
import { DefaultLogger } from '../utils/LoggerStrategy';
import { useDirectAudioCapture } from './useDirectAudioCapture';
import { useWhisperWorker } from './useWhisperWorker';

interface Transcription {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
}

type Status = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
type EngineStatus = 'loading' | 'ready' | 'error';

interface UseSimpleWhisperDirectOptions {
  autoPreload?: boolean;
  logger?: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    setEnabled?: (value: boolean) => void;
  };
}

export function useSimpleWhisperDirect({
  autoPreload = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  logger = DefaultLogger,
}: UseSimpleWhisperDirectOptions = {}) {
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const transcriptPartsRef = useRef<{ [key: string]: string }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const processingTimeRef = useRef<number>(0);

  const { isReady: isWorkerReady, processChunk: processWorkerChunk, reset: resetWorker } = useWhisperWorker({
    onChunkProcessed: (text, chunkId) => {
      transcriptPartsRef.current[chunkId] = text;
      logger.log(`Chunk ${chunkId} processed: ${text}`);
    },
    onError: (workerError) => {
      logger.error('Worker error:', workerError);
      setError(workerError);
    },
    onModelLoading: (progress) => {
      setLoadProgress(progress);
    },
    onModelReady: () => {
      setEngineStatus('ready');
      setLoadProgress(100);
    }
  });

  const { start: startCapture, stop: stopCapture, isRecording } = useDirectAudioCapture({
    onChunkReady: async (audioData) => {
      if (isWorkerReady) {
        const chunkId = `chunk_${Date.now()}`;
        try {
          processingTimeRef.current = Date.now();
          await processWorkerChunk(audioData, chunkId);
        } catch (err) {
          logger.error('Error processing chunk:', err);
        }
      }
    },
    chunkSize: 16000, // 1 second chunks
    sampleRate: 16000
  });

  // Update engine status based on worker readiness
  useEffect(() => {
    if (isWorkerReady && engineStatus === 'loading') {
      setEngineStatus('ready');
    }
  }, [isWorkerReady, engineStatus]);

  // Update recording time
  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startTranscription = useCallback(async (): Promise<boolean> => {
    try {
      if (!isWorkerReady) {
        setError('El modelo aún se está cargando');
        return false;
      }

      setError(null);
      setStatus('recording');
      setTranscription(null);
      transcriptPartsRef.current = {};
      
      const stream = await startCapture();
      if (!stream) {
        throw new Error('No se pudo iniciar la captura de audio');
      }
      
      return true;
    } catch (err) {
      logger.error('Error al iniciar la grabación:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar la grabación');
      setStatus('error');
      return false;
    }
  }, [isWorkerReady, startCapture, logger]);

  const stopTranscription = useCallback(async (): Promise<boolean> => {
    try {
      if (!isRecording) return false;
      
      setStatus('processing');
      stopCapture();
      
      // Wait a bit for final chunks to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Combine all transcript parts
      const sortedChunks = Object.entries(transcriptPartsRef.current)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, text]) => text);
      
      const fullText = sortedChunks.join(' ').trim();
      const processingTime = processingTimeRef.current ? Date.now() - processingTimeRef.current : 0;
      
      if (fullText) {
        const medicalTerms = extractMedicalTermsFromText(fullText).map(t => t.term);
        setTranscription({
          text: fullText,
          confidence: 0.95,
          medicalTerms,
          processingTime
        });
        setStatus('completed');
      } else {
        setError('No se pudo obtener transcripción');
        setStatus('error');
      }
      
      return true;
    } catch (err) {
      logger.error('Error al detener la grabación:', err);
      setError('Error al detener la grabación');
      setStatus('error');
      return false;
    }
  }, [isRecording, stopCapture, logger]);

  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    transcriptPartsRef.current = {};
    resetWorker();
  }, [resetWorker]);

  const preloadModel = useCallback(async () => {
    // Model loads automatically with the worker
    setEngineStatus('loading');
  }, []);

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
    setLogger: logger.setEnabled?.bind(logger)
  };
}