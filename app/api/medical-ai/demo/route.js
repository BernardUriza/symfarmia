import { NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '@/app/services/MedicalAILogic.js';
import { MedicalAIConfig } from '@/app/config/MedicalAIConfig.js';

const dependencies = {
  config: MedicalAIConfig,
  httpClient: {
    fetch: (...args) => globalThis.fetch(...args)
  }
};

const MEDICAL_KEYWORDS = [
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

function generateContextualResponse(text) {
  if (/^hola\b/i.test(text.trim())) {
    return 'Hola, soy tu asistente médico. ¿En qué puedo ayudarte hoy?';
  }
  return 'Cuéntame más sobre tu consulta médica.';
}

export async function POST(request) {
  try {
    const { input } = await request.json();
    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const isMedical = MEDICAL_KEYWORDS.some(k => input.toLowerCase().includes(k));

    if (isMedical) {
      const result = await processMedicalQuery({ query: input, type: 'diagnosis' }, dependencies);
      return NextResponse.json({ success: true, ...result });
    }

    const response = generateContextualResponse(input);
    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error.status) || 'Internal server error',
        details: error.message,
        status: error.status || 500
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Medical AI Demo endpoint',
    usage: 'POST { input: string }',
    success: true
  });
}
