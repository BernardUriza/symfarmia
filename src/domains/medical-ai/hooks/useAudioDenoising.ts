import { useEffect, useRef, useState, useCallback } from 'react';

export interface ProcessingMetadata {
  chunkId: number;
  originalLength: number;
  processedLength: number;
  denoisingUsed: boolean;
  processingTime: number;
  qualityMetrics?: any;
  activeFilters?: string[];
  fallbackMode?: boolean;
}

export interface UseAudioDenoisingOptions {
  onChunkReady?: (audio: Float32Array, metadata: ProcessingMetadata) => void;
  chunkSize?: number;
  sampleRate?: number;
}

export interface UseAudioDenoisingReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string;
  audioChunks: Array<{ id: number; data: Float32Array; metadata: ProcessingMetadata }>;
  start: () => Promise<MediaStream | null>;
  stop: () => void;
  getCompleteAudio: () => Float32Array;
  processingStats: {
    totalChunks: number;
    denoisedChunks: number;
    fallbackChunks: number;
    averageProcessingTime: number;
  };
  configureDenoisingMode: (enabled: boolean) => void;
  reset: () => void;
  audioLevel: number;
  recordingTime: number;
}

export function useAudioDenoising(
  { onChunkReady, chunkSize = 480, sampleRate = 48000 }: UseAudioDenoisingOptions = {}
): UseAudioDenoisingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [audioChunks, setAudioChunks] = useState<UseAudioDenoisingReturn['audioChunks']>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const recordingStartRef = useRef<number>(0);
  const recordingIntervalRef = useRef<number>(0);
  const chunkIdRef = useRef<number>(0);
  const allChunksRef = useRef<Float32Array[]>([]);
  const statsRef = useRef<{ totalChunks: number; denoisedChunks: number; fallbackChunks: number; totalTime: number }>({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 });

  const [processingStats, setProcessingStats] = useState({
    totalChunks: 0,
    denoisedChunks: 0,
    fallbackChunks: 0,
    averageProcessingTime: 0,
  });

  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Inicialización brutal del pipeline
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        console.log('[useAudioDenoising] Initializing audio denoiser...');
        const ctx = new window.AudioContext({ sampleRate });
        // Temporarily use simple worklet for testing
        const workletUrl = '/audio-denoiser-simple.worklet.js';
        console.log('[useAudioDenoising] Loading worklet from:', workletUrl);
        await ctx.audioWorklet.addModule(workletUrl);
        console.log('[useAudioDenoising] AudioWorklet loaded');
        
        const workletNode = new window.AudioWorkletNode(ctx, 'audio-denoiser-processor');
        console.log('[useAudioDenoising] WorkletNode created, setting up message handler...');
        
        // Wait for worklet to initialize RNNoise
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for RNNoise initialization'));
          }, 10000); // Increased timeout to 10s
          
          workletNode.port.onmessage = (event) => {
            console.log('[useAudioDenoising] Received message from worklet:', event.data.type);
            
            if (event.data.type === 'init-complete') {
              clearTimeout(timeout);
              console.log('[useAudioDenoising] RNNoise initialized in worklet');
              resolve();
            } else if (event.data.type === 'init-error') {
              clearTimeout(timeout);
              reject(new Error(`RNNoise init error: ${event.data.error}`));
            }
          };
          
          // Send init message to worklet after handler is set up
          console.log('[useAudioDenoising] Sending init message to worklet...');
          workletNode.port.postMessage({ type: 'init' });
        });
        
        if (!cancelled) {
          workletNodeRef.current = workletNode;
          audioCtxRef.current = ctx;
          setIsInitialized(true);
          setError('');
          console.log('[useAudioDenoising] Audio denoiser initialized successfully');
        }
      } catch (e: any) {
        console.error('[useAudioDenoising] Failed to initialize:', e);
        setError('Failed to load denoiser: ' + e.message);
        setIsInitialized(false);
      }
    })();
    return () => {
      cancelled = true;
      setIsInitialized(false);
      workletNodeRef.current = null;
      audioCtxRef.current?.close();
    };
  }, [sampleRate]);

  // Control brutal de grabación
  const start = useCallback(async (): Promise<MediaStream | null> => {
    try {
      // Verificar que el audio denoiser esté inicializado
      if (!isInitialized || !audioCtxRef.current || !workletNodeRef.current) {
        console.error('[useAudioDenoising] Not initialized:', { isInitialized, hasAudioCtx: !!audioCtxRef.current, hasWorklet: !!workletNodeRef.current });
        throw new Error('Audio denoiser not ready. Please wait for initialization to complete.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = audioCtxRef.current;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(workletNodeRef.current);
      setIsRecording(true);

      workletNodeRef.current.port.onmessage = (e: MessageEvent) => {
        if (e.data.type === 'denoised') {
          setIsProcessing(true);
          const chunkId = chunkIdRef.current!++;
          const floatData = new Float32Array(e.data.data);
          const peak = floatData.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
          setAudioLevel(Math.round(peak * 255));
          const startTime = Date.now();
          const metadata: ProcessingMetadata = {
            chunkId,
            originalLength: floatData.length,
            processedLength: floatData.length,
            denoisingUsed: true,
            processingTime: Date.now() - startTime,
          };
          
          // Use local reference to stats to avoid multiple null checks
          const stats = statsRef.current!;
          allChunksRef.current!.push(floatData);
          stats.totalChunks++;
          stats.denoisedChunks++;
          stats.totalTime += metadata.processingTime;
          
          setProcessingStats({
            totalChunks: stats.totalChunks,
            denoisedChunks: stats.denoisedChunks,
            fallbackChunks: stats.fallbackChunks,
            averageProcessingTime: stats.totalTime / stats.totalChunks,
          });
          setAudioChunks(prev => [...prev, { id: chunkId, data: floatData, metadata }]);
          onChunkReady?.(floatData, metadata);
          setIsProcessing(false);
        }
      };

      recordingStartRef.current! = Date.now();
      setRecordingTime(0);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current! = window.setInterval(() => {
        const startTime = recordingStartRef.current || Date.now();
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      ctx.resume();
      return stream;
    } catch (e: any) {
      setError('Recording failed: ' + e.message);
      return null;
    }
  }, [onChunkReady, isInitialized]);

  const stop = useCallback(() => {
    setIsRecording(false);
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioCtxRef.current?.suspend();
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current! = 0;
    }
    setRecordingTime(0);
    setAudioLevel(0);
  }, []);

  const getCompleteAudio = useCallback((): Float32Array => {
    const total = allChunksRef.current!.reduce((sum, c) => sum + c.length, 0);
    const buf = new Float32Array(total);
    let offset = 0;
    for (const c of allChunksRef.current!) {
      buf.set(c, offset);
      offset += c.length;
    }
    return buf;
  }, []);

  const configureDenoisingMode = useCallback((enabled: boolean) => {
    // No-op: Denoising always on. Si implementas fallback, aquí va el mensaje.
  }, []);

  const reset = useCallback(() => {
    setError('');
    setAudioChunks([]);
    setProcessingStats({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, averageProcessingTime: 0 });
    statsRef.current! = { totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 };
    allChunksRef.current! = [];
    chunkIdRef.current! = 0;
    setIsProcessing(false);
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current! = 0;
    }
    setRecordingTime(0);
    setAudioLevel(0);
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    audioChunks,
    start,
    stop,
    getCompleteAudio,
    processingStats,
    configureDenoisingMode,
    reset,
    audioLevel,
    recordingTime,
  };
}
