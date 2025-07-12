/**
 * Transcription Hook
 * 
 * React hook for medical transcription functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { transcriptionService } from '../services/transcriptionService';
import {
  TranscriptionResult,
  TranscriptionStatus,
  AudioConfig
} from '../types';
import { useMemo } from 'react';

interface UseTranscriptionProps {
  autoStart?: boolean;
  realTimeUpdates?: boolean;
  medicalOptimization?: boolean;
  audioConfig?: Partial<AudioConfig>;
}

interface UseTranscriptionReturn {
  // State
  transcription: TranscriptionResult | null;
  status: TranscriptionStatus;
  isRecording: boolean;
  error: string | null;
  
  // Actions
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  pauseTranscription: () => void;
  resumeTranscription: () => void;
  
  // Utilities
  resetTranscription: () => void;
  enhanceTranscription: () => Promise<void>;
  getTranscriptionText: () => string;
}

export const useTranscription = (props: UseTranscriptionProps = {}): UseTranscriptionReturn => {
  const {
    autoStart = false,
    realTimeUpdates = true,
    medicalOptimization = true,
    audioConfig: customAudioConfig = {}
  } = props;

  // State
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const transcriptionRef = useRef<TranscriptionResult | null>(null);
  const statusRef = useRef<TranscriptionStatus>(TranscriptionStatus.IDLE);

  // Default audio configuration with medical optimization
  const defaultAudioConfig: AudioConfig = useMemo(() => ({
    sampleRate: 44100,
    channels: 1,
    bitDepth: 16,
    format: 'webm', // Assuming 'format' is of type string in AudioConfig
    noiseReduction: true,
    medicalOptimization,
    realTimeProcessing: true,
    maxDuration: 3600,
    ...customAudioConfig
  }), [medicalOptimization, customAudioConfig]);

  // Update refs when state changes
  useEffect(() => {
    transcriptionRef.current = transcription;
    statusRef.current = status;
  }, [transcription, status]);

  // Auto-start transcription if enabled
  useEffect(() => {
    if (autoStart && status === TranscriptionStatus.IDLE) {
      startTranscription();
    }
  }, [autoStart]);

  /**
   * Start transcription
   */
  const startTranscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setStatus(TranscriptionStatus.RECORDING);
      setIsRecording(true);
      setIsPaused(false);

      // Real-time update callback
      const onTranscriptionUpdate = realTimeUpdates 
        ? (result: TranscriptionResult) => {
            setTranscription(result);
            setStatus(result.status || TranscriptionStatus.PROCESSING);
          }
        : undefined;

      const response = await transcriptionService.startTranscription(
        defaultAudioConfig,
        onTranscriptionUpdate
      );

      if (response.success && response.data) {
        setTranscription(response.data);
        return true;
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to start transcription');
        setStatus(TranscriptionStatus.ERROR);
        setIsRecording(false);
        return false;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus(TranscriptionStatus.ERROR);
      setIsRecording(false);
      return false;
    }
  }, [defaultAudioConfig, realTimeUpdates]);

  /**
   * Stop transcription
   */
  const stopTranscription = useCallback(async (): Promise<boolean> => {
    try {
      setStatus(TranscriptionStatus.PROCESSING);
      setIsRecording(false);

      const response = await transcriptionService.stopTranscription();

      if (response.success && response.data) {
        setTranscription(response.data);
        setStatus(TranscriptionStatus.COMPLETED);
        return true;
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to stop transcription');
        setStatus(TranscriptionStatus.ERROR);
        return false;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus(TranscriptionStatus.ERROR);
      return false;
    }
  }, []);

  /**
   * Pause transcription (keep recording but pause processing)
   */
  const pauseTranscription = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      // In a real implementation, this would pause the transcription service
      console.log('Transcription paused');
    }
  }, [isRecording, isPaused]);

  /**
   * Resume transcription
   */
  const resumeTranscription = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      // In a real implementation, this would resume the transcription service
      console.log('Transcription resumed');
    }
  }, [isRecording, isPaused]);

  /**
   * Reset transcription state
   */
  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus(TranscriptionStatus.IDLE);
    setIsRecording(false);
    setError(null);
    setIsPaused(false);
  }, []);

  /**
   * Enhance transcription with medical terminology
   */
  const enhanceTranscription = useCallback(async (): Promise<void> => {
    if (!transcription) {
      setError('No transcription to enhance');
      return;
    }

    try {
      setStatus(TranscriptionStatus.PROCESSING);

      const response = await transcriptionService.enhanceWithMedicalTerms(transcription);

      if (response.success && response.data) {
        setTranscription(response.data);
        setStatus(TranscriptionStatus.COMPLETED);
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to enhance transcription');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, [transcription]);

  /**
   * Get current transcription text
   */
  const getTranscriptionText = useCallback((): string => {
    return transcription?.text || '';
  }, [transcription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopTranscription();
      }
    };
  }, []);

  return {
    // State
    transcription,
    status,
    isRecording,
    error,
    
    // Actions
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    
    // Utilities
    resetTranscription,
    enhanceTranscription,
    getTranscriptionText
  };
};

export default useTranscription;