export interface DiarizationSegment {
  start: number
  end: number
  speaker: string
}

export interface SpeakerSegment {
  start: number
  end: number
  speaker: 'Paciente' | 'Doctor' | 'Unknown'
  text?: string
}

export interface LLMAuditRequest {
  transcript: string
  webSpeech?: string
  diarization?: DiarizationSegment[]
  task: 'audit-transcript' | 'diarize'
}

export interface LLMAuditResult {
  mergedTranscript: string
  speakers: SpeakerSegment[]
  summary?: string
  gptLogs?: string[]
  error?: string
}

export interface LLMAuditResponse {
  success: boolean
  data?: LLMAuditResult
  error?: string
}