import { NextRequest, NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '@/app/services/MedicalAILogic.js';
import { MedicalAIConfig } from '@/app/config/MedicalAIConfig.js';

interface MedicalRequest {
  query: string;
  type?: string;
  context?: Record<string, unknown>;
}

interface ErrorResponse {
  error: string;
  type?: string;
  details?: string;
  message?: string;
  stack?: string;
  status?: number;
}

interface MedicalError extends Error {
  status?: number;
  type?: string;
  details?: string;
  response?: string;
}

// Dependency injection point, explicit, one place
const dependencies = {
  config: MedicalAIConfig,
  httpClient: {
    fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args)
  }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as MedicalRequest;
    const { query, type = 'diagnosis' } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Query is required', type: 'validation_error' },
        { status: 400 }
      );
    }
    
    const result = await processMedicalQuery({ query, type, context: body.context || {} }, dependencies);
    return NextResponse.json(result);
  } catch (error) {
    const medicalError = error as MedicalError;
    // Deep log brutal: logea TODO, sin piedad
    console.error('[Medical API DeepLog]', {
      name: medicalError.name,
      message: medicalError.message,
      status: medicalError.status,
      type: medicalError.type,
      details: medicalError.details,
      stack: medicalError.stack,
      ...(medicalError.response && { response: medicalError.response })
    });

    // Hugging Face error exposure
    if (medicalError.type === 'huggingface_error') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Hugging Face API error',
          status: medicalError.status,
          details: medicalError.details,
          message: medicalError.message,
          stack: medicalError.stack,
        },
        { status: medicalError.status || 502 }
      );
    }

    // Configuration error
    if (medicalError.type === 'configuration_error') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Hugging Face token not configured',
          type: medicalError.type,
          details: medicalError.details || medicalError.message,
        },
        { status: 500 }
      );
    }

    // Validation error
    if (medicalError.type === 'validation_error') {
      return NextResponse.json<ErrorResponse>(
        {
          error: medicalError.message,
          type: medicalError.type,
        },
        { status: medicalError.status || 400 }
      );
    }

    // Timeout error
    if (medicalError.name === 'AbortError') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Request timeout',
          type: 'timeout_error',
          message: 'Request to Hugging Face API timed out',
          stack: medicalError.stack,
        },
        { status: 408 }
      );
    }

    // Network error
    if (medicalError.name === 'TypeError' && medicalError.message?.includes('fetch')) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Network error',
          type: 'network_error',
          message: 'Unable to connect to Hugging Face API',
          stack: medicalError.stack,
        },
        { status: 503 }
      );
    }

    // Otros errores: show all
    return NextResponse.json<ErrorResponse>(
      {
        error: getErrorMessage(medicalError.status || 500) || 'Internal server error',
        type: medicalError.type || 'server_error',
        details: medicalError.details || medicalError.message,
        stack: medicalError.stack,
        status: medicalError.status || 500,
      },
      { status: medicalError.status || 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
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