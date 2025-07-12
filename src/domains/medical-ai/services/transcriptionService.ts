/**
 * Transcription Service
 * 
 * Handles medical transcription with real-time processing
 */

// Web Speech API declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new() => SpeechRecognition;
    webkitSpeechRecognition: new() => SpeechRecognition;
  }
}

import {
  TranscriptionResult,
  TranscriptionSegment,
  TranscriptionStatus,
  AudioConfig,
  MedicalTerm,
  MedicalCategory,
  ServiceResponse,
  TranscriptionError
} from '../types';

import { transcriptionEngineManager } from './TranscriptionEngineManager';

export class TranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;
  private speechRecognition: SpeechRecognition | null = null;
  private retryAttempts = 0;
  private maxRetryAttempts = 3;
  private exponentialBackoffBase = 1000;
  private maxRetryDelay = 30000;
  private fallbackManager: any = null;
  private networkStatusDetector: any = null;
  private medicalErrorHandler: any = null;
  private isRecovering = false;
  private networkHealthCheckInterval: number | null = null;
  private recognitionState: 'idle' | 'starting' | 'running' | 'stopping' = 'idle';
  private lastNetworkLog = 0;
  private networkLogThrottle = 60000; // Log network status at most once per minute
  private consecutiveNetworkErrors = 0;
  private maxConsecutiveNetworkErrors = 5;

  constructor() {
    // Only setup audio context on client side
    if (typeof window !== 'undefined') {
      this.setupAudioContext();
      this.setupSpeechRecognition();
      this.initializeNetworkResilienceComponents();
      this.initializeNetworkMonitoring();
      this.initializeHybridTranscription();
    }
  }

  /**
   * Initialize hybrid transcription system
   */
  private async initializeHybridTranscription(): Promise<void> {
    try {
      await transcriptionEngineManager.initialize({
        whisperClient: {
          modelName: 'openai/whisper-base',
          language: 'es',
          medicalMode: true
        },
        whisperWASM: {
          modelName: 'whisper-base',
          language: 'es',
          medicalMode: true
        },
        webSpeech: {
          language: 'es-MX',
          continuous: true,
          interimResults: true
        },
        openAI: {
          apiKey: process.env.OPENAI_API_KEY,
          model: 'whisper-1',
          language: 'es',
          medicalMode: true
        }
      });
      
      console.log('Hybrid transcription system initialized');
    } catch (error) {
      console.error('Failed to initialize hybrid transcription:', error);
      // Fallback to original implementation
    }
  }

  /**
   * Start real-time transcription
   */
  async startTranscription(
    config: AudioConfig,
    onTranscriptionUpdate?: (result: TranscriptionResult) => void
  ): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (this.isRecording) {
        throw new TranscriptionError('Transcription already in progress');
      }

      this.transcriptionCallback = onTranscriptionUpdate || null;
      
      // Try hybrid transcription first
      try {
        const hybridResult = await this.startHybridTranscription(config, onTranscriptionUpdate);
        if (hybridResult.success) {
          return hybridResult;
        }
      } catch (error) {
        console.warn('Hybrid transcription failed, falling back to original:', error);
      }
      
      // Fallback to original implementation
      const stream = await this.getMediaStream(config);
      this.currentTranscription = this.initializeTranscription(config);
      await this.startRecording(stream, config);
      
      return {
        success: true,
        data: this.currentTranscription,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start transcription',
        timestamp: new Date()
      };
    }
  }

  /**
   * Start hybrid transcription
   */
  private async startHybridTranscription(
    config: AudioConfig,
    onTranscriptionUpdate?: (result: TranscriptionResult) => void
  ): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      // Set medical context
      const medicalContext = {
        specialty: 'general',
        patientId: 'current',
        sessionType: 'consultation',
        urgency: 'routine'
      };
      
      transcriptionEngineManager.setMedicalContext(medicalContext);
      
      // Start transcription with hybrid engine
      const result = await transcriptionEngineManager.startTranscription(config, {
        onTranscriptionUpdate: (hybridResult) => {
          // Convert hybrid result to legacy format
          const legacyResult = this.convertHybridToLegacyResult(hybridResult);
          this.currentTranscription = legacyResult;
          
          if (onTranscriptionUpdate) {
            onTranscriptionUpdate(legacyResult);
          }
        },
        onError: (error) => {
          console.error('Hybrid transcription error:', error);
          this.handleHybridTranscriptionError(error);
        }
      });
      
      if (result.success) {
        this.isRecording = true;
        this.currentTranscription = this.convertHybridToLegacyResult(result.data);
        
        return {
          success: true,
          data: this.currentTranscription,
          timestamp: new Date()
        };
      }
      
      throw new Error('Hybrid transcription failed to start');
      
    } catch (error) {
      console.error('Hybrid transcription startup failed:', error);
      throw error;
    }
  }

  /**
   * Convert hybrid result to legacy format
   */
  private convertHybridToLegacyResult(hybridResult: any): TranscriptionResult {
    return {
      id: hybridResult.sessionId || hybridResult.id || `hybrid-${Date.now()}`,
      text: hybridResult.text || hybridResult.fullText || '',
      confidence: hybridResult.confidence || 0.8,
      timestamp: new Date(),
      language: 'es-MX',
      medicalTerms: hybridResult.medicalTerms || [],
      segments: hybridResult.segments || [],
      status: hybridResult.status || TranscriptionStatus.RECORDING
    };
  }

  /**
   * Handle hybrid transcription errors
   */
  private handleHybridTranscriptionError(error: any): void {
    console.error('Hybrid transcription error:', error);
    
    // Update current transcription with error
    if (this.currentTranscription) {
      this.currentTranscription.status = TranscriptionStatus.ERROR;
      this.currentTranscription.error = error.message || 'Hybrid transcription error';
    }
    
    // Notify callback
    if (this.transcriptionCallback && this.currentTranscription) {
      this.transcriptionCallback(this.currentTranscription);
    }
  }

  /**
   * Stop transcription and return final result
   */
  async stopTranscription(): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (!this.isRecording || !this.currentTranscription) {
        throw new TranscriptionError('No active transcription to stop');
      }

      // Try hybrid transcription stop first
      try {
        const hybridResult = await transcriptionEngineManager.stopTranscription();
        if (hybridResult.success) {
          this.isRecording = false;
          const finalResult = this.convertHybridToLegacyResult(hybridResult.data);
          return {
            success: true,
            data: finalResult,
            timestamp: new Date()
          };
        }
      } catch (error) {
        console.warn('Hybrid transcription stop failed, using fallback:', error);
      }

      // Fallback to original implementation
      this.stopRecording();
      const finalResult = await this.finalizeTranscription(this.currentTranscription);
      
      return {
        success: true,
        data: finalResult,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop transcription',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process audio chunk for real-time transcription
   */
  async processAudioChunk(
    audioData: ArrayBuffer,
    config: AudioConfig
  ): Promise<ServiceResponse<TranscriptionSegment>> {
    try {
      // Try hybrid transcription processing first
      try {
        const hybridResult = await transcriptionEngineManager.processAudioChunk(audioData, config);
        if (hybridResult.success) {
          // Convert to legacy segment format
          const segment: TranscriptionSegment = {
            id: hybridResult.data.chunkId || `chunk-${Date.now()}`,
            text: hybridResult.data.text || '',
            startTime: Date.now(),
            endTime: Date.now(),
            confidence: hybridResult.data.confidence || 0.8,
            speaker: 'doctor'
          };
          
          return {
            success: true,
            data: segment,
            timestamp: new Date()
          };
        }
      } catch (error) {
        console.warn('Hybrid audio processing failed, using fallback:', error);
      }

      // Fallback to original implementation
      const segment = await this.transcribeAudioChunk(audioData, config);
      
      // Update current transcription
      if (this.currentTranscription) {
        this.currentTranscription.segments.push(segment);
        this.currentTranscription.text += ` ${segment.text}`;
        this.currentTranscription.medicalTerms.push(...this.extractMedicalTerms(segment.text));
        
        // Update confidence
        this.currentTranscription.confidence = this.calculateOverallConfidence(
          this.currentTranscription.segments
        );
        
        // Callback for real-time updates
        if (this.transcriptionCallback) {
          this.transcriptionCallback(this.currentTranscription);
        }
      }
      
      return {
        success: true,
        data: segment,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process audio chunk',
        timestamp: new Date()
      };
    }
  }

  /**
   * Enhance transcription with medical terminology
   */
  async enhanceWithMedicalTerms(
    transcription: TranscriptionResult
  ): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      const enhanced = { ...transcription };
      
      // Enhanced medical term extraction
      enhanced.medicalTerms = this.extractMedicalTerms(transcription.text);
      
      // Apply medical spell check
      enhanced.text = await this.applyMedicalSpellCheck(transcription.text);
      
      // Recalculate confidence with medical context
      enhanced.confidence = this.calculateMedicalConfidence(enhanced);
      
      return {
        success: true,
        data: enhanced,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance transcription',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get transcription status
   */
  getTranscriptionStatus(): TranscriptionStatus {
    if (!this.currentTranscription) return TranscriptionStatus.IDLE;
    return this.currentTranscription.status;
  }

  /**
   * Get current transcription progress
   */
  getCurrentTranscription(): TranscriptionResult | null {
    return this.currentTranscription;
  }

  /**
   * Get transcription engine status
   */
  getEngineStatus(): any {
    try {
      return transcriptionEngineManager.getEngineStatus();
    } catch (error) {
      console.error('Failed to get engine status:', error);
      return {
        error: 'Engine status unavailable',
        fallbackMode: true
      };
    }
  }

  /**
   * Switch to specific transcription engine
   */
  async switchToEngine(engineName: string): Promise<boolean> {
    try {
      return await transcriptionEngineManager.switchToEngine(engineName);
    } catch (error) {
      console.error('Failed to switch engine:', error);
      return false;
    }
  }

  /**
   * Get available transcription engines
   */
  getAvailableEngines(): string[] {
    try {
      const status = transcriptionEngineManager.getEngineStatus();
      return status.availableEngines || [];
    } catch (error) {
      console.error('Failed to get available engines:', error);
      return ['web-speech']; // Fallback
    }
  }

  /**
   * Initialize network resilience components
   */
  private async initializeNetworkResilienceComponents(): Promise<void> {
    try {
      // Initialize components lazily to avoid circular dependencies
      console.log('Initializing network resilience components...');
    } catch (error) {
      console.error('Failed to initialize network resilience components:', error);
    }
  }

  /**
   * Handle speech recognition errors with retry mechanism
   */
  private async handleSpeechRecognitionError(event: any): Promise<void> {
    try {
      const errorContext = {
        errorType: this.classifyError(event.error),
        severity: this.determineSeverity(event.error),
        timestamp: new Date(),
        medicalContext: this.getMedicalContext(),
        retryAttempt: this.retryAttempts
      };

      console.log('Speech recognition error:', {
        error: event.error,
        context: errorContext
      });

      // Track consecutive network errors
      if (errorContext.errorType === 'network') {
        this.consecutiveNetworkErrors++;
      } else {
        this.consecutiveNetworkErrors = 0; // Reset on non-network errors
      }

      // Determine recovery strategy
      const recoveryStrategy = this.determineRecoveryStrategy(errorContext);
      
      switch (recoveryStrategy) {
        case 'retry':
          await this.retryWithExponentialBackoff();
          break;
        case 'fallback':
          this.retryAttempts = 0; // Reset counters
          this.consecutiveNetworkErrors = 0;
          await this.switchToFallbackService();
          break;
        case 'buffer':
          await this.enableOfflineMode();
          break;
        case 'abort':
          this.retryAttempts = 0;
          this.consecutiveNetworkErrors = 0;
          this.handleCriticalError(event.error, errorContext);
          break;
        default:
          console.error('Unknown recovery strategy:', recoveryStrategy);
      }
    } catch (error) {
      console.error('Error in speech recognition error handler:', error);
    }
  }

  /**
   * Classify error type for appropriate handling
   */
  private classifyError(error: string): 'network' | 'hardware' | 'api' | 'timeout' | 'unknown' {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return 'network';
    }
    if (errorLower.includes('audio') || errorLower.includes('microphone')) {
      return 'hardware';
    }
    if (errorLower.includes('service-not-allowed') || errorLower.includes('not-allowed')) {
      return 'api';
    }
    if (errorLower.includes('timeout')) {
      return 'timeout';
    }
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: string): 'low' | 'medium' | 'high' | 'critical' {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('not-allowed') || errorLower.includes('permission')) {
      return 'critical';
    }
    if (errorLower.includes('network') || errorLower.includes('timeout')) {
      return 'high';
    }
    if (errorLower.includes('audio')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Determine recovery strategy based on error context
   */
  private determineRecoveryStrategy(errorContext: any): 'retry' | 'fallback' | 'buffer' | 'abort' {
    // Critical errors require immediate abort
    if (errorContext.severity === 'critical') {
      return 'abort';
    }
    
    // Network errors should try fallback after retries
    if (errorContext.errorType === 'network') {
      return this.retryAttempts < this.maxRetryAttempts ? 'retry' : 'fallback';
    }
    
    // Timeout errors should try buffering
    if (errorContext.errorType === 'timeout') {
      return 'buffer';
    }
    
    // Hardware errors should try fallback
    if (errorContext.errorType === 'hardware') {
      return 'fallback';
    }
    
    // Default to retry for unknown errors
    return this.retryAttempts < this.maxRetryAttempts ? 'retry' : 'abort';
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithExponentialBackoff(): Promise<void> {
    if (this.retryAttempts >= this.maxRetryAttempts) {
      console.error('Max retry attempts reached');
      this.retryAttempts = 0; // Reset counter to prevent accumulation
      await this.switchToFallbackService();
      return;
    }

    // Check for too many consecutive network errors
    if (this.consecutiveNetworkErrors >= this.maxConsecutiveNetworkErrors) {
      console.error('Too many consecutive network errors, switching to fallback');
      this.consecutiveNetworkErrors = 0;
      this.retryAttempts = 0;
      await this.switchToFallbackService();
      return;
    }

    this.retryAttempts++;
    this.isRecovering = true;
    
    // Calculate delay with exponential backoff and jitter
    const delay = Math.min(
      this.exponentialBackoffBase * Math.pow(2, this.retryAttempts - 1),
      this.maxRetryDelay
    );
    
    const jitter = Math.random() * 0.1 * delay;
    const totalDelay = delay + jitter;
    
    console.log(`Retrying speech recognition in ${totalDelay}ms (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`);
    
    // Use a timeout handle that can be cancelled if needed
    const retryTimeout = setTimeout(() => {
      if (this.isRecording) {
        this.restartSpeechRecognition();
      } else {
        console.log('Recording stopped, cancelling retry');
        this.retryAttempts = 0;
        this.isRecovering = false;
      }
    }, totalDelay);
    
    // Store timeout handle for potential cancellation
    if (this.networkHealthCheckInterval) {
      clearTimeout(this.networkHealthCheckInterval);
    }
  }

  /**
   * Restart speech recognition after error
   */
  private restartSpeechRecognition(): void {
    try {
      if (this.speechRecognition && this.isRecording) {
        // First check if recognition is already running
        try {
          this.speechRecognition.stop();
        } catch (stopError) {
          // Ignore stop errors - recognition might already be stopped
        }
        
        // Use a small delay to ensure clean state
        setTimeout(() => {
          try {
            if (this.speechRecognition && this.isRecording && this.recognitionState !== 'running') {
              this.recognitionState = 'starting';
              this.speechRecognition.start();
              this.recognitionState = 'running';
              this.isRecovering = false;
              console.log('Speech recognition restarted successfully');
            } else if (this.recognitionState === 'running') {
              // Already running, just clear recovery flag
              this.isRecovering = false;
              console.log('Speech recognition already running');
            }
          } catch (startError) {
            console.error('Failed to start speech recognition:', startError);
            this.recognitionState = 'idle';
            if (startError.message && startError.message.includes('already started')) {
              // Recognition is already running, update state
              this.recognitionState = 'running';
              this.isRecovering = false;
            } else {
              this.switchToFallbackService();
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to restart speech recognition:', error);
      this.switchToFallbackService();
    }
  }

  /**
   * Switch to fallback transcription service
   */
  private async switchToFallbackService(): Promise<void> {
    try {
      console.log('Switching to fallback transcription service...');
      // For now, we'll implement a basic fallback that continues with limited functionality
      this.retryAttempts = 0; // Reset retry counter
      this.isRecovering = false;
      
      // TODO: Implement actual fallback service when TranscriptionFallbackManager is created
      console.log('Fallback service activated');
    } catch (error) {
      console.error('Failed to switch to fallback service:', error);
      this.enableOfflineMode();
    }
  }

  /**
   * Enable offline mode with local buffering
   */
  private async enableOfflineMode(): Promise<void> {
    try {
      console.log('Enabling offline mode for transcription');
      // For now, we'll implement a basic offline mode
      this.isRecovering = false;
      
      // TODO: Implement actual offline buffering when OfflineTranscriptionBuffer is created
      console.log('Offline mode enabled');
    } catch (error) {
      console.error('Failed to enable offline mode:', error);
    }
  }

  /**
   * Handle critical errors that require immediate attention
   */
  private handleCriticalError(error: string, context: any): void {
    console.error('Critical transcription error:', error, context);
    
    // Stop current transcription
    this.stopTranscription();
    
    // Notify user through UI
    if (this.transcriptionCallback && this.currentTranscription) {
      const errorResult = {
        ...this.currentTranscription,
        status: TranscriptionStatus.ERROR,
        error: 'Critical error occurred: ' + error
      };
      this.transcriptionCallback(errorResult as any);
    }
    
    this.isRecovering = false;
  }

  /**
   * Get medical context for error handling
   */
  private getMedicalContext(): any {
    return {
      patientId: 'unknown',
      consultationId: 'unknown',
      specialty: 'general',
      urgencyLevel: 'routine',
      timestamp: new Date()
    };
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    try {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
        window.addEventListener('online', () => this.handleNetworkStatusChange({ isOnline: true }));
        window.addEventListener('offline', () => this.handleNetworkStatusChange({ isOnline: false }));
      }
      
      this.startNetworkHealthCheck();
      console.log('Network monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }

  /**
   * Start periodic network health check
   */
  private startNetworkHealthCheck(): void {
    if (this.networkHealthCheckInterval) {
      clearInterval(this.networkHealthCheckInterval);
    }
    
    this.networkHealthCheckInterval = window.setInterval(() => {
      this.checkNetworkHealth();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Check network health
   */
  private async checkNetworkHealth(): Promise<void> {
    try {
      const isOnline = navigator.onLine;
      const timestamp = Date.now();
      
      // Simple connectivity test
      if (isOnline) {
        try {
          await fetch('/api/health', { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
        } catch {
          // If API check fails but navigator says online, we might have limited connectivity
          console.warn('Limited network connectivity detected');
        }
      }
      
      // Log network status for debugging (throttled)
      if (this.isRecording) {
        const now = Date.now();
        if (now - this.lastNetworkLog > this.networkLogThrottle) {
          console.log('Network health check:', { isOnline, timestamp });
          this.lastNetworkLog = now;
        }
      }
    } catch (error) {
      console.error('Network health check failed:', error);
    }
  }

  /**
   * Handle network status changes
   */
  private handleNetworkStatusChange(status: any): void {
    console.log('Network status changed:', status);
    
    if (status.isOnline && this.isRecovering) {
      console.log('Network connection restored, attempting to recover');
      this.restartSpeechRecognition();
    } else if (!status.isOnline && this.isRecording) {
      console.log('Network connection lost, switching to offline mode');
      this.enableOfflineMode();
    }
  }

  // Private methods
  private async setupAudioContext(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.error('Failed to setup audio context:', error);
    }
  }

  private async getMediaStream(config: AudioConfig): Promise<MediaStream> {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available');
    }
    
    const constraints = {
      audio: {
        sampleRate: config.sampleRate,
        channelCount: config.channels,
        echoCancellation: true,
        noiseSuppression: config.noiseReduction,
        autoGainControl: true
      }
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  private initializeTranscription(config: AudioConfig): TranscriptionResult {
    return {
      id: `transcription-${Date.now()}`,
      text: '',
      confidence: 0,
      timestamp: new Date(),
      language: 'es-MX', // Default to Spanish Mexico
      medicalTerms: [],
      segments: [],
      status: TranscriptionStatus.RECORDING
    };
  }

  private async startRecording(stream: MediaStream, config: AudioConfig): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.MediaRecorder) {
        throw new Error('MediaRecorder not available');
      }
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getMimeType(config.format)
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.processAudioData(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Capture every 1 second
      
      // Start speech recognition
      if (this.speechRecognition && this.recognitionState !== 'running') {
        try {
          this.recognitionState = 'starting';
          this.speechRecognition.start();
          this.recognitionState = 'running';
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          this.recognitionState = 'idle';
          // Continue without speech recognition - don't fail the entire recording
        }
      }
      
      this.isRecording = true;

    } catch (error) {
      throw new TranscriptionError('Failed to start recording', { error });
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      
      // Stop speech recognition
      if (this.speechRecognition && this.recognitionState === 'running') {
        try {
          this.recognitionState = 'stopping';
          this.speechRecognition.stop();
          this.recognitionState = 'idle';
        } catch (error) {
          console.error('Failed to stop speech recognition:', error);
          this.recognitionState = 'idle';
        }
      }
      
      this.isRecording = false;
      
      if (this.currentTranscription) {
        this.currentTranscription.status = TranscriptionStatus.PROCESSING;
      }
    }
  }

  private async processAudioData(audioBlob: Blob): Promise<void> {
    try {
      // Web Speech API handles transcription directly
      // This method is now primarily for audio level monitoring
      if (this.speechRecognition) {
        // Speech recognition handles text processing
        // We just need to maintain the recording state
      }
    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  }

  private async transcribeAudioChunk(
    audioData: ArrayBuffer,
    config: AudioConfig
  ): Promise<TranscriptionSegment> {
    // Web Speech API handles transcription in real-time
    // This method creates segments from speech recognition results
    return {
      id: `segment-${Date.now()}`,
      text: '', // Will be populated by speech recognition
      startTime: Date.now(),
      endTime: Date.now() + 1000,
      confidence: 0.85,
      speaker: 'doctor'
    };
  }

  private async finalizeTranscription(
    transcription: TranscriptionResult
  ): Promise<TranscriptionResult> {
    const finalized = { ...transcription };
    
    // Final processing
    finalized.status = TranscriptionStatus.COMPLETED;
    finalized.confidence = this.calculateOverallConfidence(finalized.segments);
    finalized.medicalTerms = this.extractMedicalTerms(finalized.text);
    
    return finalized;
  }

  private extractMedicalTerms(text: string): MedicalTerm[] {
    const terms: MedicalTerm[] = [];
    
    // Medical term patterns
    const medicalTerms = [
      { term: 'hipertensión', category: MedicalCategory.DIAGNOSIS },
      { term: 'diabetes', category: MedicalCategory.DIAGNOSIS },
      { term: 'fiebre', category: MedicalCategory.SYMPTOM },
      { term: 'dolor', category: MedicalCategory.SYMPTOM },
      { term: 'medicamento', category: MedicalCategory.TREATMENT },
      { term: 'presión arterial', category: MedicalCategory.PROCEDURE }
    ];

    const words = text.toLowerCase().split(/\s+/);
    
    for (const medicalTerm of medicalTerms) {
      if (words.some(word => word.includes(medicalTerm.term))) {
        terms.push({
          term: medicalTerm.term,
          definition: `Medical term: ${medicalTerm.term}`,
          category: medicalTerm.category,
          confidence: 0.8,
          synonyms: []
        });
      }
    }
    
    return terms;
  }

  private async applyMedicalSpellCheck(text: string): Promise<string> {
    // Medical spell check logic
    // In real implementation, this would use a medical dictionary
    return text; // Simplified for now
  }

  private calculateOverallConfidence(segments: TranscriptionSegment[]): number {
    if (segments.length === 0) return 0;
    
    const totalConfidence = segments.reduce((sum, segment) => sum + segment.confidence, 0);
    return totalConfidence / segments.length;
  }

  private calculateMedicalConfidence(transcription: TranscriptionResult): number {
    const baseConfidence = transcription.confidence;
    const medicalTermBonus = Math.min(transcription.medicalTerms.length * 0.05, 0.2);
    
    return Math.min(baseConfidence + medicalTermBonus, 1.0);
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'webm': return 'audio/webm';
      case 'mp3': return 'audio/mpeg';
      case 'ogg': return 'audio/ogg';
      case 'wav': return 'audio/wav';
      default: return 'audio/webm';
    }
  }

  private setupSpeechRecognition(): void {
    try {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          this.speechRecognition = new SpeechRecognition();
          this.speechRecognition.continuous = true;
          this.speechRecognition.interimResults = true;
          this.speechRecognition.lang = 'es-MX';
          
          this.speechRecognition.onresult = (event) => {
            this.handleSpeechResult(event);
          };
          
          this.speechRecognition.onerror = (event) => {
            this.handleSpeechRecognitionError(event);
          };
          
          this.speechRecognition.onend = () => {
            if (this.isRecording) {
              // Restart if still recording
              this.speechRecognition?.start();
            }
          };
        }
      }
    } catch (error) {
      console.error('Failed to setup speech recognition:', error);
    }
  }

  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    if (!this.currentTranscription) return;

    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        
        // Create a new segment for final results
        const segment: TranscriptionSegment = {
          id: `segment-${Date.now()}`,
          text: transcript,
          startTime: Date.now(),
          endTime: Date.now() + 1000,
          confidence: event.results[i][0].confidence,
          speaker: 'doctor'
        };
        
        this.currentTranscription.segments.push(segment);
        this.currentTranscription.text += ` ${transcript}`;
        this.currentTranscription.medicalTerms.push(...this.extractMedicalTerms(transcript));
      } else {
        interimTranscript += transcript;
      }
    }

    // Update confidence
    this.currentTranscription.confidence = this.calculateOverallConfidence(
      this.currentTranscription.segments
    );

    // Callback for real-time updates
    if (this.transcriptionCallback) {
      this.transcriptionCallback(this.currentTranscription);
    }
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();