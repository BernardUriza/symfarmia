/**
 * Transcription Service
 * 
 * Handles medical transcription with real-time processing
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
  private audioContext: AudioContext | null = null;
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;

  constructor() {
    this.setupAudioContext();
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

  // Private methods
  private async setupAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to setup audio context:', error);
    }
  }

  private async getMediaStream(config: AudioConfig): Promise<MediaStream> {
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
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getMimeType(config.format)
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.processAudioData(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Capture every 1 second
      this.isRecording = true;

    } catch (error) {
      throw new TranscriptionError('Failed to start recording', { error });
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      if (this.currentTranscription) {
        this.currentTranscription.status = TranscriptionStatus.PROCESSING;
      }
    }
  }

  private async processAudioData(audioBlob: Blob): Promise<void> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Simulate transcription processing
      // In real implementation, this would send to transcription service
      const mockText = this.generateMockTranscription();
      
      const segment: TranscriptionSegment = {
        id: `segment-${Date.now()}`,
        text: mockText,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        confidence: 0.85,
        speaker: 'doctor'
      };

      await this.processAudioChunk(arrayBuffer, {
        sampleRate: 44100,
        channels: 1,
        bitDepth: 16,
        format: 'webm' as any,
        noiseReduction: true,
        medicalOptimization: true,
        realTimeProcessing: true,
        maxDuration: 3600
      });

    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  }

  private async transcribeAudioChunk(
    audioData: ArrayBuffer,
    config: AudioConfig
  ): Promise<TranscriptionSegment> {
    // Simulate transcription processing
    // In real implementation, this would call the actual transcription service
    const mockText = this.generateMockTranscription();
    
    return {
      id: `segment-${Date.now()}`,
      text: mockText,
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
      { term: 'fiebre', category: MedicalCategory.SYMPTOMS },
      { term: 'dolor', category: MedicalCategory.SYMPTOMS },
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

  private generateMockTranscription(): string {
    const mockPhrases = [
      'El paciente presenta dolor abdominal',
      'La presión arterial está elevada',
      'Se recomienda realizar análisis de sangre',
      'El paciente tiene fiebre de 38 grados',
      'Se prescribe medicamento para la hipertensión',
      'Los síntomas comenzaron hace dos días'
    ];
    
    return mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();