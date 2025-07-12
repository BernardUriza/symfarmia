/**
 * TranscriptionFallbackChain
 * 
 * Automatically switches between WhisperWASM, WebSpeech, and mock transcription
 * when engines fail, maintaining continuity of medical transcription
 */

import { transcriptionEngineStateManager } from './TranscriptionEngineStateManager';

export class TranscriptionFallbackChain {
  constructor() {
    this.engines = [];
    this.currentEngineIndex = 0;
    this.currentEngine = null;
    this.isTranscribing = false;
    this.sessionConfig = null;
    this.callbacks = {};
    this.fallbackHistory = [];
    this.maxFallbackAttempts = 3;
    this.engineHealthScores = new Map();
  }

  /**
   * Register transcription engine in fallback chain
   */
  registerEngine(engine, priority = 100) {
    const engineEntry = {
      engine,
      priority,
      id: engine.constructor.name || `engine_${this.engines.length}`,
      failures: 0,
      lastFailure: null
    };

    this.engines.push(engineEntry);
    this.engines.sort((a, b) => a.priority - b.priority);
    
    // Initialize health score
    this.engineHealthScores.set(engineEntry.id, 100);
    
    // Register with state manager
    transcriptionEngineStateManager.registerEngine(engineEntry.id, 'idle');
    
    console.log(`Registered engine ${engineEntry.id} with priority ${priority}`);
  }

  /**
   * Initialize fallback chain
   */
  async initialize() {
    console.log('Initializing transcription fallback chain');
    
    // Try to initialize engines in priority order
    for (let i = 0; i < this.engines.length; i++) {
      const engineEntry = this.engines[i];
      
      try {
        transcriptionEngineStateManager.updateEngineState(engineEntry.id, 'initializing');
        
        if (engineEntry.engine.initialize) {
          await engineEntry.engine.initialize();
        }
        
        transcriptionEngineStateManager.updateEngineState(engineEntry.id, 'ready');
        
        // Set as current if it's the first ready engine
        if (!this.currentEngine) {
          this.currentEngine = engineEntry;
          this.currentEngineIndex = i;
        }
        
      } catch (error) {
        console.error(`Failed to initialize engine ${engineEntry.id}:`, error);
        transcriptionEngineStateManager.updateEngineState(engineEntry.id, 'error', {
          error: error.message
        });
        this.updateEngineHealth(engineEntry.id, -20);
      }
    }
    
    if (!this.currentEngine) {
      throw new Error('No transcription engines could be initialized');
    }
    
    console.log(`Fallback chain initialized with ${this.engines.length} engines`);
  }

  /**
   * Start transcription with automatic fallback
   */
  async startTranscription(audioConfig, callbacks = {}) {
    this.sessionConfig = audioConfig;
    this.callbacks = callbacks;
    this.isTranscribing = true;
    
    return await this.tryStartWithCurrentEngine();
  }

  /**
   * Try to start transcription with current engine
   */
  async tryStartWithCurrentEngine() {
    if (!this.currentEngine) {
      throw new Error('No engine available');
    }

    const engineId = this.currentEngine.id;
    
    try {
      console.log(`Starting transcription with ${engineId}`);
      
      // Check if engine can start
      if (!transcriptionEngineStateManager.canEngineStart(engineId)) {
        console.warn(`Engine ${engineId} cannot start, trying next`);
        return await this.fallbackToNext('engine_busy');
      }
      
      // Update state
      transcriptionEngineStateManager.updateEngineState(engineId, 'starting');
      
      // Wrap callbacks to intercept errors
      const wrappedCallbacks = this.wrapCallbacks(this.callbacks);
      
      // Start transcription
      const result = await this.currentEngine.engine.startTranscription(
        this.sessionConfig,
        wrappedCallbacks
      );
      
      // Update state to active
      transcriptionEngineStateManager.updateEngineState(engineId, 'active');
      
      // Notify success callback
      if (this.callbacks.onEngineSwitch) {
        this.callbacks.onEngineSwitch({
          engine: engineId,
          reason: 'started',
          fallbackCount: this.fallbackHistory.length
        });
      }
      
      return result;
      
    } catch (error) {
      console.error(`Engine ${engineId} failed to start:`, error);
      
      // Update state and health
      transcriptionEngineStateManager.reportEngineError(engineId, error);
      this.updateEngineHealth(engineId, -30);
      
      // Record failure
      this.currentEngine.failures++;
      this.currentEngine.lastFailure = Date.now();
      
      // Try fallback
      return await this.fallbackToNext(error.message || 'start_failed');
    }
  }

