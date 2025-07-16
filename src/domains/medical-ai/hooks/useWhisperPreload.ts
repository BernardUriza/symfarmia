'use client';

import { useEffect, useState, useCallback } from 'react';
import { whisperPreloadManager, PreloadStatus } from '../services/WhisperPreloadManager';
import type { Pipeline } from '@xenova/transformers';

interface UseWhisperPreloadOptions {
  autoInit?: boolean;
  priority?: 'high' | 'low' | 'auto';
  delay?: number;
}

interface UseWhisperPreloadReturn {
  status: PreloadStatus;
  progress: number;
  error: Error | null;
  model: Pipeline | null;
  isLoading: boolean;
  isLoaded: boolean;
  isFailed: boolean;
  forcePreload: () => Promise<void>;
  cancel: () => void;
}

export function useWhisperPreload(options: UseWhisperPreloadOptions = {}): UseWhisperPreloadReturn {
  const { autoInit = true, priority = 'auto', delay = 2000 } = options;
  
  const [state, setState] = useState(() => whisperPreloadManager.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = whisperPreloadManager.subscribe(setState);

    // Auto-initialize if requested
    if (autoInit) {
      whisperPreloadManager.initializePreload({ delay, priority });
    }

    return unsubscribe;
  }, [autoInit, delay, priority]);

  const forcePreload = useCallback(async () => {
    await whisperPreloadManager.forcePreload();
  }, []);

  const cancel = useCallback(() => {
    whisperPreloadManager.cancel();
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    error: state.error,
    model: state.model,
    isLoading: state.status === 'loading',
    isLoaded: state.status === 'loaded',
    isFailed: state.status === 'failed',
    forcePreload,
    cancel,
  };
}