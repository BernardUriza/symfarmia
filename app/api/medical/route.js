import { NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '@/services/MedicalAILogic';
import { MedicalAIConfig } from '@/config/MedicalAIConfig';

// Utiliza tipos explícitos y un solo punto de entrada para dependencias
const dependencies = {
  config: MedicalAIConfig,
  httpClient: { fetch }
};

export async function POST(request) {
  try {
    const { query, type = 'diagnosis' } = await request.json();
    const result = await processMedicalQuery({ query, type }, dependencies);
    return NextResponse.json(result);
  } catch (error) {
    // Brutalidad absoluta en errores, un solo bloque, limpieza total
    return NextResponse.json(
      {
        error: getErrorMessage(error.status) || 'Internal server error',
        type: error.type || 'server_error',
        details: error.details || error.message,
        ...(error.name === 'AbortError' && {
          error: 'Request timeout',
          type: 'timeout_error',
          message: 'Request to Hugging Face API timed out'
        }),
        ...(error.name === 'TypeError' && error.message?.includes('fetch') && {
          error: 'Network error',
          type: 'network_error',
          message: 'Unable to connect to Hugging Face API'
        }),
        ...(error.type === 'configuration_error' && {
          error: 'Configuration error',
        })
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Medical AI API endpoint',
      availableTypes: MedicalAIConfig.getAvailableTypes(),
      usage: 'POST with { query, context?, type? }',
      service: 'SYMFARMIA Medical AI Service v1.0'
    },
    { status: 200 }
  );
}