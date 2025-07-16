/**
 * Unified Whisper Model Manager
 * =============================
 * 
 * This service ensures the Whisper model is loaded only once across the entire application,
 * regardless of page reloads or route changes. It coordinates between:
 * 
 * 1. Worker-based model (for audio processing)
 * 2. Direct model (for preloading/non-worker usage)
 * 3. Browser caching (IndexedDB)
 * 4. Memory caching (global variables)
 */

import { whisperModelCache } from './whisperModelCache';
import { whisperPreloadManager } from './WhisperPreloadManager';
import { configureTransformers } from '../config/transformersConfig';

// Global initialization tracking
declare global {
  var __WHISPER_MANAGER_INITIALIZED__: boolean | undefined;
  var __WHISPER_INIT_TIMESTAMP__: number | undefined;
}

export class WhisperModelManager {
  private static instance: WhisperModelManager;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): WhisperModelManager {
    if (!WhisperModelManager.instance) {
      WhisperModelManager.instance = new WhisperModelManager();
    }
    return WhisperModelManager.instance;
  }
  
  /**
   * Initialize the Whisper model system
   * This should be called once at app startup
   */
  async initialize(): Promise<void> {
    // Check if already initialized
    if (typeof window !== 'undefined' && global.__WHISPER_MANAGER_INITIALIZED__) {
      const timeSinceInit = Date.now() - (global.__WHISPER_INIT_TIMESTAMP__ || 0);
      console.log(`[WhisperManager] Already initialized ${Math.round(timeSinceInit / 1000)}s ago`);
      return;
    }
    
    console.log('[WhisperManager] Starting initialization...');
    
    // Mark as initialized
    if (typeof window !== 'undefined') {
      global.__WHISPER_MANAGER_INITIALIZED__ = true;
      global.__WHISPER_INIT_TIMESTAMP__ = Date.now();
    }
    
    try {
      // 1. Configure transformers for caching
      await configureTransformers();
      
      // 2. Check if model is already in worker cache
      if (whisperModelCache.isModelLoaded()) {
        console.log('[WhisperManager] Model already loaded in worker cache');
        return;
      }
      
      // 3. Check if model is in preload manager
      const preloadState = whisperPreloadManager.getState();
      if (preloadState.status === 'loaded') {
        console.log('[WhisperManager] Model already loaded in preload manager');
        return;
      }
      
      // 4. Initialize preloading (will handle its own caching)
      whisperPreloadManager.initializePreload({
        priority: 'auto',
        delay: 2000
      });
      
      console.log('[WhisperManager] Initialization complete');
    } catch (error) {
      console.error('[WhisperManager] Failed to initialize:', error);
      // Reset initialization flag on error
      if (typeof window !== 'undefined') {
        global.__WHISPER_MANAGER_INITIALIZED__ = false;
      }
      throw error;
    }
  }
  
  /**
   * Get the worker instance (for audio processing)
   */
  async getWorker(): Promise<Worker> {
    return whisperModelCache.getWorker();
  }
  
  /**
   * Check if any model is loaded
   */
  isModelLoaded(): boolean {
    // Check worker cache
    if (whisperModelCache.isModelLoaded()) {
      return true;
    }
    
    // Check preload manager
    const preloadState = whisperPreloadManager.getState();
    return preloadState.status === 'loaded';
  }
  
  /**
   * Get model loading status
   */
  getStatus(): {
    workerLoaded: boolean;
    preloadStatus: 'idle' | 'loading' | 'loaded' | 'failed';
    initialized: boolean;
  } {
    return {
      workerLoaded: whisperModelCache.isModelLoaded(),
      preloadStatus: whisperPreloadManager.getState().status,
      initialized: global.__WHISPER_MANAGER_INITIALIZED__ || false
    };
  }
  
  /**
   * Force preload the model
   */
  async forcePreload(): Promise<void> {
    await whisperPreloadManager.forcePreload();
  }
  
  /**
   * Reset everything (mainly for testing)
   */
  reset(): void {
    whisperModelCache.destroy();
    whisperPreloadManager.reset();
    
    if (typeof window !== 'undefined') {
      global.__WHISPER_MANAGER_INITIALIZED__ = false;
      global.__WHISPER_INIT_TIMESTAMP__ = undefined;
    }
  }
}

// Export singleton instance
export const whisperModelManager = WhisperModelManager.getInstance();