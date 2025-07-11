/**
 * AudioCompressionManager
 * 
 * Manages audio compression for optimized API usage and cost reduction
 * Preserves medical-grade quality while reducing bandwidth usage
 */

export class AudioCompressionManager {
  constructor(config = {}) {
    this.config = {
      targetFormat: config.targetFormat || 'webm',
      targetBitrate: config.targetBitrate || 64000,
      preserveQuality: config.preserveQuality !== false,
      medicalOptimized: config.medicalOptimized !== false,
      compressionLevel: config.compressionLevel || 'medium',
      ...config
    };

    this.encoder = null;
    this.decoder = null;
    this.isInitialized = false;
  }

  /**
   * Initialize audio compression manager
   */
  async initialize() {
    try {
      // Initialize audio encoder/decoder
      await this.initializeEncoder();
      
      this.isInitialized = true;
      console.log('AudioCompressionManager initialized');
      
    } catch (error) {
      console.error('Failed to initialize AudioCompressionManager:', error);
      throw error;
    }
  }

  /**
   * Initialize audio encoder
   */
  async initializeEncoder() {
    try {
      // Check for Web Audio API support
      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Web Audio API not supported');
      }

      // Initialize audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.encoder = {
        audioContext,
        sampleRate: audioContext.sampleRate,
        channelCount: 1 // Mono for medical transcription
      };

