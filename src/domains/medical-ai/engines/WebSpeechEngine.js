/**
 * WebSpeechEngine - Web Speech API transcription engine with circuit breaker pattern
 * 
 * Provides resilient speech recognition with automatic recovery
 */

export class WebSpeechEngine {
  constructor() {
    // Circuit breaker state
    this.isCircuitBreakerOpen = false;
    this.consecutiveErrors = 0;
    this.retryCount = 0;
    this.lastErrorTime = null;
    
    // Configuration
    this.maxConsecutiveErrors = 3;
    this.circuitBreakerTimeout = 30000; // 30 seconds
    this.maxRetries = 5;
    
    // Speech recognition
    this.recognition = null;
    this.isListening = false;
    this.currentSession = null;
    
    // Error types
    this.RECOVERABLE_ERRORS = ['network', 'audio-capture', 'no-speech', 'aborted'];
    this.CRITICAL_ERRORS = ['not-allowed', 'service-not-allowed', 'bad-grammar'];
    
    // Callbacks
    this.callbacks = {
      onStart: null,
      onResult: null,
      onError: null,
      onEnd: null
    };
    
    // Initialize
    this.initializeRecognition();
  }
  
  /**
   * Force reset circuit breaker - clears all error states
   */
  forceResetCircuitBreaker() {
    console.log('[WebSpeechEngine] Force resetting circuit breaker');
    this.isCircuitBreakerOpen = false;
    this.consecutiveErrors = 0;
    this.retryCount = 0;
    this.lastErrorTime = null;
  }
  
