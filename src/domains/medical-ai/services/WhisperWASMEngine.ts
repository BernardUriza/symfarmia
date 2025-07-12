/**
 * WhisperWASMEngine
 * 
 * Real Whisper.cpp WebAssembly implementation for browser-based medical transcription
 * Uses official whisper.cpp WASM runtime with direct API calls
 */

import { TranscriptionStatus } from '../types';
import {
  TranscriptionEngine,
  WhisperWASMConfig,
  InitializationResult,
  TranscriptionResult,
  TranscriptionSession,
  TranscriptionCallbacks,
  AudioData,
  EngineStats,
  MedicalContext,
  TranscriptionSegment,
  TranscriptionCompleteEvent
} from '../types/transcription-engines';

interface WhisperModule {
  init: (modelFilename: string) => any;
  full_default: (instance: any, audioData: Float32Array, language: string, threads: number, translate: boolean) => string;
  cleanup?: (instance: any) => void;
  FS: {
    stat: (path: string) => any;
    writeFile: (path: string, data: Uint8Array) => void;
  };
  print?: (text: string) => void;
  printErr?: (text: string) => void;
  setStatus?: (text: string) => void;
}

export class WhisperWASMEngine implements TranscriptionEngine {
  private config: WhisperWASMConfig;
  private Module: WhisperModule | null = null;
  private whisperInstance: any = null;
  private isInitialized: boolean = false;
  private isTranscribing: boolean = false;
  private currentSession: TranscriptionSession | null = null;
  private audioBuffer: Float32Array[] = [];
  private audioContext: AudioContext | null = null;
  private audioStream: MediaStream | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private medicalContext: MedicalContext | null = null;
  private errorCount: number = 0;
  private maxErrors: number = 5;
  private modelFilename: string | null = null;

  constructor(config: WhisperWASMConfig = {}) {
    this.config = {
      modelName: config.modelName || 'base.en',
      language: config.language || 'es',
      sampleRate: config.sampleRate || 16000,
      chunkSize: config.chunkSize || 1024,
      medicalMode: config.medicalMode || true,
      n_threads: config.n_threads || Math.min(navigator.hardwareConcurrency || 4, 8),
      translate: config.translate || false,
      maxAudioLength: config.maxAudioLength || 30, // seconds
      ...config
    };
  }

  /**
   * Initialize Whisper WASM engine
   */
  async initialize(): Promise<InitializationResult> {
    try {
      // Initializing WhisperWASMEngine...
      
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
      
      // Load the model file
      await this.loadModel();
            
      // Initialize Whisper instance
      await this.initializeWhisperInstance();
      
      this.isInitialized = true;
      console.log('✓ WhisperWASMEngine ready');
      
      return {
        success: true,
        message: 'WhisperWASMEngine initialized',
        config: this.config
      };
      
    } catch (error) {
      console.error('Failed to initialize WhisperWASMEngine:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Initialization failed',
        recoverable: true
      };
    }
  }

  /**
   * Check WebAssembly support
   */
  private checkWebAssemblySupport(): boolean {
    return typeof WebAssembly === 'object' && 
           typeof WebAssembly.instantiate === 'function';
  }

  /**
   * Check SharedArrayBuffer support
   */
  private checkSharedArrayBufferSupport(): boolean {
    return typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Initialize audio context
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // Don't create AudioContext here - it will be created after user interaction
      // Just check if AudioContext is available
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        throw new Error('AudioContext not supported in this browser');
      }
      
