/**
 * useTranscription - Hook for Web Speech API transcription with circuit breaker
 * 
 * Provides a React hook interface for the WebSpeechEngine
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { webSpeechEngine } from '../engines/WebSpeechEngine';

export interface TranscriptionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface TranscriptionError {
  error: string;
  recoverable: boolean;
  message: string;
}

export interface UseTranscriptionOptions {
  autoStart?: boolean;
  onTranscriptionUpdate?: (result: TranscriptionResult) => void;
  onError?: (error: TranscriptionError) => void;
  debug?: boolean;
}

export interface UseTranscriptionReturn {
  // State
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: TranscriptionError | null;
  engineState: any;
  
  // Actions
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => void;
  resetTranscription: () => void;
  
  // Manual mode
  isManualMode: boolean;
  manualTranscript: string;
  setManualTranscript: (text: string) => void;
  enableManualMode: () => void;
  disableManualMode: () => void;
}

export const useTranscription = (options: UseTranscriptionOptions = {}): UseTranscriptionReturn => {
  const { autoStart = false, onTranscriptionUpdate, onError, debug = false } = options;
  
  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<TranscriptionError | null>(null);
  const [engineState, setEngineState] = useState({});
  
  // Manual mode state
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  
  // Refs
  const finalTranscriptRef = useRef('');
  const debugIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update engine state for debugging
  useEffect(() => {
    if (debug) {
      debugIntervalRef.current = setInterval(() => {
        setEngineState(webSpeechEngine.getEngineState());
      }, 1000);
      
      return () => {
        if (debugIntervalRef.current) {
          clearInterval(debugIntervalRef.current);
        }
      };
    }
  }, [debug]);
  
  /**
   * Start transcription with engine reset
   */
  const startTranscription = useCallback(async (): Promise<boolean> => {
    console.log('[useTranscription] Starting transcription');
    
    // Reset state
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    
    // Ensure complete engine reset before starting
    webSpeechEngine.forceResetCircuitBreaker();
    
    const callbacks = {
      onStart: () => {
        console.log('[useTranscription] Transcription started');
        setIsListening(true);
      },
      
      onResult: (result: TranscriptionResult) => {
        if (debug) {
          console.log('[useTranscription] Result:', result);
        }
        
        if (result.isFinal) {
          // Append to final transcript
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + result.transcript;
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
        } else {
          // Update interim transcript
          setInterimTranscript(result.transcript);
        }
        
        // Callback with current full transcript
        onTranscriptionUpdate?.({
          ...result,
          transcript: finalTranscriptRef.current + (result.isFinal ? '' : ' ' + result.transcript)
        });
      },
      
      onError: (err: TranscriptionError) => {
        console.error('[useTranscription] Error:', err);
        setError(err);
        onError?.(err);
        
        // Enable manual mode on critical errors
        if (!err.recoverable) {
          setIsManualMode(true);
        }
      },
      
      onEnd: () => {
        console.log('[useTranscription] Transcription ended');
        setIsListening(false);
      }
    };
    
    try {
      const success = await webSpeechEngine.startTranscription(callbacks);
      
      if (!success) {
        // Enable manual mode if engine fails to start
        setIsManualMode(true);
      }
      
      return success;
    } catch (err) {
      console.error('[useTranscription] Failed to start:', err);
      setError({
        error: 'start-failed',
        recoverable: false,
        message: 'Error al iniciar la transcripción'
      });
      setIsManualMode(true);
      return false;
    }
  }, [onTranscriptionUpdate, onError, debug]);
  
  /**
   * Stop transcription
   */
  const stopTranscription = useCallback(() => {
    console.log('[useTranscription] Stopping transcription');
    webSpeechEngine.stopTranscription();
    setIsListening(false);
  }, []);
  
  /**
   * Reset transcription
   */
  const resetTranscription = useCallback(() => {
    console.log('[useTranscription] Resetting transcription');
    stopTranscription();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
    setManualTranscript('');
  }, [stopTranscription]);
  
  /**
   * Enable manual mode
   */
  const enableManualMode = useCallback(() => {
    console.log('[useTranscription] Enabling manual mode');
    stopTranscription();
    setIsManualMode(true);
    // Copy current transcript to manual field
    setManualTranscript(transcript);
  }, [stopTranscription, transcript]);
  
  /**
   * Disable manual mode
   */
  const disableManualMode = useCallback(() => {
    console.log('[useTranscription] Disabling manual mode');
    setIsManualMode(false);
    // Copy manual transcript back to main transcript
    if (manualTranscript) {
      setTranscript(manualTranscript);
      finalTranscriptRef.current = manualTranscript;
    }
  }, [manualTranscript]);
  
  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isListening && !isManualMode) {
      startTranscription();
    }
  }, [autoStart, isListening, isManualMode, startTranscription]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webSpeechEngine.stopTranscription();
      if (debugIntervalRef.current) {
        clearInterval(debugIntervalRef.current);
      }
    };
  }, []);
  
  // Update manual transcript to main transcript in real-time when in manual mode
  useEffect(() => {
    if (isManualMode && manualTranscript) {
      setTranscript(manualTranscript);
      onTranscriptionUpdate?.({
        transcript: manualTranscript,
        isFinal: true,
        confidence: 1.0
      });
    }
  }, [isManualMode, manualTranscript, onTranscriptionUpdate]);
  
  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    error,
    engineState,
    
    // Actions
    startTranscription,
    stopTranscription,
    resetTranscription,
    
    // Manual mode
    isManualMode,
    manualTranscript,
    setManualTranscript,
    enableManualMode,
    disableManualMode
  };
};

export default useTranscription;