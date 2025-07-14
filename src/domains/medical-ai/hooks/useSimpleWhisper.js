'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// Singleton para el modelo Whisper
let whisperModel = null;

export function useSimpleWhisper({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000
} = {}) {
  // Estados principales
  const [transcription, setTranscription] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, recording, processing, completed, error
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [engineStatus, setEngineStatus] = useState('loading'); // ready, loading, error, fallback
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  // Referencias
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const loadModelWithRetries = useCallback(async () => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        setEngineStatus('loading');
        if (!whisperModel) {
          const { pipeline } = await import('@xenova/transformers');
          whisperModel = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
            progress_callback: (p) => setLoadProgress(p.progress || 0)
          });
        }
        setEngineStatus('ready');
        return;
      } catch (err) {
        console.error(`Error loading Whisper model (attempt ${attempt}):`, err);
        if (attempt < retryCount) {
          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          setEngineStatus('error');
          setError('Error cargando el modelo de transcripción');
        }
      }
    }
  }, [retryCount, retryDelay]);

  const preloadModel = useCallback(async () => {
    if (engineStatus === 'ready') return;
    await loadModelWithRetries();
  }, [loadModelWithRetries, engineStatus]);

  // Cargar modelo Whisper al montar si autoPreload
  useEffect(() => {
    if (autoPreload) {
      preloadModel();
    }
  }, [autoPreload, preloadModel]);

  // Monitor de nivel de audio
  const setupAudioMonitoring = useCallback((stream) => {
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

  // Timer de grabación
  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Iniciar transcripción
  const startTranscription = async () => {
    try {
      setError(null);
      setStatus('recording');
      audioChunksRef.current = [];
      
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Configurar monitor de audio
      setupAudioMonitoring(stream);
      
      // Configurar eventos
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        await processAudio();
      };
      
      // Iniciar grabación
      mediaRecorder.start();
      setIsRecording(true);
      
      return true;
    } catch (err) {
      console.error('Error starting recording:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.');
      } else {
        setError('Error al iniciar la grabación: ' + err.message);
      }
      
      setStatus('error');
      setEngineStatus('error');
      return false;
    }
  };

  // Detener transcripción
  const stopTranscription = async () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      
      // Limpiar monitor de audio
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Limpiar stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Cerrar audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      return true;
    }
    return false;
  };

  // Procesar audio y transcribir
  const processAudio = async () => {
    setStatus('processing');
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Convertir a Float32Array para Whisper
      const audioContext = new AudioContext();
      const audioData = await audioContext.decodeAudioData(arrayBuffer);
      const float32Audio = audioData.getChannelData(0);
      
      console.log('Transcribiendo audio con Whisper...');
      const startTime = performance.now();
      
      if (!whisperModel) {
        throw new Error('Modelo no cargado');
      }
      
      const result = await whisperModel(float32Audio, { 
        chunk_length_s: 30, 
        return_timestamps: false 
      });
      
      const processingTime = Math.round(performance.now() - startTime);
      
      // Extraer términos médicos simples
      const medicalTerms = extractMedicalTerms(result.text || '');
      
      setTranscription({
        text: result.text || '',
        confidence: 0.95, // Whisper no devuelve confidence, usar valor por defecto
        medicalTerms,
        processingTime
      });
      
      setStatus('completed');
      console.log('Transcripción completada:', result.text);
      
    } catch (err) {
      console.error('Error en transcripción:', err);
      setError('Error al procesar el audio: ' + err.message);
      setStatus('error');
      setEngineStatus('error');
    }
  };

  // Resetear transcripción
  const resetTranscription = () => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    audioChunksRef.current = [];
  };

  // Extraer términos médicos básicos
  const extractMedicalTerms = (text) => {
    const medicalKeywords = [
      'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón',
      'respiración', 'síntoma', 'diagnóstico', 'tratamiento',
      'medicamento', 'alergia', 'diabetes', 'hipertensión', 'cefalea',
      'náusea', 'mareo', 'fatiga', 'tos', 'gripe'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return medicalKeywords.filter(term => 
      words.some(word => word.includes(term))
    );
  };

  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel
  };
}