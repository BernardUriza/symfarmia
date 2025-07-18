import { useState, useCallback } from 'react';
import { ChunkData, ChunkWithProgress, ChunkProgressMap } from '../types';

/**
 * Custom hook for managing audio processing state
 */
export const useAudioProcessingState = () => {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [currentChunk, setCurrentChunk] = useState<ChunkWithProgress | null>(null);
  const [chunkProgress, setChunkProgress] = useState<ChunkProgressMap>({});

  const handleChunkProcessed = useCallback((text: string, chunkNumber: number) => {
    const newChunk: ChunkData = { 
      text, 
      chunkNumber, 
      timestamp: Date.now() 
    };
    
    setChunks(prev => [...prev, newChunk]);
    setCurrentChunk({ text, number: chunkNumber });
  }, []);

  const handleChunkProgress = useCallback((chunkNumber: number, progress: number) => {
    setChunkProgress(prev => ({ ...prev, [chunkNumber]: progress }));
    setCurrentChunk(curr => 
      curr && curr.number === chunkNumber 
        ? { ...curr, progress } 
        : curr
    );
  }, []);

  const resetState = useCallback(() => {
    setChunks([]);
    setCurrentChunk(null);
    setChunkProgress({});
  }, []);

  return {
    chunks,
    currentChunk,
    chunkProgress,
    handleChunkProcessed,
    handleChunkProgress,
    resetState,
  };
};