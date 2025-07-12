/**
 * WhisperWASMEngine
 * 
 * Real Whisper.cpp WebAssembly implementation for browser-based medical transcription
 * Uses official whisper.cpp WASM runtime with direct API calls
 */

import { TranscriptionStatus } from '../types';
import { loadRemotePromise, getModelSize, checkStorageQuota } from '../utils/whisperUtils';

export class WhisperWASMEngine {
  constructor(config = {}) {
    this.config = {
      modelName: config.modelName || 'base.en',
      language: config.language || 'es',
      sampleRate: config.sampleRate || 16000,
      chunkSize: config.chunkSize || 1024,
      medicalMode: config.medicalMode || true,
      modelPath: config.modelPath || '/models/ggml-base.en.bin',
      n_threads: config.n_threads || Math.min(navigator.hardwareConcurrency || 4, 8),
      translate: config.translate || false,
      maxAudioLength: config.maxAudioLength || 30, // seconds
      ...config
    };

    this.Module = null;
    this.whisperInstance = null;
    this.isInitialized = false;
    this.isTranscribing = false;
    this.currentSession = null;
    this.audioBuffer = [];
    this.audioContext = null;
    this.audioStream = null;
    this.audioProcessor = null;
    this.medicalContext = null;
    this.errorCount = 0;
    this.maxErrors = 5;
  }

  /**
   * Initialize Whisper WASM engine
   */
  async initialize() {
    try {
      console.log('Initializing WhisperWASMEngine...');
      
      // Check WebAssembly support
      if (!this.checkWebAssemblySupport()) {
        throw new Error('WebAssembly not supported in this browser');
      }
      
      // Check SharedArrayBuffer support for optimal performance
      if (!this.checkSharedArrayBufferSupport()) {
        console.warn('SharedArrayBuffer not available, performance may be reduced');
      }
      
      // Initialize audio context
      await this.initializeAudioContext();
      
      // Load Whisper.cpp WASM modules
      await this.loadWhisperModules();
            
      // Initialize Whisper instance
      await this.initializeWhisperInstance();
      
      this.isInitialized = true;
      console.log('WhisperWASMEngine initialized successfully');
      
      return {
        success: true,
        message: 'WhisperWASMEngine initialized',
        config: this.config
      };
      
    } catch (error) {
      console.error('Failed to initialize WhisperWASMEngine:', error);
      throw error;
    }
  }

  /**
   * Check WebAssembly support
   */
  checkWebAssemblySupport() {
    return typeof WebAssembly === 'object' && 
           typeof WebAssembly.instantiate === 'function';
  }

  /**
   * Check SharedArrayBuffer support
   */
  checkSharedArrayBufferSupport() {
    return typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Initialize audio context
   */
  async initializeAudioContext() {
    try {
      // Don't create AudioContext here - it will be created after user interaction
      // Just check if AudioContext is available
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error('AudioContext not supported in this browser');
      }
      
      console.log('AudioContext support verified, will initialize on user interaction');
      
    } catch (error) {
      console.error('Failed to verify audio context support:', error);
      throw error;
    }
  }
  
  /**
   * Set audio context from user interaction
   */
  setAudioContext(audioContext, audioStream = null) {
    this.audioContext = audioContext;
    this.audioStream = audioStream;
    console.log('Audio context set from user interaction:', {
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state,
      hasStream: !!audioStream
    });
  }
  
