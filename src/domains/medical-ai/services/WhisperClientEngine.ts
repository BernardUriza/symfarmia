/**
 * WhisperClientEngine
 * 
 * Client-side Whisper transcription using transformers.js with WebGPU acceleration
 * Optimized for medical terminology and Spanish language
 */

import { TranscriptionStatus } from '../types';
import {
  TranscriptionEngine,
  WhisperClientConfig,
  InitializationResult,
  TranscriptionResult,
  TranscriptionSession,
  TranscriptionCallbacks,
  AudioData,
  AudioChunk,
  EngineStats,
  MedicalContext,
  TranscriptionSegment,
  TranscriptionCompleteEvent,
  ModelCacheManager,
  AudioProcessor
} from '../types/transcription-engines';

interface ProcessingQueueItem {
  id: string;
  data: AudioData;
  timestamp: number;
  config?: any;
}

export class WhisperClientEngine implements TranscriptionEngine {
  private config: WhisperClientConfig;
  private pipeline: any = null;
  private isInitialized: boolean = false;
  private isTranscribing: boolean = false;
  private modelCache: ModelCacheManager | null = null;
  private medicalContext: MedicalContext | null = null;
  private processingQueue: ProcessingQueueItem[] = [];
  private webGPUDevice: GPUDevice | null = null;
  private audioProcessor: AudioProcessor | null = null;
  private currentSession: TranscriptionSession | null = null;

  constructor(config: WhisperClientConfig = {}) {
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
  }

