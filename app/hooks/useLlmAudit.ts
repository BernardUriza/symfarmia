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
  retryCount: number
}

// Configuration constants
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const REQUEST_TIMEOUT = 30000 // 30 seconds

export function useLlmAudit(): UseLlmAuditReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LLMAuditResult | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
    setIsLoading(false)
    setRetryCount(0)
  }, [])

  const auditTranscript = useCallback(async (params: LLMAuditRequest): Promise<LLMAuditResult> => {
    setIsLoading(true)
    setError(null)
    setRetryCount(0)

    const attemptRequest = async (attempt: number): Promise<LLMAuditResult> => {
      try {
        // Add timeout to fetch
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

        const response = await fetch('/api/llm-audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...params,
            task: params.task || 'audit-transcript'
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

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
        const isLastAttempt = attempt >= MAX_RETRIES
        const errorMessage = err instanceof Error ? err.message : 'Failed to audit transcript'
        
        console.error(`LLM Audit Error (attempt ${attempt}/${MAX_RETRIES}):`, err)
        setRetryCount(attempt)

        // Retry logic
        if (!isLastAttempt && !errorMessage.includes('Invalid response') && !errorMessage.includes('400')) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          return attemptRequest(attempt + 1)
        }

        // Final error handling
        setError(errorMessage)
        
        // En caso de error, devolver la transcripción original sin modificar
        const fallbackResult: LLMAuditResult = {
          mergedTranscript: params.transcript,
          speakers: [],
          gptLogs: [`Error after ${attempt} attempts: ${errorMessage}`],
          summary: 'Error: No se pudo procesar con ChatGPT'
        }
        
        setResult(fallbackResult)
        return fallbackResult
      }
    }

    try {
      return await attemptRequest(1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    auditTranscript,
    isLoading,
    error,
    result,
    reset,
    retryCount
  }
}