/**
 * useAudioDenoising - Captura unificada con preprocesamiento (denoising)
 *
 * Este hook centraliza la captura de audio, aplica denoising mediante
 * AudioPipelineIntegration y expone los chunks limpios, estadísticas
 * y control (start/stop).
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { audioPipelineIntegration } from '../services/AudioPipelineIntegration'
import { useAudioProcessor } from './useAudioProcessor'
import * as RnnoiseModule from '@jitsi/rnnoise-wasm'


/** Metadata asociada al procesamiento de cada chunk */
export interface ProcessingMetadata {
  chunkId: number
  originalLength: number
  processedLength: number
  denoisingUsed: boolean
  processingTime: number
  qualityMetrics?: any
  activeFilters?: string[]
  fallbackMode?: boolean
}

/** Opciones de configuración del hook */
export interface UseAudioDenoisingOptions {
  onChunkReady?: (audio: Float32Array, metadata: ProcessingMetadata) => void
  chunkSize?: number
  sampleRate?: number
}

/** Interfaz de retorno del hook */
export interface UseAudioDenoisingReturn {
  isRecording: boolean
  isProcessing: boolean
  error: string
  audioChunks: Array<{ id: number; data: Float32Array; metadata: ProcessingMetadata }>
  start: () => Promise<MediaStream | null>
  stop: () => void
  getCompleteAudio: () => Float32Array
  processingStats: {
    totalChunks: number
    denoisedChunks: number
    fallbackChunks: number
    averageProcessingTime: number
  }
  configureDenoisingMode: (enabled: boolean) => void
  reset: () => void
  /** Nivel de audio del último chunk procesado (0-255) */
  audioLevel: number
  /** Tiempo de grabación en segundos */
  recordingTime: number
}

