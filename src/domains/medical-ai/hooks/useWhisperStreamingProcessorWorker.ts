import { useRef, useCallback } from 'react';
import { resampleTo16kHz, normalizeFloat32 } from '../utils/audioHelpers';
import { useWhisperWorker } from './useWhisperWorker';

interface PartialResult {
  text: string;
  chunkId: string;
  timestamp: number;
}

export function useWhisperStreamingProcessorWorker() {
  const resultsRef = useRef<PartialResult[]>([]);
  const chunkCountRef = useRef(0);
  const processingQueueRef = useRef<Array<{ chunk: Blob; chunkId: string }>>([]);
  const isProcessingRef = useRef(false);

  const { isReady, processChunk: processWorkerChunk, reset: resetWorker } = useWhisperWorker({
    onChunkProcessed: (text, chunkId) => {
      resultsRef.current.push({ 
        text, 
        chunkId, 
        timestamp: Date.now() 
      });
      processNextInQueue();
    },
    onError: (error) => {
      console.error('Worker error:', error);
      isProcessingRef.current = false;
      processNextInQueue();
    }
  });

  const processNextInQueue = useCallback(async () => {
    if (isProcessingRef.current || processingQueueRef.current.length === 0) {
      return;
    }

    const nextItem = processingQueueRef.current.shift();
    if (!nextItem) return;

    isProcessingRef.current = true;
    const { chunk, chunkId } = nextItem;
    
    try {
      // Validar el chunk antes de procesarlo
      if (!chunk || chunk.size === 0) {
        console.warn(`Chunk ${chunkId} está vacío, omitiendo...`);
        return;
      }

      const arrayBuffer = await chunk.arrayBuffer();
      
      // Crear AudioContext sin especificar sampleRate para evitar problemas de compatibilidad
      const audioCtx = new AudioContext();
      
      try {
        const audioData = await audioCtx.decodeAudioData(arrayBuffer);
        const float32 = audioData.getChannelData(0);
        
        if (float32 && float32.length > 0) {
          const resampled = resampleTo16kHz(float32, audioData.sampleRate);
          const normalized = normalizeFloat32(resampled);
          await processWorkerChunk(normalized, chunkId);
        } else {
          console.warn(`Chunk ${chunkId} no tiene datos de audio válidos`);
        }
      } catch (decodeError) {
        console.error(`Error decodificando audio del chunk ${chunkId}:`, decodeError);
        // Continuar con el siguiente chunk en lugar de detener todo
      } finally {
        // Cerrar el AudioContext para liberar recursos
        audioCtx.close();
      }
    } catch (error) {
      console.error(`Error procesando chunk ${chunkId}:`, error);
    } finally {
      isProcessingRef.current = false;
      // Procesar el siguiente chunk en la cola
      setTimeout(() => processNextInQueue(), 100);
    }
  }, [processWorkerChunk]);

  const processChunk = useCallback(async (chunk: Blob) => {
    const chunkId = `chunk_${chunkCountRef.current++}`;
    processingQueueRef.current.push({ chunk, chunkId });
    
    if (isReady && !isProcessingRef.current) {
      processNextInQueue();
    }
  }, [isReady, processNextInQueue]);

  const getTranscript = useCallback(() => {
    return resultsRef.current
      .sort((a, b) => a.chunkId.localeCompare(b.chunkId))
      .map(r => r.text)
      .join(' ')
      .trim();
  }, []);

  const reset = useCallback(() => {
    resultsRef.current = [];
    chunkCountRef.current = 0;
    processingQueueRef.current = [];
    isProcessingRef.current = false;
    resetWorker();
  }, [resetWorker]);

  return { 
    processChunk, 
    getTranscript, 
    reset,
    isReady 
  };
}