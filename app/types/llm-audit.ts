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
  partialTranscripts?: string[]
  confidence?: number
  language?: string
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

export interface LLMAuditResponse {
  success: boolean
  data?: LLMAuditResult
  error?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}