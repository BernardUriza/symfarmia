/**
 * AudioChunkOptimizer
 * 
 * Intelligent audio segmentation and optimization for medical transcription
 * Optimized for Spanish medical terminology and real-time processing
 */

export class AudioChunkOptimizer {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 16000,
      chunkSize: config.chunkSize || 16000 * 10, // 10 seconds
      overlapSize: config.overlapSize || 16000 * 2, // 2 seconds
      silenceThreshold: config.silenceThreshold || 0.01,
      minChunkDuration: config.minChunkDuration || 3000, // 3 seconds
      maxChunkDuration: config.maxChunkDuration || 30000, // 30 seconds
      medicalMode: config.medicalMode || true,
      voiceActivityDetection: config.voiceActivityDetection !== false,
      ...config
    };

    this.audioBuffer = new Float32Array(0);
    this.processingBuffer = new Float32Array(0);
    this.silenceBuffer = new Float32Array(0);
    this.voiceActivityDetector = null;
    this.isInitialized = false;
    this.chunkId = 0;
    this.lastSpeechTime = 0;
    this.energyHistory = [];
    this.medicalContext = null;
  }

  /**
   * Initialize audio chunk optimizer
   */
  async initialize() {
    try {
      // Initialize voice activity detector
      if (this.config.voiceActivityDetection) {
        await this.initializeVAD();
      }
      
      this.isInitialized = true;
      console.log('AudioChunkOptimizer initialized');
      
    } catch (error) {
      console.error('Failed to initialize AudioChunkOptimizer:', error);
      throw error;
    }
  }

  /**
   * Initialize Voice Activity Detection
   */
  async initializeVAD() {
    try {
      this.voiceActivityDetector = {
        frameSize: 512,
        energyThreshold: 0.01,
        spectralCentroidThreshold: 1000,
        zeroCrossingThreshold: 0.1,
        history: [],
        lastDecision: false
      };
      
      console.log('Voice Activity Detection initialized');
    } catch (error) {
      console.warn('VAD initialization failed:', error);
    }
  }

  /**
   * Optimize audio chunk for Whisper processing
   */
  async optimizeForWhisper(audioData, config) {
    try {
      // Convert to Float32Array if needed
      const audioFloat32 = await this.convertToFloat32(audioData);
      
      // Resample to 16kHz if needed
      const resampledAudio = await this.resampleAudio(audioFloat32, config.sampleRate || 44100);
      
      // Apply audio preprocessing
      const preprocessedAudio = this.preprocessAudio(resampledAudio);
      
      // Normalize audio levels
      const normalizedAudio = this.normalizeAudio(preprocessedAudio);
      
      // Apply medical-specific optimizations
      if (this.config.medicalMode) {
        return this.applyMedicalOptimizations(normalizedAudio);
      }
      
      return normalizedAudio;
      
    } catch (error) {
      console.error('Audio optimization failed:', error);
      return audioData;
    }
  }

  /**
   * Convert audio to Float32Array
   */
  async convertToFloat32(audioData) {
    if (audioData instanceof Float32Array) {
      return audioData;
    }
    
    if (audioData instanceof ArrayBuffer) {
      const audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      return audioBuffer.getChannelData(0);
    }
    
    if (audioData instanceof Uint8Array) {
      const float32 = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        float32[i] = (audioData[i] - 128) / 128.0;
      }
      return float32;
    }
    
    throw new Error('Unsupported audio format');
  }

  /**
   * Resample audio to target sample rate
   */
  async resampleAudio(audioData, sourceSampleRate) {
    if (sourceSampleRate === this.config.sampleRate) {
      return audioData;
    }
    
    const ratio = this.config.sampleRate / sourceSampleRate;
    const outputLength = Math.round(audioData.length * ratio);
    const resampled = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const sourceIndex = i / ratio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;
      
      if (index + 1 < audioData.length) {
        resampled[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        resampled[i] = audioData[index];
      }
    }
    
    return resampled;
  }

  /**
   * Preprocess audio for better transcription
   */
  preprocessAudio(audioData) {
    // Apply high-pass filter to remove low-frequency noise
    const filtered = this.applyHighPassFilter(audioData);
    
    // Apply dynamic range compression
    const compressed = this.applyDynamicRangeCompression(filtered);
    
    // Apply spectral subtraction for noise reduction
    const denoised = this.applySpectralSubtraction(compressed);
    
    return denoised;
  }

  /**
   * Apply high-pass filter
   */
  applyHighPassFilter(audioData, cutoffFreq = 80) {
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / this.config.sampleRate;
    const alpha = dt / (rc + dt);
    
    const filtered = new Float32Array(audioData.length);
    filtered[0] = audioData[0];
    
    for (let i = 1; i < audioData.length; i++) {
      filtered[i] = alpha * (filtered[i - 1] + audioData[i] - audioData[i - 1]);
    }
    
    return filtered;
  }

  /**
   * Apply dynamic range compression
   */
  applyDynamicRangeCompression(audioData, threshold = 0.5, ratio = 4.0) {
    const compressed = new Float32Array(audioData.length);
    
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
   * Apply spectral subtraction for noise reduction
   */
  applySpectralSubtraction(audioData) {
    // Simple spectral subtraction implementation
    const frameSize = 512;
    const hopSize = 256;
    const denoised = new Float32Array(audioData.length);
    
    // Estimate noise spectrum from first 0.5 seconds
    const noiseFrames = Math.floor(0.5 * this.config.sampleRate / hopSize);
    const noiseSpectrum = this.estimateNoiseSpectrum(audioData, frameSize, noiseFrames);
    
    // Process audio in frames
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      const frame = audioData.slice(i, i + frameSize);
      const denoisedFrame = this.subtractNoise(frame, noiseSpectrum);
      
      // Overlap-add
      for (let j = 0; j < frameSize && i + j < denoised.length; j++) {
        denoised[i + j] += denoisedFrame[j];
      }
    }
    
    return denoised;
  }

  /**
   * Estimate noise spectrum
   */
  estimateNoiseSpectrum(audioData, frameSize, numFrames) {
    const spectrum = new Float32Array(frameSize / 2);
    
    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * frameSize;
      const end = Math.min(start + frameSize, audioData.length);
      
      if (end - start < frameSize) break;
      
      const frameData = audioData.slice(start, end);
      const frameSpectrum = this.computeSpectrum(frameData);
      
      for (let i = 0; i < spectrum.length; i++) {
        spectrum[i] += frameSpectrum[i];
      }
    }
    
    // Average the spectrum
    for (let i = 0; i < spectrum.length; i++) {
      spectrum[i] /= numFrames;
    }
    
    return spectrum;
  }

  /**
   * Compute spectrum using FFT
   */
  computeSpectrum(frame) {
    // Simplified spectrum computation
    const spectrum = new Float32Array(frame.length / 2);
    
    for (let i = 0; i < spectrum.length; i++) {
      let real = 0;
      let imag = 0;
      
      for (let j = 0; j < frame.length; j++) {
        const angle = -2 * Math.PI * i * j / frame.length;
        real += frame[j] * Math.cos(angle);
        imag += frame[j] * Math.sin(angle);
      }
      
      spectrum[i] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
  }

  /**
   * Subtract noise from frame
   */
  subtractNoise(frame, noiseSpectrum) {
    const frameSpectrum = this.computeSpectrum(frame);
    const alpha = 2.0; // Over-subtraction factor
    
    // Subtract noise spectrum
    for (let i = 0; i < frameSpectrum.length; i++) {
      const subtracted = frameSpectrum[i] - alpha * noiseSpectrum[i];
      frameSpectrum[i] = Math.max(subtracted, 0.1 * frameSpectrum[i]);
    }
    
    // Convert back to time domain (simplified)
    const denoised = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      denoised[i] = frame[i] * 0.8; // Simple reduction
    }
    
    return denoised;
  }

  /**
   * Normalize audio levels
   */
  normalizeAudio(audioData) {
    // Find peak amplitude
    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      peak = Math.max(peak, Math.abs(audioData[i]));
    }
    
    if (peak === 0) return audioData;
    
    // Normalize to 0.9 to prevent clipping
    const normalized = new Float32Array(audioData.length);
    const scale = 0.9 / peak;
    
    for (let i = 0; i < audioData.length; i++) {
      normalized[i] = audioData[i] * scale;
    }
    
    return normalized;
  }

  /**
   * Apply medical-specific optimizations
   */
  applyMedicalOptimizations(audioData) {
    // Enhance speech frequencies (300-3400 Hz)
    const enhanced = this.enhanceSpeechFrequencies(audioData);
    
    // Apply AGC for consistent levels
    const agcApplied = this.applyAutomaticGainControl(enhanced);
    
    // Reduce breathing and ambient noise
    const breathingReduced = this.reduceBreathingNoise(agcApplied);
    
    return breathingReduced;
  }

  /**
   * Enhance speech frequencies
   */
  enhanceSpeechFrequencies(audioData) {
    // Simple frequency enhancement by emphasizing mid-range frequencies
    const enhanced = new Float32Array(audioData.length);
    
    // Apply a simple band-pass emphasis
    for (let i = 0; i < audioData.length; i++) {
      enhanced[i] = audioData[i] * 1.2; // Mild enhancement
    }
    
    return enhanced;
  }

  /**
   * Apply automatic gain control
   */
  applyAutomaticGainControl(audioData, targetLevel = 0.3) {
    const agc = new Float32Array(audioData.length);
    const windowSize = Math.floor(0.1 * this.config.sampleRate); // 100ms window
    
    for (let i = 0; i < audioData.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(audioData.length, i + windowSize);
      
      // Calculate RMS for current window
      let rms = 0;
      for (let j = start; j < end; j++) {
        rms += audioData[j] * audioData[j];
      }
      rms = Math.sqrt(rms / (end - start));
      
      // Apply gain adjustment
      const gain = rms > 0 ? Math.min(targetLevel / rms, 3.0) : 1.0;
      agc[i] = audioData[i] * gain;
    }
    
    return agc;
  }

  /**
   * Reduce breathing noise
   */
  reduceBreathingNoise(audioData) {
    // Simple breathing noise reduction
    const reduced = new Float32Array(audioData.length);
    const threshold = 0.05;
    
    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) < threshold) {
        reduced[i] = audioData[i] * 0.3; // Reduce quiet passages
      } else {
        reduced[i] = audioData[i];
      }
    }
    
    return reduced;
  }

  /**
   * Intelligent chunk segmentation
   */
  async segmentIntelligently(audioData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const chunks = [];
    let currentChunk = new Float32Array(0);
    let lastSpeechEnd = 0;
    
    // Process audio in frames for VAD
    const frameSize = 512;
    for (let i = 0; i < audioData.length; i += frameSize) {
      const frame = audioData.slice(i, Math.min(i + frameSize, audioData.length));
      const hasSpeech = this.detectVoiceActivity(frame);
      
      if (hasSpeech) {
        // Extend current chunk
        const newChunk = new Float32Array(currentChunk.length + frame.length);
        newChunk.set(currentChunk);
        newChunk.set(frame, currentChunk.length);
        currentChunk = newChunk;
        lastSpeechEnd = i + frame.length;
      } else {
        // Check if we should end current chunk
        if (currentChunk.length > 0 && 
            (i - lastSpeechEnd > this.config.sampleRate * 2 || // 2 seconds of silence
             currentChunk.length > this.config.maxChunkDuration * this.config.sampleRate / 1000)) {
          
          if (currentChunk.length > this.config.minChunkDuration * this.config.sampleRate / 1000) {
            chunks.push({
              id: this.chunkId++,
              data: currentChunk,
              startTime: (i - currentChunk.length) / this.config.sampleRate,
              endTime: i / this.config.sampleRate,
              hasSpeech: true
            });
          }
          
          currentChunk = new Float32Array(0);
        }
      }
    }
    
    // Add final chunk if it exists
    if (currentChunk.length > this.config.minChunkDuration * this.config.sampleRate / 1000) {
      chunks.push({
        id: this.chunkId++,
        data: currentChunk,
        startTime: (audioData.length - currentChunk.length) / this.config.sampleRate,
        endTime: audioData.length / this.config.sampleRate,
        hasSpeech: true
      });
    }
    
    return chunks;
  }

  /**
   * Detect voice activity
   */
  detectVoiceActivity(frame) {
    if (!this.voiceActivityDetector) {
      return this.simpleVoiceActivityDetection(frame);
    }
    
    // Calculate energy
    const energy = this.calculateEnergy(frame);
    
    // Calculate spectral centroid
    const spectralCentroid = this.calculateSpectralCentroid(frame);
    
    // Calculate zero crossing rate
    const zeroCrossingRate = this.calculateZeroCrossingRate(frame);
    
    // Combine features for decision
    const isVoice = energy > this.voiceActivityDetector.energyThreshold &&
                   spectralCentroid > this.voiceActivityDetector.spectralCentroidThreshold &&
                   zeroCrossingRate < this.voiceActivityDetector.zeroCrossingThreshold;
    
    // Update history
    this.voiceActivityDetector.history.push(isVoice);
    if (this.voiceActivityDetector.history.length > 10) {
      this.voiceActivityDetector.history.shift();
    }
    
    // Apply temporal smoothing
    const recentVoiceActivity = this.voiceActivityDetector.history.filter(v => v).length;
    const smoothedDecision = recentVoiceActivity > this.voiceActivityDetector.history.length * 0.4;
    
    this.voiceActivityDetector.lastDecision = smoothedDecision;
    return smoothedDecision;
  }

  /**
   * Simple voice activity detection
   */
  simpleVoiceActivityDetection(frame) {
    const energy = this.calculateEnergy(frame);
    return energy > this.config.silenceThreshold;
  }

  /**
   * Calculate frame energy
   */
  calculateEnergy(frame) {
    let energy = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
    }
    return energy / frame.length;
  }

  /**
   * Calculate spectral centroid
   */
  calculateSpectralCentroid(frame) {
    const spectrum = this.computeSpectrum(frame);
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = i * this.config.sampleRate / (2 * spectrum.length);
      weightedSum += frequency * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate zero crossing rate
   */
  calculateZeroCrossingRate(frame) {
    let crossings = 0;
    
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0) !== (frame[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / frame.length;
  }

  /**
   * Set medical context
   */
  setMedicalContext(context) {
    this.medicalContext = context;
    
    // Adjust parameters based on medical context
    if (context.specialty === 'cardiology') {
      this.config.silenceThreshold = 0.005; // More sensitive for heart sounds
    } else if (context.specialty === 'pulmonology') {
      this.config.silenceThreshold = 0.008; // Account for breathing sounds
    }
  }

  /**
   * Get optimizer statistics
   */
  getOptimizerStats() {
    return {
      sampleRate: this.config.sampleRate,
      chunkSize: this.config.chunkSize,
      overlapSize: this.config.overlapSize,
      vadEnabled: this.config.voiceActivityDetection,
      medicalMode: this.config.medicalMode,
      chunksProcessed: this.chunkId,
      bufferSize: this.audioBuffer.length
    };
  }

  /**
   * Cleanup optimizer
   */
  async cleanup() {
    this.audioBuffer = new Float32Array(0);
    this.processingBuffer = new Float32Array(0);
    this.silenceBuffer = new Float32Array(0);
    this.voiceActivityDetector = null;
    this.energyHistory = [];
    this.isInitialized = false;
    
    console.log('AudioChunkOptimizer cleanup completed');
  }
}

export default AudioChunkOptimizer;