  /**
   * Fallback to next engine
   */
  async fallbackToNext(reason) {
    // Record fallback event
    this.fallbackHistory.push({
      from: this.currentEngine?.id,
      reason,
      timestamp: Date.now()
    });
    
    // Check fallback limit
    if (this.fallbackHistory.length > this.maxFallbackAttempts) {
      throw new Error('Maximum fallback attempts exceeded');
    }
    
    // Find next healthy engine
    const nextEngine = this.findNextHealthyEngine();
    
    if (!nextEngine) {
      // No more engines, try to create mock engine
      return await this.createAndUseMockEngine();
    }
    
    // Switch to next engine
    console.log(`Falling back from ${this.currentEngine?.id} to ${nextEngine.id} (reason: ${reason})`);
    
    this.currentEngine = nextEngine;
    this.currentEngineIndex = this.engines.indexOf(nextEngine);
    
    // Try to start with new engine
    return await this.tryStartWithCurrentEngine();
  }

  /**
   * Find next healthy engine
   */
  findNextHealthyEngine() {
    // Start from next engine in chain
    for (let i = this.currentEngineIndex + 1; i < this.engines.length; i++) {
      const engine = this.engines[i];
      const health = this.engineHealthScores.get(engine.id);
      
      // Skip unhealthy engines
      if (health < 50) continue;
      
      // Skip engines with recent failures
      if (engine.lastFailure && Date.now() - engine.lastFailure < 30000) continue;
      
      return engine;
    }
    
    // No healthy engine found in remaining chain
    return null;
  }

  /**
   * Create and use mock engine as last resort
   */
  async createAndUseMockEngine() {
    console.warn('All engines failed, creating mock engine');
    
    const mockEngine = {
      id: 'mock-fallback',
      engine: {
        startTranscription: async (config, callbacks) => {
          if (callbacks.onStart) callbacks.onStart();
          
          // Simulate transcription updates
          if (callbacks.onTranscriptionUpdate) {
            setInterval(() => {
              if (this.isTranscribing) {
                callbacks.onTranscriptionUpdate({
                  text: '[Mock transcription - All engines failed]',
                  segments: [],
                  confidence: 0.1,
                  engine: 'mock-fallback'
                });
              }
            }, 5000);
          }
          
          return true;
        },
        stopTranscription: async () => true,
        processAudioChunk: async () => ({ text: '[Mock]', confidence: 0.1 })
      },
      priority: 999,
      failures: 0,
      lastFailure: null
    };
    
    this.engines.push(mockEngine);
    this.currentEngine = mockEngine;
    this.engineHealthScores.set('mock-fallback', 100);
    
    transcriptionEngineStateManager.registerEngine('mock-fallback', 'ready');
    
    return await this.tryStartWithCurrentEngine();
  }

  /**
   * Wrap callbacks to intercept errors
   */
  wrapCallbacks(originalCallbacks) {
    return {
      ...originalCallbacks,
      onError: (error) => {
        console.error(`Engine error during transcription:`, error);
        
        // Update engine health
        this.updateEngineHealth(this.currentEngine.id, -10);
        
        // Call original error handler
        if (originalCallbacks.onError) {
          originalCallbacks.onError(error);
        }
        
        // Attempt fallback if critical error
        if (this.isCriticalError(error)) {
          this.handleCriticalError(error);
        }
      },
      onTranscriptionUpdate: (result) => {
        // Add engine info to result
        const enhancedResult = {
          ...result,
          engine: this.currentEngine.id,
          fallbackCount: this.fallbackHistory.length
        };
        
        // Update engine health based on confidence
        if (result.confidence < 0.5) {
          this.updateEngineHealth(this.currentEngine.id, -5);
        } else if (result.confidence > 0.8) {
          this.updateEngineHealth(this.currentEngine.id, 5);
        }
        
        if (originalCallbacks.onTranscriptionUpdate) {
          originalCallbacks.onTranscriptionUpdate(enhancedResult);
        }
      }
    };
  }

