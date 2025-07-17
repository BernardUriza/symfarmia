/**
 * API Endpoints para ClinicalAudioEnhancer - "BAZAAR MODE"
 * 
 * ENDPOINTS PÚBLICOS:
 * - GET /api/audio/denoising/status - Estado del sistema
 * - GET /api/audio/denoising/metrics - Métricas de rendimiento
 * - GET /api/audio/denoising/config - Configuración actual
 * - POST /api/audio/denoising/config - Actualizar configuración
 * - POST /api/audio/denoising/process - Procesar audio
 * - POST /api/audio/denoising/benchmark - Ejecutar benchmark
 * - GET /api/audio/denoising/audit - Log de auditoría
 * - GET /api/audio/denoising/export - Exportar configuración
 * - POST /api/audio/denoising/import - Importar configuración
 */

import { NextResponse } from 'next/server';
import { clinicalAudioEnhancer } from '@/src/domains/medical-ai/services/ClinicalAudioEnhancer';

export async function GET(request, { params }) {
  try {
    const { param } = params;
    const endpoint = param?.[0] || 'status';
    
    switch (endpoint) {
      case 'status':
        return handleGetStatus();
      
      case 'metrics':
        return handleGetMetrics();
      
      case 'config':
        return handleGetConfig();
      
      case 'audit':
        return handleGetAudit();
      
      case 'export':
        return handleExportConfig();
      
      default:
        return NextResponse.json(
          { error: `Endpoint not found: ${endpoint}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error in denoising API:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { param } = params;
    const endpoint = param?.[0] || 'process';
    
    switch (endpoint) {
      case 'process':
        return handleProcessAudio(request);
      
      case 'config':
        return handleUpdateConfig(request);
      
      case 'benchmark':
        return handleBenchmark(request);
      
      case 'import':
        return handleImportConfig(request);
      
      default:
        return NextResponse.json(
          { error: `Endpoint not found: ${endpoint}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Error in denoising API:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audio/denoising/status - Estado del sistema
 */
async function handleGetStatus() {
  const state = clinicalAudioEnhancer.getFullState();
  
  return NextResponse.json({
    success: true,
    data: {
      isInitialized: state.isInitialized,
      modelName: state.modelName,
      currentEnvironment: state.systemState.currentEnvironment,
      isProcessing: state.systemState.isProcessing,
      lastError: state.systemState.lastError,
      configVersion: state.systemState.configVersion,
      debugMode: state.systemState.debugMode,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * GET /api/audio/denoising/metrics - Métricas de rendimiento
 */
async function handleGetMetrics() {
  const metrics = clinicalAudioEnhancer.getProcessingMetrics();
  
  return NextResponse.json({
    success: true,
    data: {
      processing: {
        totalProcessed: metrics.totalProcessed,
        successRate: metrics.successRate,
        averageProcessingTime: metrics.averageProcessingTime,
        errorCount: metrics.errorCount,
        lastProcessingTime: metrics.lastProcessingTime
      },
      quality: {
        noiseReductionEffectiveness: metrics.noiseReductionEffectiveness,
        alarmPreservationRate: metrics.alarmPreservationRate
      },
      performance: {
        history: metrics.performanceHistory.slice(-20), // Últimos 20 puntos
        currentLoad: metrics.systemState.isProcessing ? 1 : 0
      },
      system: {
        modelName: metrics.systemState.modelVersion,
        environment: metrics.systemState.currentEnvironment,
        configVersion: metrics.systemState.configVersion
      },
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * GET /api/audio/denoising/config - Configuración actual
 */
async function handleGetConfig() {
  const state = clinicalAudioEnhancer.getFullState();
  
  return NextResponse.json({
    success: true,
    data: {
      noiseTypes: state.config.noiseTypes,
      environments: state.config.environments,
      global: state.config.global,
      currentEnvironment: state.systemState.currentEnvironment,
      configVersion: state.systemState.configVersion,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * POST /api/audio/denoising/config - Actualizar configuración
 */
async function handleUpdateConfig(request) {
  const body = await request.json();
  
  if (!body.config) {
    return NextResponse.json(
      { error: 'Missing config in request body' },
      { status: 400 }
    );
  }
  
  // Validar configuración
  const validationResult = validateConfig(body.config);
  if (!validationResult.valid) {
    return NextResponse.json(
      { error: `Invalid configuration: ${validationResult.error}` },
      { status: 400 }
    );
  }
  
  clinicalAudioEnhancer.configure(body.config);
  
  return NextResponse.json({
    success: true,
    message: 'Configuration updated successfully',
    data: {
      updatedConfig: body.config,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * POST /api/audio/denoising/process - Procesar audio
 */
async function handleProcessAudio(request) {
  const body = await request.json();
  
  if (!body.audioData) {
    return NextResponse.json(
      { error: 'Missing audioData in request body' },
      { status: 400 }
    );
  }
  
  // Convertir array a Float32Array
  const audioData = new Float32Array(body.audioData);
  const options = body.options || {};
  
  try {
    const result = await clinicalAudioEnhancer.processAudio(audioData, options);
    
    return NextResponse.json({
      success: true,
      data: {
        enhancedAudio: Array.from(result.enhancedAudio),
        noiseClassifications: result.noiseClassifications,
        activeFilters: result.activeFilters,
        processingTime: result.processingTime,
        fallbackMode: result.fallbackMode || false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audio/denoising/benchmark - Ejecutar benchmark
 */
async function handleBenchmark(request) {
  const body = await request.json();
  
  if (!body.testSamples || !Array.isArray(body.testSamples)) {
    return NextResponse.json(
      { error: 'Missing or invalid testSamples in request body' },
      { status: 400 }
    );
  }
  
  try {
    // Convertir samples a formato correcto
    const testSamples = body.testSamples.map(sample => ({
      id: sample.id,
      audioData: new Float32Array(sample.audioData),
      options: sample.options || {}
    }));
    
    const benchmarkResult = await clinicalAudioEnhancer.benchmarkModel(testSamples);
    
    return NextResponse.json({
      success: true,
      data: benchmarkResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Benchmark failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audio/denoising/audit - Log de auditoría
 */
async function handleGetAudit() {
  const state = clinicalAudioEnhancer.getFullState();
  
  return NextResponse.json({
    success: true,
    data: {
      auditLog: state.auditLog,
      processingLog: state.processingLog,
      totalEntries: state.auditLog.length,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * GET /api/audio/denoising/export - Exportar configuración
 */
async function handleExportConfig() {
  const exportData = clinicalAudioEnhancer.exportConfiguration();
  
  return NextResponse.json({
    success: true,
    data: exportData,
    timestamp: new Date().toISOString()
  });
}

/**
 * POST /api/audio/denoising/import - Importar configuración
 */
async function handleImportConfig(request) {
  const body = await request.json();
  
  if (!body.configData) {
    return NextResponse.json(
      { error: 'Missing configData in request body' },
      { status: 400 }
    );
  }
  
  try {
    clinicalAudioEnhancer.importConfiguration(body.configData);
    
    return NextResponse.json({
      success: true,
      message: 'Configuration imported successfully',
      data: {
        importedVersion: body.configData.version,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Import failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Validar configuración
 */
function validateConfig(config) {
  try {
    // Validar estructura básica
    if (!config.noiseTypes || typeof config.noiseTypes !== 'object') {
      return { valid: false, error: 'Missing or invalid noiseTypes' };
    }
    
    if (!config.environments || typeof config.environments !== 'object') {
      return { valid: false, error: 'Missing or invalid environments' };
    }
    
    if (!config.global || typeof config.global !== 'object') {
      return { valid: false, error: 'Missing or invalid global config' };
    }
    
    // Validar tipos de ruido
    for (const [noiseType, noiseConfig] of Object.entries(config.noiseTypes)) {
      if (typeof noiseConfig.enabled !== 'boolean') {
        return { valid: false, error: `Invalid enabled value for ${noiseType}` };
      }
      
      if (typeof noiseConfig.threshold !== 'number' || noiseConfig.threshold < 0 || noiseConfig.threshold > 1) {
        return { valid: false, error: `Invalid threshold value for ${noiseType}` };
      }
      
      if (typeof noiseConfig.filterStrength !== 'number' || noiseConfig.filterStrength < 0 || noiseConfig.filterStrength > 1) {
        return { valid: false, error: `Invalid filterStrength value for ${noiseType}` };
      }
    }
    
    // Validar ambientes
    for (const [envName, envConfig] of Object.entries(config.environments)) {
      if (!Array.isArray(envConfig.enabledNoises)) {
        return { valid: false, error: `Invalid enabledNoises for environment ${envName}` };
      }
      
      if (typeof envConfig.globalThreshold !== 'number' || envConfig.globalThreshold < 0 || envConfig.globalThreshold > 1) {
        return { valid: false, error: `Invalid globalThreshold for environment ${envName}` };
      }
      
      if (typeof envConfig.preserveAlarms !== 'boolean') {
        return { valid: false, error: `Invalid preserveAlarms for environment ${envName}` };
      }
      
      if (typeof envConfig.aggressiveness !== 'number' || envConfig.aggressiveness < 0 || envConfig.aggressiveness > 1) {
        return { valid: false, error: `Invalid aggressiveness for environment ${envName}` };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}