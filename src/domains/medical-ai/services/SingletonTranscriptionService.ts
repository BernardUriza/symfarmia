import {
  TranscriptionResult,
  TranscriptionStatus,
  AudioConfig,
  ServiceResponse,
} from '../types';

export class SingletonTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;
  private recordingStartTime = 0;
  private chunkInterval: NodeJS.Timeout | null = null;
  private microserviceUrl = 'http://localhost:3001';

  async startTranscription(
    config: AudioConfig,
    onTranscriptionUpdate?: (result: TranscriptionResult) => void
  ): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (this.isRecording) throw new Error('Transcription already in progress');
      this.transcriptionCallback = onTranscriptionUpdate || null;
      const stream = await this.getMediaStream(config);
      this.currentTranscription = this.initializeTranscription();
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

  async stopTranscription(): Promise<ServiceResponse<TranscriptionResult>> {
    try {
      if (!this.isRecording || !this.currentTranscription)
        throw new Error('No active transcription to stop');
      this.stopRecording();
      const finalResult = { ...this.currentTranscription, status: TranscriptionStatus.COMPLETED };
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

  private async getMediaStream(config: AudioConfig): Promise<MediaStream> {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available');
    }
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: config.sampleRate,
        channelCount: config.channels,
        echoCancellation: true,
        noiseSuppression: config.noiseReduction,
        autoGainControl: true
      }
    });
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

  private async startRecording(stream: MediaStream, config: AudioConfig): Promise<void> {
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      throw new Error('MediaRecorder not available');
    }
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: this.getMimeType(config.format || 'webm')
    });
    this.audioChunks = [];
    this.recordingStartTime = Date.now();
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start(1000);
    this.isRecording = true;
    
    // Process chunks every 10 seconds
    this.chunkInterval = setInterval(() => {
      if (this.audioChunks.length > 0) {
        this.processAudioChunks();
      }
    }, 10000);
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      if (this.chunkInterval) {
        clearInterval(this.chunkInterval);
        this.chunkInterval = null;
      }
      
      // Process remaining chunks
      if (this.audioChunks.length > 0) {
        this.processAudioChunks();
      }
      
      if (this.currentTranscription) {
        this.currentTranscription.status = TranscriptionStatus.PROCESSING;
        this.currentTranscription.duration = (Date.now() - this.recordingStartTime) / 1000;
      }
    }
  }


  private async processAudioChunks(): Promise<void> {
    if (this.audioChunks.length === 0 || !this.currentTranscription) return;
    
    try {
      // Combine chunks into single blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      
      // Create form data for microservice
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('language', 'es');
      
      // Send to SusurroTest microservice
      const response = await fetch(`${this.microserviceUrl}/api/transcribe-upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Microservice error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.transcription && this.currentTranscription) {
        // Update transcription
        this.currentTranscription.fullText = 
          (this.currentTranscription.fullText + ' ' + result.transcription).trim();
        this.currentTranscription.text = this.currentTranscription.fullText;
        this.currentTranscription.confidence = result.confidence || 0.85;
        
        // Notify callback
        if (this.transcriptionCallback) {
          this.transcriptionCallback(this.currentTranscription);
        }
      }
      
    } catch (error) {
      console.error('[SingletonTranscriptionService] Error processing audio chunks:', error);
    }
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

export const transcriptionService = new SingletonTranscriptionService();
