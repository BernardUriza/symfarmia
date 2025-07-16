import { useRef, useCallback, useEffect, useState } from 'react';

interface UseWhisperWorkerOptions {
  onChunkProcessed?: (text: string, chunkId: string) => void;
  onError?: (error: string) => void;
  onModelLoading?: (progress: number) => void;
  onModelReady?: () => void;
}

export function useWhisperWorker(options: UseWhisperWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const resultsRef = useRef<Map<string, string>>(new Map());
  const pendingChunksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/audioProcessingWorker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type, ...data } = event.data;

      switch (type) {
        case 'MODEL_LOADING':
          options.onModelLoading?.(data.progress);
          break;

        case 'MODEL_READY':
          setIsReady(true);
          options.onModelReady?.();
          break;

        case 'CHUNK_PROCESSED':
          resultsRef.current.set(data.chunkId, data.text);
          pendingChunksRef.current.delete(data.chunkId);
          options.onChunkProcessed?.(data.text, data.chunkId);
          if (pendingChunksRef.current.size === 0) {
            setIsProcessing(false);
          }
          break;

        case 'PROCESSING_ERROR':
          pendingChunksRef.current.delete(data.chunkId);
          options.onError?.(data.error);
          if (pendingChunksRef.current.size === 0) {
            setIsProcessing(false);
          }
          break;

        case 'ERROR':
          options.onError?.(data.error);
          setIsReady(false);
          break;
      }
    };

    workerRef.current = worker;
    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.terminate();
    };
  }, []);

  const processChunk = useCallback(async (audioData: Float32Array, chunkId: string) => {
    if (!workerRef.current || !isReady) {
      throw new Error('Worker not ready');
    }

    setIsProcessing(true);
    pendingChunksRef.current.add(chunkId);
    
    workerRef.current.postMessage({
      type: 'PROCESS_CHUNK',
      data: { audioData, chunkId }
    });
  }, [isReady]);

  const getTranscript = useCallback(() => {
    const results = Array.from(resultsRef.current.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, text]) => text)
      .join(' ');
    return results;
  }, []);

  const reset = useCallback(() => {
    resultsRef.current.clear();
    pendingChunksRef.current.clear();
    setIsProcessing(false);
    workerRef.current?.postMessage({ type: 'RESET' });
  }, []);

  return {
    isReady,
    isProcessing,
    processChunk,
    getTranscript,
    reset
  };
}