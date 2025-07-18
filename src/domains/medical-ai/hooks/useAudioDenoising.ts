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
}

export function useAudioDenoising(
  { onChunkReady, chunkSize = 16000, sampleRate = 16000 }: UseAudioDenoisingOptions = {}
): UseAudioDenoisingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [audioChunks, setAudioChunks] = useState<UseAudioDenoisingReturn['audioChunks']>([])

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
      const id = chunkIdRef.current++
      allChunksRef.current.push(chunk)
      setIsProcessing(true)
      const startTime = Date.now()
      try {
        const result = await audioPipelineIntegration.processAudioWithDenoising(chunk, {})
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

  /** Inicia captura y procesamiento unificado */
  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return null
    setError('')
    allChunksRef.current = []
    statsRef.current = { totalChunks: 0, denoisedChunks: 0, fallbackChunks: 0, totalTime: 0 }
    chunkIdRef.current = 0
    try {
      const stream = await startProc()
      if (stream) setIsRecording(true)
      return stream
    } catch (e: any) {
      setError(e.message || 'Error starting audio capture')
      return null
    }
  }, [isRecording, startProc])

  /** Detiene captura y procesamiento */
  const stop = useCallback(() => {
    if (!isRecording) return
    stopProc()
    setIsRecording(false)
  }, [isRecording, stopProc])

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
  }, [])

  return { isRecording, isProcessing, error, audioChunks, start, stop, getCompleteAudio, processingStats, configureDenoisingMode, reset }
}