      // AudioContext support verified
      
    } catch (error) {
      console.error('Failed to verify audio context support:', error);
      throw error;
    }
  }
  
  /**
   * Set audio context from user interaction
   */
  setAudioContext(audioContext: AudioContext, audioStream: MediaStream | null = null): void {
    this.audioContext = audioContext;
    this.audioStream = audioStream;
    // Audio context set from user interaction
  }
  
  /**
   * Check if user interaction is required
   */
  requiresUserInteraction(): boolean {
    return !this.audioContext || this.audioContext.state === 'suspended';
  }
  

  /**
   * Load Whisper.cpp WASM modules
   */
  private async loadWhisperModules(): Promise<void> {
    try {
      // Load the main whisper.cpp WASM module
      if (!(window as any).Module) {
        await this.loadScript('/main.js');
      }
      
      // Setup Module configuration
      if (!(window as any).Module) {
        (window as any).Module = {};
      }
      
      (window as any).Module.print = () => {}; // Suppress module logs
      
      (window as any).Module.printErr = (text: string) => {
        if (text && text.includes('error')) {
          console.error('Whisper Error:', text);
        }
      };
      
      (window as any).Module.setStatus = () => {}; // Suppress status logs
      
      // Wait for module to be ready
      await new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if ((window as any).Module && (window as any).Module.init && (window as any).Module.full_default) {
            clearInterval(checkInterval);
            this.Module = (window as any).Module as WhisperModule;
            // Whisper.cpp modules loaded
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
   * Load model file
   */
  private async loadModel(): Promise<void> {
    try {
      // Loading Whisper model
      
      // Model file mapping
      const modelFiles = {
        'tiny': 'ggml-tiny.bin',
        'tiny.en': 'ggml-tiny.en.bin',
        'base': 'ggml-base.bin',
        'base.en': 'ggml-base.en.bin',
        'small': 'ggml-small.bin',
        'small.en': 'ggml-small.en.bin',
        'medium': 'ggml-medium.bin',
        'medium.en': 'ggml-medium.en.bin'
      };
      
      this.modelFilename = modelFiles[this.config.modelName!] || 'ggml-base.en.bin';
      
      // Check if model is already cached
      if ((window as any).Module && (window as any).Module.FS) {
        try {
          const stat = (window as any).Module.FS.stat('/' + this.modelFilename);
          if (stat) {
            // Model already loaded
            return;
          }
        } catch (e) {
          // Model not cached, proceed to download
        }
      }
      
      // Download model file
      const modelUrl = `/models/${this.modelFilename}`;
      // Downloading model
      
      const response = await fetch(modelUrl);
      if (!response.ok) {
        throw new Error(`Failed to download model: ${response.status}`);
      }
      
      const modelData = await response.arrayBuffer();
      // Model downloaded
      
      // Store model in WASM filesystem
      if ((window as any).Module && (window as any).Module.FS) {
        const modelArray = new Uint8Array(modelData);
        (window as any).Module.FS.writeFile('/' + this.modelFilename, modelArray);
        // Model stored in WASM filesystem
      }
      
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Initialize Whisper instance
   */
  private async initializeWhisperInstance(): Promise<void> {
    try {
      if (!this.Module || !this.modelFilename) {
        throw new Error('Module or model not loaded');
      }
      
      // Initialize Whisper instance
      this.whisperInstance = this.Module.init(this.modelFilename);
      
      if (!this.whisperInstance) {
        throw new Error('Failed to initialize Whisper instance');
      }
      
      // Whisper instance initialized
      
    } catch (error) {
      console.error('Failed to initialize Whisper instance:', error);
      throw error;
    }
  }

  /**
   * Load script dynamically
   */
  private async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Handle transcription errors
   */
  private handleTranscriptionError(error: Error | any): void {
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
  private async attemptRecovery(): Promise<void> {
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
  private handleFatalError(error: Error | any): void {
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
  async isReady(): Promise<boolean> {
    return this.isInitialized && 
           this.Module && 
           this.whisperInstance && 
           this.modelFilename &&
           this.audioContext && 
           this.audioContext.state === 'running';
  }

  /**
   * Start transcription session
   */
  async startTranscription(audioConfig?: any, callbacks: TranscriptionCallbacks = {}): Promise<TranscriptionResult> {
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
        language: this.config.language || 'es',
        medicalMode: this.config.medicalMode,
        medicalTerms: []
      };
      
      // Start audio capture
      await this.startAudioCapture();
      
      // Transcription started
      
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
  async stopTranscription(): Promise<TranscriptionResult> {
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription session');
    }
    
    try {
      // Stop audio capture
      await this.stopAudioCapture();
      
      // Process accumulated audio
      if (this.audioBuffer.length > 0) {
        await this.processAudioBufferAsync();
      }
      
      // Finalize session
      this.currentSession.endTime = Date.now();
      this.currentSession.status = TranscriptionStatus.COMPLETED;
      
      const result: TranscriptionCompleteEvent = {
        id: this.currentSession.id,
        text: this.currentSession.fullText,
        segments: this.currentSession.segments,
        medicalTerms: this.currentSession.medicalTerms || [],
        confidence: 0.9,
        language: this.currentSession.language || 'es',
        engine: 'whisper-wasm',
        processingTime: this.currentSession.endTime - this.currentSession.startTime,
        status: TranscriptionStatus.COMPLETED,
        timestamp: new Date()
      };
      
      if (this.currentSession.callbacks.onComplete) {
        await this.currentSession.callbacks.onComplete(result);
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
  private async startAudioCapture(): Promise<void> {
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
      const source = this.audioContext!.createMediaStreamSource(this.audioStream!);
      const processor = this.audioContext!.createScriptProcessor(this.config.chunkSize || 4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        this.processAudioBuffer(event.inputBuffer);
      };
      
      source.connect(processor);
      processor.connect(this.audioContext!.destination);
      
      this.audioProcessor = processor;
      
      // Audio capture started
      
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  private async stopAudioCapture(): Promise<void> {
    try {
      if (this.audioProcessor) {
        this.audioProcessor.disconnect();
        this.audioProcessor = null;
      }
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      // Audio capture stopped
      
    } catch (error) {
      console.error('Error stopping audio capture:', error);
    }
  }

  /**
   * Process audio chunk
   */
  private processAudioBuffer(audioBuffer: AudioBuffer): void {
    if (!this.isTranscribing) return;
    
    // Convert to Float32Array
    const channelData = audioBuffer.getChannelData(0);
    const audioData = new Float32Array(channelData);
    
    // Add to buffer
    this.audioBuffer.push(audioData);
    
    // Process buffer when we have enough data (e.g., 1 second)
    const bufferDuration = this.audioBuffer.length * (this.config.chunkSize || 4096) / (this.config.sampleRate || 16000);
    if (bufferDuration >= 1.0) {
      this.processAudioBufferAsync();
    }
  }

  /**
   * Process accumulated audio buffer
   */
  private async processAudioBufferAsync(): Promise<void> {
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
      const maxSamples = (this.config.maxAudioLength || 30) * (this.config.sampleRate || 16000);
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
  private async transcribeAudio(audioData: Float32Array): Promise<any> {
    try {
      if (!this.Module || !this.whisperInstance) {
        throw new Error('Whisper not initialized');
      }
      
      // Transcribing audio
      
      // Call Whisper.cpp full_default API
      const result = this.Module.full_default(
        this.whisperInstance,
        audioData,
        this.config.language || 'es',
        this.config.n_threads || 4,
        this.config.translate || false
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
  private parseTranscriptionResult(result: any): any {
    try {
      // The result format from whisper.cpp may vary
      // For now, treat it as a simple string
      const text = typeof result === 'string' ? result : result.toString();
      
      // Create segments from the text
      const segments = [{
        start: 0,
        end: this.audioBuffer.length / (this.config.sampleRate || 16000),
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
  private handleTranscriptionResult(result: any): void {
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
  private calculateAverageConfidence(): number {
    if (!this.currentSession?.segments?.length) return 0.9;
    
    const totalConfidence = this.currentSession.segments.reduce(
      (sum, segment) => sum + (segment.confidence || 0.9), 0
    );
    
    return totalConfidence / this.currentSession.segments.length;
  }

  /**
   * Process audio chunk directly (for external audio streams)
   */
  async processAudioChunk(audioData: AudioData, config?: any): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      throw new Error('WhisperWASMEngine not initialized');
    }
    
    try {
      // Convert AudioData to Float32Array if needed
      let floatData: Float32Array;
      if (audioData instanceof Float32Array) {
        floatData = audioData;
      } else if (audioData instanceof ArrayBuffer) {
        floatData = new Float32Array(audioData);
      } else if (audioData instanceof Blob) {
        const arrayBuffer = await audioData.arrayBuffer();
        floatData = new Float32Array(arrayBuffer);
      } else if (audioData instanceof AudioBuffer) {
        floatData = audioData.getChannelData(0);
      } else {
        throw new Error('Unsupported audio data type');
      }
      
      const result = await this.transcribeAudio(floatData);
      
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
  setMedicalContext(context: MedicalContext): void {
    this.medicalContext = context;
    // Medical context set
  }

  /**
   * Get engine statistics
   */
  getEngineStats(): EngineStats {
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
  getSupportedLanguages(): Array<{code: string; name: string}> {
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
  getCurrentSession(): TranscriptionSession | null {
    return this.currentSession;
  }


  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      // Cleaning up WhisperWASMEngine
      
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
      
      // Cleanup completed
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WhisperWASMEngine;