export function useAudioDenoising(
  { onChunkReady, chunkSize = 4096, sampleRate = 16000 }: UseAudioDenoisingOptions = {}
): UseAudioDenoisingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [audioChunks, setAudioChunks] = useState<UseAudioDenoisingReturn['audioChunks']>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingStartRef = useRef<number | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)

  // Estadísticas internas
  const statsRef = useRef({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 })
  const [processingStats, setProcessingStats] = useState<UseAudioDenoisingReturn['processingStats']>({
    totalChunks: 0,
    denoisedChunks: 0,
    fallbackChunks: 0,
    averageProcessingTime: 0,
  })

  const chunkIdRef = useRef(0)
  const allChunksRef = useRef<Float32Array[]>([])

  // RNNoise denoising module (singleton)
  const rnnoiseRef = useRef<any>(null)
  const rnnoiseReady = useRef(false)

  // Initialize RNNoise once
  useEffect(() => {
    ;(async () => {
      try {
        rnnoiseRef.current = await RnnoiseModule()
        rnnoiseReady.current = true
      } catch (err) {
        console.error('Error initializing RNNoise module', err)
      }
    })()
  }, [])

  // Convert Float32Array (Web Audio) to Int16Array (RNNoise)
  const float32ToInt16 = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length)
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return output
  }

  // Convert Int16Array back to Float32Array
  const int16ToFloat32 = (input: Int16Array): Float32Array => {
    const output = new Float32Array(input.length)
    for (let i = 0; i < input.length; i++) {
      const v = input[i] / 0x7fff
      output[i] = Math.max(-1, Math.min(1, v))
    }
    return output
  }

  // Configuración inicial del pipeline
  useEffect(() => {
    audioPipelineIntegration.configure({
      enableDenoising: true,
      enableFallback: true,
      enableQualityMetrics: true,
      enablePersistence: false,
      logLevel: 'info',
    })
  }, [])

  // AudioProcessor genera datos crudos
  const { start: startProc, stop: stopProc } = useAudioProcessor({
    onAudioData: (raw) => handleRawChunk(raw),
    bufferSize: chunkSize,
    sampleRate,
  })

  /** Procesa cada bloque crudo con denoising y actualiza estado */
  const handleRawChunk = useCallback(
    async (chunk: Float32Array) => {
      // Nivel de audio (pico) para visualización
      const peak = chunk.reduce((max, v) => Math.max(max, Math.abs(v)), 0)
      setAudioLevel(Math.round(peak * 255))
      // Paso de denoising con RNNoise (pre-Whisper)
      let denoisedChunk: Float32Array = chunk
      if (rnnoiseReady.current && rnnoiseRef.current) {
        try {
          const int16 = float32ToInt16(chunk)
          const out16 = rnnoiseRef.current.process(int16)
          denoisedChunk = int16ToFloat32(out16)
        } catch (err) {
          console.warn('RNNoise processing failed, using original chunk', err)
        }
      }
      const id = chunkIdRef.current++
      allChunksRef.current.push(denoisedChunk)
      setIsProcessing(true)
      const startTime = Date.now()
      try {
        const result = await audioPipelineIntegration.processAudioWithDenoising(denoisedChunk, {})
        const metadata: ProcessingMetadata = {
          chunkId: id,
          originalLength: chunk.length,
          processedLength: result.processedAudio.length,
          denoisingUsed: result.usedDenoising,
          processingTime: Date.now() - startTime,
          qualityMetrics: result.qualityMetrics,
          activeFilters: result.denoisingResult ? Object.keys(result.denoisingResult.activeFilters) : [],
          fallbackMode: !!result.fallbackMode,
        }
        statsRef.current.totalChunks++
        if (metadata.denoisingUsed) statsRef.current.denoisedChunks++
        if (metadata.fallbackMode) statsRef.current.fallbackChunks++
        statsRef.current.totalTime += metadata.processingTime
        setProcessingStats({
          totalChunks: statsRef.current.totalChunks,
          denoisedChunks: statsRef.current.denoisedChunks,
          fallbackChunks: statsRef.current.fallbackChunks,
          averageProcessingTime: statsRef.current.totalTime / statsRef.current.totalChunks,
        })
        setAudioChunks((prev) => [...prev, { id, data: result.processedAudio, metadata }])
        onChunkReady?.(result.processedAudio, metadata)
      } catch (e: any) {
        setError(e.message || 'Error processing audio chunk')
        const metadata: ProcessingMetadata = {
          chunkId: id,
          originalLength: chunk.length,
          processedLength: chunk.length,
          denoisingUsed: false,
          processingTime: Date.now() - startTime,
          fallbackMode: true,
        }
        statsRef.current.totalChunks++
        statsRef.current.fallbackChunks++
        setProcessingStats({
          totalChunks: statsRef.current.totalChunks,
          denoisedChunks: statsRef.current.denoisedChunks,
          fallbackChunks: statsRef.current.fallbackChunks,
          averageProcessingTime: statsRef.current.totalTime / statsRef.current.totalChunks,
        })
        setAudioChunks((prev) => [...prev, { id, data: chunk, metadata }])
        onChunkReady?.(chunk, metadata)
      } finally {
        setIsProcessing(false)
      }
    },
    [onChunkReady]
  )

  /** Detiene captura y procesamiento */
  const stop = useCallback(async (): Promise<void> => {
    if (!isRecording) return
    // Ensure audio processor resources are fully released
    await stopProc()
    setIsRecording(false)
    // Clear recording timer and reset levels
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    recordingStartRef.current = null
    setRecordingTime(0)
    setAudioLevel(0)
    // Clean residual data and stats
    allChunksRef.current = []
    statsRef.current = { totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 }
    setAudioChunks([])
    setProcessingStats({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, averageProcessingTime: 0 })
  }, [isRecording, stopProc])

  /** Inicia captura y procesamiento unificado */
  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) {
      // Stop any ongoing recording to ensure resources are released
      await stop()
    }
    setError('')
    // Reset internal buffers and stats
    allChunksRef.current = []
    statsRef.current = { totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 }
    chunkIdRef.current = 0
    setAudioChunks([])
    setProcessingStats({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, averageProcessingTime: 0 })
    // Setup recording timer
    recordingStartRef.current = Date.now()
    setRecordingTime(0)
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    recordingIntervalRef.current = window.setInterval(() => {
      if (recordingStartRef.current != null) {
        setRecordingTime(Math.floor((Date.now() - recordingStartRef.current) / 1000))
      }
    }, 1000)
    try {
      const stream = await startProc()
      if (stream) setIsRecording(true)
      return stream
    } catch (e: any) {
      setError(e.message || 'Error starting audio capture')
      return null
    }
  }, [isRecording, startProc, stop])

  /** Devuelve todo el audio concatenado */
  const getCompleteAudio = useCallback((): Float32Array => {
    const total = allChunksRef.current.reduce((sum, c) => sum + c.length, 0)
    const buf = new Float32Array(total)
    let offset = 0
    for (const c of allChunksRef.current) {
      buf.set(c, offset)
      offset += c.length
    }
    return buf
  }, [])

  /** Ajusta el modo de denoising dinámicamente */
  const configureDenoisingMode = useCallback((enabled: boolean) => {
    audioPipelineIntegration.configure({ enableDenoising: enabled, enableFallback: true, enableQualityMetrics: true, enablePersistence: false, logLevel: 'info' })
  }, [])

  /** Resetea el estado del hook y limpia chunks */
  const reset = useCallback(() => {
    setError('')
    setAudioChunks([])
    setProcessingStats({ totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, averageProcessingTime: 0 })
    statsRef.current = { totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 }
    allChunksRef.current = []
    chunkIdRef.current = 0
    setIsProcessing(false)
    setIsRecording(false)
    // Reset audio level and recording timer
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    recordingStartRef.current = null
    setRecordingTime(0)
    setAudioLevel(0)
  }, [])

  return { isRecording, isProcessing, error, audioChunks, start, stop, getCompleteAudio, processingStats, configureDenoisingMode, reset, audioLevel, recordingTime }
}
