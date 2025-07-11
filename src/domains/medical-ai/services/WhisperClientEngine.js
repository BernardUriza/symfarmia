/**
 * WhisperClientEngine
 * 
 * Client-side Whisper transcription using transformers.js with WebGPU acceleration
 * Optimized for medical terminology and Spanish language
 */

import { TranscriptionStatus } from '../types';

export class WhisperClientEngine {
  constructor(config = {}) {
    this.config = {
      modelName: config.modelName || 'openai/whisper-base',
      language: config.language || 'es',
      task: config.task || 'transcribe',
      backend: config.backend || 'webgpu',
      chunkLengthS: config.chunkLengthS || 30,
      strideLengthS: config.strideLengthS || 5,
      medicalMode: config.medicalMode || true,
      ...config
    };

    this.pipeline = null;
    this.isInitialized = false;
    this.isTranscribing = false;
    this.modelCache = null;
    this.medicalContext = null;
    this.processingQueue = [];
    this.webGPUDevice = null;
    this.audioProcessor = null;
    this.currentSession = null;
  }

  /**
   * Initialize Whisper client engine
   */
  async initialize() {
    try {
      console.log('Initializing WhisperClientEngine with WebGPU...');
      
      // Initialize WebGPU device
      await this.initializeWebGPU();
      
      // Import transformers.js
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Configure transformers.js environment
      env.allowRemoteModels = true;
      env.allowLocalModels = true;
      env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;
      
      // Set backend preference
      if (this.webGPUDevice) {
        env.backends.onnx.webgpu = true;
        console.log('WebGPU backend enabled for Whisper');
      } else {
        env.backends.onnx.webgl = true;
        console.log('WebGL backend enabled for Whisper');
      }
      
      // Initialize model cache manager
      await this.initializeModelCache();
      
      // Create transcription pipeline
      this.pipeline = await pipeline(
        'automatic-speech-recognition',
        this.config.modelName,
        {
          device: this.webGPUDevice ? 'webgpu' : 'webgl',
          dtype: 'fp16',
          cache_dir: this.modelCache?.getCacheDir()
        }
      );
      
      // Initialize audio processor
      this.audioProcessor = await this.initializeAudioProcessor();
      
      this.isInitialized = true;
      console.log('WhisperClientEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WhisperClientEngine:', error);
      throw error;
    }
  }

  /**
   * Initialize WebGPU device
   */
  async initializeWebGPU() {
    try {
      if (!('gpu' in navigator)) {
        console.warn('WebGPU not supported');
        return;
      }

      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      if (!adapter) {
        console.warn('WebGPU adapter not available');
        return;
      }

      this.webGPUDevice = await adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {
          maxComputeWorkgroupStorageSize: 16384,
          maxStorageBufferBindingSize: 134217728
        }
      });

