/**
 * Enhanced Transcription Hook
 * 
 * Advanced transcription hook with word-by-word processing and voice reactivity
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMicrophoneLevel } from '../../hooks/useMicrophoneLevel';
import type { 
  Word, 
  EnhancedTranscriptionResult, 
  UseEnhancedTranscriptionProps, 
  TranscriptionStatus,
  TranscriptionService
} from '../types/transcription';

export const useEnhancedTranscription = (props: UseEnhancedTranscriptionProps = {}) => {
  const {
    autoStart = false,
    realTimeUpdates = true,
    medicalOptimization = true,
    language = 'es-ES',
    service = 'browser'
  } = props;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<EnhancedTranscriptionResult>({
    words: [],
    currentWord: '',
    finalTranscript: '',
    liveTranscript: '',
    totalWords: 0,
    confidence: 0,
    medicalTerms: []
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');

  // Refs for speech recognition
  const recognitionRef = useRef<any>(null);
  const wordsRef = useRef<Word[]>([]);
  const finalTranscriptRef = useRef<string>('');

  // Get microphone level for voice reactivity
  const audioLevel = useMicrophoneLevel(isRecording);

  // Medical terms detection
  const medicalTerms = [
    'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón', 'respiración',
    'síntoma', 'diagnóstico', 'tratamiento', 'medicamento', 'alergia', 'diabetes',
    'hipertensión', 'cardíaco', 'respiratorio', 'abdominal', 'cefalea', 'mareo'
  ];

  const detectMedicalTerms = useCallback((text: string): string[] => {
    const words = text.toLowerCase().split(' ');
    return medicalTerms.filter(term => 
      words.some(word => word.includes(term))
    );
  }, []);

  // Process transcript and extract words
  const processTranscript = useCallback((transcript: string, isFinal: boolean = false) => {
    const words = transcript.split(' ').filter(w => w.length > 0);
    
    if (isFinal) {
      // Final transcript - add to words array
      const newWords: Word[] = words.map(word => ({
        text: word,
        confidence: 0.9, // Browser API doesn't provide per-word confidence
        startTime: Date.now(),
        endTime: Date.now()
      }));
      
      const currentWords = wordsRef.current || [];
      const currentFinalTranscript = finalTranscriptRef.current || '';
      
      const updatedWords = [...currentWords, ...newWords];
      const updatedTranscript = currentFinalTranscript + ' ' + transcript;
      
      wordsRef.current = updatedWords;
      finalTranscriptRef.current = updatedTranscript;
      
      setTranscriptionResult(prev => ({
        ...prev,
        words: updatedWords,
        finalTranscript: updatedTranscript.trim(),
        liveTranscript: '',
        currentWord: '',
        totalWords: updatedWords.length,
        medicalTerms: detectMedicalTerms(updatedTranscript)
      }));
    } else {
      // Live transcript - show as current/live
      const currentWord = words[words.length - 1] || '';
      const liveTranscript = transcript;
      
      setTranscriptionResult(prev => ({
        ...prev,
        liveTranscript,
        currentWord,
        totalWords: prev.words.length + words.length,
        medicalTerms: detectMedicalTerms(prev.finalTranscript + ' ' + liveTranscript)
      }));
    }
  }, [detectMedicalTerms]);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('recording');
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Process final transcript
      if (finalTranscript) {
        processTranscript(finalTranscript, true);
      }

      // Process interim transcript
      if (interimTranscript) {
        processTranscript(interimTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setStatus('error');
    };

    recognition.onend = () => {
      setStatus('completed');
      setIsRecording(false);
    };

    return recognition;
  }, [language, processTranscript]);

  // Start transcription
  const startTranscription = useCallback(async () => {
    try {
      setError(null);
      setStatus('recording');
      
      const recognition = initializeRecognition();
      if (!recognition) return false;

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start transcription');
      setStatus('error');
      return false;
    }
  }, [initializeRecognition]);

  // Stop transcription
  const stopTranscription = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setStatus('completed');
    return true;
  }, []);

  // Reset transcription
  const resetTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setStatus('idle');
    setError(null);
    wordsRef.current = [];
    finalTranscriptRef.current = '';
    
    setTranscriptionResult({
      words: [],
      currentWord: '',
      finalTranscript: '',
      liveTranscript: '',
      totalWords: 0,
      confidence: 0,
      medicalTerms: []
    });
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && status === 'idle') {
      startTranscription();
    }
  }, [autoStart, status, startTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    // State
    ...transcriptionResult,
    isRecording,
    status,
    error,
    audioLevel,
    service: service as TranscriptionService,
    
    // Actions
    startTranscription,
    stopTranscription,
    resetTranscription,
    
    // Utilities
    getTranscriptionText: () => transcriptionResult.finalTranscript
  };
};