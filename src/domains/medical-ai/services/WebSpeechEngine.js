/**
 * WebSpeechEngine
 * 
 * Web Speech API wrapper for compatibility with the hybrid transcription system
 * Used as a fallback when Whisper engines are not available
 */

import { TranscriptionStatus } from '../types';

export class WebSpeechEngine {
  constructor(config = {}) {
    this.config = {
      language: config.language || 'es-MX',
      continuous: config.continuous !== false,
      interimResults: config.interimResults !== false,
      maxAlternatives: config.maxAlternatives || 1,
      maxRetries: config.maxRetries || 5,
      retryDelay: config.retryDelay || 1000,
      maxRetryDelay: config.maxRetryDelay || 10000,
      ...config
    };

    this.speechRecognition = null;
    this.isInitialized = false;
    this.isTranscribing = false;
    this.currentSession = null;
    this.medicalContext = null;
    
    // Error handling and retry management
    this.retryCount = 0;
    this.consecutiveErrors = 0;
    this.lastErrorTime = 0;
    this.isCircuitBreakerOpen = false;
    this.retryTimeout = null;
    this.circuitBreakerResetTime = 30000; // 30 seconds
  }

  /**
   * Initialize Web Speech API engine
   */
  async initialize() {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Web Speech API not available in server environment');
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Web Speech API not supported in this browser');
      }

      this.speechRecognition = new SpeechRecognition();
      this.setupSpeechRecognition();
      
