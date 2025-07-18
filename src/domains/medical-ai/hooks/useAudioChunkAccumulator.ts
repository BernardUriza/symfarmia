import { useCallback, useRef } from 'react';

export interface ProcessingMetadata {
  chunkId: number;
  originalLength?: number;
  processedLength?: number;
  denoisingUsed?: boolean;
  processingTime?: number;
}

export interface UseAudioChunkAccumulatorOptions {
  sourceSampleRate: number;
  targetSampleRate: number;
  minChunkSize: number;
  onAccumulatedChunk: (audioData: Float32Array, metadata: ProcessingMetadata) => void;
}

export interface UseAudioChunkAccumulatorReturn {
  processChunk: (audioData: Float32Array, metadata: ProcessingMetadata) => void;
  flush: () => void;
  reset: () => void;
}

export function useAudioChunkAccumulator({
  sourceSampleRate,
  targetSampleRate,
  minChunkSize,
  onAccumulatedChunk
}: UseAudioChunkAccumulatorOptions): UseAudioChunkAccumulatorReturn {
  const bufferRef = useRef<Float32Array[]>([]);
  const accumulatedSamplesRef = useRef(0);
  const chunkIdRef = useRef(0);

  const downsample = useCallback((buffer: Float32Array, fromRate: number, toRate: number): Float32Array => {
    if (fromRate === toRate) return buffer;
    
    const ratio = fromRate / toRate;
    const newLength = Math.floor(buffer.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const index = Math.floor(i * ratio);
      result[i] = buffer[index];
    }
    
    return result;
  }, []);

  const processChunk = useCallback((audioData: Float32Array, metadata: ProcessingMetadata) => {
    // Downsample the audio data from source to target sample rate
    const downsampled = downsample(audioData, sourceSampleRate, targetSampleRate);
    
    bufferRef.current.push(downsampled);
    accumulatedSamplesRef.current += downsampled.length;
    
    
    // If we've accumulated enough samples, send them for processing
    if (accumulatedSamplesRef.current >= minChunkSize) {
      const totalLength = bufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedBuffer = new Float32Array(totalLength);
      let offset = 0;
      
      for (const chunk of bufferRef.current) {
        combinedBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      
      const newMetadata: ProcessingMetadata = {
        chunkId: chunkIdRef.current++,
        originalLength: totalLength,
        processedLength: totalLength,
        denoisingUsed: metadata.denoisingUsed,
        processingTime: Date.now()
      };
      
      onAccumulatedChunk(combinedBuffer, newMetadata);
      
      // Clear the buffer
      bufferRef.current = [];
      accumulatedSamplesRef.current = 0;
    }
  }, [sourceSampleRate, targetSampleRate, minChunkSize, onAccumulatedChunk, downsample]);

  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;
    
    const totalLength = bufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedBuffer = new Float32Array(totalLength);
    let offset = 0;
    
    for (const chunk of bufferRef.current) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    const metadata: ProcessingMetadata = {
      chunkId: chunkIdRef.current++,
      originalLength: totalLength,
      processedLength: totalLength,
      processingTime: Date.now()
    };
    
    onAccumulatedChunk(combinedBuffer, metadata);
    
    bufferRef.current = [];
    accumulatedSamplesRef.current = 0;
  }, [onAccumulatedChunk]);

  const reset = useCallback(() => {
    bufferRef.current = [];
    accumulatedSamplesRef.current = 0;
    chunkIdRef.current = 0;
  }, []);

  return {
    processChunk,
    flush,
    reset
  };
}