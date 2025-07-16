import { useRef, useCallback } from 'react';
import { resampleTo16kHz, normalizeFloat32 } from '../utils/audioHelpers';
import { useWhisperWorker } from './useWhisperWorker';

interface PartialResult {
  text: string;
  chunkId: string;
  timestamp: number;
}

interface UseWhisperStreamingProcessorWorkerOptions {
  onChunkProcessed?: (text: string, chunkNumber: number) => void;
}

export function useWhisperStreamingProcessorWorker(options: UseWhisperStreamingProcessorWorkerOptions = {}) {
  const resultsRef = useRef<PartialResult[]>([]);
  const chunkCountRef = useRef(0);
  const processingQueueRef = useRef<Array<{ chunk: Blob; chunkId: string }>>([]);
  const isProcessingRef = useRef(false);
  const pendingChunksRef = useRef(0);

  const { isReady, processChunk: processWorkerChunk, reset: resetWorker } = useWhisperWorker({
    onChunkProcessed: (text, chunkId) => {
      console.log(`[StreamingProcessor] TEXTO RECIBIDO del chunk ${chunkId}: "${text}" (${text.length} caracteres)`);
      resultsRef.current.push({ 
        text, 
        chunkId, 
        timestamp: Date.now() 
      });
      pendingChunksRef.current--;
      console.log(`[StreamingProcessor] Chunk ${chunkId} procesado. Pendientes: ${pendingChunksRef.current}`);
      
      // Llamar al callback externo si existe
      if (options.onChunkProcessed && text) {
        const chunkNumber = parseInt(chunkId.split('_')[1]) + 1;
        options.onChunkProcessed(text, chunkNumber);
      }
      
      processNextInQueue();
    },
    onError: (error) => {
      console.error('[StreamingProcessor] Worker error:', error);
      isProcessingRef.current = false;
      pendingChunksRef.current--;
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
    pendingChunksRef.current++;
    console.log(`[StreamingProcessor] Chunk ${chunkId} agregado a la cola. Total pendientes: ${pendingChunksRef.current}`);
    
    if (isReady && !isProcessingRef.current) {
      processNextInQueue();
    }
  }, [isReady, processNextInQueue]);

  const waitForAllChunks = useCallback(async (maxWaitTime = 15000): Promise<void> => {
    const startTime = Date.now();
    
    while (pendingChunksRef.current > 0 || processingQueueRef.current.length > 0 || isProcessingRef.current) {
      if (Date.now() - startTime > maxWaitTime) {
        console.warn(`[StreamingProcessor] Timeout esperando chunks después de ${maxWaitTime}ms`);
        break;
      }
      
      console.log(`[StreamingProcessor] Esperando... Pendientes: ${pendingChunksRef.current}, En cola: ${processingQueueRef.current.length}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('[StreamingProcessor] Todos los chunks procesados o timeout alcanzado');
  }, []);

  const getTranscript = useCallback(async () => {
    // Esperar a que todos los chunks terminen
    await waitForAllChunks();
    
    const results = resultsRef.current;
    console.log(`[StreamingProcessor] getTranscript llamado - ${results.length} resultados disponibles`);
    
    if (results.length === 0) {
      console.warn('[StreamingProcessor] NO HAY RESULTADOS - El usuario no dijo nada o error en procesamiento');
      return '';
    }
    
    const transcript = results
      .sort((a, b) => a.chunkId.localeCompare(b.chunkId))
      .map(r => r.text)
      .join(' ')
      .trim();
    
    console.log(`[StreamingProcessor] TRANSCRIPT FINAL: "${transcript}" (${transcript.length} caracteres)`);
    return transcript;
  }, [waitForAllChunks]);

  const reset = useCallback(() => {
    resultsRef.current = [];
    chunkCountRef.current = 0;
    processingQueueRef.current = [];
    isProcessingRef.current = false;
    pendingChunksRef.current = 0;
    resetWorker();
  }, [resetWorker]);

  return { 
    processChunk, 
    getTranscript, 
    reset,
    isReady 
  };
}