      this.isInitialized = true;
      console.log('WebSpeechEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WebSpeechEngine:', error);
      throw error;
    }
  }

  /**
   * Setup speech recognition configuration
   */
  setupSpeechRecognition() {
    this.speechRecognition.continuous = this.config.continuous;
    this.speechRecognition.interimResults = this.config.interimResults;
    this.speechRecognition.lang = this.config.language;
    this.speechRecognition.maxAlternatives = this.config.maxAlternatives;

    this.speechRecognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };

    this.speechRecognition.onerror = (event) => {
      this.handleSpeechError(event);
    };

    this.speechRecognition.onend = () => {
      this.handleSpeechEnd();
    };

    this.speechRecognition.onstart = () => {
      console.log('Web Speech recognition started');
    };
  }

  /**
   * Check if engine is ready
   */
  async isReady() {
    return this.isInitialized && this.speechRecognition !== null;
  }

  /**
   * Start transcription
   */
  async startTranscription(audioConfig, callbacks = {}) {
    if (!this.isInitialized) {
      throw new Error('WebSpeechEngine not initialized');
    }

    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    this.isTranscribing = true;
    this.currentSession = {
      id: `webspeech-session-${Date.now()}`,
      startTime: Date.now(),
      audioConfig,
      callbacks,
      segments: [],
      fullText: '',
      medicalTerms: [],
      interimText: ''
    };

    try {
      this.speechRecognition.start();
      
      console.log('Web Speech transcription started');
      
      return {
        success: true,
        data: {
          sessionId: this.currentSession.id,
          engine: 'web-speech',
          status: TranscriptionStatus.RECORDING
        }
      };
    } catch (error) {
      this.isTranscribing = false;
      this.currentSession = null;
      throw error;
    }
  }

  /**
   * Stop transcription
   */
  async stopTranscription() {
    if (!this.isTranscribing || !this.currentSession) {
      throw new Error('No active transcription');
    }

    this.speechRecognition.stop();
    this.isTranscribing = false;
    
    // Finalize transcription
    const finalResult = await this.finalizeTranscription();
    
    this.currentSession = null;
    
    return {
      success: true,
      data: finalResult
    };
  }

  /**
   * Process audio chunk (not used in Web Speech API)
   */
  async processAudioChunk(audioData, config) {
    // Web Speech API handles audio processing internally
    return {
      success: true,
      data: {
        message: 'Web Speech API handles audio processing internally'
      }
    };
  }

  /**
   * Handle speech recognition results
   */
  handleSpeechResult(event) {
    if (!this.currentSession) return;

    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        
        // Create a new segment for final results
        const segment = {
          id: `webspeech-segment-${Date.now()}`,
          text: transcript,
          startTime: Date.now(),
          endTime: Date.now(),
          confidence: event.results[i][0].confidence || 0.8,
          speaker: 'doctor',
          language: this.config.language
        };
        
        this.currentSession.segments.push(segment);
        this.currentSession.fullText += ` ${transcript}`;
        
        // Extract medical terms
        this.extractMedicalTerms(transcript);
        
        // Clear interim text
        this.currentSession.interimText = '';
      } else {
        interimTranscript += transcript;
        this.currentSession.interimText = interimTranscript;
      }
    }

    // Real-time callback
    if (this.currentSession.callbacks.onTranscriptionUpdate) {
      this.currentSession.callbacks.onTranscriptionUpdate({
        finalText: this.currentSession.fullText.trim(),
        interimText: this.currentSession.interimText,
        segments: this.currentSession.segments,
        medicalTerms: this.currentSession.medicalTerms,
        confidence: this.calculateOverallConfidence(),
        engine: 'web-speech'
      });
    }
  }

  /**
   * Handle speech recognition errors
   */
  handleSpeechError(event) {
    const errorType = event.error || event;
    console.error('Web Speech recognition error:', errorType);
    
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();
    
    // Check if we should open circuit breaker
    if (this.consecutiveErrors >= this.config.maxRetries) {
      this.openCircuitBreaker();
    }
    
    // Clear any pending retry timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    const isRecoverable = this.isRecoverableError(errorType) && !this.isCircuitBreakerOpen;
    
    if (this.currentSession && this.currentSession.callbacks.onError) {
      this.currentSession.callbacks.onError({
        error: errorType,
        engine: 'web-speech',
        recoverable: isRecoverable,
        retryCount: this.retryCount,
        consecutiveErrors: this.consecutiveErrors,
        circuitBreakerOpen: this.isCircuitBreakerOpen
      });
    }
    
    // If not recoverable or circuit breaker is open, stop transcription
    if (!isRecoverable) {
      console.warn('Web Speech API error not recoverable or circuit breaker open, stopping transcription');
      this.stopTranscriptionDueToError();
    }
  }

  /**
   * Handle speech recognition end
   */
  handleSpeechEnd() {
    if (!this.isTranscribing) {
      return;
    }
    
    // Check circuit breaker status
    if (this.isCircuitBreakerOpen) {
      this.checkCircuitBreakerReset();
      if (this.isCircuitBreakerOpen) {
        console.warn('Circuit breaker is open, not restarting speech recognition');
        return;
      }
    }
    
    // Check if we should restart (with retry logic)
    if (this.shouldRetryRestart()) {
      this.scheduleRestart();
    } else {
      console.warn('Maximum retries reached, stopping transcription');
      this.stopTranscriptionDueToError();
    }
  }

  /**
   * Check if error is recoverable
   */
  isRecoverableError(error) {
    const recoverableErrors = [
      'network',
      'audio-capture',
      'no-speech',
      'aborted'
    ];
    
    return recoverableErrors.includes(error);
  }

  /**
   * Extract medical terms from transcribed text
   */
  async extractMedicalTerms(text) {
    try {
      const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js');
      const enhancer = new MedicalTerminologyEnhancer();
      const terms = await enhancer.extractTerms(text, this.config.language);
      
      this.currentSession.medicalTerms.push(...terms);
    } catch (error) {
      console.warn('Medical term extraction failed:', error);
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
    
    try {
      const { MedicalTerminologyEnhancer } = await import('./MedicalTerminologyEnhancer.js');
      const enhancer = new MedicalTerminologyEnhancer();
      enhancedText = await enhancer.enhanceText(enhancedText, this.config.language);
    } catch (error) {
      console.warn('Medical terminology enhancement failed:', error);
    }
    
    return {
      id: session.id,
      text: enhancedText,
      segments: session.segments,
      medicalTerms: session.medicalTerms,
      confidence: this.calculateOverallConfidence(),
      language: this.config.language,
      engine: 'web-speech',
      processingTime: Date.now() - session.startTime,
      status: TranscriptionStatus.COMPLETED,
      timestamp: new Date()
    };
  }

  /**
   * Open circuit breaker to prevent further retries
   */
  openCircuitBreaker() {
    this.isCircuitBreakerOpen = true;
    this.circuitBreakerOpenTime = Date.now();
    console.warn('Circuit breaker opened due to consecutive errors');
  }

  /**
   * Check if circuit breaker should be reset
   */
  checkCircuitBreakerReset() {
    if (this.isCircuitBreakerOpen) {
      const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime;
      if (timeSinceOpen >= this.circuitBreakerResetTime) {
        this.resetCircuitBreaker();
      }
    }
  }

  /**
   * Reset circuit breaker and error counters
   */
  resetCircuitBreaker() {
    this.isCircuitBreakerOpen = false;
    this.consecutiveErrors = 0;
    this.retryCount = 0;
    console.log('Circuit breaker reset, ready to retry');
  }

  /**
   * Check if we should retry restart
   */
  shouldRetryRestart() {
    // Don't retry if circuit breaker is open
    if (this.isCircuitBreakerOpen) {
      return false;
    }
    
    // Don't retry if we've exceeded max retries
    if (this.retryCount >= this.config.maxRetries) {
      return false;
    }
    
    // Don't retry too quickly (minimum 1 second between attempts)
    const timeSinceLastError = Date.now() - this.lastErrorTime;
    if (timeSinceLastError < 1000) {
      return false;
    }
    
    return true;
  }

  /**
   * Schedule restart with exponential backoff
   */
  scheduleRestart() {
    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    // Calculate delay with exponential backoff
    const baseDelay = this.config.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, this.retryCount);
    const delay = Math.min(exponentialDelay, this.config.maxRetryDelay);
    
    this.retryCount++;
    
    console.log(`Scheduling speech recognition restart in ${delay}ms (attempt ${this.retryCount})`);
    
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.attemptRestart();
    }, delay);
  }

  /**
   * Attempt to restart speech recognition
   */
  attemptRestart() {
    if (!this.isTranscribing) {
      return;
    }
    
    try {
      console.log('Attempting to restart speech recognition...');
      this.speechRecognition.start();
      
      // Reset consecutive errors on successful start
      this.consecutiveErrors = 0;
      
    } catch (error) {
      console.error('Failed to restart speech recognition:', error);
      this.handleSpeechError({ error: 'restart-failed' });
    }
  }

  /**
   * Stop transcription due to unrecoverable error
   */
  stopTranscriptionDueToError() {
    console.warn('Stopping transcription due to unrecoverable error');
    
    // Clear any pending timeouts
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    // Mark as not transcribing to prevent restart attempts
    this.isTranscribing = false;
    
    // Stop speech recognition
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    // Notify session of failure
    if (this.currentSession && this.currentSession.callbacks.onError) {
      this.currentSession.callbacks.onError({
        error: 'fatal_error',
        engine: 'web-speech',
        recoverable: false,
        message: 'Speech recognition stopped due to repeated failures'
      });
    }
  }

  /**
   * Set medical context for optimization
   */
  setMedicalContext(context) {
    this.medicalContext = context;
    console.log('Medical context set for WebSpeechEngine:', context);
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      backend: 'web-speech-api',
      language: this.config.language,
      continuous: this.config.continuous,
      interimResults: this.config.interimResults,
      isInitialized: this.isInitialized,
      isTranscribing: this.isTranscribing,
      browserSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
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
      
      // Clear any pending retry timeout
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }
      
      // Clear speech recognition
      if (this.speechRecognition) {
        this.speechRecognition.onresult = null;
        this.speechRecognition.onerror = null;
        this.speechRecognition.onend = null;
        this.speechRecognition.onstart = null;
        this.speechRecognition = null;
      }
      
      // Reset state
      this.isInitialized = false;
      this.currentSession = null;
      this.retryCount = 0;
      this.consecutiveErrors = 0;
      this.isCircuitBreakerOpen = false;
      
      console.log('WebSpeechEngine cleanup completed');
      
    } catch (error) {
      console.error('Error during WebSpeechEngine cleanup:', error);
    }
  }
}

export default WebSpeechEngine;