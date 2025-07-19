import { useState, useRef, useCallback, useEffect } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseWebSpeechCaptureReturn {
  isRecording: boolean;
  transcript: string;
  isAvailable: boolean;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  clearTranscript: () => void;
  restartCount: number;
  lastRestartTime: Date | null;
  isListening: boolean;
  confidence: number;
  language: string;
  setLanguage: (lang: string) => void;
  partialTranscripts: string[];
}

// Audit log for medical debugging
interface WebSpeechAuditLog {
  timestamp: Date;
  event: 'start' | 'stop' | 'restart' | 'error' | 'timeout';
  reason?: string;
  duration?: number;
}

export const useWebSpeechCapture = (): UseWebSpeechCaptureReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restartCount, setRestartCount] = useState(0);
  const [lastRestartTime, setLastRestartTime] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('es-MX');
  const [partialTranscripts, setPartialTranscripts] = useState<string[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const auditLogRef = useRef<WebSpeechAuditLog[]>([]);
  const isIntentionalStopRef = useRef(false);
  const lastTranscriptRef = useRef('');
  const confidenceAccumulatorRef = useRef<number[]>([]);
  
  // Watchdog configuration
  const WATCHDOG_TIMEOUT = 13000; // 13 seconds
  const MAX_AUDIT_LOGS = 100;

  // Audit logging function
  const addAuditLog = useCallback((event: WebSpeechAuditLog['event'], reason?: string) => {
    const now = new Date();
    const duration = sessionStartTimeRef.current 
      ? now.getTime() - sessionStartTimeRef.current.getTime() 
      : undefined;
    
    const logEntry: WebSpeechAuditLog = {
      timestamp: now,
      event,
      reason,
      duration
    };
    
    auditLogRef.current.push(logEntry);
    
    // Keep only last MAX_AUDIT_LOGS entries
    if (auditLogRef.current.length > MAX_AUDIT_LOGS) {
      auditLogRef.current = auditLogRef.current.slice(-MAX_AUDIT_LOGS);
    }
    
    // Log to console for debugging
    console.log(`[WebSpeech Audit] ${event}`, { reason, duration, restartCount });
  }, [restartCount]);
  
  // Reset watchdog timer
  const resetWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
    }
    
    if (isRecording && !isIntentionalStopRef.current) {
      watchdogTimerRef.current = setTimeout(() => {
        console.warn('[WebSpeech] Watchdog timeout - restarting recognition');
        addAuditLog('timeout', 'No activity for 13 seconds');
        
        // Force restart
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            // Start will be called in onend handler
          } catch (err) {
            console.error('[WebSpeech] Error in watchdog restart:', err);
          }
        }
      }, WATCHDOG_TIMEOUT);
    }
  }, [isRecording, addAuditLog]);
  
  // Clear watchdog timer
  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // Check if WebSpeech API is available
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    setIsAvailable(!!SpeechRecognition);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearWatchdog();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [clearWatchdog]);

  // Start real-time transcription
  const startRealTimeTranscription = useCallback((isRestart = false) => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Web Speech API no está disponible en este navegador');
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = Array.from(event.results);
        let finalTranscript = '';
        let interimTranscript = '';
        let totalConfidence = 0;
        let confCount = 0;
        
        for (let i = event.resultIndex; i < results.length; i++) {
          const result = results[i] as SpeechRecognitionResult;
          const alternative = result[0];
          
          if (result.isFinal) {
            finalTranscript += alternative.transcript;
            // Save partial transcript
            setPartialTranscripts(prev => [...prev, alternative.transcript]);
          } else {
            interimTranscript += alternative.transcript;
          }
          
          if (alternative.confidence) {
            totalConfidence += alternative.confidence;
            confCount++;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        if (fullTranscript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = fullTranscript;
          setTranscript(fullTranscript);
        }
        
        // Update average confidence
        if (confCount > 0) {
          const avgConfidence = totalConfidence / confCount;
          if (confidenceAccumulatorRef.current) {
            confidenceAccumulatorRef.current.push(avgConfidence);
          }
          setConfidence(avgConfidence);
        }
        
        // Reset watchdog on activity
        resetWatchdog();
      };
      
      recognition.onspeechstart = () => {
        console.log('[WebSpeech] Speech detected');
        setIsListening(true);
        resetWatchdog();
      };
      
      recognition.onspeechend = () => {
        console.log('[WebSpeech] Speech ended');
        setIsListening(false);
      };
      
      recognition.onsoundstart = () => {
        resetWatchdog();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        addAuditLog('error', event.error);
        
        // Don't show network errors as they're often false positives
        if (event.error !== 'network') {
          setError(`Error de reconocimiento: ${event.error}`);
        }
        
        // For 'no-speech' or 'aborted' errors, try to restart
        if ((event.error === 'no-speech' || event.error === 'aborted') && isRecording) {
          console.log('[WebSpeech] Auto-restarting after error:', event.error);
          setTimeout(() => {
            if (isRecording && !isIntentionalStopRef.current) {
              startRealTimeTranscription(true);
              setRestartCount(prev => prev + 1);
              setLastRestartTime(new Date());
            }
          }, 100);
        } else {
          setIsRecording(false);
          clearWatchdog();
        }
      };
      
      recognition.onend = () => {
        console.log('[WebSpeech] Recognition ended, intentional:', isIntentionalStopRef.current);
        
        // Auto-restart if still recording and not intentionally stopped
        if (isRecording && !isIntentionalStopRef.current) {
          console.log('[WebSpeech] Auto-restarting recognition...');
          addAuditLog('restart', 'Auto-restart on unexpected end');
          
          setTimeout(() => {
            if (isRecording) {
              startRealTimeTranscription(true);
              setRestartCount(prev => prev + 1);
              setLastRestartTime(new Date());
            }
          }, 100);
        } else {
          setIsRecording(false);
          clearWatchdog();
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
      if (!isRestart) {
        sessionStartTimeRef.current = new Date();
        addAuditLog('start');
      } else {
        addAuditLog('restart', 'Automatic restart');
      }
      
      setError(null);
      resetWatchdog();
      return true;
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Error al iniciar el reconocimiento de voz');
      return false;
    }
  }, [resetWatchdog, clearWatchdog, addAuditLog, isRecording]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Transcripción en tiempo real no disponible. Solo se usará Whisper.');
      return false;
    }

    try {
      isIntentionalStopRef.current = false;
      setIsRecording(true);
      setTranscript('');
      setRestartCount(0);
      setLastRestartTime(null);
      
      const success = startRealTimeTranscription();
      
      if (!success) {
        setIsRecording(false);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setTranscript('');
      recognitionRef.current?.stop();
      clearWatchdog();
      return false;
    }
  }, [isAvailable, startRealTimeTranscription, clearWatchdog]);

  const stopRecording = useCallback(() => {
    isIntentionalStopRef.current = true;
    setIsRecording(false);
    clearWatchdog();
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        addAuditLog('stop', 'User initiated');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    
    // Log final audit summary
    const sessionDuration = sessionStartTimeRef.current 
      ? new Date().getTime() - sessionStartTimeRef.current.getTime() 
      : 0;
    
    console.log('[WebSpeech] Session summary:', {
      duration: sessionDuration,
      restartCount,
      transcriptLength: transcript.length,
      auditLogs: auditLogRef.current?.length ?? 0
    });
  }, [clearWatchdog, addAuditLog, restartCount, transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
    setPartialTranscripts([]);
    lastTranscriptRef.current = '';
    confidenceAccumulatorRef.current = [];
    setConfidence(0);
  }, []);

  return {
    isRecording,
    transcript,
    isAvailable,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    restartCount,
    lastRestartTime,
    isListening,
    confidence,
    language,
    setLanguage,
    partialTranscripts,
  };
};
