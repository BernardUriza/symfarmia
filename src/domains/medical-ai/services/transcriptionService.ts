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

  constructor() {
    // Only setup audio context on client side
    if (typeof window !== 'undefined') {
      this.setupAudioContext();
      this.setupSpeechRecognition();
      this.initializeNetworkResilienceComponents();
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
      
      // Get media stream
      const stream = await this.getMediaStream(config);
      
      // Initialize transcription
      this.currentTranscription = this.initializeTranscription(config);
      
      // Start recording
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
   * Stop transcription and return final result
   */
  async stopTranscription(): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (!this.isRecording || !this.currentTranscription) {
        throw new TranscriptionError('No active transcription to stop');
      }

      // Stop recording
      this.stopRecording();
      
      // Finalize transcription
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
      // Convert audio data to text
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

      // Determine recovery strategy
      const recoveryStrategy = this.determineRecoveryStrategy(errorContext);
      
      switch (recoveryStrategy) {
        case 'retry':
          await this.retryWithExponentialBackoff();
          break;
        case 'fallback':
          await this.switchToFallbackService();
          break;
        case 'buffer':
          await this.enableOfflineMode();
          break;
        case 'abort':
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
    
    setTimeout(() => {
      this.restartSpeechRecognition();
    }, totalDelay);
  }

  /**
   * Restart speech recognition after error
   */
  private restartSpeechRecognition(): void {
    try {
      if (this.speechRecognition && this.isRecording) {
        this.speechRecognition.start();
        this.isRecovering = false;
        console.log('Speech recognition restarted successfully');
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
   * Handle network status changes
   */
  private handleNetworkStatusChange(status: any): void {
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
      if (this.speechRecognition) {
        this.speechRecognition.start();
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
      if (this.speechRecognition) {
        this.speechRecognition.stop();
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