// useWhisperEngine.ts - Solo lógica de worker/transcripción brutal
import { useRef, useState, useCallback } from "react";
import type { EngineStatus, TranscriptionChunk, WhisperEngineOptions } from "./types";

export function useWhisperEngine({
  logger,
  chunkSize,
  sampleRate,
  onChunkProcessed,
  onChunkProgress
}: WhisperEngineOptions) {
  // Estado crítico
  const [status, setStatus] = useState<EngineStatus>("loading");
  const chunksRef = useRef<TranscriptionChunk[]>([]);
  const confidenceRef = useRef(0.9);
  const processingTimeRef = useRef(0);

  // Simulación de procesamiento brutal, para conectar con worker real
  const processAudioChunk = useCallback(async (audio: Float32Array, meta: { chunkId: number }) => {
    setStatus("ready"); // Cambiar a "processing" real si hay worker
    const fakeText = `Texto transcrito [chunk #${meta.chunkId}] (${audio.length} samples)`;
    const chunk: TranscriptionChunk = {
      id: `chunk_${meta.chunkId}`,
      text: fakeText,
      timestamp: Date.now()
    };
    chunksRef.current.push(chunk);
    if (onChunkProcessed) onChunkProcessed(fakeText, meta.chunkId);
    if (onChunkProgress) onChunkProgress(meta.chunkId, 100);
    logger.log(`[Engine] Procesado chunk ${meta.chunkId}`);
  }, [logger, onChunkProcessed, onChunkProgress]);

  // Obtener texto total
  const getFullTranscription = useCallback(() => {
    return chunksRef.current.map(c => c.text).join(" ").trim();
  }, []);

  const getChunks = useCallback(() => {
    return [...chunksRef.current];
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    chunksRef.current = [];
    confidenceRef.current = 0.9;
    processingTimeRef.current = 0;
  }, []);

  return {
    status,
    processAudioChunk,
    getFullTranscription,
    getChunks,
    confidence: confidenceRef.current,
    processingTime: processingTimeRef.current,
    reset
  };
}
