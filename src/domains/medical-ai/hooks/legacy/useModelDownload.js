/**
 * useModelDownload Hook
 * 
 * React hook for managing Whisper model downloads with progress tracking
 */

import { useState, useCallback } from 'react';

export const useModelDownload = () => {
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    progress: 0,
    message: '',
    modelName: '',
    error: null,
    isComplete: false
  });

  const resetDownload = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      progress: 0,
      message: '',
      modelName: '',
      error: null,
      isComplete: false
    });
  }, []);

  const startDownload = useCallback((modelName) => {
    setDownloadState({
      isDownloading: true,
      progress: 0,
      message: 'Initializing download...',
      modelName: modelName,
      error: null,
      isComplete: false
    });
  }, []);

  const updateProgress = useCallback((progress, message) => {
    setDownloadState(prev => ({
      ...prev,
      progress: progress,
      message: message || prev.message
    }));
  }, []);

  const completeDownload = useCallback(() => {
    setDownloadState(prev => ({
      ...prev,
      isDownloading: false,
      progress: 1,
      message: 'Model loaded successfully!',
      isComplete: true
    }));
  }, []);

  const errorDownload = useCallback((error) => {
    setDownloadState(prev => ({
      ...prev,
      isDownloading: false,
      error: error,
      message: `Download failed: ${error.message}`
    }));
  }, []);

  // Create callbacks for WhisperWASMEngine
  const createEngineCallbacks = useCallback(() => {
    return {
      onProgress: (progressData) => {
        if (progressData.stage === 'model_loading') {
          updateProgress(progressData.progress, progressData.message);
        }
      },
      onMessage: (messageData) => {
        if (messageData.stage === 'model_loading') {
          setDownloadState(prev => ({
            ...prev,
            message: messageData.message
          }));
        }
      },
      onError: (error) => {
        errorDownload(error);
      }
    };
  }, [updateProgress, errorDownload]);

  return {
    downloadState,
    resetDownload,
    startDownload,
    updateProgress,
    completeDownload,
    errorDownload,
    createEngineCallbacks
  };
};