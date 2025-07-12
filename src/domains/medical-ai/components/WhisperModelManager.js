/**
 * WhisperModelManager Component
 * 
 * Management interface for Whisper models with caching features
 */

import React, { useState, useEffect } from 'react';
import { WhisperWASMEngine } from '../services/WhisperWASMEngine';
import { useModelDownload } from '../hooks/useModelDownload';

// Storage quota check helper
const checkStorageQuota = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { quota: 0, usage: 0, available: 0 };
  }
  try {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
      available: (estimate.quota || 0) - (estimate.usage || 0)
    };
  } catch (error) {
    console.error('Failed to check storage quota:', error);
    return { quota: 0, usage: 0, available: 0 };
  }
};

const WhisperModelManager = ({ onModelReady = null }) => {
  const [engine, setEngine] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState('base.en');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  const { downloadState, startDownload, createEngineCallbacks, resetDownload } = useModelDownload();

  // Available models (matching what's in public/models folder)
  const models = [
    { name: 'base', size: 148, description: 'Base multilingual model' },
    { name: 'base.en', size: 148, description: 'Base English-only model' }
  ];

  // Initialize engine when component mounts
  useEffect(() => {
    const initEngine = async () => {
      try {
        const whisperEngine = new WhisperWASMEngine({
          modelName: selectedModel,
          modelPath: `/models/ggml-${selectedModel}.bin`,
          language: 'es',
          medicalMode: true
        });
        
        setEngine(whisperEngine);
        
        // Get storage info
        const info = await checkStorageQuota();
        setStorageInfo(info);
        
      } catch (err) {
        console.error('Failed to initialize engine:', err);
        setError(err.message);
      }
    };

    initEngine();
  }, [selectedModel]);

  // Load model with progress tracking
  const loadModel = async () => {
    if (!engine) return;

    try {
      setIsInitializing(true);
      setError(null);
      startDownload(selectedModel);

      // Create callbacks for progress tracking
      const callbacks = createEngineCallbacks();
      
      // Store callbacks in a session-like object for the engine
      engine.currentSession = { callbacks };
      
      await engine.initialize();
      
      // Update storage info after successful load
      const info = await checkStorageQuota();
      setStorageInfo(info);
      
      if (onModelReady) {
        onModelReady(engine);
      }
      
    } catch (err) {
      console.error('Failed to load model:', err);
      setError(err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const deleteReq = indexedDB.deleteDatabase('whisper-models-cache');
      deleteReq.onsuccess = () => {
        console.log('Cache cleared successfully');
        checkStorageQuota().then(setStorageInfo);
      };
      deleteReq.onerror = () => {
        console.error('Failed to clear cache');
        setError('Failed to clear cache');
      };
    } catch (err) {
      console.error('Failed to clear cache:', err);
      setError(err.message);
    }
  };

  // Cancel download
  const cancelDownload = () => {
    resetDownload();
    setIsInitializing(false);
    if (engine) {
      engine.currentSession = null;
    }
  };

  const formatSize = (mb) => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Whisper Model Manager
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isInitializing}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {models.map(model => (
              <option key={model.name} value={model.name}>
                {model.name} ({formatSize(model.size)}) - {model.description}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Information */}
        {storageInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Storage Information</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Used:</span>
                <span className="ml-2 font-mono">{Math.round(storageInfo.usage / 1024 / 1024)}MB</span>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>
                <span className="ml-2 font-mono">{Math.round(storageInfo.available / 1024 / 1024)}MB</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <span className="ml-2 font-mono">{Math.round(storageInfo.quota / 1024 / 1024)}MB</span>
              </div>
            </div>
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={loadModel}
            disabled={isInitializing}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isInitializing ? 'Loading...' : 'Load Model'}
          </button>
          
          <button
            onClick={clearCache}
            disabled={isInitializing}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Cache
          </button>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Usage Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select a model based on your accuracy and performance needs</li>
            <li>• Models are downloaded once and cached for future use</li>
            <li>• Larger models provide better accuracy but take longer to load</li>
            <li>• For medical transcription, we recommend 'base.en' or larger models</li>
            <li>• Clear cache if you need to free up storage space</li>
          </ul>
        </div>
      </div>

      {/* Download Progress */}
      {downloadState.isDownloading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Downloading Model</h3>
            <p className="text-sm text-gray-600 mb-2">{downloadState.modelName}</p>
            <p className="text-sm text-gray-500 mb-4">{downloadState.message}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadState.progress * 100}%` }}
              />
            </div>
            <p className="text-center text-sm font-medium">{Math.round(downloadState.progress * 100)}%</p>
            <button
              onClick={cancelDownload}
              className="mt-4 w-full py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhisperModelManager;