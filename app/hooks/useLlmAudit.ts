import { useState, useCallback } from 'react'
import { 
  LLMAuditRequest, 
  LLMAuditResult, 
  LLMAuditResponse,
  DiarizationSegment 
} from '@/app/types/llm-audit'

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

      const data: LLMAuditResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Invalid response from server')
      }

      setResult(data.data)
      return data.data

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