/**
 * Medical Specialty API Route
 * 
 * Specialized endpoint for vulnerable populations and complex medical scenarios.
 * Supports HIV+ pregnant adolescents and quality of life assessments.
 */

import { NextResponse } from 'next/server';
import { MedicalSpecialtyService } from '../../services/MedicalSpecialtyService.js';
import Logger from '../../../utils/logger.ts';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { specialty, patientContext, testMode } = body;

    Logger.info('Medical Specialty API Request', {
      specialty,
      patientContext: patientContext ? Object.keys(patientContext) : [],
      testMode,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!specialty) {
      return NextResponse.json({
        error: 'Specialty is required',
        supportedSpecialties: ['hiv_pregnancy_adolescent', 'quality_of_life', 'comprehensive']
      }, { status: 400 });
    }

    // Execute specialty service
    let result;
    try {
      result = await MedicalSpecialtyService.testEndpoint(specialty, patientContext || {});
    } catch (serviceError) {
      Logger.error('Specialty Service Error', {
        specialty,
        error: serviceError.message,
        stack: serviceError.stack
      });

      return NextResponse.json({
        error: 'Failed to execute specialty service',
        details: serviceError.message,
        specialty
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;

    Logger.info('Medical Specialty API Success', {
      specialty,
      processingTimeMs: processingTime,
      responseCount: result.responses ? result.responses.length : 0,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        specialty,
        version: '1.0.0'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;

    Logger.error('Medical Specialty API Error', {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for service information
export async function GET() {
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