  /**
   * Initialize speech recognition
   */
  initializeRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('[WebSpeechEngine] Speech recognition not supported');
        return false;
      }
      
      this.recognition = new SpeechRecognition();
      this.setupRecognitionConfig();
      this.setupRecognitionHandlers();
      
      return true;
    } catch (error) {
      console.error('[WebSpeechEngine] Failed to initialize recognition:', error);
      return false;
    }
  }
  
  /**
   * Setup recognition configuration
   */
  setupRecognitionConfig() {
    if (!this.recognition) return;
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-MX';
    this.recognition.maxAlternatives = 1;
  }
  
  /**
   * Setup recognition event handlers
   */
  setupRecognitionHandlers() {
    if (!this.recognition) return;
    
    this.recognition.onstart = () => {
      console.log('[WebSpeechEngine] Recognition started');
      this.isListening = true;
      this.callbacks.onStart?.();
    };
    
    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => result[0].transcript)
        .join('');
      
      const isFinal = results.some(result => result.isFinal);
      
      this.callbacks.onResult?.({
        transcript,
        isFinal,
        confidence: results[results.length - 1][0].confidence
      });
      
      // Reset error count on successful result
      if (isFinal && transcript.trim()) {
        this.consecutiveErrors = 0;
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('[WebSpeechEngine] Recognition error:', event.error);
      this.handleRecognitionError(event);
    };
    
    this.recognition.onend = () => {
      console.log('[WebSpeechEngine] Recognition ended');
      this.isListening = false;
      
      // Auto-restart if should be listening and no critical errors
      if (this.currentSession && !this.isCircuitBreakerOpen) {
        console.log('[WebSpeechEngine] Auto-restarting recognition');
        setTimeout(() => this.startRecognition(), 100);
      } else {
        this.callbacks.onEnd?.();
      }
    };
  }
  
  /**
   * Handle recognition errors with circuit breaker logic
   */
  handleRecognitionError(event) {
    const error = event.error;
    const isRecoverable = this.RECOVERABLE_ERRORS.includes(error);
    const isCritical = this.CRITICAL_ERRORS.includes(error);
    
    console.log(`[WebSpeechEngine] Error type: ${error}, recoverable: ${isRecoverable}, critical: ${isCritical}`);
    
    if (isCritical) {
      // Critical errors - stop completely
      console.error('[WebSpeechEngine] Critical error, stopping transcription');
      this.isCircuitBreakerOpen = true;
      this.stopTranscription();
      this.callbacks.onError?.({
        error,
        recoverable: false,
        message: this.getErrorMessage(error)
      });
      return;
    }
    
    if (isRecoverable) {
      // Recoverable errors - ignore and let auto-restart handle it
      console.log('[WebSpeechEngine] Recoverable error, will auto-restart');
      this.callbacks.onError?.({
        error,
        recoverable: true,
        message: this.getErrorMessage(error)
      });
      return;
    }
    
    // Other errors - increment error count
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();
    
    if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
      console.error('[WebSpeechEngine] Too many consecutive errors, opening circuit breaker');
      this.isCircuitBreakerOpen = true;
      this.stopTranscription();
      
      // Schedule circuit breaker reset
      setTimeout(() => {
        console.log('[WebSpeechEngine] Circuit breaker timeout reached, resetting');
        this.forceResetCircuitBreaker();
      }, this.circuitBreakerTimeout);
    }
    
    this.callbacks.onError?.({
      error,
      recoverable: !this.isCircuitBreakerOpen,
      message: this.getErrorMessage(error)
    });
  }
  
  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    const errorMessages = {
      'not-allowed': 'Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.',
      'no-speech': 'No se detectó voz. Por favor, habla más cerca del micrófono.',
      'audio-capture': 'Error al capturar audio. Verifica tu micrófono.',
      'network': 'Error de conexión. Verifica tu conexión a internet.',
      'aborted': 'Transcripción cancelada.',
      'service-not-allowed': 'Servicio de voz no disponible.',
      'bad-grammar': 'Error de configuración del servicio.'
    };
    
    return errorMessages[error] || `Error de transcripción: ${error}`;
  }
  
  /**
   * Start transcription with circuit breaker reset
   */
  async startTranscription(callbacks = {}) {
    console.log('[WebSpeechEngine] Starting transcription');
    
    // Always reset circuit breaker when starting new transcription
    this.forceResetCircuitBreaker();
    
    // Check if circuit breaker is open (shouldn't be after reset, but double-check)
    if (this.isCircuitBreakerOpen) {
      console.error('[WebSpeechEngine] Circuit breaker is open, cannot start');
      callbacks.onError?.({
        error: 'circuit-breaker-open',
        recoverable: false,
        message: 'Sistema de transcripción temporalmente no disponible'
      });
      return false;
    }
    
    // Initialize recognition if needed
    if (!this.recognition) {
      if (!this.initializeRecognition()) {
        callbacks.onError?.({
          error: 'not-supported',
          recoverable: false,
          message: 'Reconocimiento de voz no soportado en este navegador'
        });
        return false;
      }
    }
    
    // Set callbacks
    this.callbacks = { ...this.callbacks, ...callbacks };
    
    // Create new session
    this.currentSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      transcript: ''
    };
    
    try {
      // Start recognition
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('[WebSpeechEngine] Failed to start recognition:', error);
      
      // If already started, try to stop and restart
      if (error.message?.includes('already started')) {
        try {
          this.recognition.stop();
          await new Promise(resolve => setTimeout(resolve, 100));
          this.recognition.start();
          this.isListening = true;
          return true;
        } catch (retryError) {
          console.error('[WebSpeechEngine] Retry failed:', retryError);
        }
      }
      
      callbacks.onError?.({
        error: 'start-failed',
        recoverable: false,
        message: 'No se pudo iniciar el reconocimiento de voz'
      });
      return false;
    }
  }
  
  /**
   * Stop transcription
   */
  stopTranscription() {
    console.log('[WebSpeechEngine] Stopping transcription');
    
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('[WebSpeechEngine] Error stopping recognition:', error);
      }
    }
    
    this.isListening = false;
    this.currentSession = null;
  }
  
  /**
   * Get engine state for debugging
   */
  getEngineState() {
    return {
      isListening: this.isListening,
      isCircuitBreakerOpen: this.isCircuitBreakerOpen,
      consecutiveErrors: this.consecutiveErrors,
      retryCount: this.retryCount,
      lastErrorTime: this.lastErrorTime,
      hasRecognition: !!this.recognition,
      currentSession: this.currentSession ? {
        id: this.currentSession.id,
        duration: Date.now() - this.currentSession.startTime
      } : null
    };
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    this.stopTranscription();
    this.recognition = null;
    this.callbacks = {
      onStart: null,
      onResult: null,
      onError: null,
      onEnd: null
    };
  }
}

// Export singleton instance
export const webSpeechEngine = new WebSpeechEngine();