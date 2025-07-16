"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { loadWhisperModel, transcribeAudio } from "../services/audioProcessingService";
import { extractMedicalTermsFromText } from "../utils/medicalTerms";
import { resampleTo16kHz, normalizeFloat32 } from "../utils/audioHelpers";
import { DefaultLogger } from "../utils/LoggerStrategy";
import { useWhisperPreload } from "./useWhisperPreload";

// This is an enhanced version that shows preload status
interface UseSimpleWhisperEnhancedReturn {
  // All the regular returns
  transcription: any;
  status: string;
  isRecording: boolean;
  error: string | null;
  engineStatus: string;
  loadProgress: number;
  audioLevel: number;
  recordingTime: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  preloadModel: () => Promise<void>;
  // Enhanced preload info
  preloadStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  preloadProgress: number;
  isPreloaded: boolean;
}

export function useSimpleWhisperEnhanced(options: any = {}): UseSimpleWhisperEnhancedReturn {
  // Get preload status
  const { 
    status: preloadStatus, 
    progress: preloadProgress,
    isLoaded: isPreloaded,
    forcePreload 
  } = useWhisperPreload({
    autoInit: true,
    priority: 'auto',
    delay: 2000
  });

  // All the original hook logic...
  const [transcription, setTranscription] = useState(null);
  const [status, setStatus] = useState("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState("loading");
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Update engine status based on preload
  useEffect(() => {
    if (isPreloaded) {
      setEngineStatus("ready");
      console.log("✨ Whisper model ready from preload!");
    } else if (preloadStatus === 'loading') {
      setEngineStatus("loading");
      setLoadProgress(preloadProgress);
    } else if (preloadStatus === 'failed') {
      setEngineStatus("error");
    }
  }, [isPreloaded, preloadStatus, preloadProgress]);

  // Modified preload function that works with preload manager
  const preloadModel = useCallback(async () => {
    if (isPreloaded) {
      console.log("✅ Model already preloaded");
      return;
    }

    try {
      setEngineStatus("loading");
      await forcePreload();
      setEngineStatus("ready");
    } catch (err) {
      setEngineStatus("error");
      setError("Error loading model");
      console.error("Error:", err);
    }
  }, [isPreloaded, forcePreload]);

  // ... rest of the original hook implementation ...
  
  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    loadProgress: isPreloaded ? 100 : loadProgress,
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    startTranscription: async () => { 
      // Implementation 
      return true; 
    },
    stopTranscription: async () => { 
      // Implementation
      return true; 
    },
    resetTranscription: () => {
      // Implementation
    },
    preloadModel,
    // Enhanced info
    preloadStatus,
    preloadProgress,
    isPreloaded,
  };
}