  /**
   * Initialize Whisper client engine
   */
  async initialize() {
    try {
      // Initializing WhisperClientEngine...
      
      // Initialize WebGPU device
      await this.initializeWebGPU();
      
      // Import transformers.js
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Configure transformers.js environment with null checks
      if (env) {
        env.allowRemoteModels = true;
        env.allowLocalModels = true;
        
        // Ensure backends object exists
        if (!env.backends) {
          env.backends = {};
        }
        
        // Ensure onnx backend exists
        if (!env.backends.onnx) {
          env.backends.onnx = {};
        }
        
        // Ensure wasm backend exists
        if (!env.backends.onnx.wasm) {
          env.backends.onnx.wasm = {};
        }
        
        env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;
      }
      
      // Set backend preference
      if (env && env.backends && env.backends.onnx) {
        if (this.webGPUDevice) {
          env.backends.onnx.webgpu = true;
          // WebGPU backend enabled
        } else {
          env.backends.onnx.webgl = true;
          // WebGL backend enabled
        }
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
      console.log('✓ WhisperClientEngine ready');
      
      return {
        success: true,
        message: 'WhisperClientEngine initialized',
        config: this.config
      };
      
    } catch (error) {
      console.error('Failed to initialize WhisperClientEngine:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Initialization failed',
        recoverable: true
      };
    }
  }

  /**
   * Initialize WebGPU device
   */
  private async initializeWebGPU(): Promise<void> {
    try {
      if (!('gpu' in navigator)) {
        // WebGPU not supported
        return;
      }

      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      if (!adapter) {
        // WebGPU adapter not available
        return;
      }

      this.webGPUDevice = await adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {
          maxComputeWorkgroupStorageSize: 16384,
          maxStorageBufferBindingSize: 134217728
        }
      });

      // WebGPU device initialized
      
    } catch (error) {
      console.warn('WebGPU initialization failed:', error);
      this.webGPUDevice = null;
    }
  }

  /**
   * Initialize model cache manager
   */
  private async initializeModelCache(): Promise<void> {
    try {
      const { ModelCacheManager } = await import('./ModelCacheManager.js') as any;
      this.modelCache = new ModelCacheManager({
        modelName: this.config.modelName,
        cacheName: 'whisper-models'
      });
      
      await this.modelCache.initialize();
      // Model cache manager initialized
    } catch (error) {
      console.warn('Model cache manager initialization failed:', error);
    }
  }

  /**
   * Initialize audio processor
   */
  private async initializeAudioProcessor(): Promise<AudioProcessor | null> {
    try {
      const { AudioChunkOptimizer } = await import('./AudioChunkOptimizer.js') as any;
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
  async isReady(): Promise<boolean> {
    return this.isInitialized && this.pipeline !== null;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig?: any, callbacks: TranscriptionCallbacks = {}): Promise<TranscriptionResult> {
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
      status: TranscriptionStatus.RECORDING,
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: [],
      language: this.config.language || 'es',
      medicalMode: this.config.medicalMode
    };

    // Starting Whisper client transcription
    
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
  async stopTranscription(): Promise<TranscriptionResult> {
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
  async processAudioChunk(audioData: AudioData, config?: any): Promise<TranscriptionResult> {
    console.log('[WhisperClient] processAudioChunk called:', {
      hasData: !!audioData,
      dataSize: audioData?.byteLength || audioData?.length || 0,
      dataType: audioData?.constructor?.name || typeof audioData,
      isTranscribing: this.isTranscribing,
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id,
      queueLength: this.processingQueue.length,
      currentFullTextLength: this.currentSession?.fullText?.length || 0
    });
    
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
  private async processQueue(): Promise<void> {
    while (this.processingQueue.length > 0 && this.isTranscribing) {
      const chunk = this.processingQueue.shift();
      if (!chunk) continue;
      
      try {
        const result = await this.transcribeChunk(chunk.data, chunk.config);
        
        if (result.text && result.text.trim().length > 0) {
          const segment: TranscriptionSegment = {
            id: chunk.id,
            text: result.text,
            startTime: chunk.timestamp,
            endTime: Date.now(),
            confidence: result.confidence || 0.9,
            speaker: 'doctor',
            language: this.config.language || 'es',
            sessionId: this.currentSession!.id,
            engine: 'whisper-client'
          };
          
          this.currentSession.segments.push(segment);
          this.currentSession.fullText += ` ${result.text}`;
          
          console.log('[WhisperClient] Text accumulated:', {
            newText: result.text,
            newTextLength: result.text.length,
            totalTextLength: this.currentSession.fullText.length,
            segmentCount: this.currentSession.segments.length
          });
          
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
  private async processQueuedAudio(): Promise<void> {
    if (this.processingQueue.length > 0) {
      // Processing remaining audio chunks
      await this.processQueue();
    }
  }

  /**
   * Optimize audio chunk for Whisper processing
   */
  private async optimizeAudioChunk(audioData: AudioData, config?: any): Promise<AudioData> {
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
  private async transcribeChunk(audioData: AudioData, config?: any): Promise<any> {
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
  private async extractMedicalTerms(text: string): Promise<string[]> {
    try {
      const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js') as any;
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
  private calculateOverallConfidence(): number {
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
  private async finalizeTranscription(): Promise<TranscriptionCompleteEvent> {
    // Finalizing transcription
    if (false) { // Debug logging disabled
    console.log('[WhisperClient] Finalizing transcription - Session state:', {
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id,
      fullTextLength: this.currentSession?.fullText?.length || 0,
      fullTextContent: this.currentSession?.fullText || 'EMPTY',
      segmentCount: this.currentSession?.segments?.length || 0,
      queueLength: this.processingQueue.length
    });
    }
    
    // Process any remaining queued audio
    if (this.processingQueue.length > 0) {
      // Processing remaining queued audio
      await this.processQueue();
    }
    
    const session = this.currentSession;
    
    if (!session) {
      console.error('[WhisperClient] No active session found during finalization');
      throw new Error('No active transcription session');
    }
    
    // Get text with validation and fallback
    const rawText = session.fullText || '';
    // Check raw text
    if (false) { // Debug logging disabled
    console.log('[WhisperClient] Raw text before trim:', {
      length: rawText.length,
      isEmpty: rawText.trim() === '',
      preview: rawText.substring(0, 100)
    });
    }
    
    let enhancedText = rawText.trim();
    
    // Fallback to segments if fullText is empty
    if (!enhancedText && session.segments && session.segments.length > 0) {
      console.warn('[WhisperClient] Empty fullText detected, reconstructing from segments');
      enhancedText = session.segments.map(s => s.text || '').join(' ').trim();
      // Reconstructed text from segments
      if (false) { // Debug logging disabled
      console.log('[WhisperClient] Reconstructed text from segments:', {
        segmentCount: session.segments.length,
        reconstructedLength: enhancedText.length,
        preview: enhancedText.substring(0, 100)
      });
      }
    }
    
    // Final fallback
    if (!enhancedText) {
      console.error('[WhisperClient] No text available for enhancement');
      enhancedText = '[No transcription text available]';
    }
    
    if (this.config.medicalMode) {
      // Applying medical terminology enhancement
      if (false) { // Debug logging disabled
      console.log('[WhisperClient] Applying medical terminology enhancement:', {
        textLength: enhancedText.length,
        language: 'es-MX'
      });
      }
      
      try {
        const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js');
        const enhancer = new MedicalTerminologyEnhancer();
        enhancedText = await enhancer.enhanceText(enhancedText, 'es-MX');
        // Enhancement completed
        if (false) { // Debug logging disabled
        console.log('[WhisperClient] Enhancement completed:', {
          enhancedLength: enhancedText.length
        });
        }
      } catch (error) {
        console.warn('[WhisperClient] Medical terminology enhancement failed:', error);
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
  setMedicalContext(context: MedicalContext): void {
    this.medicalContext = context;
    // Medical context set
  }

  /**
   * Get engine statistics
   */
  getEngineStats(): EngineStats {
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
  async cleanup(): Promise<void> {
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