/**
 * WhisperWASMEngine
 * 
 * WebAssembly-based Whisper transcription engine for browsers without WebGPU support
 * Optimized for Brave browser and older browser compatibility
 */

import { TranscriptionStatus } from '../types';

export class WhisperWASMEngine {
  constructor(config = {}) {
    this.config = {
      modelName: config.modelName || 'whisper-base',
      language: config.language || 'es',
      threads: config.threads || Math.min(navigator.hardwareConcurrency || 4, 4),
      sampleRate: config.sampleRate || 16000,
      medicalMode: config.medicalMode || true,
      wasmPath: config.wasmPath || '/whisper.wasm',
      modelPath: config.modelPath || '/models/',
      ...config
    };

    this.whisperModule = null;
    this.context = null;
    this.isInitialized = false;
    this.isTranscribing = false;
    this.currentSession = null;
    this.audioBuffer = new Float32Array(0);
    this.processingQueue = [];
    this.worker = null;
    this.modelCache = null;
    this.medicalContext = null;
  }

  /**
   * Initialize Whisper WASM engine
   */
  async initialize() {
    try {
      console.log('Initializing WhisperWASMEngine...');
      
      // Check WebAssembly support
      if (!this.checkWebAssemblySupport()) {
        throw new Error('WebAssembly not supported');
      }
      
      // Initialize model cache
      await this.initializeModelCache();
      
      // Initialize Web Worker for WASM processing
      await this.initializeWorker();
      
      // Download and cache model if needed
      await this.ensureModelAvailable();
      
      this.isInitialized = true;
      console.log('WhisperWASMEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WhisperWASMEngine:', error);
      throw error;
    }
  }

  /**
   * Check WebAssembly support
   */
  checkWebAssemblySupport() {
    try {
      if (!('WebAssembly' in window)) {
        return false;
      }
      
      // Test basic WebAssembly functionality
      const module = new WebAssembly.Module(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
      ]));
      
      return WebAssembly.validate(module);
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize model cache manager
   */
  async initializeModelCache() {
    try {
      const { ModelCacheManager } = await import('./ModelCacheManager.js');
      this.modelCache = new ModelCacheManager({
        modelName: this.config.modelName,
        cacheName: 'whisper-wasm-models',
        wasmSupport: true
      });
      
      await this.modelCache.initialize();
      console.log('Model cache manager initialized for WASM');
    } catch (error) {
      console.warn('Model cache manager initialization failed:', error);
    }
  }

  /**
   * Initialize Web Worker for WASM processing
   */
  async initializeWorker() {
    try {
      // Create worker with inline code to avoid CORS issues
      const workerCode = this.generateWorkerCode();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      this.worker = new Worker(workerUrl);
      
      // Setup worker message handling
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
      
      // Initialize worker with configuration
      await this.sendWorkerMessage('initialize', {
        config: this.config,
        wasmPath: this.config.wasmPath,
        modelPath: this.config.modelPath
      });
      
      console.log('Web Worker initialized for WASM processing');
      
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
      throw error;
    }
  }

  /**
   * Generate Web Worker code for WASM processing
   */
  generateWorkerCode() {
    return `
      let whisperModule = null;
      let context = null;
      
      self.onmessage = async function(event) {
        const { type, data, id } = event.data;
        
        try {
          switch (type) {
            case 'initialize':
              await initializeWhisper(data);
              self.postMessage({ type: 'initialized', id });
              break;
              
            case 'transcribe':
              const result = await transcribeAudio(data);
              self.postMessage({ type: 'transcribed', data: result, id });
              break;
              
            case 'cleanup':
              await cleanupWhisper();
              self.postMessage({ type: 'cleaned', id });
              break;
              
            default:
              self.postMessage({ type: 'error', data: 'Unknown message type', id });
          }
        } catch (error) {
          self.postMessage({ type: 'error', data: error.message, id });
        }
      };
      
      async function initializeWhisper(config) {
        try {
          // Load Whisper WASM module
          const response = await fetch(config.wasmPath);
          const wasmBytes = await response.arrayBuffer();
          
          // Initialize Whisper module
          whisperModule = await WebAssembly.instantiate(wasmBytes);
          
          // Load model
          const modelResponse = await fetch(config.modelPath + config.config.modelName + '.bin');
          const modelData = await modelResponse.arrayBuffer();
          
          // Initialize context
          context = {
            model: new Uint8Array(modelData),
            config: config.config,
            initialized: true
          };
          
          console.log('Whisper WASM initialized in worker');
          
        } catch (error) {
          console.error('Failed to initialize Whisper WASM:', error);
          throw error;
        }
      }
      
      async function transcribeAudio(audioData) {
        if (!context || !context.initialized) {
          throw new Error('Whisper not initialized');
        }
        
        try {
          // Process audio with Whisper WASM
          // This is a simplified implementation
          // In practice, you would use the actual Whisper WASM bindings
          
          const result = {
            text: simulateTranscription(audioData),
            confidence: 0.85,
            timestamp: Date.now()
          };
          
          return result;
          
        } catch (error) {
          console.error('Transcription failed:', error);
          throw error;
        }
      }
      
      function simulateTranscription(audioData) {
        // Simplified simulation for demonstration
        // In real implementation, this would call the actual Whisper WASM functions
        return 'Transcripción simulada de audio médico';
      }
      
      async function cleanupWhisper() {
        if (whisperModule) {
          whisperModule = null;
        }
        if (context) {
          context = null;
        }
        console.log('Whisper WASM cleanup completed');
      }
    `;
  }

