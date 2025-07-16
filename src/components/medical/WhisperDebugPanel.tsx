'use client';

import { useEffect, useState } from 'react';
import { whisperModelManager } from '@/src/domains/medical-ai/services/WhisperModelManager';
import { whisperModelCache } from '@/src/domains/medical-ai/services/whisperModelCache';
import { whisperPreloadManager } from '@/src/domains/medical-ai/services/WhisperPreloadManager';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';

export function WhisperDebugPanel() {
  const [status, setStatus] = useState(() => whisperModelManager.getStatus());
  const [preloadState, setPreloadState] = useState(() => whisperPreloadManager.getState());
  const [globalVars, setGlobalVars] = useState({});
  
  // Test the unified hook
  const {
    engineStatus,
    preloadStatus,
    preloadProgress, // eslint-disable-line @typescript-eslint/no-unused-vars
    isPreloaded,
    loadProgress
  } = useSimpleWhisper({ 
    autoPreload: false,
    processingMode: 'direct',
    showPreloadStatus: true
  });
  
  useEffect(() => {
    // Update status every second
    const intervalId = setInterval(() => {
      setStatus(whisperModelManager.getStatus());
      setPreloadState(whisperPreloadManager.getState());
      
      // Check global variables
      if (typeof window !== 'undefined') {
        setGlobalVars({
          __WHISPER_WORKER_INSTANCE__: !!global.__WHISPER_WORKER_INSTANCE__,
          __WHISPER_MODEL_LOADED__: !!global.__WHISPER_MODEL_LOADED__,
          __WHISPER_LOADING_PROMISE__: !!global.__WHISPER_LOADING_PROMISE__,
          __WHISPER_MODEL_CACHE__: !!global.__WHISPER_MODEL_CACHE__,
          __WHISPER_PRELOAD_STATE__: !!global.__WHISPER_PRELOAD_STATE__,
          __WHISPER_HAS_INITIALIZED__: !!global.__WHISPER_HAS_INITIALIZED__,
          __WHISPER_COMPONENT_INITIALIZED__: !!global.__WHISPER_COMPONENT_INITIALIZED__,
          __WHISPER_MANAGER_INITIALIZED__: !!global.__WHISPER_MANAGER_INITIALIZED__,
          __WHISPER_INIT_TIMESTAMP__: global.__WHISPER_INIT_TIMESTAMP__
        });
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-xs font-mono">
      <h3 className="text-sm font-bold mb-2">🏥 Medical AI Status</h3>
      <div className="text-[10px] text-gray-400 mb-2">📋 Symfarmia Medical Workflow</div>
      
      <div className="space-y-2">
        <div>
          <strong>Manager Status:</strong>
          <ul className="ml-4">
            <li>Initialized: {status.initialized ? '✅' : '❌'}</li>
            <li>Worker Loaded: {status.workerLoaded ? '✅' : '❌'}</li>
            <li>Preload: {status.preloadStatus}</li>
          </ul>
        </div>
        
        <div>
          <strong>Preload State:</strong>
          <ul className="ml-4">
            <li>Status: {preloadState.status}</li>
            <li>Progress: {preloadState.progress}%</li>
            <li>Has Model: {preloadState.model ? '✅' : '❌'}</li>
            <li>Toast Shown: {preloadState.hasShownSuccessToast ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div>
          <strong>Global Variables:</strong>
          <ul className="ml-4 text-[10px]">
            {Object.entries(globalVars).map(([key, value]) => (
              <li key={key}>
                {key}: {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <strong>Unified Hook Status:</strong>
          <ul className="ml-4">
            <li>Engine Status: {engineStatus}</li>
            <li>Preload Status: {preloadStatus}</li>
            <li>Is Preloaded: {isPreloaded ? '✅' : '❌'}</li>
            <li>Progress: {loadProgress}%</li>
          </ul>
        </div>
        
        <div>
          <strong>Medical AI Status:</strong>
          <ul className="ml-4">
            <li>Transcription Ready: {whisperModelCache.isModelLoaded() ? '✅' : '❌'}</li>
            <li>Medical Terms Engine: {whisperModelManager.isModelLoaded() ? '✅' : '❌'}</li>
            <li>Workflow Continuity: {whisperModelCache.isModelLoaded() ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => whisperModelManager.forcePreload()}
          className="px-2 py-1 bg-blue-600 rounded text-[10px] hover:bg-blue-700"
        >
          Force Load
        </button>
        <button
          onClick={() => {
            whisperModelManager.reset();
            window.location.reload();
          }}
          className="px-2 py-1 bg-red-600 rounded text-[10px] hover:bg-red-700"
        >
          Reset & Reload
        </button>
      </div>
    </div>
  );
}