// useSimpleWhisper.ts (limite: 300 líneas brutales)
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWhisperPreload } from "./useWhisperPreload";
import { useWhisperEngine } from "./aux_hooks/useWhisperEngine";
import { useAudioDenoising } from "./useAudioDenoising";
import { useAudioProcessorFallback } from "./useAudioProcessorFallback";
import { extractMedicalTermsFromText } from "../utils/medicalTerms";
import { DefaultLogger } from "../utils/LoggerStrategy";

// Types y contratos esenciales
import type { UseSimpleWhisperOptions, UseSimpleWhisperReturn, Status, EngineStatus, Transcription } from "./aux_hooks/types";

/**
 * Hook principal para orquestación brutal de transcripción médica con Whisper.
 * Delegación absoluta a sub-hooks. Sin mezclas caóticas ni side effects sucios.
 */
export function useSimpleWhisper({
  autoPreload = false,
  processingMode = "direct",
  chunkSize = 160000,
  sampleRate = 16000,
  preloadPriority = "auto",
  preloadDelay = 2000,
  logger = DefaultLogger,
  showPreloadStatus = false,
  ...restOptions
}: UseSimpleWhisperOptions = {}): UseSimpleWhisperReturn {
  // --- Sub-hooks: nada de monstruosidades en un solo archivo ---
  const preload = useWhisperPreload({
    autoInit: autoPreload,
    priority: preloadPriority,
    delay: preloadDelay
  });

  const engine = useWhisperEngine({
    logger,
    chunkSize,
    sampleRate,
    onChunkProcessed: restOptions.onChunkProcessed,
    onChunkProgress: restOptions.onChunkProgress
  });

  // Try to use audio denoising first
  const audioDenoising = useAudioDenoising({
    sampleRate,
    chunkSize,
    onChunkReady: engine.processAudioChunk,
  });

  // Use fallback if denoising fails
  const audioFallback = useAudioProcessorFallback({
    sampleRate,
    bufferSize: chunkSize,
    onAudioData: engine.processAudioChunk,
  });

  // Select which audio processor to use based on denoising status
  const usingFallback = audioDenoising.error.includes('Failed to load denoiser');
  const audio = usingFallback ? audioFallback : audioDenoising;
  
  useEffect(() => {
    if (usingFallback) {
      logger.log("[useSimpleWhisper] Using fallback audio processor (no denoising)");
    } else {
      logger.log("[useSimpleWhisper] Using audio denoising processor");
    }
  }, [usingFallback, logger]);

  // --- Estado local minimalista ---
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // --- Hooks de ciclo de vida ---
  useEffect(() => {
    if (preload.isLoaded && engine.status === "ready") {
      setStatus("idle");
      setError(null);
      logger.log("[useSimpleWhisper] Modelo y engine listos");
    } else if (preload.status === "failed" || engine.status === "error") {
      setStatus("error");
      setError("Modelo no disponible");
      logger.error("[useSimpleWhisper] Error en modelo o engine");
    }
  }, [preload.isLoaded, preload.status, engine.status, logger]);


  // --- Acciones principales ---
  const startTranscription = useCallback(async () => {
    setError(null);
    setStatus("recording");
    setTranscription(null);
    try {
      const started = await audio.start();
      if (!started) throw new Error("No se pudo iniciar audio");
      return true;
    } catch (e) {
      setStatus("error");
      setError((e as Error).message);
      return false;
    }
  }, [audio]);

  const stopTranscription = useCallback(async () => {
    try {
      await audio.stop();
      setStatus("processing");
      // Pedir transcripción completa al engine, con medical terms
      const fullText = engine.getFullTranscription();
      const medicalTerms = extractMedicalTermsFromText(fullText).map(t => t.term);
      setTranscription({
        text: fullText,
        confidence: engine.confidence,
        medicalTerms,
        processingTime: engine.processingTime,
        timestamp: Date.now(),
        chunks: engine.getChunks()
      });
      setStatus("completed");
      return true;
    } catch (e) {
      setStatus("error");
      setError((e as Error).message);
      return false;
    }
  }, [audio, engine]);

  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus("idle");
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    audio.reset();
    engine.reset();
  }, [audio, engine]);
  // --- API brutal y clara ---
  // Si el modelo ya fue preloaded, consideramos el engine listo inmediatamente
  const engineStatusDerived: EngineStatus = preload.isLoaded ? 'ready' : engine.status;
  return {
    transcription,
    status,
    isRecording: audio.isRecording,
    error,
    engineStatus: engineStatusDerived,
    loadProgress: preload.progress,
    audioLevel: audio.audioLevel,
    recordingTime: audio.recordingTime,
    audioUrl,
    audioBlob,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadModel: preload.forcePreload,
    getCompleteAudio: audio.getCompleteAudio,
    preloadStatus: preload.status,
    preloadProgress: preload.progress,
    isPreloaded: preload.isLoaded,
    setLogger: logger.setEnabled?.bind(logger)
  };
}
