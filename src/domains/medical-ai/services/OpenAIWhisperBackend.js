/**
 * OpenAIWhisperBackend
 * 
 * Backend API-based Whisper transcription service for ultimate fallback
 * Optimized for cost-effectiveness and medical terminology
 */

import { TranscriptionStatus } from '../types';

export class OpenAIWhisperBackend {
  constructor(config = {}) {
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

    this.isInitialized = false;
    this.isTranscribing = false;
    this.currentSession = null;
    this.audioBuffer = [];
    this.compressionManager = null;
    this.costOptimizer = null;
    this.medicalContext = null;
    this.retryCount = 0;
  }

  /**
   * Initialize OpenAI Whisper backend
   */
  async initialize() {
    try {
      console.log('Initializing OpenAI Whisper backend...');
      
      // Validate API key
      if (!this.config.apiKey) {
        console.warn('OpenAI API key not configured. Create a .env file with OPENAI_API_KEY=your_key_here or pass apiKey in config.');
        throw new Error('OpenAI API key not provided. Please configure OPENAI_API_KEY environment variable or pass apiKey in config.');
      }
      
      // Initialize audio compression manager
      await this.initializeCompressionManager();
      
      // Initialize cost optimizer
      await this.initializeCostOptimizer();
      
      // Test API connection
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('OpenAI Whisper backend initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize OpenAI Whisper backend:', error);
      throw error;
    }
  }

  /**
   * Initialize audio compression manager
   */
  async initializeCompressionManager() {
    try {
      const { AudioCompressionManager } = await import('./AudioCompressionManager.js');
      this.compressionManager = new AudioCompressionManager({
        targetFormat: 'webm',
        targetBitrate: 64000, // 64 kbps for cost optimization
        preserveQuality: true,
        medicalOptimized: this.config.medicalMode
      });
      
      await this.compressionManager.initialize();
      console.log('Audio compression manager initialized');
    } catch (error) {
      console.warn('Audio compression manager initialization failed:', error);
    }
  }

