// Global cache for Whisper model to prevent multiple downloads
class WhisperModelCache {
  private static instance: WhisperModelCache;
  private modelLoaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;
  private worker: Worker | null = null;
  private listeners: Set<(event: MessageEvent) => void> = new Set();
  
  private constructor() {}
  
  static getInstance(): WhisperModelCache {
    if (!WhisperModelCache.instance) {
      WhisperModelCache.instance = new WhisperModelCache();
    }
    return WhisperModelCache.instance;
  }
  
  async getWorker(): Promise<Worker> {
    if (this.worker && this.modelLoaded) {
      return this.worker;
    }
    
    if (this.loadingPromise) {
      await this.loadingPromise;
      return this.worker!;
    }
    
    this.loadingPromise = this.initializeWorker();
    await this.loadingPromise;
    return this.worker!;
  }
  
  private async initializeWorker(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create worker only once
        if (!this.worker) {
          this.worker = new Worker(
            new URL('../workers/audioProcessingWorker.js', import.meta.url),
            { type: 'module' }
          );
          
          // Set up global message handler
          this.worker.onmessage = (event) => {
            // Handle model ready
            if (event.data.type === 'MODEL_READY') {
              this.modelLoaded = true;
              resolve();
            }
            
            // Forward to all listeners
            this.listeners.forEach(listener => listener(event));
          };
          
          // Initialize the model
          this.worker.postMessage({ type: 'INIT' });
        } else {
          // Worker already exists, just resolve
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  
  addMessageListener(listener: (event: MessageEvent) => void): () => void {
    this.listeners.add(listener);
    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  isModelLoaded(): boolean {
    return this.modelLoaded;
  }
  
  // Clean up method (for testing or manual cleanup)
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.modelLoaded = false;
    this.loadingPromise = null;
    this.listeners.clear();
  }
}

export const whisperModelCache = WhisperModelCache.getInstance();