import { NextRequest, NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '@/app/services/MedicalAILogic';
import { MedicalAIConfig } from '@/app/config/MedicalAIConfig.js';

interface MedicalAIRequest {
  input: string;
}

interface MedicalAIResponse {
  success: boolean;
  response?: string;
  confidence?: number;
  reasoning?: string[];
  suggestions?: string[];
  disclaimer?: string;
  sources?: string[];
  error?: string;
  details?: string;
  status?: number;
}

const dependencies = {
  config: MedicalAIConfig,
  httpClient: {
    fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args)
  }
};

const MEDICAL_KEYWORDS: string[] = [
  'duele',
  'dolor',
  'enfermo',
  'síntoma',
  'fiebre',
  'cabeza',
  'estómago',
  'tos',
  'mareo',
  'náusea'
];

function generateContextualResponse(text: string): string {
  if (/^hola\b/i.test(text.trim())) {
    return 'Hola, soy tu asistente médico. ¿En qué puedo ayudarte hoy?';
  }
  return 'Cuéntame más sobre tu consulta médica.';
}

export async function POST(request: NextRequest): Promise<NextResponse<MedicalAIResponse>> {
  try {
    const body = await request.json() as MedicalAIRequest;
    const { input } = body;
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json<MedicalAIResponse>(
        { success: false, error: 'Input is required' }, 
        { status: 400 }
      );
    }

    const isMedical = MEDICAL_KEYWORDS.some(k => input.toLowerCase().includes(k));

    if (isMedical) {
      const result = await processMedicalQuery(
        { query: input, type: 'diagnosis', context: {} }, 
        dependencies
      );
      return NextResponse.json<MedicalAIResponse>({ success: true, ...result });
    }

    const response = generateContextualResponse(input);
    return NextResponse.json<MedicalAIResponse>({ success: true, response });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const errorStatus = err?.status || 500;
    return NextResponse.json<MedicalAIResponse>(
      {
        success: false,
        error: getErrorMessage(errorStatus) || 'Internal server error',
        details: err?.message || 'Unknown error',
        status: errorStatus
      },
      { status: errorStatus }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Medical AI Demo endpoint',
    usage: 'POST { input: string }',
    success: true
  });
}