  /**
   * Send message to worker
   */
  async sendWorkerMessage(type, data) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      
      const timeout = setTimeout(() => {
        reject(new Error('Worker message timeout'));
      }, 30000);
      
      const messageHandler = (event) => {
        if (event.data.id === id) {
          clearTimeout(timeout);
          this.worker.removeEventListener('message', messageHandler);
          
          if (event.data.type === 'error') {
            reject(new Error(event.data.data));
          } else {
            resolve(event.data.data);
          }
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      this.worker.postMessage({ type, data, id });
    });
  }

  /**
   * Handle worker messages
   */
  handleWorkerMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'transcribed':
        this.handleTranscriptionResult(data);
        break;
        
      case 'error':
        console.error('Worker error:', data);
        break;
        
      default:
        console.log('Worker message:', type, data);
    }
  }

  /**
   * Handle transcription result from worker
   */
  handleTranscriptionResult(result) {
    if (!this.currentSession) return;
    
    const segment = {
      id: `wasm-segment-${Date.now()}`,
      text: result.text,
      startTime: result.timestamp,
      endTime: Date.now(),
      confidence: result.confidence || 0.85,
      speaker: 'doctor',
      language: this.config.language
    };
    
    this.currentSession.segments.push(segment);
    this.currentSession.fullText += ` ${result.text}`;
    
    // Real-time callback
    if (this.currentSession.callbacks.onTranscriptionUpdate) {
      this.currentSession.callbacks.onTranscriptionUpdate({
        segment,
        fullText: this.currentSession.fullText.trim(),
        confidence: this.calculateOverallConfidence()
      });
    }
  }

  /**
   * Ensure model is available
   */
  async ensureModelAvailable() {
    try {
      if (this.modelCache) {
        const isCached = await this.modelCache.isModelCached(this.config.modelName);
        
        if (!isCached) {
          console.log('Downloading Whisper WASM model...');
          await this.modelCache.downloadModel(this.config.modelName);
        }
      }
    } catch (error) {
      console.warn('Model cache check failed:', error);
    }
  }

  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && this.worker !== null;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig, callbacks = {}) {
    if (!this.isInitialized) {
      throw new Error('WhisperWASMEngine not initialized');
    }

    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    this.isTranscribing = true;
    this.currentSession = {
      id: `whisper-wasm-session-${Date.now()}`,
      startTime: Date.now(),
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: []
    };

    // Reset audio buffer
    this.audioBuffer = new Float32Array(0);

    console.log('Starting Whisper WASM transcription');
    
    return {
      success: true,
      data: {
        sessionId: this.currentSession.id,
        engine: 'whisper-wasm',
        status: TranscriptionStatus.RECORDING
      }
    };
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription');
    }

    this.isTranscribing = false;
    
    // Process any remaining audio
    if (this.audioBuffer.length > 0) {
      await this.processAudioBuffer();
    }
    
    // Finalize transcription
    const finalResult = await this.finalizeTranscription();
    
    this.currentSession = null;
    this.audioBuffer = new Float32Array(0);
    
    return {
      success: true,
      data: finalResult
    };
  }

  /**
   * Process audio chunk
   */
  async processAudioChunk(audioData, config) {
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription session');
    }

    try {
      // Convert audio data to Float32Array
      const audioFloat32 = await this.convertAudioToFloat32(audioData);
      
      // Append to buffer
      this.audioBuffer = this.appendToBuffer(this.audioBuffer, audioFloat32);
      
      // Process when buffer reaches minimum size
      const minBufferSize = this.config.sampleRate * 5; // 5 seconds
      
      if (this.audioBuffer.length >= minBufferSize) {
        await this.processAudioBuffer();
      }
      
      return {
        success: true,
        data: {
          bufferLength: this.audioBuffer.length,
          processed: this.audioBuffer.length >= minBufferSize
        }
      };
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert audio data to Float32Array
   */
  async convertAudioToFloat32(audioData) {
    try {
      // Handle different audio data formats
      if (audioData instanceof Float32Array) {
        return audioData;
      }
      
      if (audioData instanceof ArrayBuffer) {
        const audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        return audioBuffer.getChannelData(0);
      }
      
      if (audioData instanceof Uint8Array) {
        // Convert Uint8Array to Float32Array
        const float32 = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          float32[i] = (audioData[i] - 128) / 128.0;
        }
        return float32;
      }
      
      throw new Error('Unsupported audio data format');
      
    } catch (error) {
      console.error('Audio conversion failed:', error);
      throw error;
    }
  }

  /**
   * Append audio data to buffer
   */
  appendToBuffer(buffer, newData) {
    const combined = new Float32Array(buffer.length + newData.length);
    combined.set(buffer);
    combined.set(newData, buffer.length);
    return combined;
  }

  /**
   * Process accumulated audio buffer
   */
  async processAudioBuffer() {
    if (this.audioBuffer.length === 0) return;
    
    try {
      // Send audio to worker for transcription
      const result = await this.sendWorkerMessage('transcribe', {
        audioData: this.audioBuffer,
        config: this.config
      });
      
      // Clear processed audio from buffer
      this.audioBuffer = new Float32Array(0);
      
    } catch (error) {
      console.error('Audio buffer processing failed:', error);
      throw error;
    }
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence() {
    if (!this.currentSession || this.currentSession.segments.length === 0) return 0;
    
    const totalConfidence = this.currentSession.segments.reduce(
      (sum, segment) => sum + segment.confidence,
      0
    );
    
    return totalConfidence / this.currentSession.segments.length;
  }

  /**
   * Finalize transcription session
   */
  async finalizeTranscription() {
    const session = this.currentSession;
    
    // Apply medical terminology enhancement
    let enhancedText = session.fullText.trim();
    
    if (this.config.medicalMode) {
      try {
        const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js');
        const enhancer = new MedicalTerminologyEnhancer();
        enhancedText = await enhancer.enhanceText(enhancedText, 'es-MX');
        session.medicalTerms = await enhancer.extractTerms(enhancedText, 'es-MX');
      } catch (error) {
        console.warn('Medical terminology enhancement failed:', error);
      }
    }
    
    return {
      id: session.id,
      text: enhancedText,
      segments: session.segments,
      medicalTerms: session.medicalTerms,
      confidence: this.calculateOverallConfidence(),
      language: this.config.language,
      engine: 'whisper-wasm',
      processingTime: Date.now() - session.startTime,
      status: TranscriptionStatus.COMPLETED,
      timestamp: new Date()
    };
  }

  /**
   * Set medical context for optimization
   */
  setMedicalContext(context) {
    this.medicalContext = context;
    console.log('Medical context set for WhisperWASMEngine:', context);
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      modelName: this.config.modelName,
      backend: 'wasm',
      threads: this.config.threads,
      isInitialized: this.isInitialized,
      isTranscribing: this.isTranscribing,
      bufferLength: this.audioBuffer.length,
      medicalMode: this.config.medicalMode,
      wasmSupported: this.checkWebAssemblySupport()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Stop any active transcription
      if (this.isTranscribing) {
        await this.stopTranscription();
      }
      
      // Cleanup worker
      if (this.worker) {
        await this.sendWorkerMessage('cleanup', {});
        this.worker.terminate();
        this.worker = null;
      }
      
      // Clear buffers
      this.audioBuffer = new Float32Array(0);
      this.processingQueue = [];
      
      // Reset state
      this.isInitialized = false;
      this.context = null;
      this.currentSession = null;
      
      console.log('WhisperWASMEngine cleanup completed');
      
    } catch (error) {
      console.error('Error during WhisperWASMEngine cleanup:', error);
    }
  }
}

export default WhisperWASMEngine;