// Temporary placeholder - to be replaced with new audio package

export interface DiarizationSegment {
  startTime: number;
  endTime: number;
  speaker: string;
  text?: string;
}

export interface DiarizationResult {
  segments: DiarizationSegment[];
  speakerCount: number;
  processingTime: number;
}

export class DiarizationService {
  async diarizeAudio(audioData: Float32Array): Promise<DiarizationResult> {
    console.warn('DiarizationService disabled - waiting for new audio package');
    return {
      segments: [],
      speakerCount: 0,
      processingTime: 0
    };
  }
}

export const diarizationService = new DiarizationService();

export const DiarizationUtils = {
  mergeTranscriptions(text1: string, text2: string): string {
    return `${text1} ${text2}`.trim();
  }
};