  /**
   * Check if error is critical
   */
  isCriticalError(error) {
    const errorStr = error.toString().toLowerCase();
    return (
      errorStr.includes('permission') ||
      errorStr.includes('not allowed') ||
      errorStr.includes('audio context') ||
      errorStr.includes('microphone') ||
      errorStr.includes('network')
    );
  }

  /**
   * Handle critical error with fallback
   */
  async handleCriticalError(error) {
    console.error('Critical error detected, attempting fallback:', error);
    
    try {
      // Stop current engine
      if (this.currentEngine) {
        await this.currentEngine.engine.stopTranscription();
        transcriptionEngineStateManager.updateEngineState(this.currentEngine.id, 'error');
      }
      
      // Attempt fallback
      await this.fallbackToNext('critical_error');
      
    } catch (fallbackError) {
      console.error('Failed to fallback after critical error:', fallbackError);
      
      if (this.callbacks.onError) {
        this.callbacks.onError(fallbackError);
      }
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    this.isTranscribing = false;
    
    if (!this.currentEngine) {
      return;
    }
    
    try {
      const result = await this.currentEngine.engine.stopTranscription();
      transcriptionEngineStateManager.updateEngineState(this.currentEngine.id, 'idle');
      return result;
    } catch (error) {
      console.error('Error stopping transcription:', error);
      transcriptionEngineStateManager.updateEngineState(this.currentEngine.id, 'error');
      throw error;
    }
  }

  /**
   * Process audio chunk
   */
  async processAudioChunk(audioData, config) {
    if (!this.currentEngine) {
      throw new Error('No active engine');
    }
    
    try {
      return await this.currentEngine.engine.processAudioChunk(audioData, config);
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      
      // For chunk processing errors, don't immediately fallback
      // Just update health score
      this.updateEngineHealth(this.currentEngine.id, -2);
      
      throw error;
    }
  }

  /**
   * Update engine health score
   */
  updateEngineHealth(engineId, delta) {
    const currentHealth = this.engineHealthScores.get(engineId) || 100;
    const newHealth = Math.max(0, Math.min(100, currentHealth + delta));
    
    this.engineHealthScores.set(engineId, newHealth);
    
    console.log(`Engine ${engineId} health: ${currentHealth} -> ${newHealth}`);
  }

  /**
   * Get fallback chain status
   */
  getStatus() {
    return {
      currentEngine: this.currentEngine?.id,
      engines: this.engines.map(e => ({
        id: e.id,
        priority: e.priority,
        health: this.engineHealthScores.get(e.id),
        failures: e.failures,
        state: transcriptionEngineStateManager.getEngineState(e.id)?.state
      })),
      fallbackHistory: this.fallbackHistory,
      isTranscribing: this.isTranscribing
    };
  }

  /**
   * Reset fallback chain
   */
  reset() {
    this.currentEngineIndex = 0;
    this.currentEngine = this.engines[0] || null;
    this.fallbackHistory = [];
    this.isTranscribing = false;
    
    // Reset engine failures
    this.engines.forEach(engine => {
      engine.failures = 0;
      engine.lastFailure = null;
    });
    
    // Reset health scores
    this.engines.forEach(engine => {
      this.engineHealthScores.set(engine.id, 100);
    });
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.isTranscribing) {
      await this.stopTranscription();
    }
    
    // Cleanup all engines
    for (const engineEntry of this.engines) {
      try {
        if (engineEntry.engine.cleanup) {
          await engineEntry.engine.cleanup();
        }
      } catch (error) {
        console.error(`Error cleaning up engine ${engineEntry.id}:`, error);
      }
    }
    
    this.reset();
  }
}

// Export singleton instance
export const transcriptionFallbackChain = new TranscriptionFallbackChain();