/**
 * TranscriptionEngineSelector
 * 
 * Intelligent transcription engine selection with automatic fallback
 * Prioritizes working engines and handles graceful degradation
 */

import { TranscriptionStatus } from '../types';
import {
  TranscriptionEngine,
  TranscriptionEngineConfig,
  InitializationResult,
  TranscriptionResult,
  TranscriptionCallbacks,
  AudioData,
  EngineStats,
  MedicalContext,
  EngineSwitchEvent
} from '../types/transcription-engines';

interface EngineSelectorConfig extends TranscriptionEngineConfig {
  preferredEngine?: string;
  fallbackOrder?: string[];
  testTimeout?: number;
  cacheResults?: boolean;
}

interface EngineStatus {
  loaded: boolean;
  tested: boolean;
  available?: boolean;
  error?: string;
  initResult?: InitializationResult;
}

interface AvailableEngine {
  name: string;
  priority: number;
  status: EngineStatus;
}

export class TranscriptionEngineSelector {
  private config: EngineSelectorConfig;
  private engines: Map<string, TranscriptionEngine>;
  private engineStatus: Map<string, EngineStatus>;
  private currentEngine: string | null;
  private isInitialized: boolean;
  private initializationPromise: Promise<InitializationResult> | null;

  constructor(config: EngineSelectorConfig = {}) {
    this.config = {
      preferredEngine: config.preferredEngine || 'auto',
      fallbackOrder: config.fallbackOrder || [
        'web-speech',     // Fastest, most reliable
        'whisper-client', // Client-side AI
        'whisper-wasm',   // WebAssembly fallback
        'openai-whisper'  // API-based last resort
      ],
      testTimeout: config.testTimeout || 5000,
      cacheResults: config.cacheResults !== false,
      medicalMode: config.medicalMode || true,
      ...config
    };

    this.engines = new Map();
    this.engineStatus = new Map();
    this.currentEngine = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize the engine selector
   */
  async initialize(): Promise<InitializationResult> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<InitializationResult> {
    try {
      // Initializing TranscriptionEngineSelector...
      
      // Import all available engines
      await this.loadEngines();
      
      // Test engines in parallel for faster initialization
      await this.testEnginesParallel();
      
      // Select the best available engine
      this.currentEngine = await this.selectBestEngine();
      
      if (!this.currentEngine) {
        throw new Error('No working transcription engines available');
      }
      
      this.isInitialized = true;
      console.log(`✓ TranscriptionEngineSelector ready: ${this.currentEngine}`);
      
      return {
        success: true,
        message: `Engine selected: ${this.currentEngine?.constructor.name || 'none'}`
      };
      
    } catch (error) {
      console.error('Failed to initialize TranscriptionEngineSelector:', error);
      throw error;
    }
  }

  /**
   * Load all transcription engines
   */
  private async loadEngines(): Promise<void> {
    const engineLoaders: Record<string, () => Promise<TranscriptionEngine>> = {
      'web-speech': async () => {
        const { WebSpeechEngine } = await import('./WebSpeechEngine.js') as any;
        return new WebSpeechEngine(this.config);
      },
      'whisper-client': async () => {
        const { WhisperClientEngine } = await import('./WhisperClientEngine');
        return new WhisperClientEngine(this.config);
      },
      'whisper-wasm': async () => {
        const { WhisperWASMEngine } = await import('./WhisperWASMEngine');
        return new WhisperWASMEngine(this.config);
      },
      'openai-whisper': async () => {
        const { OpenAIWhisperBackend } = await import('./OpenAIWhisperBackend');
        return new OpenAIWhisperBackend(this.config);
      }
    };

    // Load engines in parallel
    const loadPromises = (this.config.fallbackOrder || []).map(async (engineName) => {
      try {
        if ((engineLoaders as any)[engineName]) {
          const engine = await (engineLoaders as any)[engineName]();
          this.engines.set(engineName, engine);
          this.engineStatus.set(engineName, { loaded: true, tested: false });
        }
      } catch (error) {
        // Failed to load engine
        this.engineStatus.set(engineName, { 
          loaded: false, 
          tested: false, 
          error: (error as Error).message 
        });
      }
    });

    await Promise.allSettled(loadPromises);
  }

  /**
   * Test engines in parallel for availability
   */
  private async testEnginesParallel(): Promise<void> {
    const testPromises = Array.from(this.engines.entries()).map(async ([name, engine]) => {
      try {
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), this.config.testTimeout)
        );
        
        const initResult = await Promise.race([
          engine.initialize(),
          timeout
        ]);
        
        // Check if initialization was successful
        const isReady = (initResult as InitializationResult)?.success || (await engine.isReady());
        
        const currentStatus = this.engineStatus.get(name) || { loaded: true, tested: false };
        this.engineStatus.set(name, {
          ...currentStatus,
          tested: true,
          available: isReady,
          initResult: initResult as InitializationResult
        });
        
        if (isReady) {
          // Engine available
        } else {
          // Engine not available
        }
        
      } catch (error) {
        // Engine test failed
        this.engineStatus.set(name, {
          ...this.engineStatus.get(name) || {},
          tested: true,
          available: false,
          error: (error as Error).message
        } as EngineStatus);
      }
    });

    await Promise.allSettled(testPromises);
  }

  /**
   * Select the best available engine
   */
  private async selectBestEngine(): Promise<string | null> {
    // If preferred engine is specified and available, use it
    if (this.config.preferredEngine && this.config.preferredEngine !== 'auto') {
      const status = this.engineStatus.get(this.config.preferredEngine);
      if (status?.available) {
        return this.config.preferredEngine;
      }
    }

    // Otherwise, select first available engine from fallback order
    for (const engineName of (this.config.fallbackOrder || [])) {
      const status = this.engineStatus.get(engineName);
      if (status?.available) {
        return engineName;
      }
    }

    return null;
  }

  /**
   * Get current active engine
   */
  getActiveEngine(): TranscriptionEngine | null {
    if (!this.currentEngine || !this.engines.has(this.currentEngine)) {
      return null;
    }
    return this.engines.get(this.currentEngine) || null;
  }

  /**
   * Get list of available engines
   */
  getAvailableEngines(): AvailableEngine[] {
    const available: AvailableEngine[] = [];
    for (const [name, status] of this.engineStatus.entries()) {
      if (status.available) {
        available.push({
          name,
          priority: (this.config.fallbackOrder || []).indexOf(name),
          status
        });
      }
    }
    return available.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Switch to a different engine
   */
  async switchEngine(engineName: string): Promise<{success: boolean; previousEngine: string | null; currentEngine: string}> {
    const status = this.engineStatus.get(engineName);
    if (!status?.available) {
      throw new Error(`Engine ${engineName} is not available`);
    }

    const previousEngine = this.currentEngine;
    this.currentEngine = engineName;
    
    // Switched engines
    
    return {
      success: true,
      previousEngine,
      currentEngine: engineName
    };
  }

  /**
   * Try next available engine in fallback order
   */
  private async tryNextEngine(): Promise<boolean> {
    const currentIndex = (this.config.fallbackOrder || []).indexOf(this.currentEngine || '');
    
    for (let i = currentIndex + 1; i < (this.config.fallbackOrder || []).length; i++) {
      const engineName = (this.config.fallbackOrder || [])[i];
      const status = this.engineStatus.get(engineName);
      
      if (status?.available) {
        await this.switchEngine(engineName);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Start transcription with automatic fallback
   */
  async startTranscription(audioConfig?: any, callbacks: TranscriptionCallbacks = {}): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const wrappedCallbacks = this.wrapCallbacksWithFallback(callbacks);
    
    try {
      const engine = this.getActiveEngine();
      if (!engine) {
        throw new Error('No active engine available');
      }

      const result = await engine.startTranscription(audioConfig, wrappedCallbacks);
      
      return {
        ...result,
        engine: this.currentEngine || undefined
      };
      
    } catch (error) {
      console.error(`Engine ${this.currentEngine} failed to start:`, error);
      
      // Try fallback engines
      if (await this.tryNextEngine()) {
        return this.startTranscription(audioConfig, callbacks);
      }
      
      throw new Error('All transcription engines failed');
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription(): Promise<TranscriptionResult> {
    const engine = this.getActiveEngine();
    if (!engine) {
      throw new Error('No active engine');
    }

    try {
      const result = await engine.stopTranscription();
      return {
        ...result,
        engine: this.currentEngine || undefined
      };
    } catch (error) {
      console.error(`Failed to stop transcription on ${this.currentEngine}:`, error);
      throw error;
    }
  }

  /**
   * Process audio chunk with fallback
   */
  async processAudioChunk(audioData: AudioData, config?: any): Promise<TranscriptionResult> {
    const engine = this.getActiveEngine();
    if (!engine) {
      throw new Error('No active engine');
    }

    try {
      return await engine.processAudioChunk(audioData, config);
    } catch (error) {
      console.error(`Engine ${this.currentEngine} failed to process audio:`, error);
      
      // Try fallback
      if (await this.tryNextEngine()) {
        return this.processAudioChunk(audioData, config);
      }
      
      throw error;
    }
  }

  /**
   * Wrap callbacks to handle engine failures
   */
  private wrapCallbacksWithFallback(callbacks: TranscriptionCallbacks): TranscriptionCallbacks {
    return {
      ...callbacks,
      onError: async (error) => {
        // Engine error occurred
        
        // Call original error handler
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        
        // Try fallback if error is not recoverable
        if (!error.recoverable && await this.tryNextEngine()) {
          // Retrying with fallback engine
          
          // Notify about engine switch
          if (callbacks.onEngineSwitch) {
            callbacks.onEngineSwitch({
              previousEngine: (this.config.fallbackOrder || [])[
                (this.config.fallbackOrder || []).indexOf(this.currentEngine || '') - 1
              ],
              newEngine: this.currentEngine || '',
              reason: error
            });
          }
        }
      }
    };
  }

  /**
   * Get engine statistics
   */
  getStats(): any {
    const stats: any = {
      currentEngine: this.currentEngine,
      engineStatus: Object.fromEntries(this.engineStatus),
      availableEngines: this.getAvailableEngines().map(e => e.name),
      isInitialized: this.isInitialized
    };

    // Add current engine stats if available
    const engine = this.getActiveEngine();
    if (engine && typeof engine.getEngineStats === 'function') {
      stats.currentEngineStats = engine.getEngineStats();
    }

    return stats;
  }

  /**
   * Cleanup all engines
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.engines.values()).map(async (engine) => {
      try {
        if (typeof engine.cleanup === 'function') {
          await engine.cleanup();
        }
      } catch (error) {
        console.error('Engine cleanup error:', error);
      }
    });

    await Promise.allSettled(cleanupPromises);
    
    this.engines.clear();
    this.engineStatus.clear();
    this.currentEngine = null;
    this.isInitialized = false;
    
    // Cleanup completed
  }
}

export default TranscriptionEngineSelector;