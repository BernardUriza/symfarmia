"use client";
import { useEffect, useState } from 'react';
import { whisperModelCache } from '../services/whisperModelCache';

/**
 * WhisperPreloaderGlobal Component
 *
 * Preloads the Xenova Whisper model once globally and maintains it in cache.
 * Should be included once in the application (e.g., in the dashboard layout).
 */
export default function WhisperPreloaderGlobal() {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    // Check if model is already loaded
    if (whisperModelCache.isModelLoaded()) {
      setLoadingState('loaded');
      setProgress(100);
      return;
    }

    // Start loading
    setLoadingState('loading');
    
    const cleanup = whisperModelCache.addMessageListener((event) => {
      if (!mounted) return;
      
      if (event.data.type === 'MODEL_LOADING') {
        setProgress(event.data.progress || 0);
      } else if (event.data.type === 'MODEL_READY') {
        setLoadingState('loaded');
        setProgress(100);
      } else if (event.data.type === 'ERROR') {
        setLoadingState('error');
        console.error('Error cargando modelo Whisper:', event.data.error);
      }
    });

    // Initialize the worker and model
    whisperModelCache.getWorker()
      .then(() => {
        if (mounted && whisperModelCache.isModelLoaded()) {
          setLoadingState('loaded');
          setProgress(100);
        }
      })
      .catch((error) => {
        if (mounted) {
          setLoadingState('error');
          console.error('Error inicializando worker:', error);
        }
      });

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  // Show UI during loading or error
  if (loadingState === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600">
            Cargando modelo Whisper... {Math.round(progress)}%
          </span>
        </div>
        <div className="mt-2 w-48 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="fixed bottom-4 right-4 p-3 bg-red-50 rounded-lg shadow-lg border border-red-200 z-50">
        <div className="flex items-center gap-3">
          <div className="text-red-500">⚠️</div>
          <span className="text-sm text-red-600">
            Error cargando modelo. Recarga la página.
          </span>
        </div>
      </div>
    );
  }

  return null;
}