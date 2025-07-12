/**
 * OpenAIWhisperBackend
 * 
 * Backend API-based Whisper transcription service for ultimate fallback
 * Optimized for cost-effectiveness and medical terminology
 */

import { TranscriptionStatus } from '../types';
import {
  TranscriptionEngine,
  OpenAIWhisperConfig,
  InitializationResult,
  TranscriptionResult,
  TranscriptionSession,
  TranscriptionCallbacks,
  AudioData,
  AudioChunk,
  EngineStats,
  CompressionManager,
  CostOptimizer,
  MedicalContext,
  TranscriptionSegment,
  TranscriptionCompleteEvent
} from '../types/transcription-engines';

export class OpenAIWhisperBackend implements TranscriptionEngine {
  private config: OpenAIWhisperConfig;
  private isInitialized: boolean = false;
  private isTranscribing: boolean = false;
  private currentSession: TranscriptionSession | null = null;
  private audioBuffer: AudioChunk[] = [];
  private compressionManager: CompressionManager | null = null;
  private costOptimizer: CostOptimizer | null = null;
  private medicalContext: MedicalContext | null = null;
  private retryCount: number = 0;
  private connectionTested: boolean = false;

  constructor(config: OpenAIWhisperConfig = {}) {
    this.config = {
      apiKey: config.apiKey || (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) || null,
      model: config.model || 'whisper-1',
      language: config.language || 'es',
      temperature: config.temperature || 0.0,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      medicalMode: config.medicalMode || true,
      costOptimization: config.costOptimization || true,
      apiEndpoint: config.apiEndpoint || 'https://api.openai.com/v1/audio/transcriptions',
      ...config
    };
  }

  /**
   * Initialize OpenAI Whisper backend
   */
  async initialize(): Promise<InitializationResult> {
    try {
      // Initializing OpenAI Whisper backend...
      
      // Validate API key
      if (!this.config.apiKey) {
        console.warn('OpenAI API key not configured. Create a .env file with OPENAI_API_KEY=your_key_here or pass apiKey in config.');
        // Don't throw error immediately - allow graceful degradation
        this.isInitialized = false;
        return {
          success: false,
          message: 'OpenAI API key not configured',
          recoverable: true
        };
      }
      
      // Initialize audio compression manager
      await this.initializeCompressionManager();
      
      // Initialize cost optimizer
      await this.initializeCostOptimizer();
      
      // Skip API connection test during initialization for graceful degradation
      // Connection will be tested on first actual transcription attempt
      this.isInitialized = true;
      console.log('✓ OpenAI Whisper backend ready');
      
      return {
        success: true,
        message: 'OpenAI Whisper backend initialized',
        apiKeyConfigured: true
      };
      
    } catch (error) {
      console.error('Failed to initialize OpenAI Whisper backend:', error);
      // Return error info instead of throwing
      return {
        success: false,
        message: error.message,
        recoverable: true
      };
    }
  }

  /**
   * Initialize audio compression manager
   */
  private async initializeCompressionManager(): Promise<void> {
    try {
      const { AudioCompressionManager } = await import('./AudioCompressionManager.js') as any;
      this.compressionManager = new AudioCompressionManager({
        targetFormat: 'webm',
        targetBitrate: 64000, // 64 kbps for cost optimization
        preserveQuality: true,
        medicalOptimized: this.config.medicalMode
      });
      
      await this.compressionManager!.initialize();
      // Audio compression manager initialized
    } catch (error) {
      console.warn('Audio compression manager initialization failed:', error);
    }
  }

  /**
   * Initialize cost optimizer
   */
  private async initializeCostOptimizer(): Promise<void> {
    try {
      const { CostOptimizedWhisper } = await import('./CostOptimizedWhisper.js') as any;
      this.costOptimizer = new CostOptimizedWhisper({
        maxDurationPerRequest: 600, // 10 minutes
        batchRequests: this.config.costOptimization,
        pricePerMinute: 0.006, // OpenAI pricing
        budgetLimit: this.config.budgetLimit || 50 // $50 per session
      });
      
      await this.costOptimizer!.initialize();
      // Cost optimizer initialized
    } catch (error) {
      console.warn('Cost optimizer initialization failed:', error);
    }
  }

