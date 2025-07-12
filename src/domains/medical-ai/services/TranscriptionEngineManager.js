/**
 * TranscriptionEngineManager
 * 
 * Manages multiple transcription engines with intelligent capability detection
 * and fallback strategies for medical transcription
 */

import { TranscriptionStatus } from '../types';

export class TranscriptionEngineManager {
  constructor() {
    this.engines = new Map();
    this.currentEngine = null;
    this.enginePreferences = [];
    this.capabilities = null;
    this.fallbackChain = [];
    this.performanceMetrics = new Map();
    this.medicalContext = null;
    this.isInitialized = false;
  }

  /**
   * Initialize engine manager with capability detection
   */
  async initialize(config = {}) {
    try {
      if (this.isInitialized) return;

      // Detect browser capabilities
      this.capabilities = await this.detectBrowserCapabilities();
      
      // Initialize available engines
      await this.initializeEngines(config);
      
      // Build fallback chain based on capabilities
      this.buildFallbackChain();
      
      // Select optimal engine
      await this.selectOptimalEngine();
      
      this.isInitialized = true;
      console.log('TranscriptionEngineManager initialized', {
        capabilities: this.capabilities,
        availableEngines: Array.from(this.engines.keys()),
        selectedEngine: this.currentEngine?.name
      });
      
    } catch (error) {
      console.error('Failed to initialize TranscriptionEngineManager:', error);
      throw error;
    }
  }

