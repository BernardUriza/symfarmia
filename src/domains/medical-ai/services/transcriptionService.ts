/**
 * Transcription Service
 * 
 * Handles medical transcription using SusurroTest microservice
 */

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
  private audioChunks: Blob[] = [];
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;
  private recordingStartTime = 0;
  private chunkDuration = 10000; // 10 seconds max chunk size
  private chunkInterval: NodeJS.Timeout | null = null;
  private microserviceUrl = 'http://localhost:3001';

  constructor() {
    console.log('🎙️ [TranscriptionService] Initialized - Using SusurroTest microservice');
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
      
      // Get media stream and initialize
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
   * Stop transcription and return final result
   */
  async stopTranscription(): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (!this.isRecording || !this.currentTranscription) {
        throw new TranscriptionError('No active transcription to stop');
      }

      // Stop recording and process final chunk
      this.stopRecording();
      
      // Process any remaining audio chunks
      if (this.audioChunks.length > 0) {
        await this.processAudioChunk();
      }
      
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
      // This method is not used in the simplified version
      // Audio chunks are processed in processAudioChunk()
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
    return this.currentTranscription.status || TranscriptionStatus.IDLE;
  }

  /**
   * Get current transcription progress
   */
  getCurrentTranscription(): TranscriptionResult | null {
    return this.currentTranscription;
  }



  // Private methods

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
    const now = Date.now();
    return {
      id: `transcription-${now}`,
      sessionId: `session-${now}`,
      text: '',
      fullText: '',
      duration: 0,
      engine: 'susurro-test',
      confidence: 0,
      timestamp: new Date(),
      createdAt: new Date(),
      language: 'es-MX',
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
      
      console.log('🎵 [Recording] Starting audio capture');
      this.recordingStartTime = Date.now();
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('🎙️ [Recording] Audio chunk received:', event.data.size);
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Capture every 1 second
      this.isRecording = true;
      
      // Start chunk processing interval
      this.chunkInterval = setInterval(() => {
        if (this.audioChunks.length > 0) {
          this.processAudioChunk();
        }
      }, this.chunkDuration);
      
      console.log('✅ [Recording] Started successfully');

    } catch (error) {
      throw new TranscriptionError('Failed to start recording', { 
        details: error,
        code: 'RECORDING_START_FAILED',
        recoverable: true
      });
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      console.log('🛑 [Recording] Stopping audio capture');
      
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Clear chunk interval
      if (this.chunkInterval) {
        clearInterval(this.chunkInterval);
        this.chunkInterval = null;
      }
      
      if (this.currentTranscription) {
        this.currentTranscription.status = TranscriptionStatus.PROCESSING;
        this.currentTranscription.duration = (Date.now() - this.recordingStartTime) / 1000;
      }
    }
  }

  /**
   * Process accumulated audio chunks and send to microservice
   */
  private async processAudioChunk(): Promise<void> {
    if (this.audioChunks.length === 0 || !this.currentTranscription) return;
    
    try {
      console.log('📤 [Transcription] Processing audio chunk');
      
      // Combine all chunks into a single blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = []; // Clear chunks after combining
      
      // Convert to WAV format
      const wavBlob = await this.convertToWav(audioBlob);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', wavBlob, 'audio.wav');
      formData.append('language', 'es');
      
      // Send to microservice
      console.log('🌐 [Transcription] Sending to SusurroTest microservice');
      const response = await fetch(`${this.microserviceUrl}/api/transcribe-upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Microservice error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ [Transcription] Received result:', result);
      
      // Update transcription
      if (result.transcription) {
        this.currentTranscription.fullText = 
          (this.currentTranscription.fullText + ' ' + result.transcription).trim();
        this.currentTranscription.text = this.currentTranscription.fullText;
        
        // Create segment
        const segment: TranscriptionSegment = {
          id: `segment-${Date.now()}`,
          start: 0,
          end: 0,
          startTime: Date.now() - this.chunkDuration,
          endTime: Date.now(),
          text: result.transcription,
          confidence: result.confidence || 0.85,
          speaker: 'doctor',
          language: 'es-MX',
          timestamp: Date.now()
        };
        
        this.currentTranscription.segments.push(segment);
        
        // Extract medical terms
        const medicalTerms = this.extractMedicalTerms(result.transcription);
        this.currentTranscription.medicalTerms.push(...medicalTerms);
        
        // Update confidence
        this.currentTranscription.confidence = 
          this.calculateOverallConfidence(this.currentTranscription.segments);
        
        // Notify callback
        if (this.transcriptionCallback) {
          this.transcriptionCallback(this.currentTranscription);
        }
      }
      
    } catch (error) {
      console.error('❌ [Transcription] Error processing chunk:', error);
      if (this.currentTranscription) {
        this.currentTranscription.error = error instanceof Error ? error.message : 'Processing error';
      }
    }
  }
  
  /**
   * Convert audio blob to WAV format
   */
  private async convertToWav(audioBlob: Blob): Promise<Blob> {
    // For now, return the blob as-is
    // In production, implement proper audio conversion
    console.log('🔀 [Audio] Converting to WAV format');
    return audioBlob;
  }

  private async transcribeAudioChunk(
    audioData: ArrayBuffer,
    config: AudioConfig
  ): Promise<TranscriptionSegment> {
    // This method is not used in the simplified microservice version
    // Audio processing is handled by processAudioChunk()
    return {
      id: `segment-${Date.now()}`,
      start: 0,
      end: 0,
      startTime: Date.now(),
      endTime: Date.now() + 1000,
      text: '',
      confidence: 0.85,
      speaker: 'doctor',
      language: 'es-MX',
      timestamp: Date.now()
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
          id: `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          term: medicalTerm.term,
          termEs: medicalTerm.term, // Already in Spanish
          definition: `Medical term: ${medicalTerm.term}`,
          definitionEs: `Término médico: ${medicalTerm.term}`,
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

}

// Export singleton instance
export const transcriptionService = new TranscriptionService();