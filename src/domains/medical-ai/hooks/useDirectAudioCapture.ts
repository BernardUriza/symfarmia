import { useRef, useCallback, useState } from 'react';
import { useAudioProcessor } from './useAudioProcessor';

interface UseDirectAudioCaptureOptions {
  onChunkReady?: (audioData: Float32Array) => void;
  chunkSize?: number;
  sampleRate?: number;
}

export function useDirectAudioCapture({
  onChunkReady,
  chunkSize = 16000, // 1 second at 16kHz
  sampleRate = 16000
}: UseDirectAudioCaptureOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const bufferRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIdRef = useRef(0);

  // Remove internal worker - processing will be handled by the caller

  const { start: startProcessor, stop: stopProcessor } = useAudioProcessor({
    onAudioData: (audioData) => {
      // Accumulate audio data
      bufferRef.current.push(audioData);
      
      // Calculate total length
      const totalLength = bufferRef.current.reduce((sum, arr) => sum + arr.length, 0);
      
      // If we have enough data for a chunk
      if (totalLength >= chunkSize) {
        // Combine buffers
        const combinedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const buffer of bufferRef.current) {
          combinedBuffer.set(buffer, offset);
          offset += buffer.length;
        }
        
        // Extract chunk
        const chunk = combinedBuffer.slice(0, chunkSize);
        const remaining = combinedBuffer.slice(chunkSize);
        
        // Reset buffer with remaining data
        bufferRef.current = remaining.length > 0 ? [remaining] : [];
        
        // Process chunk
        const chunkId = `chunk_${chunkIdRef.current++}`;
        onChunkReady?.(chunk);
      }
    },
    bufferSize: 4096,
    sampleRate
  });

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return null;
    
    try {
      bufferRef.current = [];
      chunkIdRef.current = 0;
      const stream = await startProcessor();
      if (stream) {
        streamRef.current = stream;
        setIsRecording(true);
      }
      return stream;
    } catch (error) {
      console.error('Error starting direct audio capture:', error);
      return null;
    }
  }, [isRecording, startProcessor]);

  const stop = useCallback(() => {
    if (!isRecording) return;
    
    stopProcessor();
    
    // Process any remaining audio
    if (bufferRef.current.length > 0) {
      const totalLength = bufferRef.current.reduce((sum, arr) => sum + arr.length, 0);
      if (totalLength > 0) {
        const finalBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const buffer of bufferRef.current) {
          finalBuffer.set(buffer, offset);
          offset += buffer.length;
        }
        
        const chunkId = `chunk_${chunkIdRef.current++}`;
        onChunkReady?.(finalBuffer);
      }
    }
    
    bufferRef.current = [];
    streamRef.current = null;
    setIsRecording(false);
  }, [isRecording, stopProcessor, onChunkReady]);

  return { 
    start, 
    stop, 
    isRecording
  };
}