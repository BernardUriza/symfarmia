import { useState, useRef, useEffect, useCallback } from 'react';
import { useConsultation } from '../src/contexts/ConsultationContext';
import Logger from '../src/utils/logger';
import { useMicrophoneDiagnostics } from './useMicrophoneDiagnostics';

export function useTranscription() {
  const {
    isRecording,
    isPaused,
    liveTranscript,
    finalTranscript,
    confidence,
    startRecording,
    stopRecording,
    updateLiveTranscript,
    finalizeTranscript,
    logEvent,
    addAiMessage,
    isAdvancedMode,
  } = useConsultation();

  const { micPermission, checkMicrophonePermission, runMicrophoneDiagnostics, setMicPermission } = useMicrophoneDiagnostics();

  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptionService] = useState<'browser' | 'whisper'>('browser');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [checkMicrophonePermission]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, isPaused]);

  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const microphone = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    microphone.connect(analyserRef.current);
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        if (isRecording) {
          requestAnimationFrame(updateAudioLevel);
        }
      }
    };
    updateAudioLevel();
  }, [isRecording]);

  const setupBrowserTranscription = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Logger.warn('Speech recognition not supported');
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscriptUpdate = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const conf = event.results[i][0].confidence || 0.8;
        if (event.results[i].isFinal) {
          finalTranscriptUpdate += transcript;
        } else {
          interimTranscript += transcript;
        }
        if (conf < 0.5) {
          Logger.debug('Low confidence transcription', { transcript, conf });
        }
      }
      if (interimTranscript) {
        updateLiveTranscript(interimTranscript, confidence);
      }
      if (finalTranscriptUpdate) {
        finalizeTranscript(finalTranscriptUpdate);
        if (isAdvancedMode && finalTranscriptUpdate.trim().length > 10) {
          sendToAI(finalTranscriptUpdate);
        }
      }
    };
    recognitionRef.current.onerror = (event: any) => {
      Logger.error('Speech recognition error', event.error);
      logEvent('transcription_error', { error: event.error });
    };
    recognitionRef.current.start();
  }, [updateLiveTranscript, finalizeTranscript, isAdvancedMode, logEvent, confidence]);

  const getRandomMedicalSuggestion = () => {
    const suggestions = [
      'síntomas respiratorios',
      'manifestaciones cardiovasculares',
      'signos neurológicos',
      'síntomas gastrointestinales',
      'manifestaciones dermatológicas',
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const sendToAI = (transcript: string) => {
    if (!isAdvancedMode) return;
    addAiMessage({
      type: 'system',
      content: 'Transcripción recibida: ' + transcript,
      isInternal: true,
    });
    setTimeout(() => {
      addAiMessage({
        type: 'ai',
        content: `Análisis de la transcripción: Se detectan síntomas relacionados con ${getRandomMedicalSuggestion()}. ¿Deseas que profundice en algún aspecto específico?`,
        suggestions: ['Analizar síntomas principales', 'Sugerir diagnósticos diferenciales', 'Revisar antecedentes relevantes'],
      });
    }, 2000);
  };

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });
      setMicPermission('granted');
      setupAudioAnalysis(stream);
      if (transcriptionService === 'browser') {
        setupBrowserTranscription();
      }
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => { 
        if (audioChunksRef.current) {
          audioChunksRef.current.push(e.data); 
        }
      };
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current) {
          new Blob(audioChunksRef.current, { type: 'audio/webm' });
        }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start(1000);
      startRecording();
      setRecordingTime(0);
      logEvent('recording_started', { service: transcriptionService, time: new Date().toISOString() });
    } catch (error: any) {
      Logger.error('Error accessing microphone', error);
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied');
        logEvent('microphone_error', { error: 'Permission denied by user' });
      } else if (error.name === 'NotFoundError') {
        setMicPermission('denied');
        logEvent('microphone_error', { error: 'No microphone device found' });
      } else {
        setMicPermission('prompt');
        logEvent('microphone_error', { error: error.message });
      }
    }
  }, [setupAudioAnalysis, setupBrowserTranscription, startRecording, logEvent, transcriptionService, setMicPermission]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
      stopRecording(recordingTime);
      setAudioLevel(0);
      logEvent('recording_stopped', { duration: recordingTime, transcript_length: finalTranscript.length });
    }
  }, [isRecording, recordingTime, stopRecording, finalTranscript.length, logEvent]);

  return {
    isRecording,
    isPaused,
    liveTranscript,
    finalTranscript,
    confidence,
    micPermission,
    micDiagnostics: null,
    recordingTime,
    audioLevel,
    transcriptionService,
    handleStartRecording,
    handleStopRecording,
    checkMicrophonePermission,
    runMicrophoneDiagnostics,
  };
}
