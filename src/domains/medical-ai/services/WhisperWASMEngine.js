/**
 * WhisperWASMEngine
 * 
 * Real Whisper.cpp WebAssembly implementation for browser-based medical transcription
 * Uses Web Worker for non-blocking audio processing
 */

import { TranscriptionStatus } from '../types';

export class WhisperWASMEngine {
  constructor(config = {}) {
    this.config = {
      modelName: config.modelName || 'whisper-base',
      language: config.language || 'es',
      sampleRate: config.sampleRate || 16000,
      chunkSize: config.chunkSize || 1024,
      medicalMode: config.medicalMode || true,
      wasmPath: config.wasmPath || '/whisper.wasm',
      modelPath: config.modelPath || '/models/whisper-base.bin',
      n_threads: config.n_threads || Math.min(navigator.hardwareConcurrency || 4, 8),
      translate: config.translate || false,
      no_context: config.no_context || false,
      single_segment: config.single_segment || false,
      print_timestamps: config.print_timestamps || true,
      maxAudioLength: config.maxAudioLength || 30, // seconds
      ...config
    };

    this.worker = null;
    this.isInitialized = false;
    this.isTranscribing = false;
    this.currentSession = null;
    this.audioBuffer = [];
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.processingQueue = [];
    this.messageId = 0;
    this.pendingMessages = new Map();
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
      
      // Initialize Web Worker
      await this.initializeWorker();
      
      // Initialize Whisper in worker
      await this.initializeWhisperInWorker();
      
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
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('Audio context initialized:', {
        sampleRate: this.audioContext.sampleRate,
        state: this.audioContext.state
      });
      
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  /**
   * Initialize Web Worker
   */
  async initializeWorker() {
    try {
      // Create worker with proper WASM support
      this.worker = new Worker(
        new URL('./whisper-worker.js', import.meta.url),
        { 
          type: 'module',
          name: 'whisper-wasm-worker'
        }
      );
      
      // Setup worker message handling
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.handleWorkerError(error);
      };
      
      console.log('Worker initialized');
      
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      throw error;
    }
  }

  /**
   * Initialize Whisper in worker
   */
  async initializeWhisperInWorker() {
    try {
      const result = await this.sendWorkerMessage('initialize', {
        wasmPath: this.config.wasmPath,
        modelPath: this.config.modelPath,
        language: this.config.language,
        n_threads: this.config.n_threads,
        translate: this.config.translate,
        no_context: this.config.no_context,
        single_segment: this.config.single_segment,
        print_timestamps: this.config.print_timestamps
      });
      
      console.log('Whisper initialized in worker:', result);
      
    } catch (error) {
      console.error('Failed to initialize Whisper in worker:', error);
      throw error;
    }
  }

  /**
   * Send message to worker and wait for response
   */
  async sendWorkerMessage(type, data, timeout = 30000) {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(id);
        reject(new Error(`Worker message timeout: ${type}`));
      }, timeout);
      
      this.pendingMessages.set(id, {
        resolve,
        reject,
        timeoutId,
        type
      });
      
      this.worker.postMessage({ type, data, id });
    });
  }

  /**
   * Handle worker messages
   */
  handleWorkerMessage(message) {
    const { type, data, id } = message;
    
    if (id && this.pendingMessages.has(id)) {
      const pending = this.pendingMessages.get(id);
      clearTimeout(pending.timeoutId);
      this.pendingMessages.delete(id);
      
      if (type === 'success') {
        pending.resolve(data);
      } else if (type === 'error') {
        pending.reject(new Error(data.message || 'Worker error'));
      }
    } else {
      // Handle broadcast messages
      this.handleBroadcastMessage(type, data);
    }
  }

  /**
   * Handle broadcast messages from worker
   */
  handleBroadcastMessage(type, data) {
    switch (type) {
      case 'transcription-progress':
        this.handleTranscriptionProgress(data);
        break;
      case 'transcription-complete':
        this.handleTranscriptionComplete(data);
        break;
      case 'error':
        this.handleWorkerError(data);
        break;
      default:
        console.log('Unhandled broadcast message:', type, data);
    }
  }

  /**
   * Handle worker errors
   */
  handleWorkerError(error) {
    console.error('Worker error:', error);
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
      console.log('Attempting to recover from worker error...');
      
      // Reinitialize worker
      await this.initializeWorker();
      await this.initializeWhisperInWorker();
      
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
    if (!this.isInitialized || !this.worker) {
      return false;
    }
    
    try {
      const status = await this.sendWorkerMessage('getStatus');
      return status.isInitialized && status.hasModel && status.hasContext;
    } catch (error) {
      console.error('Error checking readiness:', error);
      return false;
    }
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
      
      // Send to worker for transcription
      const result = await this.sendWorkerMessage('transcribe', combinedAudio);
      
      if (result.success) {
        this.handleTranscriptionResult(result);
      }
      
    } catch (error) {
      console.error('Error processing audio buffer:', error);
      this.handleWorkerError(error);
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
      const result = await this.sendWorkerMessage('transcribe', audioData);
      
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
      
      // Clean up worker
      if (this.worker) {
        await this.sendWorkerMessage('cleanup');
        this.worker.terminate();
        this.worker = null;
      }
      
      // Clean up audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      // Clear pending messages
      for (const [id, pending] of this.pendingMessages) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error('Engine cleanup'));
      }
      this.pendingMessages.clear();
      
      // Reset state
      this.isInitialized = false;
      this.currentSession = null;
      this.audioBuffer = [];
      
      console.log('WhisperWASMEngine cleanup completed');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WhisperWASMEngine;