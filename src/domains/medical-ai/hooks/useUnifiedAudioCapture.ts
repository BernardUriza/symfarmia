import { useRef, useCallback, useState } from 'react';
import { useAudioProcessor } from './useAudioProcessor';

interface UseUnifiedAudioCaptureOptions {
  onChunkReady?: (audioData: Float32Array) => void;
  chunkSize?: number;
  sampleRate?: number;
  mode?: 'direct' | 'streaming';
}

/**
 * Unified audio capture hook that works for both Direct and Streaming modes
 * Uses ScriptProcessorNode for reliable raw audio capture
 * Direct mode: processes chunks immediately (1-10 seconds)
 * Streaming mode: accumulates larger chunks (10+ seconds)
 */
export function useUnifiedAudioCapture({
  onChunkReady,
  chunkSize = 16000, // Default 1 second at 16kHz
  sampleRate = 16000,
  mode = 'direct'
}: UseUnifiedAudioCaptureOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const bufferRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // For streaming mode, we want larger chunks (10 seconds)
  const targetChunkSize = mode === 'streaming' ? 160000 : chunkSize; // 10s vs custom

  const { start: startProcessor, stop: stopProcessor } = useAudioProcessor({
    onAudioData: (audioData) => {
      // Accumulate audio data
      bufferRef.current.push(audioData);
      
      // Calculate total length
      const totalLength = bufferRef.current.reduce((sum, arr) => sum + arr.length, 0);
      
      // Log progress for debugging
      if (mode === 'streaming' && totalLength % 16000 === 0) {
        const seconds = totalLength / 16000;
        console.log(`[UnifiedCapture] Streaming mode: ${seconds}s accumulated`);
      }
      
      // If we have enough data for a chunk
      if (totalLength >= targetChunkSize) {
        // Combine buffers
        const combinedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const buffer of bufferRef.current) {
          combinedBuffer.set(buffer, offset);
          offset += buffer.length;
        }
        
        // Extract chunk
        const chunk = combinedBuffer.slice(0, targetChunkSize);
        const remaining = combinedBuffer.slice(targetChunkSize);
        
        // Reset buffer with remaining data
        bufferRef.current = remaining.length > 0 ? [remaining] : [];
        
        // Increment chunk counter and notify
        chunkCountRef.current++;
        console.log(`[UnifiedCapture] ${mode} mode: Chunk #${chunkCountRef.current} ready (${targetChunkSize} samples)`);
        onChunkReady?.(chunk);
      }
    },
    bufferSize: 4096,
    sampleRate
  });

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return streamRef.current;
    
    try {
      console.log(`[UnifiedCapture] Starting ${mode} mode capture`);
      bufferRef.current = [];
      chunkCountRef.current = 0;
      startTimeRef.current = Date.now();
      
      const stream = await startProcessor();
      if (stream) {
        streamRef.current = stream;
        setIsRecording(true);
      }
      return stream;
    } catch (error) {
      console.error('[UnifiedCapture] Error starting audio capture:', error);
      return null;
    }
  }, [isRecording, startProcessor, mode]);

  const stop = useCallback(() => {
    if (!isRecording) return;
    
    console.log(`[UnifiedCapture] Stopping ${mode} mode capture`);
    stopProcessor();
    
    // Process any remaining audio
    if (bufferRef.current.length > 0) {
      const totalLength = bufferRef.current.reduce((sum, arr) => sum + arr.length, 0);
      
      // For streaming mode, only process if we have significant data
      const minLength = mode === 'streaming' ? 16000 : 0; // 1 second minimum for streaming
      
      if (totalLength > minLength) {
        const finalBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const buffer of bufferRef.current) {
          finalBuffer.set(buffer, offset);
          offset += buffer.length;
        }
        
        chunkCountRef.current++;
        console.log(`[UnifiedCapture] Final chunk #${chunkCountRef.current} (${totalLength} samples)`);
        onChunkReady?.(finalBuffer);
      }
    }
    
    const duration = (Date.now() - startTimeRef.current) / 1000;
    console.log(`[UnifiedCapture] Recording stopped. Duration: ${duration}s, Chunks: ${chunkCountRef.current}`);
    
    bufferRef.current = [];
    streamRef.current = null;
    setIsRecording(false);
  }, [isRecording, stopProcessor, onChunkReady, mode]);

  const getRecordingTime = useCallback(() => {
    if (!isRecording) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, [isRecording]);

  return { 
    start, 
    stop, 
    isRecording,
    chunkCount: chunkCountRef.current,
    getRecordingTime
  };
}