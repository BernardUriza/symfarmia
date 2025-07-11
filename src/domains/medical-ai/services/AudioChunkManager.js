/**
 * Audio Chunk Manager
 * 
 * Handles intelligent audio segmentation for medical transcription resilience
 */

import { networkStatusDetector } from './NetworkStatusDetector.js';

export class AudioChunkManager {
  constructor() {
    this.chunks = new Map();
    this.chunkSequence = 0;
    this.isProcessing = false;
    this.audioContext = null;
    this.analyzer = null;
    this.silenceThreshold = 0.01;
    this.minChunkDuration = 2000; // 2 seconds
    this.maxChunkDuration = 10000; // 10 seconds
    this.optimalChunkDuration = 5000; // 5 seconds
    this.silenceDetectionEnabled = true;
    this.adaptiveChunking = true;
    this.chunkOverlap = 500; // 0.5 second overlap
    this.compressionEnabled = true;
    this.callbacks = new Map();
    this.processingQueue = [];
    this.currentChunk = null;
    this.chunkBuffer = [];
    this.silenceBuffer = [];
    this.lastSilenceTime = 0;
    this.currentVolume = 0;
    this.volumeHistory = [];
    this.maxVolumeHistory = 50;
    
    this.initialize();
  }

  /**
   * Initialize audio processing components
   */
  async initialize() {
    try {
      // Initialize audio context
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.analyzer.smoothingTimeConstant = 0.3;
      }
      
      // Monitor network changes for adaptive chunking
      networkStatusDetector.onStatusChange(this.handleNetworkChange.bind(this));
      
      console.log('AudioChunkManager initialized');
      
    } catch (error) {
      console.error('Failed to initialize AudioChunkManager:', error);
    }
  }

  /**
   * Start processing audio stream
   */
  async startProcessing(stream, options = {}) {
    try {
      this.isProcessing = true;
      this.chunkSequence = 0;
      this.chunks.clear();
      this.processingQueue = [];
      
      // Configure options
      this.configureOptions(options);
      
      // Connect audio stream to analyzer
      if (this.audioContext && this.analyzer) {
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyzer);
        
        // Start volume monitoring
        this.startVolumeMonitoring();
      }
      
      // Start chunk processing
      this.startChunkProcessing();
      
      console.log('Started audio chunk processing');
      
    } catch (error) {
      console.error('Failed to start audio processing:', error);
      throw error;
    }
  }

  /**
   * Configure processing options
   */
  configureOptions(options) {
    if (options.silenceThreshold !== undefined) {
      this.silenceThreshold = options.silenceThreshold;
    }
    
    if (options.minChunkDuration !== undefined) {
      this.minChunkDuration = options.minChunkDuration;
    }
    
    if (options.maxChunkDuration !== undefined) {
      this.maxChunkDuration = options.maxChunkDuration;
    }
    
    if (options.silenceDetectionEnabled !== undefined) {
      this.silenceDetectionEnabled = options.silenceDetectionEnabled;
    }
    
    if (options.adaptiveChunking !== undefined) {
      this.adaptiveChunking = options.adaptiveChunking;
    }
    
    // Adjust chunk sizes based on network quality
    if (this.adaptiveChunking) {
      this.adjustChunkSizesForNetwork();
    }
  }

  /**
   * Adjust chunk sizes based on network quality
   */
  adjustChunkSizesForNetwork() {
    const networkStatus = networkStatusDetector.getCurrentStatus();
    
    switch (networkStatus.quality) {
      case 'excellent':
        this.optimalChunkDuration = 8000; // 8 seconds
        this.maxChunkDuration = 15000; // 15 seconds
        break;
        
      case 'good':
        this.optimalChunkDuration = 6000; // 6 seconds
        this.maxChunkDuration = 12000; // 12 seconds
        break;
        
      case 'fair':
        this.optimalChunkDuration = 4000; // 4 seconds
        this.maxChunkDuration = 8000; // 8 seconds
        break;
        
      case 'poor':
        this.optimalChunkDuration = 2000; // 2 seconds
        this.maxChunkDuration = 5000; // 5 seconds
        break;
        
      default:
        this.optimalChunkDuration = 5000; // 5 seconds default
        this.maxChunkDuration = 10000; // 10 seconds default
    }
    
    console.log(`Adjusted chunk sizes for ${networkStatus.quality} network:`, {
      optimal: this.optimalChunkDuration,
      max: this.maxChunkDuration
    });
  }

  /**
   * Start volume monitoring for silence detection
   */
  startVolumeMonitoring() {
    if (!this.analyzer) return;
    
    const bufferLength = this.analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const monitor = () => {
      if (!this.isProcessing) return;
      
      this.analyzer.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      this.currentVolume = average / 255; // Normalize to 0-1
      
      // Update volume history
      this.volumeHistory.push(this.currentVolume);
      if (this.volumeHistory.length > this.maxVolumeHistory) {
        this.volumeHistory.shift();
      }
      
      // Check for silence
      if (this.silenceDetectionEnabled) {
        this.checkForSilence();
      }
      
      // Continue monitoring
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  /**
   * Check for silence periods
   */
  checkForSilence() {
    const isSilent = this.currentVolume < this.silenceThreshold;
    const now = Date.now();
    
    if (isSilent) {
      if (this.lastSilenceTime === 0) {
        this.lastSilenceTime = now;
      }
      
      // Check if silence has lasted long enough to trigger chunking
      const silenceDuration = now - this.lastSilenceTime;
      
      if (silenceDuration > 1000 && this.currentChunk) { // 1 second of silence
        this.finalizeCurrentChunk('silence_detected');
      }
    } else {
      this.lastSilenceTime = 0;
    }
  }

  /**
   * Process audio data into chunks
   */
  processAudioData(audioData, timestamp = Date.now()) {
    try {
      // Initialize new chunk if needed
      if (!this.currentChunk) {
        this.startNewChunk(timestamp);
      }
      
      // Add data to current chunk
      this.currentChunk.audioData.push(audioData);
      this.currentChunk.duration = timestamp - this.currentChunk.startTime;
      
      // Check if chunk should be finalized
      if (this.shouldFinalizeChunk()) {
        this.finalizeCurrentChunk('duration_limit');
      }
      
    } catch (error) {
      console.error('Error processing audio data:', error);
    }
  }

  /**
   * Start a new audio chunk
   */
  startNewChunk(timestamp) {
    this.chunkSequence++;
    
    this.currentChunk = {
      id: `chunk_${this.chunkSequence}_${timestamp}`,
      sequence: this.chunkSequence,
      startTime: timestamp,
      endTime: null,
      duration: 0,
      audioData: [],
      metadata: {
        volume: this.currentVolume,
        networkQuality: networkStatusDetector.getCurrentStatus().quality,
        chunkingReason: 'new_chunk',
        silenceDetected: false,
        hasOverlap: false
      },
      status: 'recording', // recording, processing, completed, failed
      processingAttempts: 0,
      maxAttempts: 3
    };
    
    console.log(`Started new chunk: ${this.currentChunk.id}`);
  }

  /**
   * Check if current chunk should be finalized
   */
  shouldFinalizeChunk() {
    if (!this.currentChunk) return false;
    
    const duration = this.currentChunk.duration;
    
    // Always finalize if max duration reached
    if (duration >= this.maxChunkDuration) {
      return true;
    }
    
    // Don't finalize if below minimum duration
    if (duration < this.minChunkDuration) {
      return false;
    }
    
    // Check for optimal duration
    if (duration >= this.optimalChunkDuration) {
      return true;
    }
    
    return false;
  }

  /**
   * Finalize current chunk
   */
  finalizeCurrentChunk(reason) {
    if (!this.currentChunk) return;
    
    try {
      this.currentChunk.endTime = Date.now();
      this.currentChunk.duration = this.currentChunk.endTime - this.currentChunk.startTime;
      this.currentChunk.status = 'processing';
      this.currentChunk.metadata.chunkingReason = reason;
      
      // Merge audio data
      const combinedAudioData = this.combineAudioData(this.currentChunk.audioData);
      this.currentChunk.audioData = combinedAudioData;
      
      // Add overlap if enabled
      if (this.chunkOverlap > 0 && this.chunks.size > 0) {
        this.addOverlapToChunk(this.currentChunk);
      }
      
      // Compress if enabled
      if (this.compressionEnabled) {
        this.compressChunk(this.currentChunk);
      }
      
      // Store chunk
      this.chunks.set(this.currentChunk.id, this.currentChunk);
      
      // Add to processing queue
      this.processingQueue.push(this.currentChunk.id);
      
      console.log(`Finalized chunk: ${this.currentChunk.id} (${this.currentChunk.duration}ms, reason: ${reason})`);
      
      // Trigger callback
      this.triggerCallback('chunkReady', this.currentChunk);
      
      // Reset current chunk
      this.currentChunk = null;
      
      // Process queue if not already processing
      this.processQueue();
      
    } catch (error) {
      console.error('Error finalizing chunk:', error);
    }
  }

  /**
   * Combine multiple audio data arrays
   */
  combineAudioData(audioDataArray) {
    try {
      if (audioDataArray.length === 0) return null;
      if (audioDataArray.length === 1) return audioDataArray[0];
      
      // Calculate total size
      const totalSize = audioDataArray.reduce((sum, data) => {
        return sum + (data.byteLength || data.size || 0);
      }, 0);
      
      // Create combined buffer
      const combinedBuffer = new ArrayBuffer(totalSize);
      const combinedArray = new Uint8Array(combinedBuffer);
      
      let offset = 0;
      for (const data of audioDataArray) {
        if (data instanceof ArrayBuffer) {
          combinedArray.set(new Uint8Array(data), offset);
          offset += data.byteLength;
        } else if (data instanceof Uint8Array) {
          combinedArray.set(data, offset);
          offset += data.byteLength;
        }
      }
      
      return combinedBuffer;
      
    } catch (error) {
      console.error('Error combining audio data:', error);
      return audioDataArray[0]; // Return first chunk as fallback
    }
  }

  /**
   * Add overlap to chunk for better continuity
   */
  addOverlapToChunk(chunk) {
    try {
      // Get previous chunk
      const previousChunks = Array.from(this.chunks.values())
        .filter(c => c.sequence === chunk.sequence - 1);
      
      if (previousChunks.length === 0) return;
      
      const previousChunk = previousChunks[0];
      
      // Calculate overlap size
      const overlapSize = Math.min(
        this.chunkOverlap,
        previousChunk.duration * 0.1 // Max 10% of previous chunk
      );
      
      // Add overlap metadata
      chunk.metadata.hasOverlap = true;
      chunk.metadata.overlapDuration = overlapSize;
      
      console.log(`Added ${overlapSize}ms overlap to chunk ${chunk.id}`);
      
    } catch (error) {
      console.error('Error adding overlap to chunk:', error);
    }
  }

  /**
   * Compress chunk data
   */
  async compressChunk(chunk) {
    try {
      // Simple compression implementation
      // In production, you might use more sophisticated compression
      const originalSize = chunk.audioData.byteLength;
      
      // Simulate compression (in real implementation, use actual compression algorithm)
      chunk.metadata.originalSize = originalSize;
      chunk.metadata.compressed = true;
      
      console.log(`Compressed chunk ${chunk.id}: ${originalSize} bytes`);
      
    } catch (error) {
      console.error('Error compressing chunk:', error);
    }
  }

  /**
   * Process chunk queue
   */
  async processQueue() {
    if (this.processingQueue.length === 0) return;
    
    const chunkId = this.processingQueue.shift();
    const chunk = this.chunks.get(chunkId);
    
    if (!chunk) return;
    
    try {
      chunk.status = 'processing';
      chunk.processingAttempts++;
      
      // Process chunk (send to transcription service)
      const result = await this.processChunk(chunk);
      
      chunk.status = 'completed';
      chunk.result = result;
      
      console.log(`Successfully processed chunk ${chunk.id}`);
      
      // Trigger callback
      this.triggerCallback('chunkProcessed', chunk);
      
    } catch (error) {
      console.error(`Error processing chunk ${chunk.id}:`, error);
      
      if (chunk.processingAttempts < chunk.maxAttempts) {
        // Retry processing
        chunk.status = 'recording';
        this.processingQueue.push(chunk.id);
        console.log(`Retrying chunk ${chunk.id} (attempt ${chunk.processingAttempts}/${chunk.maxAttempts})`);
      } else {
        chunk.status = 'failed';
        chunk.error = error.message;
        console.error(`Chunk ${chunk.id} failed permanently`);
        
        // Trigger callback
        this.triggerCallback('chunkFailed', chunk);
      }
    }
    
    // Process next chunk in queue
    if (this.processingQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Process individual chunk
   */
  async processChunk(chunk) {
    try {
      // This would integrate with the transcription service
      // For now, we'll simulate processing
      
      const startTime = Date.now();
      
      // Simulate processing delay based on chunk size
      const processingTime = Math.min(chunk.duration * 0.1, 500);
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      const endTime = Date.now();
      
      // Return processing result
      return {
        chunkId: chunk.id,
        processingTime: endTime - startTime,
        success: true,
        confidence: 0.85,
        text: `Processed chunk ${chunk.sequence}` // Placeholder
      };
      
    } catch (error) {
      console.error('Error processing chunk:', error);
      throw error;
    }
  }

  /**
   * Handle network changes
   */
  handleNetworkChange(networkStatus) {
    console.log('Network status changed, adjusting chunk parameters');
    
    if (this.adaptiveChunking) {
      this.adjustChunkSizesForNetwork();
    }
    
    // Trigger callback
    this.triggerCallback('networkChanged', networkStatus);
  }

  /**
   * Get chunk by ID
   */
  getChunk(chunkId) {
    return this.chunks.get(chunkId);
  }

  /**
   * Get all chunks
   */
  getAllChunks() {
    return Array.from(this.chunks.values());
  }

  /**
   * Get chunks by status
   */
  getChunksByStatus(status) {
    return Array.from(this.chunks.values()).filter(chunk => chunk.status === status);
  }

  /**
   * Get chunk statistics
   */
  getChunkStats() {
    const chunks = Array.from(this.chunks.values());
    
    return {
      totalChunks: chunks.length,
      recordingChunks: chunks.filter(c => c.status === 'recording').length,
      processingChunks: chunks.filter(c => c.status === 'processing').length,
      completedChunks: chunks.filter(c => c.status === 'completed').length,
      failedChunks: chunks.filter(c => c.status === 'failed').length,
      queueLength: this.processingQueue.length,
      averageChunkDuration: chunks.length > 0 ? chunks.reduce((sum, c) => sum + c.duration, 0) / chunks.length : 0,
      currentVolume: this.currentVolume,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Register callback for events
   */
  onEvent(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    
    this.callbacks.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.get(event).delete(callback);
    };
  }

  /**
   * Trigger callback for event
   */
  triggerCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in chunk callback:', error);
        }
      });
    }
  }

  /**
   * Stop processing
   */
  stopProcessing() {
    this.isProcessing = false;
    
    // Finalize current chunk if exists
    if (this.currentChunk) {
      this.finalizeCurrentChunk('stop_requested');
    }
    
    console.log('Stopped audio chunk processing');
  }

  /**
   * Clear all chunks
   */
  clearChunks() {
    this.chunks.clear();
    this.processingQueue = [];
    this.currentChunk = null;
    this.chunkSequence = 0;
    
    console.log('Cleared all chunks');
  }

  /**
   * Force process all pending chunks
   */
  async forceProcessAllChunks() {
    // Add all pending chunks to queue
    const pendingChunks = Array.from(this.chunks.values())
      .filter(chunk => chunk.status === 'recording' || chunk.status === 'failed');
    
    for (const chunk of pendingChunks) {
      if (!this.processingQueue.includes(chunk.id)) {
        this.processingQueue.push(chunk.id);
      }
    }
    
    // Process queue
    await this.processQueue();
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopProcessing();
    this.clearChunks();
    
    // Clear callbacks
    this.callbacks.clear();
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('AudioChunkManager destroyed');
  }
}

// Export singleton instance
export const audioChunkManager = new AudioChunkManager();