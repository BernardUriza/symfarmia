/**
 * Medical Specialty API Route
 * 
 * Specialized endpoint for vulnerable populations and complex medical scenarios.
 * Supports HIV+ pregnant adolescents and quality of life assessments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MedicalSpecialtyService } from '../../services/MedicalSpecialtyService.js';
import Logger from '../../../src/utils/logger.js';

interface SpecialtyRequest {
  specialty: string;
  patientContext?: Record<string, any>;
  testMode?: boolean;
}

interface SpecialtyResponse {
  success?: boolean;
  data?: any;
  metadata?: {
    processingTimeMs: number;
    timestamp: string;
    specialty: string;
    version: string;
  };
  error?: string;
  details?: string;
  supportedSpecialties?: string[];
  timestamp?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SpecialtyResponse>> {
  const startTime = Date.now();
  
  try {
    const body = await request.json() as SpecialtyRequest;
    const { specialty, patientContext, testMode } = body;

    Logger.info('Medical Specialty API Request', {
      specialty,
      patientContext: patientContext ? Object.keys(patientContext) : [],
      testMode,
      timestamp: new Date().toISOString()
    } as any);

    // Validate required fields
    if (!specialty || typeof specialty !== 'string') {
      return NextResponse.json<SpecialtyResponse>({
        error: 'Specialty is required',
        supportedSpecialties: ['hiv_pregnancy_adolescent', 'quality_of_life', 'comprehensive']
      }, { status: 400 });
    }

    // Execute specialty service
    let result;
    try {
      result = await MedicalSpecialtyService.testEndpoint(specialty, patientContext || {});
    } catch (serviceError: any) {
      Logger.error('Specialty Service Error', {
        specialty,
        error: serviceError.message,
        stack: serviceError.stack
      } as any);

      return NextResponse.json<SpecialtyResponse>({
        error: 'Failed to execute specialty service',
        details: serviceError.message
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;

    Logger.info('Medical Specialty API Success', {
      specialty,
      processingTimeMs: processingTime,
      responseCount: result.responses ? result.responses.length : 0,
      timestamp: new Date().toISOString()
    } as any);

    return NextResponse.json<SpecialtyResponse>({
      success: true,
      data: result,
      metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        specialty,
        version: '1.0.0'
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    Logger.error('Medical Specialty API Error', {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    } as any);

    return NextResponse.json<SpecialtyResponse>({
      error: 'Internal server error',
      details: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for service information
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: 'Medical Specialty Service',
    version: '1.0.0',
    description: 'Specialized medical AI for vulnerable populations',
    supportedSpecialties: [
      {
        name: 'hiv_pregnancy_adolescent',
        description: 'HIV management in pregnant adolescents',
        priority: 'CRITICAL'
      },
      {
        name: 'quality_of_life',
        description: 'Quality of life assessment and improvement',
        priority: 'HIGH'
      },
      {
        name: 'comprehensive',
        description: 'Combined assessment for complex cases',
        priority: 'CRITICAL'
      }
    ],
    usage: {
      endpoint: '/api/medical-specialty',
      method: 'POST',
      body: {
        specialty: 'string (required)',
        patientContext: 'object (optional)',
        testMode: 'boolean (optional)'
      }
    }
  });
}