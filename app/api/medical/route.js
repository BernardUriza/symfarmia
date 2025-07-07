import { NextResponse } from 'next/server';
import { processMedicalQuery, getErrorMessage } from '../../services/MedicalAILogic.js';
import { MedicalAIConfig } from '../../config/MedicalAIConfig.js';

export async function POST(request) {
  try {
    const { query, context = {}, type = 'diagnosis' } = await request.json();
    
    const dependencies = {
      config: MedicalAIConfig,
      httpClient: { fetch: fetch }
    };

    const result = await processMedicalQuery({ query, context, type }, dependencies);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Medical API error:', error);
    
    // Handle configuration errors
    if (error.type === 'configuration_error') {
      return NextResponse.json(
        { 
          error: 'Configuration error',
          type: error.type,
          details: error.details
        },
        { status: 500 }
      );
    }

    // Handle API errors with status codes
    if (error.status && error.type) {
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