'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadWhisperModel, transcribeAudio } from '../services/audioProcessingService';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';

// Types
interface UseSimpleWhisperHybridOptions {
  autoPreload?: boolean;
  retryCount?: number;
  retryDelay?: number;
  preferWorker?: boolean;
}

interface Transcription {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
  timestamp: number;
  chunks: any[];
}

export function useSimpleWhisperHybrid({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000,
  preferWorker = true
}: UseSimpleWhisperHybridOptions = {}) {
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'completed' | 'error'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob>(new Blob());
  const [processingMode, setProcessingMode] = useState<'worker' | 'main'>('worker');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker and fallback
  const initializeProcessing = useCallback(async () => {
    try {
      setEngineStatus('loading');
      setError('');

      if (preferWorker) {
        try {
          console.log('[Hybrid] Attempting to initialize worker...');
          workerRef.current = new Worker('/workers/audioProcessingWorker.js');
          
          // Test worker initialization
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Worker initialization timeout'));
            }, 5000);

            workerRef.current!.onmessage = (event) => {
              if (event.data.type === 'MODEL_READY') {
                clearTimeout(timeout);
                setProcessingMode('worker');
                console.log('[Hybrid] Worker initialized successfully');
                resolve();
              } else if (event.data.type === 'MODEL_ERROR') {
                clearTimeout(timeout);
                reject(new Error(event.data.error));
              }
            };

            workerRef.current!.onerror = (error) => {
              clearTimeout(timeout);
              reject(error);
            };

            workerRef.current!.postMessage({ type: 'INIT' });
          });
        } catch (workerError) {
          console.warn('[Hybrid] Worker failed, falling back to main thread:', workerError);
          setProcessingMode('main');
          
          // Fallback to main thread
          await loadWhisperModel({
            retryCount,
            retryDelay,
            onProgress: (p) => setLoadProgress(p?.progress || 0),
          });
        }
      } else {
        // Direct main thread initialization
        setProcessingMode('main');
        await loadWhisperModel({
          retryCount,
          retryDelay,
          onProgress: (p) => setLoadProgress(p?.progress || 0),
        });
      }

      setEngineStatus('ready');
      console.log(`[Hybrid] Processing initialized in ${processingMode} mode`);
    } catch (err) {
      console.error('[Hybrid] Failed to initialize processing:', err);
      setEngineStatus('error');
      setError('Error cargando el modelo de transcripción');
    }
  }, [preferWorker, retryCount, retryDelay, processingMode]);

  useEffect(() => {
    if (autoPreload) initializeProcessing();
  }, [autoPreload, initializeProcessing]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [audioUrl]);

  const setupAudioMonitoring = useCallback((stream: MediaStream) => {
    console.log('[Hybrid] Setting up audio monitoring');

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        setAudioLevel(0);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const level = Math.round(average * 100 / 255); // Scale to 0-100
      setAudioLevel(level);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  const startTranscription = useCallback(async () => {
    if (engineStatus !== 'ready') {
      setError('El modelo no está listo');
      return false;
    }

    try {
      setError('');
      setStatus('recording');
      setTranscription(null);
      setAudioUrl('');
      setAudioBlob(new Blob());
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setupAudioMonitoring(stream);

      // Check supported audio formats and use the best available
      const options = [];
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.push({ mimeType: 'audio/webm;codecs=opus' });
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.push({ mimeType: 'audio/webm' });
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.push({ mimeType: 'audio/mp4' });
      }

      const mediaRecorder = new MediaRecorder(stream, options[0] || {});
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Hybrid] MediaRecorder stopped, processing audio chunks:', audioChunksRef.current.length);
        
        if (audioChunksRef.current.length === 0) {
          console.error('[Hybrid] No audio chunks available');
          setError('No se pudo grabar el audio');
          return;
        }

        // Use the same mimeType as the recorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('[Hybrid] Created audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type
        });

        if (audioBlob.size === 0) {
          console.error('[Hybrid] Audio blob is empty');
          setError('El audio grabado está vacío');
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);

        // Process transcription
        await processTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return true;
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
      return false;
    }
  }, [engineStatus, setupAudioMonitoring]);

  const stopTranscription = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
    return true;
  }, []);

  const processTranscription = async (audioBlob: Blob) => {
    try {
      setStatus('processing');
      console.log(`[Hybrid] Processing transcription using ${processingMode} mode`);

      if (processingMode === 'worker' && workerRef.current) {
        // Use worker for processing
        const result = await processWithWorker(audioBlob);
        setTranscription(result);
      } else {
        // Use main thread for processing
        const result = await processWithMainThread(audioBlob);
        setTranscription(result);
      }

      setStatus('completed');
    } catch (err) {
      console.error('[Hybrid] Transcription failed:', err);
      setStatus('error');
      setError((err as Error).message);
    }
  };

  const processWithWorker = async (audioBlob: Blob): Promise<Transcription> => {
    // Convert blob to Float32Array
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const float32Audio = audioBuffer.getChannelData(0);

    return new Promise((resolve, reject) => {
      const chunkId = Date.now();
      
      workerRef.current!.onmessage = (event) => {
        if (event.data.type === 'CHUNK_PROCESSED' && event.data.chunkId === chunkId) {
          const medicalTerms = extractMedicalTermsFromText(event.data.text).map(t => t.term);
          resolve({
            text: event.data.text,
            confidence: event.data.confidence || 0.85,
            medicalTerms,
            processingTime: event.data.processingTime || 0,
            timestamp: Date.now(),
            chunks: []
          });
        } else if (event.data.type === 'CHUNK_ERROR') {
          reject(new Error(event.data.error));
        }
      };

      workerRef.current!.postMessage({
        type: 'PROCESS_CHUNK',
        data: {
          chunkId,
          audioData: float32Audio,
          metadata: {}
        }
      });
    });
  };

  const processWithMainThread = async (audioBlob: Blob): Promise<Transcription> => {
    // Convert blob to Float32Array
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const float32Audio = audioBuffer.getChannelData(0);

    // Transcribe using main thread
    const result = await transcribeAudio(float32Audio, {
      language: 'es',
      task: 'transcribe'
    });

    // Extract medical terms
    const medicalTerms = extractMedicalTermsFromText(result.text).map(t => t.term);

    return {
      text: result.text,
      confidence: 0.85,
      medicalTerms,
      processingTime: 0,
      timestamp: Date.now(),
      chunks: []
    };
  };

  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setAudioBlob(new Blob());
  }, [audioUrl]);

  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel: initializeProcessing,
    getCompleteAudio: () => new Float32Array(0),
    preloadStatus: engineStatus === 'ready' ? 'ready' : 'loading',
    preloadProgress: loadProgress,
    isPreloaded: engineStatus === 'ready',
    setLogger: () => {},
    processingMode // Exposed for debugging
  };
}