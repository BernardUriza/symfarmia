import { useRef, useCallback, useState } from 'react';
import { useAudioProcessor } from './useAudioProcessor';
import { AudioChunkManager } from '../audio/AudioChunkManager';

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
  const chunkManagerRef = useRef<AudioChunkManager | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const allChunksRef = useRef<Float32Array[]>([]); // Store all chunks for final audio
  const MAX_RECORDING_SECONDS = 40 * 60; // 40 minutes maximum

  // For streaming mode, we want larger chunks (10 seconds)
  const targetChunkSize = mode === 'streaming' ? 160000 : chunkSize; // 10s vs custom

  const { start: startProcessor, stop: stopProcessor } = useAudioProcessor({
    onAudioData: (audioData) => {
      if (!chunkManagerRef.current) return;
      chunkManagerRef.current.addData(audioData);
    },
    bufferSize: 4096,
    sampleRate
  });

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return streamRef.current;
    
    try {
      console.log(`[UnifiedCapture] Starting ${mode} mode capture`);
      chunkManagerRef.current = new AudioChunkManager({
        chunkSize: targetChunkSize,
        onChunk: (chunk, id) => {
          chunkCountRef.current = id;
          console.log(`[UnifiedCapture] ${mode} mode: Chunk #${id} ready (${chunk.length} samples)`);
          
          // Store chunk for final audio
          allChunksRef.current.push(chunk);
          
          // Check if we've reached max recording time
          const totalSamples = allChunksRef.current.reduce((sum, c) => sum + c.length, 0);
          const totalSeconds = totalSamples / sampleRate;
          
          if (totalSeconds >= MAX_RECORDING_SECONDS) {
            console.warn('[UnifiedCapture] Maximum recording time reached (40 minutes)');
            stop();
            return;
          }
          
          onChunkReady?.(chunk);
        }
      });
      chunkCountRef.current = 0;
      startTimeRef.current = Date.now();
      allChunksRef.current = []; // Reset chunks array
      
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
    chunkManagerRef.current?.flush();
    
    const duration = (Date.now() - startTimeRef.current) / 1000;
    console.log(`[UnifiedCapture] Recording stopped. Duration: ${duration}s, Chunks: ${chunkCountRef.current}`);
    
    chunkManagerRef.current = null;
    streamRef.current = null;
    setIsRecording(false);
  }, [isRecording, stopProcessor, mode]);

  const getRecordingTime = useCallback(() => {
    if (!isRecording) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, [isRecording]);

  const getAllChunks = useCallback(() => {
    return allChunksRef.current;
  }, []);

  const getCombinedAudio = useCallback(() => {
    const chunks = allChunksRef.current;
    if (chunks.length === 0) return null;
    
    // Calculate total length
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    
    // Create combined array
    const combined = new Float32Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    return combined;
  }, []);

  return { 
    start, 
    stop, 
    isRecording,
    chunkCount: chunkCountRef.current,
    getRecordingTime,
    getAllChunks,
    getCombinedAudio
  };
}