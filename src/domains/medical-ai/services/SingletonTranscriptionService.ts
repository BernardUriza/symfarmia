import {
  TranscriptionResult,
  TranscriptionStatus,
  AudioConfig,
  ServiceResponse,
} from '../types';
import { transcriptionEngineManager } from './TranscriptionEngineManager';

export class SingletonTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private currentTranscription: TranscriptionResult | null = null;
  private isRecording = false;
  private transcriptionCallback: ((result: TranscriptionResult) => void) | null = null;

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
      engine: 'webapi',
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
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.processAudioData(event.data);
      }
    };
    this.mediaRecorder.start(1000);
    this.isRecording = true;
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
      console.log('[TranscriptionService] Processing audio data:', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        isRecording: this.isRecording,
        hasCurrentTranscription: !!this.currentTranscription,
        isUsingHybrid: false
      });

      // Convert Blob to ArrayBuffer for processing
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Send audio to transcription engine manager if using hybrid system
      if (this.isRecording && this.currentTranscription) {
        try {
          console.log('[TranscriptionService] Sending audio to engine:', {
            arrayBufferSize: arrayBuffer.byteLength,
            currentEngine: this.currentTranscription.engine
          });

          // Process audio chunk through engine manager
          const result = await transcriptionEngineManager.processAudioChunk(
            arrayBuffer,
            { 
              format: audioBlob.type.includes('webm') ? 'webm' : 'wav',
              sampleRate: 16000,
              channels: 1 
            }
          );
          
          console.log('[TranscriptionService] Audio chunk processed:', {
            success: result.success,
            hasText: !!result.data?.text,
            textLength: result.data?.text?.length || 0
          });
          
          // Update current transcription if we have results
          if (result.success && result.data && result.data.text) {
            // Accumulate text
            this.currentTranscription.fullText = (this.currentTranscription.fullText || '') + ' ' + result.data.text;
            this.currentTranscription.text = this.currentTranscription.fullText.trim();
            
            console.log('[TranscriptionService] Transcription updated:', {
              fullTextLength: this.currentTranscription.fullText.length,
              latestText: result.data.text.substring(0, 50) + '...'
            });
            
            // Update medical terms if provided
            if (result.data.medicalTerms) {
              this.currentTranscription.medicalTerms.push(...result.data.medicalTerms);
            }
            
            // Notify callback with updated transcription
            if (this.transcriptionCallback) {
              this.transcriptionCallback(this.currentTranscription);
            }
          }
        } catch (error) {
          console.error('[TranscriptionService] Failed to process audio chunk:', error);
          // Continue with speech recognition as fallback
        }
      }
    } catch (error) {
      console.error('[TranscriptionService] Error processing audio data:', error);
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
