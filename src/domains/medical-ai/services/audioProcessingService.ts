export class AudioProcessingService {
  async normalizeAudio(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    // Placeholder for audio normalization
    return buffer;
  }
}

export const audioProcessingService = new AudioProcessingService();
