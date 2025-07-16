import { useRef, useCallback } from 'react';

interface UseAudioChunkAccumulatorOptions {
  onCompleteChunk?: (chunk: Blob) => void;
  minChunkSize?: number;
  maxAccumulationTime?: number;
}

export function useAudioChunkAccumulator({
  onCompleteChunk,
  minChunkSize = 32000, // ~2 seconds at 16kHz
  maxAccumulationTime = 5000 // 5 seconds max
}: UseAudioChunkAccumulatorOptions = {}) {
  const accumulatorRef = useRef<Blob[]>([]);
  const lastFlushRef = useRef<number>(Date.now());
  const mimeTypeRef = useRef<string>('audio/webm');

  const addChunk = useCallback((chunk: Blob, mimeType: string) => {
    accumulatorRef.current.push(chunk);
    mimeTypeRef.current = mimeType;

    // Calculate total size
    const totalSize = accumulatorRef.current.reduce((sum, blob) => sum + blob.size, 0);
    const timeSinceLastFlush = Date.now() - lastFlushRef.current;

    // Flush if we have enough data or if too much time has passed
    if (totalSize >= minChunkSize || timeSinceLastFlush >= maxAccumulationTime) {
      flush();
    }
  }, [minChunkSize, maxAccumulationTime]);

  const flush = useCallback(() => {
    if (accumulatorRef.current.length === 0) return;

    // Combine all chunks into one blob
    const completeBlob = new Blob(accumulatorRef.current, { 
      type: mimeTypeRef.current 
    });

    // Reset accumulator
    accumulatorRef.current = [];
    lastFlushRef.current = Date.now();

    // Send complete chunk
    onCompleteChunk?.(completeBlob);
  }, [onCompleteChunk]);

  const reset = useCallback(() => {
    accumulatorRef.current = [];
    lastFlushRef.current = Date.now();
  }, []);

  return { addChunk, flush, reset };
}