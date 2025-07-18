/**
 * useWhisperEngine - Gestor de transcripción en Worker (Whisper)
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import type { EngineStatus, TranscriptionChunk, WhisperEngineOptions } from './types'

// Import the updated worker - use relative path for Next.js compatibility
const WhisperWorkerPath = '/workers/audioProcessingWorker.js'

export function useWhisperEngine({
  logger,
  onChunkProcessed,
  onChunkProgress
}: WhisperEngineOptions) {
  const [status, setStatus] = useState<EngineStatus>('loading')
  const chunksRef = useRef<TranscriptionChunk[]>([])
  const confidenceRef = useRef(0)
  const processingTimeRef = useRef(0)
  const workerRef = useRef<Worker>()

  // Iniciar worker y suscribirse a mensajes
  useEffect(() => {
    const worker = new Worker(WhisperWorkerPath)
    workerRef.current = worker
    worker.onmessage = ({ data: msg }) => {
      switch (msg.type) {
        case 'MODEL_READY':
          setStatus('ready')
          logger.log('[WhisperEngine] Modelo listo')
          break
        case 'MODEL_LOADING_PROGRESS':
          setStatus('loading')
          break
        case 'CHUNK_PROCESSING_START':
          setStatus('processing')
          break
        case 'CHUNK_PROCESSED':
          const { chunkId, text, confidence, processingTime } = msg
          const chunk: TranscriptionChunk = {
            id: `chunk_${chunkId}`,
            text,
            timestamp: Date.now()
          }
          chunksRef.current.push(chunk)
          confidenceRef.current = confidence || 0.8
          processingTimeRef.current = processingTime
          onChunkProcessed?.(text, chunkId)
          onChunkProgress?.(chunkId, 100)
          logger.log(`[WhisperEngine] Chunk ${chunkId} procesado`)
          break
        case 'MODEL_ERROR':
        case 'CHUNK_ERROR':
          setStatus('error')
          logger.error('[WhisperEngine] Error:', msg.error)
          break
      }
    }
    // Inicializar modelo
    worker.postMessage({ type: 'INIT' })
    return () => worker.terminate()
  }, [logger, onChunkProcessed, onChunkProgress])

  // Enviar audio al worker
  const processAudioChunk = useCallback(
    (audioData: Float32Array, meta: { chunkId: number }) => {
      setStatus('processing')
      workerRef.current?.postMessage({ 
        type: 'PROCESS_CHUNK', 
        data: { audioData, chunkId: meta.chunkId, metadata: meta } 
      })
    },
    []
  )

  const getFullTranscription = useCallback(() => {
    return chunksRef.current.map(c => c.text).join(' ').trim()
  }, [])

  const getChunks = useCallback(() => {
    return [...chunksRef.current]
  }, [])

  const reset = useCallback(() => {
    setStatus('loading')
    chunksRef.current = []
    confidenceRef.current = 0
    processingTimeRef.current = 0
    workerRef.current?.postMessage({ type: 'RESET' })
  }, [])

  return {
    status,
    processAudioChunk,
    getFullTranscription,
    getChunks,
    confidence: confidenceRef.current,
    processingTime: processingTimeRef.current,
    reset
  }
}
