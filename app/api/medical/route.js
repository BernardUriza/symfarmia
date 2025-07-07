import { NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '../../services/MedicalAILogic.js';
import { MedicalAIConfig } from '../../config/MedicalAIConfig.js';
// Dependency injection point, explicit, one place
const dependencies = {
  config: MedicalAIConfig,
  httpClient: {
    fetch: (...args) => globalThis.fetch(...args)
  }
};

export async function POST(request) {
  try {
    const { query, type = 'diagnosis' } = await request.json();
    const result = await processMedicalQuery({ query, type }, dependencies);
    return NextResponse.json(result);
  } catch (error) {
    // Deep log brutal: logea TODO, sin piedad
    console.error('[Medical API DeepLog]', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      details: error.details,
      stack: error.stack,
      ...(error.response && { response: error.response })
    });

    // Hugging Face error exposure
    if (error.type === 'huggingface_error') {
      return NextResponse.json(
        {
          error: 'Hugging Face API error',
          status: error.status,
          details: error.details,
          message: error.message,
          stack: error.stack,
        },
        { status: error.status || 502 }
      );
    }

    // Configuration error
    if (error.type === 'configuration_error') {
      return NextResponse.json(
        {
          error: 'Hugging Face token not configured',
          type: error.type,
          details: error.details || error.message,
        },
        { status: 500 }
      );
    }

    // Validation error
    if (error.type === 'validation_error') {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
        },
        { status: error.status || 400 }
      );
    }

    // Timeout error
    if (error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'Request timeout',
          type: 'timeout_error',
          message: 'Request to Hugging Face API timed out',
          stack: error.stack,
        },
        { status: 408 }
      );
    }

    // Network error
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Network error',
          type: 'network_error',
          message: 'Unable to connect to Hugging Face API',
          stack: error.stack,
        },
        { status: 503 }
      );
    }

    // Otros errores: show all
    return NextResponse.json(
      {
        error: getErrorMessage(error.status) || 'Internal server error',
        type: error.type || 'server_error',
        details: error.details || error.message,
        stack: error.stack,
        status: error.status || 500,
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