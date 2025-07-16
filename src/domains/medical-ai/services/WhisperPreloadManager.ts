import type { Pipeline } from '@xenova/transformers';

export type PreloadStatus = 'idle' | 'loading' | 'loaded' | 'failed';

interface PreloadState {
  status: PreloadStatus;
  progress: number;
  error: Error | null;
  model: Pipeline | null;
  hasShownSuccessToast?: boolean;
}

type StatusListener = (state: PreloadState) => void;

class WhisperPreloadManager {
  private static instance: WhisperPreloadManager;
  private state: PreloadState = {
    status: 'idle',
    progress: 0,
    error: null,
    model: null,
    hasShownSuccessToast: false,
  };
  private listeners: Set<StatusListener> = new Set();
  private loadPromise: Promise<Pipeline> | null = null;
  private initializationPromise: Promise<void> | null = null;
  private idleCallbackId: number | null = null;
  private hasInitialized = false;

  private constructor() {}

  static getInstance(): WhisperPreloadManager {
    if (!WhisperPreloadManager.instance) {
      WhisperPreloadManager.instance = new WhisperPreloadManager();
    }
    return WhisperPreloadManager.instance;
  }

  // Subscribe to status changes
  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    // Immediately notify of current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateState(updates: Partial<PreloadState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState(): PreloadState {
    return { ...this.state };
  }

  // Initialize preloading when browser is idle
  initializePreload(options?: { 
    delay?: number; 
    priority?: 'high' | 'low' | 'auto';
  }): void {
    // Don't initialize if already loaded or currently loading
    if (this.state.status === 'loaded' || this.state.status === 'loading') {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WhisperPreloadManager] Skipping initialization - status: ${this.state.status}`);
      }
      return;
    }
    
    // Return if already initializing or initialized
    if (this.initializationPromise || this.hasInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WhisperPreloadManager] Already ${this.initializationPromise ? 'initializing' : 'initialized'}`);
      }
      return;
    }
    
    // Create initialization promise to prevent concurrent initializations
    this.initializationPromise = this.performInitialization(options);
  }

  private async performInitialization(options?: { 
    delay?: number; 
    priority?: 'high' | 'low' | 'auto';
  }): Promise<void> {
    this.hasInitialized = true;
    const { delay = 2000, priority = 'auto' } = options || {};

    // If high priority, start immediately
    if (priority === 'high') {
      await this.startPreload();
      return;
    }

    // Otherwise, wait for idle time
    await new Promise<void>((resolve) => {
      if ('requestIdleCallback' in window) {
        this.idleCallbackId = window.requestIdleCallback(
          () => {
            // Additional delay to ensure page is fully loaded
            setTimeout(async () => {
              if (priority === 'auto' && this.shouldPreload()) {
                await this.startPreload();
              } else if (priority === 'low') {
                await this.startPreload();
              }
              resolve();
            }, delay);
          },
          { timeout: 10000 } // Max wait 10 seconds
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(async () => {
          if (this.shouldPreload()) {
            await this.startPreload();
          }
          resolve();
        }, delay + 3000);
      }
    });
  }

  // Check if we should preload based on device capabilities
  private shouldPreload(): boolean {
    // Check connection type
    const connection = (navigator as any).connection;
    if (connection) {
      // Don't preload on slow connections
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        console.log('🚫 Skipping Whisper preload: slow connection detected');
        return false;
      }
    }

    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory < 4) {
      console.log('🚫 Skipping Whisper preload: low memory device');
      return false;
    }

    // Check if on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // On mobile, be more conservative
    if (isMobile && (!connection || connection.effectiveType !== '4g')) {
      console.log('🚫 Skipping Whisper preload: mobile device without 4G');
      return false;
    }

    return true;
  }

  // Start the actual preload process
  private async startPreload(): Promise<void> {
    if (this.state.status === 'loading' || this.state.status === 'loaded') {
      return;
    }

    console.log('🎯 Starting Whisper model preload...');
    this.updateState({ status: 'loading', progress: 0, error: null });

    try {
      this.loadPromise = this.loadModel();
      const model = await this.loadPromise;
      
      this.updateState({
        status: 'loaded',
        progress: 100,
        model,
      });
      
      console.log('✅ Whisper model preloaded successfully');
    } catch (error) {
      console.error('❌ Failed to preload Whisper model:', error);
      this.updateState({
        status: 'failed',
        error: error as Error,
      });
      this.loadPromise = null;
    }
  }

  // Load the model with progress tracking
  private async loadModel(): Promise<Pipeline> {
    const { pipeline } = await import('@xenova/transformers');
    
    const model = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base',
      {
        progress_callback: (progress: { progress: number }) => {
          if (progress?.progress) {
            this.updateState({ progress: Math.round(progress.progress) });
          }
        },
      }
    );

    return model;
  }

  // Force preload (for manual trigger)
  async forcePreload(): Promise<Pipeline | null> {
    if (this.state.status === 'loaded' && this.state.model) {
      return this.state.model;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    await this.startPreload();
    return this.state.model;
  }

  // Get preloaded model if available
  getModel(): Pipeline | null {
    return this.state.model;
  }

  // Mark success toast as shown
  markSuccessToastShown(): void {
    this.updateState({ hasShownSuccessToast: true });
  }

  // Check if success toast was already shown
  hasShownSuccessToast(): boolean {
    return this.state.hasShownSuccessToast || false;
  }

  // Cancel ongoing preload
  cancel(): void {
    if (this.idleCallbackId !== null) {
      window.cancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }
    
    // Note: We can't actually cancel the model loading once started
    // but we can prevent it from starting
    if (this.state.status === 'idle') {
      this.hasInitialized = false;
    }
  }

  // Reset the manager (useful for testing)
  reset(): void {
    this.cancel();
    this.state = {
      status: 'idle',
      progress: 0,
      error: null,
      model: null,
      hasShownSuccessToast: false,
    };
    this.loadPromise = null;
    this.initializationPromise = null;
    this.hasInitialized = false;
    this.notifyListeners();
  }
}

// Export singleton instance
export const whisperPreloadManager = WhisperPreloadManager.getInstance();