  /**
   * Initialize cost optimizer
   */
  async initializeCostOptimizer() {
    try {
      const { CostOptimizedWhisper } = await import('./CostOptimizedWhisper.js');
      this.costOptimizer = new CostOptimizedWhisper({
        maxDurationPerRequest: 600, // 10 minutes
        batchRequests: this.config.costOptimization,
        pricePerMinute: 0.006, // OpenAI pricing
        budgetLimit: this.config.budgetLimit || 50 // $50 per session
      });
      
      await this.costOptimizer.initialize();
      console.log('Cost optimizer initialized');
    } catch (error) {
      console.warn('Cost optimizer initialization failed:', error);
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      // Create a minimal test audio file
      const testAudio = this.createTestAudioFile();
      
      const response = await fetch(this.config.apiEndpoint, {
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
      
      console.log('OpenAI API connection test successful');
      
    } catch (error) {
      console.warn('API connection test failed:', error);
      // Don't fail initialization for connection test failure
    }
  }

  /**
   * Create test audio file for connection testing
   */
  createTestAudioFile() {
    // Create minimal FormData with test audio
    const formData = new FormData();
    
    // Create a minimal audio blob (1 second of silence)
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const buffer = audioContext.createBuffer(1, 16000, 16000);
    const blob = new Blob([buffer.getChannelData(0)], { type: 'audio/wav' });
    
    formData.append('file', blob, 'test.wav');
    formData.append('model', this.config.model);
    formData.append('language', this.config.language);
    
    return formData;
  }

  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && this.config.apiKey;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig, callbacks = {}) {
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
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: [],
      totalCost: 0,
      apiCalls: 0
    };

    // Clear audio buffer
    this.audioBuffer = [];
    this.retryCount = 0;

    console.log('Starting OpenAI Whisper transcription');
    
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
    this.audioBuffer = [];
    
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
      // Compress audio for cost optimization
      const compressedAudio = await this.compressAudio(audioData);
      
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
  async compressAudio(audioData) {
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
  basicAudioCompression(audioData) {
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
  async shouldProcessBuffer() {
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
  async processAudioBuffer() {
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
  async combineAudioChunks(chunks) {
    try {
      // Calculate total length
      const totalLength = chunks.reduce((sum, chunk) => {
        return sum + (chunk.data.length || chunk.data.byteLength || 0);
      }, 0);
      
      // Combine chunks
      const combined = new Float32Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        const data = chunk.data instanceof Float32Array ? 
          chunk.data : new Float32Array(chunk.data);
        
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
  async createFormData(audioData) {
    const formData = new FormData();
    
    // Convert audio to blob
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    
    // Add form fields
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', this.config.model);
    formData.append('language', this.config.language);
    formData.append('temperature', this.config.temperature.toString());
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
  getMedicalPrompt() {
    const basePrompt = 'Este es una transcripción médica en español. ';
    
    if (this.medicalContext) {
      return basePrompt + `Especialidad: ${this.medicalContext.specialty || 'general'}. `;
    }
    
    return basePrompt + 'Incluye terminología médica específica.';
  }

  /**
   * Make API request with retry logic
   */
  async makeAPIRequest(formData) {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: formData,
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Track API call
        this.currentSession.apiCalls++;
        
        // Estimate cost
        const estimatedCost = this.estimateAPICallCost(formData);
        this.currentSession.totalCost += estimatedCost;
        
        return result;
        
      } catch (error) {
        console.error(`API request attempt ${attempt + 1} failed:`, error);
        
        if (attempt === this.config.maxRetries) {
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
  estimateAPICallCost(formData) {
    try {
      // Get audio file size
      const audioFile = formData.get('file');
      const fileSizeBytes = audioFile.size;
      
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
  async processAPIResult(result) {
    if (!result.text) return;
    
    const segment = {
      id: `openai-segment-${Date.now()}`,
      text: result.text,
      startTime: Date.now(),
      endTime: Date.now(),
      confidence: 0.95, // OpenAI Whisper typically has high confidence
      speaker: 'doctor',
      language: this.config.language
    };
    
    this.currentSession.segments.push(segment);
    this.currentSession.fullText += ` ${result.text}`;
    
    // Extract medical terms
    if (this.config.medicalMode) {
      try {
        const medicalTerms = await this.extractMedicalTerms(result.text);
        this.currentSession.medicalTerms.push(...medicalTerms);
      } catch (error) {
        console.warn('Medical term extraction failed:', error);
      }
    }
    
    // Real-time callback
    if (this.currentSession.callbacks.onTranscriptionUpdate) {
      this.currentSession.callbacks.onTranscriptionUpdate({
        segment,
        fullText: this.currentSession.fullText.trim(),
        medicalTerms: this.currentSession.medicalTerms,
        confidence: this.calculateOverallConfidence(),
        cost: this.currentSession.totalCost
      });
    }
  }

  /**
   * Handle API errors
   */
  async handleAPIError(error) {
    console.error('API error:', error);
    
    if (this.currentSession.callbacks.onError) {
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
  async handleRateLimitError() {
    console.log('Rate limit detected, implementing backoff...');
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.retryCount++;
  }

  /**
   * Handle timeout errors
   */
  async handleTimeoutError() {
    console.log('Timeout detected, adjusting buffer size...');
    
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
      } catch (error) {
        console.warn('Medical terminology enhancement failed:', error);
      }
    }
    
    console.log(`OpenAI Whisper session completed. Cost: $${session.totalCost.toFixed(4)}, API calls: ${session.apiCalls}`);
    
    return {
      id: session.id,
      text: enhancedText,
      segments: session.segments,
      medicalTerms: session.medicalTerms,
      confidence: this.calculateOverallConfidence(),
      language: this.config.language,
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
  setMedicalContext(context) {
    this.medicalContext = context;
    console.log('Medical context set for OpenAI Whisper backend:', context);
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
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
  async cleanup() {
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
      
      console.log('OpenAI Whisper backend cleanup completed');
      
    } catch (error) {
      console.error('Error during OpenAI Whisper backend cleanup:', error);
    }
  }
}

export default OpenAIWhisperBackend;