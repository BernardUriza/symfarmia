// useSimpleWhisper.ts (limite: 300 líneas brutales)
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWhisperPreload } from "./useWhisperPreload";
import { useWhisperEngine } from "./aux_hooks/useWhisperEngine";
import { useAudioDenoising } from "./useAudioDenoising";
import { useAudioProcessorFallback } from "./useAudioProcessorFallback";
import { useAudioChunkAccumulator } from "./useAudioChunkAccumulator";
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
  chunkSize = 16384,
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

  // Audio chunk accumulator to handle sample rate conversion and minimum chunk size
  const accumulator = useAudioChunkAccumulator({
    sourceSampleRate: 48000, // Denoising outputs at 48kHz
    targetSampleRate: 16000, // Whisper expects 16kHz
    minChunkSize: 80000, // 5 seconds at 16kHz for larger chunks
    onAccumulatedChunk: (audioData, metadata) => {
      engine.processAudioChunk(audioData, metadata);
    }
  });

  // Try to use audio denoising first
  const audioDenoising = useAudioDenoising({
    sampleRate: 48000, // Keep native sample rate for denoising
    chunkSize,
    onChunkReady: accumulator.processChunk,
  });

  // Use fallback if denoising fails
  const fallbackChunkIdRef = useRef(0);
  const audioFallback = useAudioProcessorFallback({
    sampleRate: 16000, // Fallback uses 16kHz directly
    bufferSize: 80000, // Use 5 second chunks for fallback too
    onAudioData: (audioData) => {
      const chunkId = fallbackChunkIdRef.current!++;
      engine.processAudioChunk(audioData, { chunkId });
    },
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
    setAudioUrl(null);
    setAudioBlob(null);
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
      
      // Flush any remaining audio in the accumulator
      if (!usingFallback) {
        accumulator.flush();
      }
      
      // Get the complete audio for playback
      const completeAudio = audio.getCompleteAudio();
      if (completeAudio && completeAudio.length > 0) {
        // Create WAV header - use 48kHz for denoising, 16kHz for fallback
        const wavHeader = createWavHeader(completeAudio.length, usingFallback ? 16000 : 48000);
        
        // Convert Float32Array to Int16Array
        const audioBuffer = new Int16Array(completeAudio.length);
        for (let i = 0; i < completeAudio.length; i++) {
          const s = Math.max(-1, Math.min(1, completeAudio[i]));
          audioBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Combine header and audio data
        const wavBlob = new Blob([wavHeader, audioBuffer], { type: 'audio/wav' });
        setAudioBlob(wavBlob);
        setAudioUrl(URL.createObjectURL(wavBlob));
      }
      
      // Pedir transcripción completa al engine, con medical terms
      const fullText = engine.getFullTranscription();
      const medicalTerms = extractMedicalTermsFromText(fullText).map(t => t.term);
      setTranscription({
        text: fullText,
        confidence: engine.confidence ?? 0,
        medicalTerms,
        processingTime: engine.processingTime ?? 0,
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
  }, [audio, engine, accumulator, usingFallback]);

  const resetTranscription = useCallback(() => {
    setTranscription(null);
    setStatus("idle");
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    audio.reset();
    engine.reset();
    accumulator.reset();
  }, [audio, engine, accumulator, audioUrl]);
  
  // --- API brutal y clara ---
  // Si el modelo ya fue preloaded, consideramos el engine listo inmediatamente
  const engineStatusDerived: EngineStatus = preload.isLoaded ? 'ready' : engine.status;
  return {
    transcription,
    status,
    isRecording: audio.isRecording,
    error: error ?? '',
    engineStatus: engineStatusDerived,
    loadProgress: preload.progress,
    audioLevel: audio.audioLevel,
    recordingTime: audio.recordingTime,
    audioUrl: audioUrl ?? '',
    audioBlob: audioBlob ?? new Blob(),
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

// Helper function to create WAV header
function createWavHeader(dataLength: number, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  // "RIFF" chunk descriptor
  view.setUint32(0, 0x46464952, false); // "RIFF"
  view.setUint32(4, 36 + dataLength * 2, true); // file size - 8
  view.setUint32(8, 0x45564157, false); // "WAVE"
  
  // "fmt " sub-chunk
  view.setUint32(12, 0x20746d66, false); // "fmt "
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, 1, true); // number of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // "data" sub-chunk
  view.setUint32(36, 0x61746164, false); // "data"
  view.setUint32(40, dataLength * 2, true); // sub-chunk size
  
  return buffer;
}