import {
  TranscriptionResult,
  TranscriptionSegment,
  TranscriptionStatus,
  AudioConfig,
  MedicalTerm,
  MedicalCategory,
  ServiceResponse,
} from '../types';

export class TranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;
  private recordingStartTime = 0;
  private chunkDuration = 10000;
  private chunkInterval: NodeJS.Timeout | null = null;
  // private microserviceUrl = 'http://localhost:3001'; // Ya no se usa directo, ahora usamos proxy API

  constructor() {
    console.log('🎙️ [TranscriptionService] Ready - usando proxy API endpoint');
  }

  async startTranscription(
    config: AudioConfig,
    onTranscriptionUpdate?: (result: TranscriptionResult) => void
  ): Promise<ServiceResponse<TranscriptionResult>> {
    if (this.isRecording) {
      console.error('🚨 [startTranscription] Already recording!');
      return { success: false, error: 'Transcription already in progress', timestamp: new Date() };
    }
    this.transcriptionCallback = onTranscriptionUpdate || null;
    const stream = await this.getMediaStream(config);
    this.currentTranscription = this.initializeTranscription();
    await this.startRecording(stream);
    console.log('🎬 [Transcription] STARTED');
    return { success: true, data: this.currentTranscription, timestamp: new Date() };
  }

  async stopTranscription(): Promise<ServiceResponse<TranscriptionResult>> {
    if (!this.isRecording || !this.currentTranscription) {
      console.warn('⚠️ [stopTranscription] Nothing to stop');
      return { success: false, error: 'No active transcription to stop', timestamp: new Date() };
    }
    this.stopRecording();
    if (this.audioChunks.length > 0) {
      await this.processAudioChunk();
    }
    const finalResult = await this.finalizeTranscription(this.currentTranscription);
    console.log('🏁 [Transcription] COMPLETED');
    return { success: true, data: finalResult, timestamp: new Date() };
  }

  getTranscriptionStatus(): TranscriptionStatus {
    return this.currentTranscription?.status || TranscriptionStatus.IDLE;
  }

  getCurrentTranscription(): TranscriptionResult | null {
    return this.currentTranscription;
  }

  // PRIVATE SECTION SPLIT

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

  private initializeTranscription(): TranscriptionResult {
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

  private async startRecording(stream: MediaStream): Promise<void> {
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
    this.mediaRecorder.start(1000);
    this.isRecording = true;
    this.chunkInterval = setInterval(() => {
      if (this.audioChunks.length > 0) {
        this.processAudioChunk();
      }
    }, this.chunkDuration);
    console.log('✅ [Recording] Started successfully');
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      console.log('🛑 [Recording] Stopping audio capture');
      this.mediaRecorder.stop();
      this.isRecording = false;
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

  private async processAudioChunk(): Promise<void> {
    if (this.audioChunks.length === 0 || !this.currentTranscription) return;
    try {
      console.log('📤 [Transcription] Processing audio chunk');
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      
      // TODO: Implement client-side transcription
      // For now, just simulate a transcription result
      console.warn('⚠️ [Transcription] Client-side transcription not implemented yet');
      
      // Simulate transcription
      const simulatedText = "Transcripción simulada del audio";
      const simulatedConfidence = 0.85;
      
      this.updateTranscriptionState(simulatedText, simulatedConfidence);
    } catch (error) {
      console.error('❌ [Transcription] Error processing chunk:', error);
      if (this.currentTranscription) {
        this.currentTranscription.error = error instanceof Error ? error.message : 'Processing error';
      }
    }
  }

  // Conversión de audio removida - ahora se maneja en el backend API

  private updateTranscriptionState(text: string, confidence: number) {
    if (!this.currentTranscription) return;
    this.currentTranscription.fullText =
      (this.currentTranscription.fullText + ' ' + text).trim();
    this.currentTranscription.text = this.currentTranscription.fullText;
    const segment: TranscriptionSegment = {
      id: `segment-${Date.now()}`,
      start: 0,
      end: 0,
      startTime: Date.now() - this.chunkDuration,
      endTime: Date.now(),
      text,
      confidence: confidence || 0.85,
      speaker: 'doctor',
      language: 'es-MX',
      timestamp: Date.now()
    };
    this.currentTranscription.segments.push(segment);
    const medicalTerms = this.extractMedicalTerms(text);
    this.currentTranscription.medicalTerms.push(...medicalTerms);
    this.currentTranscription.confidence = this.calculateOverallConfidence(this.currentTranscription.segments);
    if (this.transcriptionCallback) {
      this.transcriptionCallback(this.currentTranscription);
    }
  }

  private async finalizeTranscription(transcription: TranscriptionResult): Promise<TranscriptionResult> {
    const finalized = { ...transcription };
    finalized.status = TranscriptionStatus.COMPLETED;
    finalized.confidence = this.calculateOverallConfidence(finalized.segments);
    finalized.medicalTerms = this.extractMedicalTerms(finalized.text);
    return finalized;
  }

  private extractMedicalTerms(text: string): MedicalTerm[] {
    const terms: MedicalTerm[] = [];
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
          termEs: medicalTerm.term,
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

  private calculateOverallConfidence(segments: TranscriptionSegment[]): number {
    if (segments.length === 0) return 0;
    const totalConfidence = segments.reduce((sum, segment) => sum + segment.confidence, 0);
    return totalConfidence / segments.length;
  }
}

export const transcriptionService = new TranscriptionService();