  /**
   * Detect browser capabilities for transcription engines
   */
  async detectBrowserCapabilities() {
    const capabilities = {
      webGPU: false,
      webGL: false,
      webAssembly: false,
      webSpeechAPI: false,
      mediaRecorder: false,
      audioContext: false,
      offlineStorage: false,
      webWorkers: false,
      sharedArrayBuffer: false,
      browserName: this.detectBrowserName(),
      browserVersion: this.detectBrowserVersion(),
      deviceMemory: this.detectDeviceMemory(),
      hardwareConcurrency: navigator.hardwareConcurrency || 4
    };

    // Check WebGPU support
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        capabilities.webGPU = !!adapter;
      } catch (error) {
        capabilities.webGPU = false;
      }
    }

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      capabilities.webGL = !!gl;
    } catch (error) {
      capabilities.webGL = false;
    }

    // Check WebAssembly support
    capabilities.webAssembly = 'WebAssembly' in window;

    // Check Web Speech API
    capabilities.webSpeechAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    // Check MediaRecorder API
    capabilities.mediaRecorder = 'MediaRecorder' in window;

    // Check AudioContext
    capabilities.audioContext = !!(window.AudioContext || window.webkitAudioContext);

    // Check offline storage
    capabilities.offlineStorage = 'indexedDB' in window;

    // Check Web Workers
    capabilities.webWorkers = 'Worker' in window;

    // Check SharedArrayBuffer
    capabilities.sharedArrayBuffer = 'SharedArrayBuffer' in window;

    return capabilities;
  }

  /**
   * Initialize available transcription engines
   */
  async initializeEngines(config) {
    const engineConfigs = [
      {
        name: 'openai-whisper',
        priority: 3,
        requirements: [],
        module: () => import('./OpenAIWhisperBackend'),
        config: { ...config.openAI }
      },
      {
        name: 'web-speech-api',
        priority: 4,
        requirements: ['webSpeechAPI'],
        module: () => import('./WebSpeechEngine.js'),
        config: { ...config.webSpeech }
      }
    ];

    for (const engineConfig of engineConfigs) {
      try {
        // Check if engine requirements are met
        const canLoad = this.checkEngineRequirements(engineConfig.requirements);
        
        if (canLoad) {
          const engineModule = await engineConfig.module();
          const Engine = engineModule.default || engineModule[Object.keys(engineModule)[0]];
          
          const engine = new Engine(engineConfig.config);
          await engine.initialize();
          
          this.engines.set(engineConfig.name, {
            instance: engine,
            priority: engineConfig.priority,
            capabilities: engineConfig.requirements,
            config: engineConfig.config,
            name: engineConfig.name
          });
          
          console.log(`Initialized engine: ${engineConfig.name}`);
        } else {
          console.warn(`Engine ${engineConfig.name} requirements not met:`, engineConfig.requirements);
        }
      } catch (error) {
        console.error(`Failed to initialize engine ${engineConfig.name}:`, error);
      }
    }
  }

  /**
   * Check if engine requirements are satisfied
   */
  checkEngineRequirements(requirements) {
    if (!requirements || requirements.length === 0) return true;
    
    return requirements.every(req => {
      const hasCapability = this.capabilities[req];
      
      // Special case for browser-specific requirements
      if (req === 'webGPU' && this.capabilities.browserName === 'brave') {
        return false; // Brave has issues with WebGPU
      }
      
      return hasCapability;
    });
  }

  /**
   * Build fallback chain based on available engines
   */
  buildFallbackChain() {
    const sortedEngines = Array.from(this.engines.entries())
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([name, engine]) => ({ name, ...engine }));

    this.fallbackChain = sortedEngines;
    
    console.log('Fallback chain built:', this.fallbackChain.map(e => e.name));
  }

  /**
   * Select optimal engine based on capabilities and context
   */
  async selectOptimalEngine() {
    if (this.fallbackChain.length === 0) {
      console.error('No transcription engines available, using mock engine as fallback');
      // Create a mock engine as absolute fallback
      await this.createMockEngine();
      return;
    }

    // Try each engine in the fallback chain
    for (const engine of this.fallbackChain) {
      try {
        const isReady = await this.checkEngineReadiness(engine.instance);
        
        if (isReady) {
          this.currentEngine = engine;
          console.log(`Selected engine: ${engine.name}`);
          return;
        } else {
          console.warn(`Engine ${engine.name} not ready, trying next`);
        }
      } catch (error) {
        console.warn(`Engine ${engine.name} check failed:`, error);
      }
    }
    
    // If no engines are ready, create mock engine
    console.warn('All engines failed readiness check, using mock engine');
    await this.createMockEngine();
  }

  /**
   * Create a mock engine as absolute fallback
   */
  async createMockEngine() {
    const mockEngine = {
      name: 'mock-engine',
      instance: {
        initialize: async () => true,
        isReady: async () => true,
        startTranscription: async (config, callbacks) => {
          console.warn('Using mock transcription engine');
          if (callbacks.onStart) callbacks.onStart();
          return true;
        },
        stopTranscription: async () => {
          console.warn('Stopping mock transcription');
          return true;
        },
        processAudioChunk: async (audioData, config) => {
          return { text: '[Mock transcription active]', confidence: 0.5 };
        },
        cleanup: async () => true
      },
      priority: 999,
      capabilities: [],
      config: { isMock: true }
    };
    
    this.engines.set('mock-engine', mockEngine);
    this.currentEngine = mockEngine;
    this.fallbackChain.push(mockEngine);
  }

  /**
   * Check if engine is ready for transcription
   */
  async checkEngineReadiness(engine) {
    try {
      if (typeof engine.isReady === 'function') {
        return await engine.isReady();
      }
      return true;
    } catch (error) {
      console.error('Engine readiness check failed:', error);
      return false;
    }
  }

  /**
   * Fallback to next available engine
   */
  async fallbackToNextEngine() {
    const currentIndex = this.fallbackChain.findIndex(e => e.name === this.currentEngine?.name);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < this.fallbackChain.length) {
      const nextEngine = this.fallbackChain[nextIndex];
      
      console.log(`Falling back to engine: ${nextEngine.name}`);
      
      const isReady = await this.checkEngineReadiness(nextEngine.instance);
      
      if (isReady) {
        this.currentEngine = nextEngine;
        return true;
      } else {
        return await this.fallbackToNextEngine();
      }
    }
    
    throw new Error('All transcription engines exhausted');
  }

  /**
   * Start transcription with current engine
   */
  async startTranscription(audioConfig, callbacks = {}) {
    if (!this.currentEngine) {
      console.warn('No transcription engine selected, attempting to initialize');
      if (!this.isInitialized) {
        await this.initialize();
      } else {
        await this.selectOptimalEngine();
      }
      
      if (!this.currentEngine) {
        throw new Error('Failed to select any transcription engine');
      }
    }

    try {
      const result = await this.currentEngine.instance.startTranscription(
        audioConfig,
        callbacks
      );
      
      // Track performance metrics
      this.trackEnginePerformance(this.currentEngine.name, 'start', true);
      
      return result;
    } catch (error) {
      console.error(`Engine ${this.currentEngine.name} failed to start:`, error);
      
      // Track failure and attempt fallback
      this.trackEnginePerformance(this.currentEngine.name, 'start', false);
      
      const fallbackSuccessful = await this.fallbackToNextEngine();
      
      if (fallbackSuccessful) {
        return await this.startTranscription(audioConfig, callbacks);
      } else {
        throw error;
      }
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    if (!this.currentEngine) {
      throw new Error('No active transcription engine');
    }

    try {
      const result = await this.currentEngine.instance.stopTranscription();
      this.trackEnginePerformance(this.currentEngine.name, 'stop', true);
      return result;
    } catch (error) {
      this.trackEnginePerformance(this.currentEngine.name, 'stop', false);
      throw error;
    }
  }

  /**
   * Process audio chunk
   */
  async processAudioChunk(audioData, config) {
    if (!this.currentEngine) {
      throw new Error('No active transcription engine');
    }

    try {
      const result = await this.currentEngine.instance.processAudioChunk(audioData, config);
      this.trackEnginePerformance(this.currentEngine.name, 'process', true);
      return result;
    } catch (error) {
      this.trackEnginePerformance(this.currentEngine.name, 'process', false);
      
      // For processing errors, try fallback but don't interrupt current session
      console.error(`Engine ${this.currentEngine.name} processing error:`, error);
      throw error;
    }
  }

  /**
   * Get current engine status
   */
  getEngineStatus() {
    return {
      currentEngine: this.currentEngine?.name,
      availableEngines: Array.from(this.engines.keys()),
      capabilities: this.capabilities,
      fallbackChain: this.fallbackChain.map(e => e.name),
      performanceMetrics: Object.fromEntries(this.performanceMetrics)
    };
  }

  /**
   * Manually switch to specific engine
   */
  async switchToEngine(engineName) {
    const engine = this.engines.get(engineName);
    
    if (!engine) {
      throw new Error(`Engine ${engineName} not available`);
    }

    const isReady = await this.checkEngineReadiness(engine.instance);
    
    if (isReady) {
      this.currentEngine = engine;
      console.log(`Manually switched to engine: ${engineName}`);
      return true;
    } else {
      throw new Error(`Engine ${engineName} not ready`);
    }
  }

  /**
   * Track engine performance metrics
   */
  trackEnginePerformance(engineName, operation, success) {
    const key = `${engineName}_${operation}`;
    
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, {
        successes: 0,
        failures: 0,
        totalAttempts: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(key);
    metrics.totalAttempts++;
    
    if (success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
    
    this.performanceMetrics.set(key, metrics);
  }

  /**
   * Get engine performance metrics
   */
  getPerformanceMetrics() {
    const metrics = {};
    
    for (const [key, data] of this.performanceMetrics) {
      metrics[key] = {
        ...data,
        successRate: data.totalAttempts > 0 ? data.successes / data.totalAttempts : 0
      };
    }
    
    return metrics;
  }

  /**
   * Detect browser name
   */
  detectBrowserName() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('brave')) return 'brave';
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    
    return 'unknown';
  }

  /**
   * Detect browser version
   */
  detectBrowserVersion() {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+\.\d+)/i);
    return match ? match[1] : 'unknown';
  }

  /**
   * Detect device memory
   */
  detectDeviceMemory() {
    if ('deviceMemory' in navigator) {
      return navigator.deviceMemory;
    }
    
    // Estimate based on hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;
    return Math.max(4, cores * 2); // Rough estimate
  }

  /**
   * Set medical context for engine optimization
   */
  setMedicalContext(context) {
    this.medicalContext = context;
    
    // Update engines with medical context
    for (const [name, engine] of this.engines) {
      if (typeof engine.instance.setMedicalContext === 'function') {
        engine.instance.setMedicalContext(context);
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // Stop current transcription
    if (this.currentEngine) {
      try {
        await this.stopTranscription();
      } catch (error) {
        console.error('Error stopping transcription during cleanup:', error);
      }
    }

    // Cleanup all engines
    for (const [name, engine] of this.engines) {
      try {
        if (typeof engine.instance.cleanup === 'function') {
          await engine.instance.cleanup();
        }
      } catch (error) {
        console.error(`Error cleaning up engine ${name}:`, error);
      }
    }

    this.engines.clear();
    this.currentEngine = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const transcriptionEngineManager = new TranscriptionEngineManager();