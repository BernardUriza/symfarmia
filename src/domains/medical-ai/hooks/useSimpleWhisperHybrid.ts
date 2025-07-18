'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadWhisperModel, transcribeAudio } from '../services/audioProcessingService';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';
import { webSpeechFallback } from '../services/webSpeechFallback';

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
  const isMonitoringRef = useRef<boolean>(false);
  const realtimeTranscriptRef = useRef<string>('');

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
            onProgress: (p) => {
              if (p?.progress) setLoadProgress(p.progress);
            }
          });
          setLoadProgress(100); // Set to 100% when loaded
        }
      } else {
        // Direct main thread initialization
        setProcessingMode('main');
        await loadWhisperModel({
          retryCount,
          retryDelay,
          onProgress: (p) => {
            if (p?.progress) setLoadProgress(p.progress);
          }
        });
        setLoadProgress(100); // Set to 100% when loaded
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
    console.log('[Hybrid] Setting up audio monitoring', {
      streamActive: stream.active,
      tracks: stream.getTracks().length
    });

    try {
      // Ensure stream is active
      if (!stream.active) {
        console.error('[Hybrid] Stream is not active!');
        return;
      }

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256; // Smaller buffer for more responsive readings
      analyser.smoothingTimeConstant = 0.8; // More smoothing
      
      // Connect the source to analyser and check connection
      source.connect(analyser);
      
      // Removed initial audio test logs
      
      console.log('[Hybrid] Audio analyser configured:', {
        fftSize: analyser.fftSize,
        frequencyBinCount: analyser.frequencyBinCount,
        smoothingTimeConstant: analyser.smoothingTimeConstant
      });

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        
        try {
          // Check if we should continue monitoring
          if (!isMonitoringRef.current || !analyserRef.current || audioContextRef.current?.state === 'closed') {
            if (!isMonitoringRef.current) {
              console.log('[Hybrid] Monitoring stopped by flag');
            } else {
              console.warn('[Hybrid] Analyser or context not available, stopping monitor');
            }
            setAudioLevel(0);
            return;
          }

          // Try both time domain and frequency domain for better results
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          // Calculate amplitude from time domain data
          let sum = 0;
          let max = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = Math.abs(dataArray[i] - 128) / 128;
            sum += normalized;
            max = Math.max(max, normalized);
          }
          
          // Also try frequency data for comparison
          const freqArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(freqArray);
          const freqAvg = freqArray.reduce((a, b) => a + b, 0) / freqArray.length;
          
          // Use the higher value between time and frequency domain
          const avgAmplitude = sum / dataArray.length;
          const amplificationFactor = 8; // Increased amplification
          const timeLevel = Math.min(100, Math.round(avgAmplitude * 100 * amplificationFactor));
          const freqLevel = Math.min(100, Math.round(freqAvg * 100 / 255));
          const level = Math.max(timeLevel, freqLevel);
          
          // Always update level for debugging
          setAudioLevel(level);
          
          // Removed audio level debugging logs

          animationFrameRef.current = requestAnimationFrame(updateLevel);
        } catch (error) {
          console.warn('[Hybrid] Audio level monitoring error:', error);
          setAudioLevel(0);
          // Try to restart after a delay
          setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'recording') {
              animationFrameRef.current = requestAnimationFrame(updateLevel);
            }
          }, 100);
        }
      };

      // Start the update loop with a small delay to ensure everything is ready
      setTimeout(() => {
        console.log('[Hybrid] Starting audio level monitoring...');
        isMonitoringRef.current = true;
        updateLevel();
      }, 50);
    } catch (error) {
      console.error('[Hybrid] Failed to setup audio monitoring:', error);
      setAudioLevel(0);
    }
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
      realtimeTranscriptRef.current = ''; // Reset real-time transcript

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ [Hybrid] MediaDevices API not available');
        setError('Tu navegador no soporta grabación de audio');
        return false;
      }

      console.log('🎙️ [Hybrid] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setupAudioMonitoring(stream);

      // Check supported audio formats and use the best available
      const options: MediaRecorderOptions[] = [];
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
        console.log('🎬 [Hybrid] ondataavailable fired, data size:', event.data.size);
        if (event.data.size > 0 && audioChunksRef.current) {
          audioChunksRef.current.push(event.data);
          console.log('📦 [Hybrid] Chunk added, total chunks:', audioChunksRef.current.length);
          
          // Check if we're getting actual audio data
          if (audioChunksRef.current.length === 1) {
            console.log('🎵 [Hybrid] First audio chunk received, MediaRecorder is working');
          }
        } else if (event.data.size === 0) {
          console.warn('⚠️ [Hybrid] Received empty audio chunk');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[Hybrid] MediaRecorder stopped, processing audio chunks:', audioChunksRef.current?.length || 0);
        
        if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
          console.error('[Hybrid] No audio chunks available');
          setError('No se pudo grabar el audio');
          return;
        }

        // Use the same mimeType as the recorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current || [], { type: mimeType });
        
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

      // Start recording with timeslice to get chunks periodically
      const timeslice = 1000; // Get chunks every 1 second
      mediaRecorder.start(timeslice);
      console.log('🔴 [Hybrid] MediaRecorder started with timeslice:', timeslice, 'ms');
      setIsRecording(true);
      
      // Start Web Speech API for real-time transcription
      try {
        console.log('🚀 [Hybrid] Starting Web Speech API for real-time transcription...');
        webSpeechFallback.startLiveTranscription((text, isFinal) => {
          console.log(`🗣️ [Hybrid] Web Speech event - Final: ${isFinal}, Text: "${text}"`);
          
          if (text) {
            // Update transcription for both interim and final results
            const currentText = isFinal 
              ? realtimeTranscriptRef.current + text + ' '
              : realtimeTranscriptRef.current + text;
            
            if (isFinal) {
              realtimeTranscriptRef.current = currentText;
            }
            
            console.log('🎤 [Hybrid] Updating transcription state with:', currentText);
            
            // Update transcription in real-time
            setTranscription({
              text: currentText,
              confidence: isFinal ? 0.9 : 0.7,
              medicalTerms: extractMedicalTermsFromText(currentText).map(t => t.term),
              processingTime: 0,
              timestamp: Date.now(),
              chunks: []
            });
          }
        });
        console.log('✅ [Hybrid] Web Speech API started successfully');
      } catch (err) {
        console.error('❌ [Hybrid] Web Speech API fallback failed:', err);
      }

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
    console.log('[Hybrid] Stopping transcription...');
    
    // Stop monitoring
    isMonitoringRef.current = false;
    
    // Stop Web Speech API
    try {
      webSpeechFallback.stop();
    } catch (err) {
      console.warn('⚠️ [Hybrid] Error stopping Web Speech API:', err);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch (error) {
        console.warn('[Hybrid] Error closing audio context:', error);
      }
      audioContextRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
    return true;
  }, []);

  const processTranscription = async (audioBlob: Blob) => {
    try {
      setStatus('processing');
      
      // If we already have text from Web Speech API, use it
      if (realtimeTranscriptRef.current) {
        console.log('✅ [Hybrid] Using Web Speech API transcription');
        const medicalTerms = extractMedicalTermsFromText(realtimeTranscriptRef.current).map(t => t.term);
        setTranscription({
          text: realtimeTranscriptRef.current,
          confidence: 0.9,
          medicalTerms,
          processingTime: 0,
          timestamp: Date.now(),
          chunks: []
        });
        setStatus('completed');
        return;
      }

      // Only try Whisper if Web Speech API didn't capture anything
      console.log(`[Hybrid] No Web Speech text, trying ${processingMode} mode`);
      if (processingMode === 'worker' && workerRef.current) {
        const result = await processWithWorker(audioBlob);
        setTranscription(result);
      } else {
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
    console.log('🎯 [Hybrid] Starting processWithMainThread...');
    console.log('📊 [Hybrid] Audio blob size:', audioBlob.size, 'type:', audioBlob.type);
    
    // Convert blob to Float32Array
    const arrayBuffer = await audioBlob.arrayBuffer();
    console.log('📦 [Hybrid] ArrayBuffer size:', arrayBuffer.byteLength);
    
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('🎵 [Hybrid] Audio buffer:', {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length
    });
    
    const float32Audio = audioBuffer.getChannelData(0);
    console.log('🔊 [Hybrid] Float32Array length:', float32Audio.length);
    
    // Check if audio has actual content
    const hasContent = float32Audio.some(sample => Math.abs(sample) > 0.01);
    console.log('🎤 [Hybrid] Audio has content:', hasContent);
    
    // Transcribe using main thread
    console.log('🚀 [Hybrid] Calling transcribeAudio...');
    let result;
    try {
      result = await transcribeAudio(float32Audio, {
        language: 'es',
        task: 'transcribe'
      });
    } catch (error) {
      console.error('❌ [Hybrid] Whisper transcription failed:', error);
      // Don't use mock - rely on Web Speech API that already captured the text
      result = {
        text: realtimeTranscriptRef.current || '',
        error: 'Using Web Speech API'
      };
    }
    
    console.log('✅ [Hybrid] Transcription result:', result);

    // Extract medical terms
    const medicalTerms = extractMedicalTermsFromText(result.text).map(t => t.term);
    console.log('🏥 [Hybrid] Medical terms found:', medicalTerms);

    return {
      text: result.text || '[Sin transcripción]',
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
    realtimeTranscriptRef.current = '';
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