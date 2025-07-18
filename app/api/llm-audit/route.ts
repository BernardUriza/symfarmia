import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { LLMAuditRequest, LLMAuditResponse, LLMAuditResult } from '@/app/types/llm-audit'
import { llmCache } from '@/app/services/llmCache'
import { llmMetrics } from '@/app/services/llmMetrics'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const MEDICAL_AUDIT_PROMPT = `Eres un asistente médico especializado. Tu tarea es auditar y mejorar transcripciones médicas.

INSTRUCCIONES:
1. Fusiona y corrige el texto de la transcripción principal con los datos de WebSpeech si están disponibles
2. Asigna speakers (Doctor/Paciente) según el contexto y los datos de diarización
3. Corrige errores médicos obvios, terminología y coherencia
4. Mantén el contenido clínico intacto

FORMATO DE RESPUESTA OBLIGATORIO (JSON):
{
  "mergedTranscript": "texto completo fusionado y corregido",
  "speakers": [
    {"start": 0, "end": 10, "speaker": "Doctor", "text": "segmento de texto"},
    {"start": 10, "end": 20, "speaker": "Paciente", "text": "segmento de texto"}
  ],
  "summary": "resumen clínico breve de la consulta",
  "gptLogs": ["Fusioné WebSpeech con Whisper", "Corregí término médico X", "Asigné speaker basado en contexto"]
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body: LLMAuditRequest = await request.json()
    const { transcript, webSpeech, diarization, task } = body

    if (!transcript) {
      return NextResponse.json<LLMAuditResponse>({
        success: false,
        error: 'Transcript is required'
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<LLMAuditResponse>({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    // Check cache first
    const cachedResult = llmCache.get(transcript, task || 'audit-transcript')
    if (cachedResult) {
      console.log('[LLM Audit] Returning cached result')
      llmMetrics.recordCall(true, Date.now() - startTime, 0, undefined, true)
      return NextResponse.json<LLMAuditResponse>({
        success: true,
        data: cachedResult
      })
    }

    // Extract additional context from request
    const { partialTranscripts, confidence, language } = body
    
    const userContent = `
TRANSCRIPCIÓN PRINCIPAL (Whisper):
${transcript}

${webSpeech ? `TRANSCRIPCIÓN WEBSPEECH:
${webSpeech}` : ''}

${diarization && diarization.length > 0 ? `DATOS DE DIARIZACIÓN:
${JSON.stringify(diarization, null, 2)}` : ''}

${partialTranscripts && partialTranscripts.length > 0 ? `TRANSCRIPCIONES PARCIALES:
${partialTranscripts.join('\n')}` : ''}

${confidence ? `CONFIANZA WEBSPEECH: ${confidence}` : ''}

IDIOMA: ${language || 'es-MX'}

TAREA: ${task === 'diarize' ? 'Enfócate en asignar speakers correctamente' : 'Audita y mejora la transcripción'}
`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: MEDICAL_AUDIT_PROMPT },
        { role: 'user', content: userContent }
      ],
      temperature: 0.2,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const result: LLMAuditResult = JSON.parse(responseContent)

    // Validar estructura básica del resultado
    if (!result.mergedTranscript || !Array.isArray(result.speakers)) {
      throw new Error('Invalid response structure from OpenAI')
    }

    // Cache the successful result
    llmCache.set(transcript, task || 'audit-transcript', result)

    // Record metrics
    const tokens = completion.usage?.total_tokens || 0
    llmMetrics.recordCall(true, Date.now() - startTime, tokens)

    return NextResponse.json<LLMAuditResponse>({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('LLM Audit Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to audit transcript'
    llmMetrics.recordCall(false, Date.now() - startTime, 0, errorMessage)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json<LLMAuditResponse>({
        success: false,
        error: `OpenAI API Error: ${error.message}`
      }, { status: error.status || 500 })
    }

    return NextResponse.json<LLMAuditResponse>({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}