'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from '../app/providers/I18nProvider';

// 📊 Types que ConversationCapture necesita
export interface TranscriptionResult {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
}

export type TranscriptionStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

export interface UseTranscriptionReturn {
  // Estados que ConversationCapture consume
  transcription: TranscriptionResult | null;
  status: TranscriptionStatus;
  isRecording: boolean;
  error: string | null;
  engineStatus: 'ready' | 'loading' | 'error' | 'fallback';
  audioLevel: number;
  recordingTime: number;
  
  // Métodos que ConversationCapture necesita
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
}

export function useTranscription(options = {}): UseTranscriptionReturn {
  const { t } = useTranslation();
  
  // Estados internos
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error' | 'fallback'>('ready');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer de grabación
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
  
  // Inicializar audio level monitoring
  const setupAudioMonitoring = useCallback(async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!isRecording) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio monitoring setup failed:', error);
    }
  }, [isRecording]);
  
  // Start transcription
  const startTranscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setStatus('recording');
      setEngineStatus('ready');
      setRecordingTime(0);
      
      // Verificar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio monitoring
      await setupAudioMonitoring(stream);
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        setStatus('processing');
        
        try {
          // Crear blob de audio
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Enviar al endpoint /api/transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          
          const response = await fetch('/api/transcription', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            setTranscription({
              text: result.transcript || '',
              confidence: result.confidence || 0,
              medicalTerms: extractMedicalTerms(result.transcript || ''),
              processingTime: result.processing_time_ms || 0
            });
            setStatus('completed');
          } else {
            throw new Error(result.error || 'Transcription failed');
          }
          
        } catch (error) {
          console.error('Transcription failed:', error);
          setError(error instanceof Error ? error.message : 'Transcription failed');
          setStatus('error');
          setEngineStatus('error');
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setAudioLevel(0);
      };
      
      // Start recording
      mediaRecorder.start(1000); // Chunk every second
      setIsRecording(true);
      
      return true;
      
    } catch (error) {
      console.error('Failed to start transcription:', error);
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setStatus('error');
      setEngineStatus('error');
      setIsRecording(false);
      return false;
    }
  }, [setupAudioMonitoring]);
  
  // Stop transcription
  const stopTranscription = useCallback(async (): Promise<boolean> => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to stop transcription:', error);
      setError('Failed to stop recording');
      return false;
    }
  }, [isRecording]);
  
  // Reset transcription
  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus('idle');
    setError(null);
    setRecordingTime(0);
    setAudioLevel(0);
    setEngineStatus('ready');
  }, []);
  
  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription
  };
}

// Utility function to extract medical terms
function extractMedicalTerms(text: string): string[] {
  const medicalTerms = [
    'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón', 
    'respiración', 'síntoma', 'diagnóstico', 'tratamiento', 
    'medicamento', 'alergia', 'diabetes', 'hipertensión', 'cefalea'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  return medicalTerms.filter(term => 
    words.some(word => word.includes(term))
  );
}

export default useTranscription;