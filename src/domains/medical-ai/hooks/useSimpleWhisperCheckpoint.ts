'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { loadWhisperModel, transcribeAudio } from '../services/audioProcessingService';
import { extractMedicalTermsFromText } from '../utils/medicalTerms';

export function useSimpleWhisperCheckpoint({
  autoPreload = true,
  retryCount = 3,
  retryDelay = 1000
} = {}) {
  const [transcription, setTranscription] = useState(null);
  const [status, setStatus] = useState('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [engineStatus, setEngineStatus] = useState('loading');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const preloadModel = useCallback(async () => {
    try {
      setEngineStatus('loading');
      await loadWhisperModel({
        retryCount,
        retryDelay,
        onProgress: (p) => setLoadProgress(p?.progress || 0),
      });
      setEngineStatus('ready');
    } catch (err) {
      setEngineStatus('error');
      setError('Error cargando el modelo de transcripción');
    }
  }, [retryCount, retryDelay]);

  useEffect(() => {
    if (autoPreload) preloadModel();
  }, [autoPreload, preloadModel]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const setupAudioMonitoring = useCallback((stream) => {
    console.log('🎤 [AudioMonitoring] Iniciando configuración de monitoreo de audio');

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
      setError(null);
      setStatus('recording');
      setTranscription(null);
      setAudioUrl(null);
      setAudioBlob(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setupAudioMonitoring(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
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
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return true;
    } catch (err) {
      setStatus('error');
      setError(err.message);
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

  const processTranscription = async (audioBlob) => {
    try {
      setStatus('processing');

      // Convert blob to Float32Array
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const float32Audio = audioBuffer.getChannelData(0);

      // Transcribe
      const result = await transcribeAudio(float32Audio, {
        language: 'es',
        task: 'transcribe'
      });

      // Extract medical terms
      const medicalTerms = extractMedicalTermsFromText(result.text).map(t => t.term);

      setTranscription({
        text: result.text,
        confidence: 0.85,
        medicalTerms,
        processingTime: 0,
        timestamp: Date.now(),
        chunks: []
      });

      setStatus('completed');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
  }, [audioUrl]);

  return {
    transcription,
    status,
    isRecording,
    error: error || '',
    engineStatus,
    loadProgress,
    audioLevel,
    recordingTime,
    audioUrl: audioUrl || '',
    audioBlob: audioBlob || new Blob(),
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel,
    getCompleteAudio: () => new Float32Array(0),
    preloadStatus: engineStatus === 'ready' ? 'ready' : 'loading',
    preloadProgress: loadProgress,
    isPreloaded: engineStatus === 'ready',
    setLogger: () => {}
  };
}