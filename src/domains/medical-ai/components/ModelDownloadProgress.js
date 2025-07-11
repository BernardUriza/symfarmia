/**
 * ModelDownloadProgress Component
 * 
 * Progress indicator for Whisper model downloads with caching information
 */

import React, { useState, useEffect } from 'react';

const ModelDownloadProgress = ({ 
  isVisible = false, 
  progress = 0, 
  message = '', 
  modelName = '', 
  onCancel = null,
  onComplete = null 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now());
    }
  }, [isVisible, startTime]);

  useEffect(() => {
    if (startTime && progress > 0) {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      const speed = progress / elapsed;
      const remaining = speed > 0 ? (1 - progress) / speed : 0;
      
      setDownloadSpeed(speed);
      setTimeRemaining(remaining);
    }
  }, [progress, startTime]);

  useEffect(() => {
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatSpeed = (progressPerSecond) => {
    const percentPerSecond = progressPerSecond * 100;
    return `${percentPerSecond.toFixed(1)}%/s`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Downloading Medical AI Model
          </h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Cancel download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {modelName}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {message || 'Downloading model...'}
          </p>
          
          {progress > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Speed: {formatSpeed(downloadSpeed)}</span>
              {timeRemaining > 0 && (
                <span>ETA: {formatTime(timeRemaining)}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Cached for future use
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="font-mono">{modelName}</span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-mono">{Math.round(progress * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="font-mono">{formatSpeed(downloadSpeed)}</span>
              </div>
              {timeRemaining > 0 && (
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-gray-600">
                This model will be cached in your browser for instant loading in future sessions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelDownloadProgress;