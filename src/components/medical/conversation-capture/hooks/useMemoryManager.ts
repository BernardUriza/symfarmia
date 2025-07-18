import { useEffect, useRef, useCallback } from 'react';

interface MemoryManagerOptions {
  maxAudioDuration?: number; // in seconds
  cleanupInterval?: number; // in milliseconds
}

export function useMemoryManager(options: MemoryManagerOptions = {}) {
  const {
    maxAudioDuration = 1800, // 30 minutes
    cleanupInterval = 60000 // 1 minute
  } = options;

  const audioBuffers = useRef<Map<string, Float32Array>>(new Map());
  const lastCleanup = useRef<number>(Date.now());

  const addAudioBuffer = useCallback((id: string, buffer: Float32Array) => {
    // Check if we need to cleanup old buffers
    const now = Date.now();
    if (now - lastCleanup.current > cleanupInterval) {
      cleanupOldBuffers();
      lastCleanup.current = now;
    }

    // Add new buffer
    audioBuffers.current.set(id, buffer);
    
    // Log memory usage
    const totalSize = Array.from(audioBuffers.current.values())
      .reduce((sum, buf) => sum + buf.length * 4, 0); // Float32 = 4 bytes
    
    console.log(`[MemoryManager] Audio buffers: ${audioBuffers.current.size}, Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }, [cleanupInterval]);

  const cleanupOldBuffers = useCallback(() => {
    const maxBuffers = Math.ceil(maxAudioDuration / 60); // Assuming 1 minute chunks
    
    if (audioBuffers.current.size > maxBuffers) {
      const entries = Array.from(audioBuffers.current.entries());
      const toRemove = entries.slice(0, entries.length - maxBuffers);
      
      toRemove.forEach(([id]) => {
        audioBuffers.current.delete(id);
      });
      
      console.log(`[MemoryManager] Cleaned up ${toRemove.length} old audio buffers`);
    }
  }, [maxAudioDuration]);

  const clearAllBuffers = useCallback(() => {
    const count = audioBuffers.current.size;
    audioBuffers.current.clear();
    console.log(`[MemoryManager] Cleared all ${count} audio buffers`);
  }, []);

  const getBuffer = useCallback((id: string) => {
    return audioBuffers.current.get(id);
  }, []);

  const getMemoryUsage = useCallback(() => {
    const buffers = Array.from(audioBuffers.current.values());
    const totalSize = buffers.reduce((sum, buf) => sum + buf.length * 4, 0);
    
    return {
      bufferCount: audioBuffers.current.size,
      totalSizeBytes: totalSize,
      totalSizeMB: totalSize / 1024 / 1024
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllBuffers();
    };
  }, [clearAllBuffers]);

  return {
    addAudioBuffer,
    clearAllBuffers,
    getBuffer,
    getMemoryUsage,
    cleanupOldBuffers
  };
}