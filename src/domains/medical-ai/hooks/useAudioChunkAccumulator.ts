import { useRef, useCallback } from 'react';

interface UseAudioChunkAccumulatorOptions {
  onCompleteChunk?: (chunk: Blob) => void;
  minChunkSize?: number;
  maxAccumulationTime?: number;
}

export function useAudioChunkAccumulator({
  onCompleteChunk,
  minChunkSize = 16000, // ~1 segundo a 16kHz (mínimo para Whisper)
  maxAccumulationTime = 2000 // 2 segundos max para evitar latencia
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

    console.log(`[AudioAccumulator] Chunk recibido: ${chunk.size} bytes | Total acumulado: ${totalSize} bytes | Tiempo desde último flush: ${timeSinceLastFlush}ms`);

    // Flush if we have enough data or if too much time has passed
    if (totalSize >= minChunkSize) {
      console.log(`[AudioAccumulator] Tamaño mínimo alcanzado (${totalSize} >= ${minChunkSize}), enviando chunk...`);
      flush();
    } else if (timeSinceLastFlush >= maxAccumulationTime) {
      console.log(`[AudioAccumulator] Tiempo máximo alcanzado (${timeSinceLastFlush}ms), enviando chunk parcial...`);
      flush();
    }
  }, [minChunkSize, maxAccumulationTime]);

  const flush = useCallback(() => {
    if (accumulatorRef.current.length === 0) {
      console.log('[AudioAccumulator] Flush llamado pero no hay chunks para enviar');
      return;
    }

    // Combine all chunks into one blob
    const completeBlob = new Blob(accumulatorRef.current, { 
      type: mimeTypeRef.current 
    });

    console.log(`[AudioAccumulator] FLUSH: Enviando blob de ${completeBlob.size} bytes (${accumulatorRef.current.length} chunks combinados)`);

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