  /**
   * Check if user interaction is required
   */
  requiresUserInteraction() {
    return !this.audioContext || this.audioContext.state === 'suspended';
  }
  
  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && this.audioContext && this.audioContext.state === 'running';
  }

  /**
   * Load Whisper.cpp WASM modules
   */
  async loadWhisperModules() {
    try {
      // Load the main whisper.cpp WASM module
      if (!window.Module) {
        await this.loadScript('/main.js');
      }
      
      // Setup Module configuration
      if (!window.Module) {
        window.Module = {};
      }
      
      window.Module.print = (text) => {
        console.log('Whisper:', text);
      };
      
      window.Module.printErr = (text) => {
        console.error('Whisper Error:', text);
      };
      
      window.Module.setStatus = (text) => {
        console.log('Whisper Status:', text);
      };
      
      // Wait for module to be ready
      await new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (window.Module && window.Module.init && window.Module.full_default) {
            clearInterval(checkInterval);
            this.Module = window.Module;
            console.log('Whisper.cpp modules loaded successfully');
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for Whisper modules to load'));
        }, 30000);
      });
      
    } catch (error) {
      console.error('Failed to load Whisper modules:', error);
      throw error;
    }
  }

  /**
   * Load model into WASM filesystem with caching
   */
  async loadModel() {
    try {
      console.log('Loading model with cache:', this.config.modelPath);
      
      // Check storage quota before loading
      const storageInfo = await checkStorageQuota();
      const modelSize = getModelSize(this.config.modelName);
      const requiredSpace = modelSize * 1024 * 1024; // Convert MB to bytes
      
      if (storageInfo.available < requiredSpace) {
        console.warn(`Storage warning: Required ${modelSize}MB, Available ${Math.round(storageInfo.available / 1024 / 1024)}MB`);
      }
      
      // Load model with caching and progress feedback
      const result = await loadRemotePromise(
        this.config.modelPath,
        this.config.modelName,
        {
          size: modelSize,
          onProgress: (progress) => {
            console.log(`Model loading progress: ${progress.percentage}%`);
            
            // Emit progress event if callbacks are available
            if (this.currentSession?.callbacks?.onProgress) {
              this.currentSession.callbacks.onProgress({
                stage: 'model_loading',
                progress: progress.progress,
                percentage: progress.percentage,
                message: `Loading ${this.config.modelName} model... ${progress.percentage}%`
              });
            }
          },
          onMessage: (message) => {
            console.log(`Model loading: ${message}`);
            
            // Emit message event if callbacks are available
            if (this.currentSession?.callbacks?.onMessage) {
              this.currentSession.callbacks.onMessage({
                stage: 'model_loading',
                message: message
              });
            }
          }
        }
      );
      
      const modelBuffer = result.data;
      const modelFilename = 'whisper.bin';
      
      // Remove existing model file if it exists
      try {
        this.Module.FS_unlink(modelFilename);
      } catch (e) {
        // Ignore if file doesn't exist
      }
      
      // Create new model file in WASM filesystem
      this.Module.FS_createDataFile('/', modelFilename, modelBuffer, true, true);
      
      console.log('Model loaded successfully:', {
        filename: modelFilename,
        size: modelBuffer.length,
        cached: true,
        modelName: this.config.modelName
      });
      
      this.modelFilename = modelFilename;
      
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Initialize Whisper instance
   */
  async initializeWhisperInstance() {
    try {
      if (!this.Module || !this.modelFilename) {
        throw new Error('Module or model not loaded');
      }
      
      // Initialize Whisper instance
      this.whisperInstance = this.Module.init(this.modelFilename);
      
      if (!this.whisperInstance) {
        throw new Error('Failed to initialize Whisper instance');
      }
      
      console.log('Whisper instance initialized:', this.whisperInstance);
      
    } catch (error) {
      console.error('Failed to initialize Whisper instance:', error);
      throw error;
    }
  }

  /**
   * Load script dynamically
   */
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Handle transcription errors
   */
  handleTranscriptionError(error) {
    console.error('Transcription error:', error);
    this.errorCount++;
    
    if (this.currentSession?.callbacks?.onError) {
      this.currentSession.callbacks.onError({
        error: error.message || error,
        recoverable: this.errorCount < this.maxErrors,
        errorCount: this.errorCount
      });
    }
    
    // Attempt recovery if under error limit
    if (this.errorCount < this.maxErrors) {
      this.attemptRecovery();
    } else {
      this.handleFatalError(error);
    }
  }

  /**
   * Attempt error recovery
   */
  async attemptRecovery() {
    try {
      console.log('Attempting to recover from transcription error...');
      
      // Reinitialize Whisper instance
      await this.initializeWhisperInstance();
      
      console.log('Recovery successful');
      this.errorCount = 0;
      
    } catch (error) {
      console.error('Recovery failed:', error);
      this.handleFatalError(error);
    }
  }

  /**
   * Handle fatal errors
   */
  handleFatalError(error) {
    console.error('Fatal error in WhisperWASMEngine:', error);
    
    if (this.currentSession?.callbacks?.onError) {
      this.currentSession.callbacks.onError({
        error: error.message || error,
        recoverable: false,
        fatal: true
      });
    }
    
    this.cleanup();
  }

  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && 
           this.Module && 
           this.whisperInstance && 
           this.modelFilename;
  }

  /**
   * Start transcription session
   */
  async startTranscription(audioConfig = {}, callbacks = {}) {
    if (!this.isInitialized) {
      throw new Error('WhisperWASMEngine not initialized');
    }
    
    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }
    
    try {
      this.isTranscribing = true;
      this.audioBuffer = [];
      
      this.currentSession = {
        id: `whisper-session-${Date.now()}`,
        startTime: Date.now(),
        endTime: null,
        audioConfig: { ...this.config, ...audioConfig },
        callbacks,
        segments: [],
        fullText: '',
        status: TranscriptionStatus.RECORDING,
        language: this.config.language,
        medicalMode: this.config.medicalMode
      };
      
      // Start audio capture
      await this.startAudioCapture();
      
      console.log('Transcription started:', this.currentSession.id);
      
      if (callbacks.onStart) {
        callbacks.onStart({
          sessionId: this.currentSession.id,
          status: TranscriptionStatus.RECORDING
        });
      }
      
      return {
        success: true,
        data: {
          sessionId: this.currentSession.id,
          engine: 'whisper-wasm',
          status: TranscriptionStatus.RECORDING
        }
      };
      
    } catch (error) {
      this.isTranscribing = false;
      this.currentSession = null;
      console.error('Failed to start transcription:', error);
      throw error;
    }
  }

  /**
   * Stop transcription session
   */
  async stopTranscription() {
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription session');
    }
    
    try {
      // Stop audio capture
      await this.stopAudioCapture();
      
      // Process accumulated audio
      if (this.audioBuffer.length > 0) {
        await this.processAudioBuffer();
      }
      
      // Finalize session
      this.currentSession.endTime = Date.now();
      this.currentSession.status = TranscriptionStatus.COMPLETED;
      
      const result = {
        sessionId: this.currentSession.id,
        fullText: this.currentSession.fullText,
        segments: this.currentSession.segments,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        language: this.currentSession.language,
        engine: 'whisper-wasm'
      };
      
      if (this.currentSession.callbacks.onComplete) {
        this.currentSession.callbacks.onComplete(result);
      }
      
      this.isTranscribing = false;
      this.currentSession = null;
      
      console.log('Transcription completed:', result);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Failed to stop transcription:', error);
      throw error;
    }
  }

  /**
   * Start audio capture
   */
  async startAudioCapture() {
    try {
      // Get user media
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Create audio processing pipeline
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      const processor = this.audioContext.createScriptProcessor(this.config.chunkSize, 1, 1);
      
      processor.onaudioprocess = (event) => {
        this.processAudioChunk(event.inputBuffer);
      };
      
      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
      this.audioProcessor = processor;
      
      console.log('Audio capture started');
      
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  async stopAudioCapture() {
    try {
      if (this.audioProcessor) {
        this.audioProcessor.disconnect();
        this.audioProcessor = null;
      }
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      console.log('Audio capture stopped');
      
    } catch (error) {
      console.error('Error stopping audio capture:', error);
    }
  }

  /**
   * Process audio chunk
   */
  processAudioChunk(audioBuffer) {
    if (!this.isTranscribing) return;
    
    // Convert to Float32Array
    const channelData = audioBuffer.getChannelData(0);
    const audioData = new Float32Array(channelData);
    
    // Add to buffer
    this.audioBuffer.push(audioData);
    
    // Process buffer when we have enough data (e.g., 1 second)
    const bufferDuration = this.audioBuffer.length * this.config.chunkSize / this.config.sampleRate;
    if (bufferDuration >= 1.0) {
      this.processAudioBuffer();
    }
  }

  /**
   * Process accumulated audio buffer
   */
  async processAudioBuffer() {
    if (this.audioBuffer.length === 0) return;
    
    try {
      // Combine audio chunks
      const totalLength = this.audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedAudio = new Float32Array(totalLength);
      
      let offset = 0;
      for (const chunk of this.audioBuffer) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Clear buffer
      this.audioBuffer = [];
      
      // Truncate to max length if needed
      const maxSamples = this.config.maxAudioLength * this.config.sampleRate;
      const audioData = combinedAudio.length > maxSamples ? 
        combinedAudio.slice(0, maxSamples) : combinedAudio;
      
      // Transcribe using Whisper.cpp API
      const result = await this.transcribeAudio(audioData);
      
      if (result.success) {
        this.handleTranscriptionResult(result);
      }
      
    } catch (error) {
      console.error('Error processing audio buffer:', error);
      this.handleTranscriptionError(error);
    }
  }

  /**
   * Transcribe audio using Whisper.cpp API
   */
  async transcribeAudio(audioData) {
    try {
      if (!this.Module || !this.whisperInstance) {
        throw new Error('Whisper not initialized');
      }
      
      console.log('Transcribing audio:', {
        samples: audioData.length,
        duration: audioData.length / this.config.sampleRate,
        language: this.config.language
      });
      
      // Call Whisper.cpp full_default API
      const result = this.Module.full_default(
        this.whisperInstance,
        audioData,
        this.config.language,
        this.config.n_threads,
        this.config.translate
      );
      
      if (result) {
        // Parse the transcription result
        const transcription = this.parseTranscriptionResult(result);
        
        return {
          success: true,
          transcription
        };
      } else {
        throw new Error('Whisper transcription failed');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse transcription result from Whisper.cpp
   */
  parseTranscriptionResult(result) {
    try {
      // The result format from whisper.cpp may vary
      // For now, treat it as a simple string
      const text = typeof result === 'string' ? result : result.toString();
      
      // Create segments from the text
      const segments = [{
        start: 0,
        end: this.audioBuffer.length / this.config.sampleRate,
        text: text.trim(),
        confidence: 0.9, // Default confidence
        speaker: null,
        language: this.config.language
      }];
      
      return {
        text: text.trim(),
        segments,
        language: this.config.language
      };
      
    } catch (error) {
      console.error('Error parsing transcription result:', error);
      return {
        text: '',
        segments: [],
        language: this.config.language
      };
    }
  }

  /**
   * Handle transcription result
   */
  handleTranscriptionResult(result) {
    if (!this.currentSession) return;
    
    const { transcription } = result;
    
    if (transcription.text && transcription.text.trim()) {
      // Add segments
      for (const segment of transcription.segments) {
        const enhancedSegment = {
          ...segment,
          sessionId: this.currentSession.id,
          engine: 'whisper-wasm',
          timestamp: Date.now()
        };
        
        this.currentSession.segments.push(enhancedSegment);
      }
      
      // Update full text
      this.currentSession.fullText += ' ' + transcription.text;
      
      // Real-time callback
      if (this.currentSession.callbacks.onTranscriptionUpdate) {
        this.currentSession.callbacks.onTranscriptionUpdate({
          text: transcription.text,
          fullText: this.currentSession.fullText.trim(),
          segments: transcription.segments,
          confidence: this.calculateAverageConfidence(),
          engine: 'whisper-wasm'
        });
      }
    }
  }

  /**
   * Calculate average confidence
   */
  calculateAverageConfidence() {
    if (!this.currentSession?.segments?.length) return 0.9;
    
    const totalConfidence = this.currentSession.segments.reduce(
      (sum, segment) => sum + (segment.confidence || 0.9), 0
    );
    
    return totalConfidence / this.currentSession.segments.length;
  }

  /**
   * Process audio chunk directly (for external audio streams)
   */
  async processAudioChunk(audioData, config = {}) {
    if (!this.isInitialized) {
      throw new Error('WhisperWASMEngine not initialized');
    }
    
    try {
      const result = await this.transcribeAudio(audioData);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      throw error;
    }
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
      backend: 'whisper-wasm',
      modelName: this.config.modelName,
      language: this.config.language,
      sampleRate: this.config.sampleRate,
      isInitialized: this.isInitialized,
      isTranscribing: this.isTranscribing,
      errorCount: this.errorCount,
      audioBufferLength: this.audioBuffer.length,
      currentSession: this.currentSession ? {
        id: this.currentSession.id,
        status: this.currentSession.status,
        segments: this.currentSession.segments.length
      } : null
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'zh', name: '中文' }
    ];
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Get model cache information
   */
  async getModelCacheInfo() {
    try {
      const storageInfo = await checkStorageQuota();
      const { getCachedModels } = await import('../utils/whisperUtils');
      const cachedModels = await getCachedModels();
      
      return {
        storage: {
          quota: Math.round(storageInfo.quota / 1024 / 1024),
          usage: Math.round(storageInfo.usage / 1024 / 1024),
          available: Math.round(storageInfo.available / 1024 / 1024)
        },
        cachedModels: cachedModels,
        currentModel: {
          name: this.config.modelName,
          path: this.config.modelPath,
          estimatedSize: getModelSize(this.config.modelName)
        }
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      throw error;
    }
  }

  /**
   * Clear model cache
   */
  async clearModelCache() {
    try {
      const { clearCache } = await import('../utils/whisperUtils');
      return await clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Remove specific model from cache
   */
  async removeModelFromCache(modelUrl) {
    try {
      const { removeFromCache } = await import('../utils/whisperUtils');
      return await removeFromCache(modelUrl);
    } catch (error) {
      console.error('Failed to remove model from cache:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      console.log('Cleaning up WhisperWASMEngine...');
      
      // Stop any active transcription
      if (this.isTranscribing) {
        await this.stopTranscription();
      }
      
      // Stop audio capture
      await this.stopAudioCapture();
      
      // Clean up Whisper instance
      if (this.whisperInstance && this.Module) {
        try {
          // Call cleanup function if available
          if (this.Module.cleanup) {
            this.Module.cleanup(this.whisperInstance);
          }
        } catch (error) {
          console.error('Error cleaning up Whisper instance:', error);
        }
        this.whisperInstance = null;
      }
      
      // Clean up audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      // Reset state
      this.isInitialized = false;
      this.currentSession = null;
      this.audioBuffer = [];
      this.Module = null;
      this.modelFilename = null;
      
      console.log('WhisperWASMEngine cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WhisperWASMEngine;