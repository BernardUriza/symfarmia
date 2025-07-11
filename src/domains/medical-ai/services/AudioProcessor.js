/**
 * AudioProcessor
 * 
 * Audio processing utilities for Whisper WASM
 * Handles audio format conversion, resampling, and streaming
 */

export class AudioProcessor {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 16000,
      channels: config.channels || 1,
      bufferSize: config.bufferSize || 4096,
      maxDuration: config.maxDuration || 30, // seconds
      ...config
    };
    
    this.audioContext = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.isProcessing = false;
    this.audioBuffer = [];
    this.totalSamples = 0;
    this.callbacks = {};
  }

  /**
   * Initialize audio processor
   */
  async initialize() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });
      
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('AudioProcessor initialized:', {
        sampleRate: this.audioContext.sampleRate,
        state: this.audioContext.state
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioProcessor:', error);
      throw error;
    }
  }

  /**
   * Start processing audio from media stream
   */
  async startProcessing(mediaStream, callbacks = {}) {
    if (!this.audioContext) {
      throw new Error('AudioProcessor not initialized');
    }

    if (this.isProcessing) {
      throw new Error('Already processing audio');
    }

    try {
      this.callbacks = callbacks;
      this.audioBuffer = [];
      this.totalSamples = 0;
      this.isProcessing = true;
      
      // Create source node from media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(mediaStream);
      
      // Create processor node
      this.processorNode = this.audioContext.createScriptProcessor(
        this.config.bufferSize,
        this.config.channels,
        this.config.channels
      );
      
      // Setup audio processing
      this.processorNode.onaudioprocess = (event) => {
        this.processAudioEvent(event);
      };
      
      // Connect audio nodes
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);
      
      console.log('Audio processing started');
      
      if (callbacks.onStart) {
        callbacks.onStart();
      }
      
    } catch (error) {
      this.isProcessing = false;
      console.error('Failed to start audio processing:', error);
      throw error;
    }
  }

  /**
   * Stop processing audio
   */
  async stopProcessing() {
    if (!this.isProcessing) {
      return;
    }

    try {
      // Disconnect nodes
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      
      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode = null;
      }
      
      this.isProcessing = false;
      
      // Process any remaining audio
      if (this.audioBuffer.length > 0) {
        await this.flushAudioBuffer();
      }
      
      console.log('Audio processing stopped');
      
      if (this.callbacks.onStop) {
        this.callbacks.onStop();
      }
      
    } catch (error) {
      console.error('Error stopping audio processing:', error);
    }
  }

  /**
   * Process audio event from ScriptProcessorNode
   */
  processAudioEvent(event) {
    if (!this.isProcessing) return;

    const inputBuffer = event.inputBuffer;
    const channelData = inputBuffer.getChannelData(0);
    
    // Convert to Float32Array for consistency
    const audioData = new Float32Array(channelData);
    
    // Add to buffer
    this.audioBuffer.push(audioData);
    this.totalSamples += audioData.length;
    
    // Check if we have enough data to process
    const duration = this.totalSamples / this.config.sampleRate;
    
    if (duration >= 1.0) { // Process every second
      this.processAudioBuffer();
    }
    
    // Check max duration
    if (duration >= this.config.maxDuration) {
      console.warn('Maximum audio duration reached, stopping processing');
      this.stopProcessing();
    }
  }

  /**
   * Process accumulated audio buffer
   */
  async processAudioBuffer() {
    if (this.audioBuffer.length === 0) return;

    try {
      // Combine audio chunks
      const combinedAudio = this.combineAudioChunks(this.audioBuffer);
      
      // Convert to required format
      const processedAudio = this.convertAudioFormat(combinedAudio);
      
      // Clear buffer
      this.audioBuffer = [];
      this.totalSamples = 0;
      
      // Send to callback
      if (this.callbacks.onAudioData) {
        await this.callbacks.onAudioData(processedAudio);
      }
      
    } catch (error) {
      console.error('Error processing audio buffer:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  /**
   * Flush remaining audio buffer
   */
  async flushAudioBuffer() {
    if (this.audioBuffer.length > 0) {
      await this.processAudioBuffer();
    }
  }

  /**
   * Combine audio chunks into single array
   */
  combineAudioChunks(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Float32Array(totalLength);
    
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    return combined;
  }

  /**
   * Convert audio format for Whisper
   */
  convertAudioFormat(audioData) {
    // Whisper expects 16kHz mono float32
    let converted = audioData;
    
    // Resample if needed
    if (this.audioContext.sampleRate !== this.config.sampleRate) {
      converted = this.resampleAudio(converted, this.audioContext.sampleRate, this.config.sampleRate);
    }
    
    // Normalize audio
    converted = this.normalizeAudio(converted);
    
    return converted;
  }

  /**
   * Resample audio to target sample rate
   */
  resampleAudio(audioData, fromRate, toRate) {
    if (fromRate === toRate) return audioData;
    
    const ratio = fromRate / toRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    
    // Simple linear interpolation resampling
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexInt = Math.floor(srcIndex);
      const srcIndexFrac = srcIndex - srcIndexInt;
      
      if (srcIndexInt >= audioData.length - 1) {
        result[i] = audioData[audioData.length - 1];
      } else {
        const sample1 = audioData[srcIndexInt];
        const sample2 = audioData[srcIndexInt + 1];
        result[i] = sample1 + (sample2 - sample1) * srcIndexFrac;
      }
    }
    
    return result;
  }

  /**
   * Normalize audio amplitude
   */
  normalizeAudio(audioData) {
    // Find peak amplitude
    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      const abs = Math.abs(audioData[i]);
      if (abs > peak) peak = abs;
    }
    
    // Normalize if peak is significant
    if (peak > 0.001) {
      const gain = 0.95 / peak; // Leave some headroom
      for (let i = 0; i < audioData.length; i++) {
        audioData[i] *= gain;
      }
    }
    
    return audioData;
  }

  /**
   * Apply high-pass filter to remove low-frequency noise
   */
  applyHighPassFilter(audioData, cutoffFreq = 80) {
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / this.config.sampleRate;
    const alpha = dt / (rc + dt);
    
    const filtered = new Float32Array(audioData.length);
    let prevInput = 0;
    let prevOutput = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const input = audioData[i];
      const output = alpha * (prevOutput + input - prevInput);
      filtered[i] = output;
      prevInput = input;
      prevOutput = output;
    }
    
    return filtered;
  }

  /**
   * Apply noise gate to reduce background noise
   */
  applyNoiseGate(audioData, threshold = 0.01) {
    const gated = new Float32Array(audioData.length);
    
    for (let i = 0; i < audioData.length; i++) {
      const sample = audioData[i];
      gated[i] = Math.abs(sample) > threshold ? sample : 0;
    }
    
    return gated;
  }

  /**
   * Calculate audio RMS level
   */
  calculateRMS(audioData) {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Get audio processing stats
   */
  getStats() {
    return {
      isProcessing: this.isProcessing,
      sampleRate: this.config.sampleRate,
      channels: this.config.channels,
      bufferSize: this.config.bufferSize,
      totalSamples: this.totalSamples,
      duration: this.totalSamples / this.config.sampleRate,
      bufferChunks: this.audioBuffer.length,
      audioContextState: this.audioContext ? this.audioContext.state : 'not_initialized'
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      await this.stopProcessing();
      
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.audioBuffer = [];
      this.totalSamples = 0;
      this.callbacks = {};
      
      console.log('AudioProcessor cleanup completed');
      
    } catch (error) {
      console.error('Error during AudioProcessor cleanup:', error);
    }
  }
}

export default AudioProcessor;