  /**
   * Test API connection (deferred - called on first transcription)
   */
  private async testConnection(): Promise<boolean> {
    try {
      // Skip if already tested
      if (this.connectionTested) {
        return true;
      }
      
      // Create a minimal test audio file
      const testAudio = this.createTestAudioFile();
      
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        body: testAudio,
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`API connection test failed: ${response.status}`);
      }
      
      this.connectionTested = true;
      // API connection test successful
      return true;
      
    } catch (error) {
      console.warn('API connection test failed:', error);
      // Return false but don't throw - allow fallback to other engines
      return false;
    }
  }

  /**
   * Create test audio file for connection testing
   */
  private createTestAudioFile(): FormData {
    // Create minimal FormData with test audio
    const formData = new FormData();
    
    // Create a minimal audio blob (1 second of silence)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const buffer = audioContext.createBuffer(1, 16000, 16000);
    const blob = new Blob([buffer.getChannelData(0)], { type: 'audio/wav' });
    
    formData.append('file', blob, 'test.wav');
    formData.append('model', this.config.model || 'whisper-1');
    formData.append('language', this.config.language || 'es');
    
    return formData;
  }

  /**
   * Check if engine is ready
   */
  async isReady(): Promise<boolean> {
    return this.isInitialized && !!this.config.apiKey;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig?: any, callbacks: TranscriptionCallbacks = {}): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      throw new Error('OpenAI Whisper backend not initialized');
    }

    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    this.isTranscribing = true;
    this.currentSession = {
      id: `openai-session-${Date.now()}`,
      startTime: Date.now(),
      status: TranscriptionStatus.RECORDING,
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: [],
      totalCost: 0,
      apiCalls: 0,
      language: this.config.language || 'es',
      medicalMode: this.config.medicalMode
    };

    // Clear audio buffer
    this.audioBuffer = [];
    this.retryCount = 0;

    // Starting OpenAI Whisper transcription
    
    return {
      success: true,
      data: {
        sessionId: this.currentSession.id,
        engine: 'openai-whisper',
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
    
    // Process any remaining audio
    if (this.audioBuffer.length > 0) {
      await this.processAudioBuffer();
    }
    
    // Finalize transcription
    const finalResult = await this.finalizeTranscription();
    
    this.currentSession = null;
    this.audioBuffer = [];
    
    return {
      success: true,
      data: finalResult
    };
  }

  /**
   * Process audio chunk
   */
  async processAudioChunk(audioData: AudioData, config?: any): Promise<TranscriptionResult> {
    console.log('[OpenAI Whisper] processAudioChunk called:', {
      hasData: !!audioData,
      dataSize: (audioData as any)?.byteLength || (audioData as any)?.length || 0,
      dataType: audioData?.constructor?.name || typeof audioData,
      isTranscribing: this.isTranscribing,
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id,
      bufferLength: this.audioBuffer.length,
      currentFullTextLength: this.currentSession?.fullText?.length || 0
    });
    
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription session');
    }

    try {
      // Compress audio for cost optimization
      const compressedAudio = await this.compressAudio(audioData);
      // Audio compressed
      if (false) { // Debug logging disabled
      console.log('[OpenAI Whisper] Audio compressed:', {
        originalSize: (audioData as any)?.byteLength || (audioData as any)?.length || 0,
        compressedSize: (compressedAudio as any)?.byteLength || (compressedAudio as any)?.length || 0
      });
      }
      
      // Add to buffer
      this.audioBuffer.push({
        data: compressedAudio,
        timestamp: Date.now(),
        config
      });
      
      // Process buffer when it reaches optimal size
      const shouldProcess = await this.shouldProcessBuffer();
      
      if (shouldProcess) {
        await this.processAudioBuffer();
      }
      
      return {
        success: true,
        data: {
          buffered: this.audioBuffer.length,
          processed: shouldProcess
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
   * Compress audio for API efficiency
   */
  private async compressAudio(audioData: AudioData): Promise<AudioData> {
    try {
      if (this.compressionManager) {
        return await this.compressionManager.compressForAPI(audioData);
      }
      
      // Basic compression fallback
      return this.basicAudioCompression(audioData);
      
    } catch (error) {
      console.warn('Audio compression failed:', error);
      return audioData;
    }
  }

  /**
   * Basic audio compression fallback
   */
  private basicAudioCompression(audioData: AudioData): AudioData {
    // Simple downsampling for smaller file size
    if (audioData instanceof Float32Array) {
      const downsampledLength = Math.floor(audioData.length / 2);
      const downsampled = new Float32Array(downsampledLength);
      
      for (let i = 0; i < downsampledLength; i++) {
        downsampled[i] = audioData[i * 2];
      }
      
      return downsampled;
    }
    
    return audioData;
  }

  /**
   * Determine if buffer should be processed
   */
  private async shouldProcessBuffer(): Promise<boolean> {
    if (this.audioBuffer.length === 0) return false;
    
    // Check cost optimizer recommendations
    if (this.costOptimizer) {
      return await this.costOptimizer.shouldProcessBuffer(this.audioBuffer);
    }
    
    // Default: process every 10 seconds of audio
    const bufferDuration = this.audioBuffer.length * 1000; // approximate
    return bufferDuration >= 10000;
  }

  /**
   * Process accumulated audio buffer
   */
  private async processAudioBuffer(): Promise<void> {
    if (this.audioBuffer.length === 0) return;
    
    try {
      // Combine audio chunks
      const combinedAudio = await this.combineAudioChunks(this.audioBuffer);
      
      // Create form data for API request
      const formData = await this.createFormData(combinedAudio);
      
      // Make API request with retry logic
      const result = await this.makeAPIRequest(formData);
      
      // Process result
      await this.processAPIResult(result);
      
      // Clear processed buffer
      this.audioBuffer = [];
      
    } catch (error) {
      console.error('Audio buffer processing failed:', error);
      await this.handleAPIError(error);
    }
  }

  /**
   * Combine audio chunks into single file
   */
  private async combineAudioChunks(chunks: AudioChunk[]): Promise<Float32Array> {
    try {
      // Calculate total length
      const totalLength = chunks.reduce((sum, chunk) => {
        return sum + ((chunk.data as any).length || (chunk.data as any).byteLength || 0);
      }, 0);
      
      // Combine chunks
      const combined = new Float32Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        let data: Float32Array;
        if (chunk.data instanceof Float32Array) {
          data = chunk.data;
        } else if (chunk.data instanceof ArrayBuffer) {
          data = new Float32Array(chunk.data);
        } else {
          // Skip non-compatible data
          continue;
        }
        
        combined.set(data, offset);
        offset += data.length;
      }
      
      return combined;
      
    } catch (error) {
      console.error('Audio chunk combination failed:', error);
      throw error;
    }
  }

  /**
   * Create form data for API request
   */
  private async createFormData(audioData: AudioData): Promise<FormData> {
    const formData = new FormData();
    
    // Convert audio to blob
    const audioBlob = new Blob([audioData as BlobPart], { type: 'audio/wav' });
    
    // Add form fields
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', this.config.model || 'whisper-1');
    formData.append('language', this.config.language || 'es');
    formData.append('temperature', (this.config.temperature || 0).toString());
    formData.append('response_format', 'json');
    
    // Add medical prompt if enabled
    if (this.config.medicalMode) {
      formData.append('prompt', this.getMedicalPrompt());
    }
    
    return formData;
  }

  /**
   * Get medical context prompt
   */
  private getMedicalPrompt(): string {
    const basePrompt = 'Este es una transcripción médica en español. ';
    
    if (this.medicalContext) {
      return basePrompt + `Especialidad: ${this.medicalContext.specialty || 'general'}. `;
    }
    
    return basePrompt + 'Incluye terminología médica específica.';
  }

  /**
   * Make API request with retry logic
   */
  private async makeAPIRequest(formData: FormData): Promise<any> {
    for (let attempt = 0; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        const response = await fetch(this.config.apiEndpoint!, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: formData,
          signal: AbortSignal.timeout(this.config.timeout || 30000)
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Track API call
        if (this.currentSession) {
          this.currentSession.apiCalls = (this.currentSession.apiCalls || 0) + 1;
        }
        
        // Estimate cost
        const estimatedCost = this.estimateAPICallCost(formData);
        if (this.currentSession) {
          this.currentSession.totalCost = (this.currentSession.totalCost || 0) + estimatedCost;
        }
        
        return result;
        
      } catch (error) {
        console.error(`API request attempt ${attempt + 1} failed:`, error);
        
        if (attempt === (this.config.maxRetries || 3)) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  /**
   * Estimate API call cost
   */
  private estimateAPICallCost(formData: FormData): number {
    try {
      // Get audio file size
      const audioFile = formData.get('file');
      const fileSizeBytes = (audioFile as File).size;
      
      // Estimate duration (rough approximation)
      const estimatedDurationMinutes = fileSizeBytes / (16000 * 2 * 60); // 16kHz, 16-bit
      
      // OpenAI pricing: $0.006 per minute
      return estimatedDurationMinutes * 0.006;
      
    } catch (error) {
      console.warn('Cost estimation failed:', error);
      return 0.01; // Default estimate
    }
  }

  /**
   * Process API result
   */
  private async processAPIResult(result: any): Promise<void> {
    // API result received
    if (false) { // Debug logging disabled
    console.log('[OpenAI Whisper] API result received:', {
      hasResult: !!result,
      hasText: !!result?.text,
      textLength: result?.text?.length || 0,
      textPreview: result?.text?.substring(0, 100) || 'NO_TEXT',
      currentFullTextLength: this.currentSession?.fullText?.length || 0
    });
    }
    
    if (!result.text) {
      console.warn('[OpenAI Whisper] API result has no text!', result);
      return;
    }
    
    const segment: TranscriptionSegment = {
      id: `openai-segment-${Date.now()}`,
      text: result.text,
      startTime: Date.now(),
      endTime: Date.now(),
      confidence: 0.95, // OpenAI Whisper typically has high confidence
      speaker: 'doctor',
      language: this.config.language || 'es',
      sessionId: this.currentSession!.id,
      engine: 'openai-whisper'
    };
    
    if (this.currentSession) {
      this.currentSession.segments.push(segment);
    }
    if (this.currentSession) {
      this.currentSession.fullText += ` ${result.text}`;
    }
    
    // fullText updated
    if (false) { // Debug logging disabled
    console.log('[OpenAI Whisper] fullText updated:', {
      newTextAdded: result.text.substring(0, 50) + '...',
      fullTextLength: this.currentSession?.fullText.length || 0,
      segmentCount: this.currentSession?.segments.length || 0,
      hasContent: (this.currentSession?.fullText.trim().length || 0) > 0
    });
    }
    
    // Extract medical terms
    if (this.config.medicalMode) {
      try {
        const medicalTerms = await this.extractMedicalTerms(result.text);
        if (this.currentSession) {
          if (this.currentSession.medicalTerms) {
            this.currentSession.medicalTerms.push(...medicalTerms);
          } else {
            this.currentSession.medicalTerms = medicalTerms;
          }
        }
      } catch (error) {
        console.warn('Medical term extraction failed:', error);
      }
    }
    
    // Real-time callback
    if (this.currentSession?.callbacks?.onTranscriptionUpdate) {
      this.currentSession.callbacks.onTranscriptionUpdate({
        segment,
        fullText: this.currentSession?.fullText.trim() || '',
        medicalTerms: this.currentSession?.medicalTerms || [],
        confidence: this.calculateOverallConfidence(),
        cost: this.currentSession?.totalCost
      });
    }
  }

  /**
   * Handle API errors
   */
  private async handleAPIError(error: Error | any): Promise<void> {
    console.error('API error:', error);
    
    if (this.currentSession?.callbacks?.onError) {
      this.currentSession.callbacks.onError(error);
    }
    
    // Implement error recovery strategies
    if (error.message.includes('rate limit')) {
      await this.handleRateLimitError();
    } else if (error.message.includes('timeout')) {
      await this.handleTimeoutError();
    }
  }

  /**
   * Handle rate limit errors
   */
  private async handleRateLimitError(): Promise<void> {
    // Rate limit detected, implementing backoff
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.retryCount++;
  }

  /**
   * Handle timeout errors
   */
  private async handleTimeoutError(): Promise<void> {
    // Timeout detected, adjusting buffer size
    
    // Reduce buffer size for faster processing
    if (this.audioBuffer.length > 1) {
      const halfBuffer = this.audioBuffer.slice(0, Math.floor(this.audioBuffer.length / 2));
      this.audioBuffer = this.audioBuffer.slice(Math.floor(this.audioBuffer.length / 2));
      
      // Process smaller buffer
      await this.processAudioBuffer();
    }
  }

  /**
   * Extract medical terms from text
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
    if (!this.currentSession || this.currentSession.segments.length === 0) return 0;
    
    const totalConfidence = this.currentSession.segments.reduce(
      (sum, segment) => sum + (segment.confidence || 0),
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
    console.log('[OpenAI Whisper] Finalizing transcription - Pre-check:', {
      hasSession: !!this.currentSession,
      audioBufferLength: this.audioBuffer.length,
      isTranscribing: this.isTranscribing
    });
    }
    
    // Process any remaining audio before finalization
    if (this.audioBuffer.length > 0) {
      // Processing remaining audio buffer
      await this.processAudioBuffer();
    }
    
    const session = this.currentSession!;
    
    // Check session state
    if (false) { // Debug logging disabled
    console.log('[OpenAI Whisper] Session state:', {
      sessionId: session.id,
      fullTextLength: session.fullText?.length || 0,
      fullTextContent: session.fullText || 'EMPTY',
      segmentCount: session.segments?.length || 0,
      apiCalls: session.apiCalls,
      totalCost: session.totalCost
    });
    }
    
    // Apply medical terminology enhancement
    let enhancedText = session.fullText?.trim() || '';
    
    // Fallback to segments if fullText is empty
    if (!enhancedText && session.segments?.length > 0) {
      console.warn('[OpenAI Whisper] fullText empty, reconstructing from segments');
      enhancedText = session.segments.map(s => s.text || '').join(' ').trim();
      // Reconstructed text
      if (false) { // Debug logging disabled
      console.log('[OpenAI Whisper] Reconstructed text:', {
        segmentCount: session.segments.length,
        reconstructedLength: enhancedText.length,
        preview: enhancedText.substring(0, 100)
      });
      }
    }
    
    if (!enhancedText) {
      console.error('[OpenAI Whisper] No text available for enhancement');
      enhancedText = '[No transcription available]';
    }
    
    // Text ready for enhancement
    if (false) { // Debug logging disabled
    console.log('[OpenAI Whisper] Text ready for enhancement:', {
      textLength: enhancedText.length,
      preview: enhancedText.substring(0, 100)
    });
    }
    
    if (this.config.medicalMode) {
      try {
        const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js') as any;
        const enhancer = new MedicalTerminologyEnhancer();
        enhancedText = await enhancer.enhanceText(enhancedText, 'es-MX');
      } catch (error) {
        console.warn('Medical terminology enhancement failed:', error);
      }
    }
    
    console.log(`✓ OpenAI Whisper completed - Cost: $${(session.totalCost || 0).toFixed(4)}`);
    
    return {
      id: session.id,
      text: enhancedText,
      segments: session.segments,
      medicalTerms: session.medicalTerms || [],
      confidence: this.calculateOverallConfidence(),
      language: this.config.language || 'es',
      engine: 'openai-whisper',
      processingTime: Date.now() - session.startTime,
      totalCost: session.totalCost,
      apiCalls: session.apiCalls,
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
      model: this.config.model,
      backend: 'openai-api',
      isInitialized: this.isInitialized,
      isTranscribing: this.isTranscribing,
      bufferLength: this.audioBuffer.length,
      medicalMode: this.config.medicalMode,
      costOptimization: this.config.costOptimization,
      currentCost: this.currentSession?.totalCost || 0,
      apiCalls: this.currentSession?.apiCalls || 0
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
      
      // Clear buffers
      this.audioBuffer = [];
      
      // Cleanup managers
      if (this.compressionManager) {
        await this.compressionManager.cleanup();
      }
      
      if (this.costOptimizer) {
        await this.costOptimizer.cleanup();
      }
      
      // Reset state
      this.isInitialized = false;
      this.currentSession = null;
      
      // Cleanup completed
      
    } catch (error) {
      console.error('Error during OpenAI Whisper backend cleanup:', error);
    }
  }
}

export default OpenAIWhisperBackend;