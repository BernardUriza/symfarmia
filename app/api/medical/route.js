import { NextResponse } from 'next/server';
import { medicalAIService, MedicalAIError } from '../../services/MedicalAIService.js';
import { MedicalAIConfig } from '../../config/MedicalAIConfig.js';

export async function POST(request) {
  try {
    const { query, context = {}, type = 'diagnosis' } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Validate configuration
    const configErrors = MedicalAIConfig.validateConfig();
    if (configErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Configuration error',
          type: 'configuration_error',
          details: configErrors
        },
        { status: 500 }
      );
    }

    // Use the service layer
    const result = await medicalAIService.processQuery({ query, context, type });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Medical API error:', error);
    
    // Handle MedicalAIError (from service layer)
    if (error instanceof MedicalAIError) {
      return NextResponse.json(
        { 
          error: getErrorMessage(error.status),
          type: error.type,
          details: error.message
        },
        { status: error.status }
      );
    }

    // Handle timeout errors
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          type: 'timeout_error',
          message: 'Request to Hugging Face API timed out'
        },
        { status: 408 }
      );
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error',
          type: 'network_error',
          message: 'Unable to connect to Hugging Face API'
        },
        { status: 503 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        type: 'server_error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

function getErrorMessage(status) {
  const errorMessages = {
    401: 'Invalid Hugging Face token',
    404: 'Model not found',
    429: 'Rate limit exceeded',
    503: 'Service unavailable - model loading'
  };
  return errorMessages[status] || `Hugging Face API error: ${status}`;
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Medical AI API endpoint',
      availableTypes: medicalAIService.getAvailableTypes(),
      usage: 'POST with { query, context?, type? }',
      service: 'SYMFARMIA Medical AI Service v1.0'
    },
    { status: 200 }
  );
}