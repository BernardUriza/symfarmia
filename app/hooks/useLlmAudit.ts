import { useState, useCallback } from 'react'

export interface DiarizationSegment {
  start: number
  end: number
  speaker?: string
  text?: string
}

export interface LLMAuditRequest {
  transcript: string
  webSpeech?: string
  diarization?: DiarizationSegment[]
  task?: 'audit-transcript' | 'diarize'
}

export interface SpeakerSegment {
  start: number
  end: number
  speaker: string
  text: string
}

export interface LLMAuditResult {
  mergedTranscript: string
  speakers: SpeakerSegment[]
  summary?: string
  gptLogs?: string[]
}

interface UseLlmAuditReturn {
  auditTranscript: (params: LLMAuditRequest) => Promise<LLMAuditResult>
  isLoading: boolean
  error: string | null
  result: LLMAuditResult | null
  reset: () => void
}

export function useLlmAudit(): UseLlmAuditReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LLMAuditResult | null>(null)

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
    setIsLoading(false)
  }, [])

  const auditTranscript = useCallback(async (params: LLMAuditRequest): Promise<LLMAuditResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/llm-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          task: params.task || 'audit-transcript'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success || !data.result) {
        throw new Error('Invalid response from server')
      }

      setResult(data.result)
      return data.result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to audit transcript'
      setError(errorMessage)
      console.error('LLM Audit Error:', err)
      
      // En caso de error, devolver la transcripción original sin modificar
      const fallbackResult: LLMAuditResult = {
        mergedTranscript: params.transcript,
        speakers: [],
        gptLogs: [`Error: ${errorMessage}`]
      }
      
      setResult(fallbackResult)
      return fallbackResult
      
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    auditTranscript,
    isLoading,
    error,
    result,
    reset
  }
}