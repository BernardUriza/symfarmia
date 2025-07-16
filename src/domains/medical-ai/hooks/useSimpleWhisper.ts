"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';
import { DefaultLogger } from '../utils/LoggerStrategy';
import { useWhisperPreload } from './useWhisperPreload';
import { useWhisperWorker } from './useWhisperWorker';
import { useDirectAudioCapture } from './useDirectAudioCapture';
import { useAudioChunkManager } from './useAudioChunkManager';
import { useWhisperStreamingProcessorWorker } from './useWhisperStreamingProcessorWorker';

// Unified transcription interface
interface Transcription {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
  timestamp?: number;
  chunks?: { id: string; text: string; timestamp: number }[];
}

type Status = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
type EngineStatus = 'loading' | 'ready' | 'error';
type ProcessingMode = 'streaming' | 'direct' | 'enhanced';

// Unified logger interface
interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  setEnabled?: (value: boolean) => void;
}

// Unified options interface
interface UseSimpleWhisperOptions {
  // Core options
  autoPreload?: boolean;
  processingMode?: ProcessingMode;
  
  // Audio options
  chunkSize?: number;
  sampleRate?: number;
  
  // Preload options
  preloadPriority?: 'high' | 'low' | 'auto';
  preloadDelay?: number;
  
  // Error handling
  retryCount?: number;
  retryDelay?: number;
  
  // Debug
  logger?: Logger;
  showPreloadStatus?: boolean;
  
  // Callbacks
  onChunkProcessed?: (text: string, chunkNumber: number) => void;
}

// Unified return interface
interface UseSimpleWhisperReturn {
  // Core transcription
  transcription: Transcription | null;
  status: Status;
  isRecording: boolean;
  error: string | null;
  
  // Engine status
  engineStatus: EngineStatus;
  loadProgress: number;
  
  // Audio monitoring
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  
  // Controls
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  preloadModel: () => Promise<void>;
  
  // Enhanced preload info (from Enhanced version)
  preloadStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  preloadProgress: number;
  isPreloaded: boolean;
  
  // Debug
  setLogger?: (enabled: boolean) => void;
}

