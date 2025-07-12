/**
 * TranscriptionEngineStateManager
 * 
 * Manages and tracks the state of all transcription engines
 * preventing conflicts between different transcription methods
 */

export class TranscriptionEngineStateManager {
  constructor() {
    this.engineStates = new Map();
    this.activeEngines = new Set();
    this.stateHistory = [];
    this.maxHistorySize = 100;
    this.listeners = new Map();
    this.globalState = {
      isTranscribing: false,
      activeEngine: null,
      lastActivity: Date.now(),
      errorCount: 0
    };
  }

  /**
   * Register a new engine
   */
  registerEngine(engineId, initialState = 'idle') {
    if (this.engineStates.has(engineId)) {
      console.warn(`Engine ${engineId} is already registered`);
      return;
    }

    const engineState = {
      id: engineId,
      state: initialState,
      lastStateChange: Date.now(),
      errorCount: 0,
      metadata: {},
      history: []
    };

    this.engineStates.set(engineId, engineState);
    this.notifyListeners(engineId, 'registered', engineState);
  }

  /**
   * Update engine state
   */
  updateEngineState(engineId, newState, metadata = {}) {
    const engine = this.engineStates.get(engineId);
    
    if (!engine) {
      console.error(`Engine ${engineId} not found`);
      return false;
    }

    const previousState = engine.state;
    
    // Validate state transition
    if (!this.isValidTransition(previousState, newState)) {
      console.error(`Invalid state transition for ${engineId}: ${previousState} -> ${newState}`);
      return false;
    }

    // Update engine state
    engine.state = newState;
    engine.lastStateChange = Date.now();
    engine.metadata = { ...engine.metadata, ...metadata };
    
    // Add to history
    const historyEntry = {
      from: previousState,
      to: newState,
      timestamp: Date.now(),
      metadata
    };
    
    engine.history.push(historyEntry);
    this.addToGlobalHistory(engineId, historyEntry);

    // Update active engines
    if (this.isActiveState(newState)) {
      this.activeEngines.add(engineId);
    } else {
      this.activeEngines.delete(engineId);
    }

    // Update global state
    this.updateGlobalState();

    // Notify listeners
    this.notifyListeners(engineId, 'stateChange', {
      previousState,
      currentState: newState,
      metadata
    });

    return true;
  }