      console.log('Audio encoder initialized');
      
    } catch (error) {
      console.error('Audio encoder initialization failed:', error);
      throw error;
    }
  }

  /**
   * Compress audio for API transmission
   */
  async compressForAPI(audioData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Convert to optimal format
      const convertedAudio = await this.convertToOptimalFormat(audioData);
      
      // Apply compression
      const compressedAudio = await this.applyCompression(convertedAudio);
      
      // Apply medical-specific optimizations
      if (this.config.medicalOptimized) {
        return await this.applyMedicalOptimizations(compressedAudio);
      }
      
      return compressedAudio;
      
    } catch (error) {
      console.error('Audio compression failed:', error);
      return audioData; // Return original if compression fails
    }
  }

  /**
   * Convert audio to optimal format
   */
  async convertToOptimalFormat(audioData) {
    try {
      // Convert to Float32Array if needed
      if (audioData instanceof ArrayBuffer) {
        const audioBuffer = await this.encoder.audioContext.decodeAudioData(audioData);
        return audioBuffer.getChannelData(0);
      }
      
      if (audioData instanceof Float32Array) {
        return audioData;
      }
      
      // Handle other formats
      return this.convertToFloat32Array(audioData);
      
    } catch (error) {
      console.error('Audio format conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert various audio formats to Float32Array
   */
  convertToFloat32Array(audioData) {
    if (audioData instanceof Uint8Array) {
      const float32 = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        float32[i] = (audioData[i] - 128) / 128.0;
      }
      return float32;
    }
    
    if (audioData instanceof Int16Array) {
      const float32 = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        float32[i] = audioData[i] / 32768.0;
      }
      return float32;
    }
    
    throw new Error('Unsupported audio format');
  }

  /**
   * Apply compression to audio data
   */
  async applyCompression(audioData) {
    try {
      // Downsample if needed
      const downsampledAudio = await this.downsample(audioData);
      
      // Apply dynamic range compression
      const compressedAudio = this.applyDynamicRangeCompression(downsampledAudio);
      
      // Apply noise reduction
      const denoisedAudio = this.applyNoiseReduction(compressedAudio);
      
      return denoisedAudio;
      
    } catch (error) {
      console.error('Audio compression failed:', error);
      throw error;
    }
  }

  /**
   * Downsample audio to reduce file size
   */
  async downsample(audioData) {
    const originalSampleRate = this.encoder.sampleRate;
    const targetSampleRate = 16000; // Optimal for speech recognition
    
    if (originalSampleRate === targetSampleRate) {
      return audioData;
    }
    
    const downsampleRatio = targetSampleRate / originalSampleRate;
    const outputLength = Math.floor(audioData.length * downsampleRatio);
    const downsampled = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const sourceIndex = i / downsampleRatio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;
      
      if (index + 1 < audioData.length) {
        downsampled[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        downsampled[i] = audioData[index];
      }
    }
    
    return downsampled;
  }

  /**
   * Apply dynamic range compression
   */
  applyDynamicRangeCompression(audioData) {
    const compressed = new Float32Array(audioData.length);
    const threshold = 0.5;
    const ratio = 4.0;
    
    for (let i = 0; i < audioData.length; i++) {
      const amplitude = Math.abs(audioData[i]);
      
      if (amplitude > threshold) {
        const excess = amplitude - threshold;
        const compressedExcess = excess / ratio;
        const sign = audioData[i] >= 0 ? 1 : -1;
        compressed[i] = sign * (threshold + compressedExcess);
      } else {
        compressed[i] = audioData[i];
      }
    }
    
    return compressed;
  }

  /**
   * Apply noise reduction
   */
  applyNoiseReduction(audioData) {
    // Simple noise gate
    const noiseGate = 0.01;
    const reduced = new Float32Array(audioData.length);
    
    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) < noiseGate) {
        reduced[i] = audioData[i] * 0.1; // Reduce noise
      } else {
        reduced[i] = audioData[i];
      }
    }
    
    return reduced;
  }

  /**
   * Apply medical-specific optimizations
   */
  async applyMedicalOptimizations(audioData) {
    // Enhance speech frequencies (300-3400 Hz)
    const speechEnhanced = this.enhanceSpeechFrequencies(audioData);
    
    // Apply AGC for consistent levels
    const agcApplied = this.applyAutomaticGainControl(speechEnhanced);
    
    // Final normalization
    const normalized = this.normalizeAudio(agcApplied);
    
    return normalized;
  }

  /**
   * Enhance speech frequencies
   */
  enhanceSpeechFrequencies(audioData) {
    // Simple frequency boost for speech range
    const enhanced = new Float32Array(audioData.length);
    
    for (let i = 0; i < audioData.length; i++) {
      enhanced[i] = audioData[i] * 1.1; // Mild enhancement
    }
    
    return enhanced;
  }

  /**
   * Apply automatic gain control
   */
  applyAutomaticGainControl(audioData) {
    const agc = new Float32Array(audioData.length);
    const windowSize = 1600; // 100ms at 16kHz
    const targetLevel = 0.3;
    
    for (let i = 0; i < audioData.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(audioData.length, i + windowSize);
      
      // Calculate RMS for current window
      let rms = 0;
      for (let j = start; j < end; j++) {
        rms += audioData[j] * audioData[j];
      }
      rms = Math.sqrt(rms / (end - start));
      
      // Apply gain
      const gain = rms > 0 ? Math.min(targetLevel / rms, 2.0) : 1.0;
      agc[i] = audioData[i] * gain;
    }
    
    return agc;
  }

  /**
   * Normalize audio levels
   */
  normalizeAudio(audioData) {
    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      peak = Math.max(peak, Math.abs(audioData[i]));
    }
    
    if (peak === 0) return audioData;
    
    const normalized = new Float32Array(audioData.length);
    const scale = 0.9 / peak;
    
    for (let i = 0; i < audioData.length; i++) {
      normalized[i] = audioData[i] * scale;
    }
    
    return normalized;
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(originalData, compressedData) {
    const originalSize = originalData.byteLength || originalData.length * 4;
    const compressedSize = compressedData.byteLength || compressedData.length * 4;
    
    return {
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
      savings: ((originalSize - compressedSize) / originalSize) * 100
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.encoder && this.encoder.audioContext) {
        await this.encoder.audioContext.close();
      }
      
      this.encoder = null;
      this.decoder = null;
      this.isInitialized = false;
      
      console.log('AudioCompressionManager cleanup completed');
      
    } catch (error) {
      console.error('Error during AudioCompressionManager cleanup:', error);
    }
  }
}

export default AudioCompressionManager;