export function useSimpleWhisper({
  autoPreload = false,
  processingMode = 'direct', // Default to direct for best performance
  chunkSize = 16000,
  sampleRate = 16000,
  preloadPriority = 'auto',
  preloadDelay = 2000,
  retryCount = 3,
  retryDelay = 1000,
  logger = DefaultLogger,
  showPreloadStatus = false,
  onChunkProcessed
}: UseSimpleWhisperOptions = {}): UseSimpleWhisperReturn {
  
  // Core state
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Refs for cleanup and state management
  const transcriptPartsRef = useRef<{ [key: string]: string }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const processingTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chunkCountRef = useRef<number>(0); // Contador de chunks procesados
  const engineStatusRef = useRef<EngineStatus>('loading'); // Track engine status in ref
  
  // Enhanced preload integration
  const { 
    status: preloadStatus, 
    progress: preloadProgress,
    isLoaded: isPreloaded,
    forcePreload 
  } = useWhisperPreload({
    autoInit: autoPreload,
    priority: preloadPriority,
    delay: preloadDelay
  });
  
  // Hooks for different processing modes
  const { 
    isReady: isWorkerReady, 
    processChunk: processWorkerChunk, 
    reset: resetWorker 
  } = useWhisperWorker({
    onChunkProcessed: (text, chunkId) => {
      transcriptPartsRef.current[chunkId] = text;
      logger.log(`[${processingMode}] Chunk ${chunkId} processed: ${text}`);
      chunkCountRef.current++;
      
      // Llamar al callback del usuario si existe en modo direct
      if (processingMode === 'direct' && onChunkProcessed && text) {
        onChunkProcessed(text, chunkCountRef.current);
      }
    },
    onError: (workerError) => {
      logger.error(`[${processingMode}] Worker error:`, workerError);
      setError(workerError);
      setStatus('error');
    },
    onModelLoading: (progress) => {
      setLoadProgress(progress);
      logger.log(`[${processingMode}] Model loading: ${progress}%`);
    },
    onModelReady: () => {
      setEngineStatus('ready');
      setLoadProgress(100);
      logger.log(`[${processingMode}] Model ready`);
    }
  });
  
  // Direct audio capture (for direct mode)
  const { 
    start: startDirectCapture, 
    stop: stopDirectCapture, 
    isRecording: isDirectRecording 
  } = useDirectAudioCapture({
    onChunkReady: async (audioData) => {
      logger.log(`[Direct] Chunk ready: ${audioData.length} samples`);
      logger.log(`[Direct] Worker state - isWorkerReady: ${isWorkerReady}, processingMode: ${processingMode}, engineStatus: ${engineStatusRef.current}`);
      
      if (isWorkerReady && processingMode === 'direct') {
        const chunkId = `chunk_${Date.now()}`; 
        try {
          processingTimeRef.current = Date.now();
          logger.log(`[Direct] Processing chunk ${chunkId} with ${audioData.length} samples`);
          await processWorkerChunk(audioData, chunkId);
        } catch (err) {
          logger.error(`[${processingMode}] Error processing chunk:`, err);
        }
      } else {
        logger.log(`[Direct] Skipping chunk - Worker ready: ${isWorkerReady}, Mode: ${processingMode}`);
      }
    },
    chunkSize,
    sampleRate
  });
  
  // Streaming processor (for streaming mode)
  const { 
    processChunk: processStreamingChunk, 
    getTranscript: getStreamingTranscript, 
    reset: resetStreamingProcessor, 
    isReady: isStreamingReady 
  } = useWhisperStreamingProcessorWorker({
    onChunkProcessed: (text, chunkNumber) => {
      logger.log(`[Streaming] Chunk ${chunkNumber} processed: ${text}`);
      chunkCountRef.current = chunkNumber;
      
      // Llamar al callback del usuario si existe
      if (onChunkProcessed && text) {
        onChunkProcessed(text, chunkNumber);
      }
    }
  });
  
  // Audio chunk manager (for streaming mode)
  const {
    start: startStreamingChunks,
    stop: stopStreamingChunks,
  } = useAudioChunkManager({
    onChunkReady: (chunk) => {
      if (processingMode === 'streaming') {
        processStreamingChunk(chunk);
      }
    },
  });
  
  // Update engine status based on selected mode and preload state
  useEffect(() => {
    if (isPreloaded) {
      setEngineStatus('ready');
      engineStatusRef.current = 'ready';
      setLoadProgress(100);
      logger.log(`[${processingMode}] Model ready from preload`);
    } else if (preloadStatus === 'loading') {
      setEngineStatus('loading');
      engineStatusRef.current = 'loading';
      setLoadProgress(preloadProgress);
    } else if (preloadStatus === 'failed') {
      setEngineStatus('error');
      engineStatusRef.current = 'error';
      setError('Error loading model from preload');
    } else {
      // Check worker readiness based on processing mode
      const modeReady = processingMode === 'streaming' ? isStreamingReady : isWorkerReady;
      if (modeReady && engineStatus === 'loading') {
        setEngineStatus('ready');
        engineStatusRef.current = 'ready';
        setLoadProgress(100);
      }
    }
  }, [isPreloaded, preloadStatus, preloadProgress, isWorkerReady, isStreamingReady, processingMode, engineStatus, logger]);
  
  // Update recording state based on mode
  useEffect(() => {
    if (processingMode === 'direct') {
      setIsRecording(isDirectRecording);
    }
  }, [isDirectRecording, processingMode]);
  
  // Audio level monitoring setup
  const setupAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        // Use ref instead of state to avoid closure issues
        if (!audioContextRef.current || !analyserRef.current) {
          setAudioLevel(0);
          return;
        }
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const level = Math.round(average);
        setAudioLevel(level);
        
        // Log periodically to avoid spamming
        if (Math.random() < 0.1) {
          logger.log(`[AudioMonitor] Level: ${level}`);
        }
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      logger.log('[AudioMonitor] Starting audio level monitoring');
      updateLevel();
    } catch (err) {
      logger.error(`[${processingMode}] Error setting up audio monitoring:`, err);
    }
  }, [processingMode, logger]);
  
  // Recording time management
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
  
  // Preload model function
  const preloadModel = useCallback(async () => {
    if (isPreloaded) {
      logger.log(`[${processingMode}] Model already preloaded`);
      return;
    }
    
    try {
      setEngineStatus('loading');
      setError(null);
      
      // Clear previous timers
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Use enhanced preload if available
      if (showPreloadStatus) {
        await forcePreload();
      } else {
        // Fallback to worker readiness check
        const modeReady = processingMode === 'streaming' ? isStreamingReady : isWorkerReady;
        
        if (modeReady) {
          setEngineStatus('ready');
          setLoadProgress(100);
          return;
        }
        
        // Poll for readiness
        checkIntervalRef.current = setInterval(() => {
          const currentModeReady = processingMode === 'streaming' ? isStreamingReady : isWorkerReady;
          if (currentModeReady) {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setEngineStatus('ready');
            setLoadProgress(100);
          }
        }, 100);
        
        // Timeout after 60 seconds
        timeoutRef.current = setTimeout(() => {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          const currentModeReady = processingMode === 'streaming' ? isStreamingReady : isWorkerReady;
          if (!currentModeReady) {
            setEngineStatus('error');
            setError('Timeout cargando el modelo de transcripción. Por favor, recarga la página.');
          }
        }, 60000);
      }
      
      setEngineStatus('ready');
    } catch (err) {
      setEngineStatus('error');
      setError('Error cargando el modelo de transcripción');
      logger.error(`[${processingMode}] Error preloading model:`, err);
      
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [isPreloaded, forcePreload, showPreloadStatus, processingMode, isStreamingReady, isWorkerReady, logger]);
  
  // Start transcription
  const startTranscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setStatus('recording');
      setTranscription(null);
      transcriptPartsRef.current = {};
      chunkCountRef.current = 0; // Reset chunk counter
      
      const modeReady = processingMode === 'streaming' ? isStreamingReady : isWorkerReady;
      
      logger.log(`[startTranscription] Mode: ${processingMode}, Worker ready: ${isWorkerReady}, Preloaded: ${isPreloaded}`);
      
      if (!modeReady && !isPreloaded) {
        setError('El modelo aún se está cargando');
        setStatus('error');
        return false;
      }
      
      // Give worker a moment to fully initialize if just became ready
      if (modeReady && !isPreloaded) {
        logger.log('[startTranscription] Waiting 100ms for worker to stabilize...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      let stream: MediaStream | null = null;
      
      if (processingMode === 'streaming') {
        stream = await startStreamingChunks();
      } else if (processingMode === 'direct') {
        stream = await startDirectCapture();
      }
      
      if (!stream) {
        throw new Error('No se pudo iniciar la captura de audio');
      }
      
      setupAudioMonitoring(stream);
      
      // Set recording state for both modes
      setIsRecording(true);
      
      logger.log(`[${processingMode}] Transcription started`);
      return true;
    } catch (err) {
      logger.error(`[${processingMode}] Error starting transcription:`, err);
      setError(err instanceof Error ? err.message : 'Error al iniciar la grabación');
      setStatus('error');
      return false;
    }
  }, [processingMode, isStreamingReady, isWorkerReady, isPreloaded, startStreamingChunks, startDirectCapture, setupAudioMonitoring, logger]);
  
  // Stop transcription
  const stopTranscription = useCallback(async (): Promise<boolean> => {
    try {
      if (!isRecording) return false;
      
      setStatus('processing');
      
      // Stop recording based on mode
      if (processingMode === 'streaming') {
        stopStreamingChunks();
      } else if (processingMode === 'direct') {
        stopDirectCapture();
      }
      
      // Set recording state to false for both modes
      setIsRecording(false);
      
      // Cleanup audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Wait for final processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get transcript based on mode
      let finalText = '';
      let processingTime = 0;
      
      console.log(`[useSimpleWhisper] Obteniendo transcripción en modo: ${processingMode}`);
      
      if (processingMode === 'streaming') {
        console.log('[useSimpleWhisper] Llamando a getStreamingTranscript...');
        finalText = await getStreamingTranscript();
        console.log(`[useSimpleWhisper] Transcripción obtenida: "${finalText}" (${finalText.length} caracteres)`);
        processingTime = processingTimeRef.current ? Date.now() - processingTimeRef.current : 0;
      } else if (processingMode === 'direct') {
        // Combine all transcript parts
        const sortedChunks = Object.entries(transcriptPartsRef.current)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, text]) => text);
        
        finalText = sortedChunks.join(' ').trim();
        processingTime = processingTimeRef.current ? Date.now() - processingTimeRef.current : 0;
      }
      
      if (finalText) {
        const medicalTerms = extractMedicalTermsFromText(finalText).map(t => t.term);
        
        console.log(`[useSimpleWhisper] ACTUALIZANDO ESTADO CON TRANSCRIPCIÓN: "${finalText}"`);
        
        setTranscription({
          text: finalText,
          confidence: 0.95,
          medicalTerms,
          processingTime,
          timestamp: Date.now(),
          chunks: Object.entries(transcriptPartsRef.current).map(([id, text]) => ({
            id,
            text,
            timestamp: Date.now()
          }))
        });
        
        setStatus('completed');
        logger.log(`[${processingMode}] Transcription completed: ${finalText}`);
        console.log('[useSimpleWhisper] Estado actualizado - La UI debería mostrar la transcripción ahora');
      } else {
        console.error('[useSimpleWhisper] NO HAY TEXTO FINAL - Usuario estafado');
        setError('No se pudo obtener transcripción - Habla más fuerte o por más tiempo');
        setStatus('error');
      }
      
      return true;
    } catch (err) {
      logger.error(`[${processingMode}] Error stopping transcription:`, err);
      setError('Error al detener la grabación');
      setStatus('error');
      return false;
    }
  }, [isRecording, processingMode, stopStreamingChunks, stopDirectCapture, getStreamingTranscript, logger]);
  
  // Reset transcription
  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    setAudioUrl(null);
    setAudioBlob(null);
    transcriptPartsRef.current = {};
    chunkCountRef.current = 0;
    
    // Reset based on mode
    if (processingMode === 'streaming') {
      resetStreamingProcessor();
    } else if (processingMode === 'direct') {
      resetWorker();
    }
    
    logger.log(`[${processingMode}] Transcription reset`);
  }, [processingMode, resetStreamingProcessor, resetWorker, logger]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);
  
  return {
    // Core transcription
    transcription,
    status,
    isRecording,
    error,
    
    // Engine status
    engineStatus,
    loadProgress: isPreloaded ? 100 : loadProgress,
    
    // Audio monitoring
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    
    // Controls
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel,
    
    // Enhanced preload info
    preloadStatus,
    preloadProgress,
    isPreloaded,
    
    // Debug
    setLogger: logger.setEnabled?.bind(logger)
  };
}