  /**
   * Check if state transition is valid
   */
  isValidTransition(from, to) {
    const validTransitions = {
      'idle': ['initializing', 'error', 'disposed'],
      'initializing': ['ready', 'error', 'idle'],
      'ready': ['starting', 'error', 'idle', 'disposed'],
      'starting': ['active', 'error', 'ready'],
      'active': ['paused', 'stopping', 'error'],
      'paused': ['resuming', 'stopping', 'error'],
      'resuming': ['active', 'error', 'paused'],
      'stopping': ['idle', 'error'],
      'error': ['idle', 'initializing', 'disposed'],
      'disposed': []
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Check if state is active
   */
  isActiveState(state) {
    return ['active', 'starting', 'paused', 'resuming'].includes(state);
  }

  /**
   * Get engine state
   */
  getEngineState(engineId) {
    return this.engineStates.get(engineId);
  }

  /**
   * Get all engine states
   */
  getAllEngineStates() {
    const states = {};
    for (const [id, engine] of this.engineStates) {
      states[id] = {
        state: engine.state,
        lastStateChange: engine.lastStateChange,
        errorCount: engine.errorCount,
        metadata: engine.metadata
      };
    }
    return states;
  }

  /**
   * Get active engines
   */
  getActiveEngines() {
    return Array.from(this.activeEngines);
  }

  /**
   * Check if any engine is active
   */
  hasActiveEngine() {
    return this.activeEngines.size > 0;
  }

  /**
   * Can engine start transcription
   */
  canEngineStart(engineId) {
    const engine = this.engineStates.get(engineId);
    
    if (!engine) {
      console.error(`Engine ${engineId} not found`);
      return false;
    }

    // Check if engine is in a state that can start
    if (!['ready', 'idle'].includes(engine.state)) {
      return false;
    }

    // Check for conflicts with other active engines
    if (this.activeEngines.size > 0 && !this.activeEngines.has(engineId)) {
      const activeEnginesList = Array.from(this.activeEngines);
      console.warn(`Cannot start ${engineId}, other engines active: ${activeEnginesList.join(', ')}`);
      return false;
    }

    return true;
  }

  /**
   * Force stop all engines
   */
  async forceStopAllEngines() {
    const promises = [];
    
    for (const engineId of this.activeEngines) {
      const engine = this.engineStates.get(engineId);
      if (engine && this.isActiveState(engine.state)) {
        this.updateEngineState(engineId, 'stopping', { forcedStop: true });
        promises.push(this.waitForState(engineId, 'idle', 5000));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Wait for engine to reach specific state
   */
  async waitForState(engineId, targetState, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const engine = this.engineStates.get(engineId);
      
      if (!engine) {
        reject(new Error(`Engine ${engineId} not found`));
        return;
      }

      if (engine.state === targetState) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        this.removeListener(engineId, listenerId);
        reject(new Error(`Timeout waiting for ${engineId} to reach ${targetState}`));
      }, timeout);

      const listenerId = this.addListener(engineId, (event) => {
        if (event.type === 'stateChange' && event.data.currentState === targetState) {
          clearTimeout(timeoutId);
          this.removeListener(engineId, listenerId);
          resolve(true);
        }
      });
    });
  }

  /**
   * Add state change listener
   */
  addListener(engineId, callback) {
    const listenerId = `listener_${Date.now()}_${Math.random()}`;
    
    if (!this.listeners.has(engineId)) {
      this.listeners.set(engineId, new Map());
    }
    
    this.listeners.get(engineId).set(listenerId, callback);
    return listenerId;
  }

  /**
   * Remove listener
   */
  removeListener(engineId, listenerId) {
    const engineListeners = this.listeners.get(engineId);
    if (engineListeners) {
      engineListeners.delete(listenerId);
    }
  }

  /**
   * Notify listeners
   */
  notifyListeners(engineId, type, data) {
    const engineListeners = this.listeners.get(engineId);
    
    if (engineListeners) {
      for (const callback of engineListeners.values()) {
        try {
          callback({ type, data, engineId, timestamp: Date.now() });
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      }
    }
  }

  /**
   * Update global state
   */
  updateGlobalState() {
    this.globalState.isTranscribing = this.activeEngines.size > 0;
    this.globalState.activeEngine = this.activeEngines.size === 1 
      ? Array.from(this.activeEngines)[0] 
      : null;
    this.globalState.lastActivity = Date.now();
  }

  /**
   * Add to global history
   */
  addToGlobalHistory(engineId, entry) {
    this.stateHistory.push({
      engineId,
      ...entry
    });

    // Trim history if too large
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get state history
   */
  getStateHistory(engineId = null, limit = 50) {
    let history = this.stateHistory;
    
    if (engineId) {
      history = history.filter(entry => entry.engineId === engineId);
    }
    
    return history.slice(-limit);
  }

  /**
   * Report error for engine
   */
  reportEngineError(engineId, error) {
    const engine = this.engineStates.get(engineId);
    
    if (!engine) {
      console.error(`Engine ${engineId} not found`);
      return;
    }

    engine.errorCount++;
    this.globalState.errorCount++;
    
    this.updateEngineState(engineId, 'error', {
      error: error.message || error,
      errorTime: Date.now()
    });
  }

  /**
   * Reset engine error count
   */
  resetEngineErrors(engineId) {
    const engine = this.engineStates.get(engineId);
    
    if (engine) {
      engine.errorCount = 0;
    }
  }

  /**
   * Get engine health status
   */
  getEngineHealth(engineId) {
    const engine = this.engineStates.get(engineId);
    
    if (!engine) {
      return { status: 'unknown', engineId };
    }

    const health = {
      engineId,
      state: engine.state,
      errorCount: engine.errorCount,
      uptime: Date.now() - engine.lastStateChange,
      isHealthy: engine.errorCount < 3 && engine.state !== 'error'
    };

    return health;
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    const engineHealths = [];
    
    for (const [id] of this.engineStates) {
      engineHealths.push(this.getEngineHealth(id));
    }

    const healthyEngines = engineHealths.filter(h => h.isHealthy).length;
    const totalEngines = engineHealths.length;

    return {
      totalEngines,
      healthyEngines,
      activeEngines: this.activeEngines.size,
      globalErrorCount: this.globalState.errorCount,
      isHealthy: healthyEngines > 0 && this.globalState.errorCount < 10,
      engines: engineHealths
    };
  }

  /**
   * Dispose engine
   */
  disposeEngine(engineId) {
    const engine = this.engineStates.get(engineId);
    
    if (!engine) {
      console.error(`Engine ${engineId} not found`);
      return;
    }

    this.updateEngineState(engineId, 'disposed');
    this.engineStates.delete(engineId);
    this.activeEngines.delete(engineId);
    this.listeners.delete(engineId);
    
    this.notifyListeners(engineId, 'disposed', engine);
  }

  /**
   * Reset state manager
   */
  reset() {
    this.engineStates.clear();
    this.activeEngines.clear();
    this.stateHistory = [];
    this.listeners.clear();
    this.globalState = {
      isTranscribing: false,
      activeEngine: null,
      lastActivity: Date.now(),
      errorCount: 0
    };
  }
}

// Export singleton instance
export const transcriptionEngineStateManager = new TranscriptionEngineStateManager();