      console.log('WebGPU device initialized:', this.webGPUDevice);
      
    } catch (error) {
      console.warn('WebGPU initialization failed:', error);
      this.webGPUDevice = null;
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
        cacheName: 'whisper-models'
      });
      
      await this.modelCache.initialize();
      console.log('Model cache manager initialized');
    } catch (error) {
      console.warn('Model cache manager initialization failed:', error);
    }
  }

  /**
   * Initialize audio processor
   */
  async initializeAudioProcessor() {
    try {
      const { AudioChunkOptimizer } = await import('./AudioChunkOptimizer.js');
      return new AudioChunkOptimizer({
        sampleRate: 16000,
        chunkSize: this.config.chunkLengthS * 16000,
        overlapSize: this.config.strideLengthS * 16000,
        medicalMode: this.config.medicalMode
      });
    } catch (error) {
      console.warn('Audio processor initialization failed:', error);
      return null;
    }
  }

  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && this.pipeline !== null;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig, callbacks = {}) {
    if (!this.isInitialized) {
      throw new Error('WhisperClientEngine not initialized');
    }

    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    this.isTranscribing = true;
    this.currentSession = {
      id: `whisper-session-${Date.now()}`,
      startTime: Date.now(),
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: []
    };

    console.log('Starting Whisper client transcription');
    
    return {
      success: true,
      data: {
        sessionId: this.currentSession.id,
        engine: 'whisper-client',
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
    
    // Process any remaining audio in queue
    await this.processQueuedAudio();
    
    // Finalize transcription
    const finalResult = await this.finalizeTranscription();
    
    this.currentSession = null;
    
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
      // Optimize audio chunk for processing
      const optimizedChunk = await this.optimizeAudioChunk(audioData, config);
      
      // Add to processing queue
      this.processingQueue.push({
        id: `chunk-${Date.now()}`,
        data: optimizedChunk,
        timestamp: Date.now(),
        config
      });
      
      // Process queue if not already processing
      if (this.processingQueue.length === 1) {
        await this.processQueue();
      }
      
      return {
        success: true,
        data: {
          chunkId: this.processingQueue[this.processingQueue.length - 1].id,
          queueLength: this.processingQueue.length
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
   * Process audio queue
   */
  async processQueue() {
    while (this.processingQueue.length > 0 && this.isTranscribing) {
      const chunk = this.processingQueue.shift();
      
      try {
        const result = await this.transcribeChunk(chunk.data, chunk.config);
        
        if (result.text && result.text.trim().length > 0) {
          const segment = {
            id: chunk.id,
            text: result.text,
            startTime: chunk.timestamp,
            endTime: Date.now(),
            confidence: result.confidence || 0.9,
            speaker: 'doctor',
            language: this.config.language
          };
          
          this.currentSession.segments.push(segment);
          this.currentSession.fullText += ` ${result.text}`;
          
          // Extract medical terms
          if (this.config.medicalMode) {
            const medicalTerms = await this.extractMedicalTerms(result.text);
            this.currentSession.medicalTerms.push(...medicalTerms);
          }
          
          // Real-time callback
          if (this.currentSession.callbacks.onTranscriptionUpdate) {
            this.currentSession.callbacks.onTranscriptionUpdate({
              segment,
              fullText: this.currentSession.fullText.trim(),
              medicalTerms: this.currentSession.medicalTerms,
              confidence: this.calculateOverallConfidence()
            });
          }
        }
        
      } catch (error) {
        console.error('Error transcribing chunk:', error);
        
        // Continue processing other chunks
        if (this.currentSession.callbacks.onError) {
          this.currentSession.callbacks.onError(error);
        }
      }
    }
  }

  /**
   * Process queued audio before stopping
   */
  async processQueuedAudio() {
    if (this.processingQueue.length > 0) {
      console.log(`Processing ${this.processingQueue.length} remaining audio chunks...`);
      await this.processQueue();
    }
  }

  /**
   * Optimize audio chunk for Whisper processing
   */
  async optimizeAudioChunk(audioData, config) {
    try {
      if (this.audioProcessor) {
        return await this.audioProcessor.optimizeForWhisper(audioData, config);
      }
      
      // Basic optimization without AudioChunkOptimizer
      return await this.basicAudioOptimization(audioData, config);
      
    } catch (error) {
      console.error('Audio optimization failed:', error);
      return audioData;
    }
  }

  /**
   * Basic audio optimization fallback
   */
  async basicAudioOptimization(audioData, config) {
    // Convert to Float32Array at 16kHz for Whisper
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    
    // Get mono channel data
    const channelData = audioBuffer.getChannelData(0);
    
    // Apply basic noise reduction
    const filtered = this.applyBasicFilter(channelData);
    
    return filtered;
  }

  /**
   * Apply basic audio filtering
   */
  applyBasicFilter(audioData) {
    // Simple high-pass filter to reduce low-frequency noise
    const filtered = new Float32Array(audioData.length);
    const alpha = 0.95;
    
    filtered[0] = audioData[0];
    
    for (let i = 1; i < audioData.length; i++) {
      filtered[i] = alpha * (filtered[i - 1] + audioData[i] - audioData[i - 1]);
    }
    
    return filtered;
  }

  /**
   * Transcribe audio chunk using Whisper
   */
  async transcribeChunk(audioData, config) {
    try {
      const result = await this.pipeline(audioData, {
        language: this.config.language,
        task: this.config.task,
        return_timestamps: true,
        chunk_length_s: this.config.chunkLengthS,
        stride_length_s: this.config.strideLengthS
      });
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0.9,
        timestamps: result.chunks || []
      };
      
    } catch (error) {
      console.error('Whisper transcription failed:', error);
      throw error;
    }
  }

  /**
   * Extract medical terms from transcribed text
   */
  async extractMedicalTerms(text) {
    try {
      const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js');
      const enhancer = new MedicalTerminologyEnhancer();
      return await enhancer.extractTerms(text, 'es-MX');
    } catch (error) {
      console.warn('Medical term extraction failed:', error);
      return [];
    }
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence() {
    if (this.currentSession.segments.length === 0) return 0;
    
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
      engine: 'whisper-client',
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
    console.log('Medical context set for WhisperClientEngine:', context);
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      modelName: this.config.modelName,
      backend: this.webGPUDevice ? 'webgpu' : 'webgl',
      isInitialized: this.isInitialized,
      isTranscribing: this.isTranscribing,
      queueLength: this.processingQueue.length,
      webGPUSupported: !!this.webGPUDevice,
      medicalMode: this.config.medicalMode
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
      
      // Clear processing queue
      this.processingQueue = [];
      
      // Cleanup pipeline
      if (this.pipeline && typeof this.pipeline.dispose === 'function') {
        await this.pipeline.dispose();
      }
      
      // Cleanup WebGPU device
      if (this.webGPUDevice && typeof this.webGPUDevice.destroy === 'function') {
        this.webGPUDevice.destroy();
      }
      
      // Reset state
      this.isInitialized = false;
      this.pipeline = null;
      this.webGPUDevice = null;
      this.currentSession = null;
      
      console.log('WhisperClientEngine cleanup completed');
      
    } catch (error) {
      console.error('Error during WhisperClientEngine cleanup:', error);
    }
  }
}

export default WhisperClientEngine;