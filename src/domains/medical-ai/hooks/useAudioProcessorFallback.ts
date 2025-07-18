import { useRef, useCallback, useState } from 'react';

interface UseAudioProcessorFallbackOptions {
  onAudioData?: (audioData: Float32Array) => void;
  bufferSize?: number;
  sampleRate?: number;
}

export function useAudioProcessorFallback({
  onAudioData,
  bufferSize = 16384, // Must be power of 2 between 256-16384
  sampleRate = 16000
}: UseAudioProcessorFallbackOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number>(0);

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isProcessing) return null;

    try {
      console.log('[AudioProcessorFallback] Starting audio capture...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      const audioContext = new AudioContext({ sampleRate });
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create script processor
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Process audio data
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);
        
        // Calculate audio level
        const peak = audioData.reduce((max, val) => Math.max(max, Math.abs(val)), 0);
        setAudioLevel(Math.round(peak * 100));
        
        onAudioData?.(audioData);
      };

      // Connect nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store references
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;
      streamRef.current = stream;

      // Start recording timer
      startTimeRef.current = Date.now();
      setRecordingTime(0);
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
      }, 1000);

      setIsProcessing(true);
      console.log('[AudioProcessorFallback] Audio capture started');
      return stream;
    } catch (error) {
      console.error('[AudioProcessorFallback] Error starting audio:', error);
      throw error;
    }
  }, [isProcessing, bufferSize, sampleRate, onAudioData]);

  const stop = useCallback(async (): Promise<void> => {
    if (!isProcessing) return;

    console.log('[AudioProcessorFallback] Stopping audio capture...');

    // Clear timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = 0;
    }

    // Disconnect nodes
    if (sourceRef.current && processorRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
    }

    // Clear references
    audioContextRef.current = null;
    sourceRef.current = null;
    processorRef.current = null;
    streamRef.current = null;

    setIsProcessing(false);
    setAudioLevel(0);
    setRecordingTime(0);
    
    console.log('[AudioProcessorFallback] Audio capture stopped');
  }, [isProcessing]);

  const getCompleteAudio = useCallback((): Float32Array => {
    // This is a simple fallback, doesn't store all chunks
    console.log('[AudioProcessorFallback] getCompleteAudio called - returning empty array');
    return new Float32Array(0);
  }, []);

  const reset = useCallback(() => {
    // Just reset state
    setAudioLevel(0);
    setRecordingTime(0);
  }, []);

  return {
    start,
    stop,
    isProcessing,
    isRecording: isProcessing,
    audioLevel,
    recordingTime,
    getCompleteAudio,
    reset,
    error: '',
    audioChunks: [],
    processingStats: {
      totalChunks: 0,
      denoisedChunks: 0,
      fallbackChunks: 0,
      averageProcessingTime: 0
    },
    configureDenoisingMode: () => {}
  };
}
