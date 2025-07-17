/**
 * Audio Pipeline Integration - "BAZAAR MODE"
 * 
 * INTEGRACIÓN TRANSPARENTE:
 * - Conexión modular con Whisper
 * - Proceso PRE-transcripción
 * - Logging completo del pipeline
 * - Fallback automático sin denoising
 * 
 * FLUJO:
 * Audio Raw → [Denoising] → Whisper → Transcripción
 */

import { clinicalAudioEnhancer } from './ClinicalAudioEnhancer';
import { medicalAudioPersistence } from './MedicalAudioPersistence';

export class AudioPipelineIntegration {
  constructor() {
    this.isEnabled = true;
    this.fallbackMode = false;
    this.processingStats = {
      totalProcessed: 0,
      denoisingEnabled: 0,
      fallbackUsed: 0,
      errors: 0,
      averageProcessingTime: 0,
      qualityImprovement: 0
    };
    
    this.pipelineConfig = {
      enableDenoising: true,
      enableFallback: true,
      enableQualityMetrics: true,
      enablePersistence: true,
      maxRetries: 3,
      timeoutMs: 30000,
      qualityThreshold: 0.5,
      logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    };
    
    this.pipelineLog = [];
    this.qualityMetrics = [];
  }

  /**
   * PROCESO PRINCIPAL - Audio con denoising opcional
   */
  async processAudioWithDenoising(audioData, options = {}) {
    const startTime = Date.now();
    const processId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.logPipeline(processId, 'start', `Processing audio chunk: ${audioData.length} samples`);
    
    try {
      // Validar entrada
      if (!audioData || audioData.length === 0) {
        throw new Error('Invalid audio data provided');
      }
      
      // Configurar opciones
      const processOptions = {
        environment: options.environment || 'consultorio',
        enableQualityMetrics: options.enableQualityMetrics !== false,
        enablePersistence: options.enablePersistence !== false,
        fallbackOnError: options.fallbackOnError !== false,
        ...options
      };
      
      this.logPipeline(processId, 'config', `Options: ${JSON.stringify(processOptions)}`);
      
      let processedAudio = audioData;
      let denoisingResult = null;
      let usedDenoising = false;
      let qualityMetrics = null;
      
      // PASO 1: Aplicar denoising si está habilitado
      if (this.pipelineConfig.enableDenoising && !this.fallbackMode) {
        try {
          this.logPipeline(processId, 'denoising_start', 'Starting audio denoising');
          
          denoisingResult = await clinicalAudioEnhancer.processAudio(audioData, processOptions);
          
          if (denoisingResult && denoisingResult.enhancedAudio) {
            processedAudio = denoisingResult.enhancedAudio;
            usedDenoising = true;
            
            this.logPipeline(processId, 'denoising_success', 
              `Denoising completed in ${denoisingResult.processingTime}ms. ` +
              `Filters: ${Object.keys(denoisingResult.activeFilters).join(', ')}`
            );
            
            // Calcular métricas de calidad
            if (processOptions.enableQualityMetrics) {
              qualityMetrics = await this.calculateQualityMetrics(audioData, processedAudio);
              this.logPipeline(processId, 'quality_metrics', 
                `Quality improvement: ${qualityMetrics.noiseReduction.toFixed(2)}%`
              );
            }
          } else {
            this.logPipeline(processId, 'denoising_skip', 'Denoising returned no enhancement');
          }
          
        } catch (denoisingError) {
          this.logPipeline(processId, 'denoising_error', `Denoising failed: ${denoisingError.message}`);
          
          if (processOptions.fallbackOnError) {
            this.logPipeline(processId, 'denoising_fallback', 'Using original audio due to denoising error');
            processedAudio = audioData;
          } else {
            throw denoisingError;
          }
        }
      } else {
        this.logPipeline(processId, 'denoising_disabled', 'Denoising disabled or in fallback mode');
      }
      
      // PASO 2: Persistir datos si está habilitado
      let persistenceId = null;
      if (processOptions.enablePersistence) {
        try {
          persistenceId = await medicalAudioPersistence.storeAudioData(processedAudio, {
            processId: processId,
            originalLength: audioData.length,
            processedLength: processedAudio.length,
            denoisingUsed: usedDenoising,
            environment: processOptions.environment,
            timestamp: new Date().toISOString()
          });
          
          this.logPipeline(processId, 'persistence_success', `Audio persisted: ${persistenceId}`);
        } catch (persistenceError) {
          this.logPipeline(processId, 'persistence_error', `Persistence failed: ${persistenceError.message}`);
          // No fallar el proceso por errores de persistencia
        }
      }
      
      // PASO 3: Preparar resultado
      const processingTime = Date.now() - startTime;
      
      const result = {
        processId: processId,
        processedAudio: processedAudio,
        originalAudio: audioData,
        denoisingResult: denoisingResult,
        qualityMetrics: qualityMetrics,
        processingTime: processingTime,
        usedDenoising: usedDenoising,
        persistenceId: persistenceId,
        pipelineLog: this.pipelineLog.filter(log => log.processId === processId),
        metadata: {
          environment: processOptions.environment,
          enabledFeatures: {
            denoising: usedDenoising,
            persistence: !!persistenceId,
            qualityMetrics: !!qualityMetrics
          }
        }
      };
      
      // Actualizar estadísticas
      this.updateProcessingStats(result);
      
      this.logPipeline(processId, 'complete', `Pipeline completed in ${processingTime}ms`);
      
      return result;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logPipeline(processId, 'error', `Pipeline failed: ${error.message}`);
      
      // Actualizar estadísticas de error
      this.processingStats.errors++;
      
      // Intentar fallback si está habilitado
      if (this.pipelineConfig.enableFallback && !this.fallbackMode) {
        this.logPipeline(processId, 'fallback_attempt', 'Attempting fallback processing');
        
        try {
          const fallbackResult = await this.fallbackProcessing(audioData, processOptions, processId);
          this.logPipeline(processId, 'fallback_success', 'Fallback processing completed');
          return fallbackResult;
        } catch (fallbackError) {
          this.logPipeline(processId, 'fallback_failed', `Fallback failed: ${fallbackError.message}`);
        }
      }
      
      throw error;
    }
  }

  /**
   * PROCESAMIENTO FALLBACK - modo seguro sin denoising
   */
  async fallbackProcessing(audioData, options, processId) {
    this.logPipeline(processId, 'fallback_start', 'Starting fallback processing');
    
    const startTime = Date.now();
    this.processingStats.fallbackUsed++;
    
    // Procesamiento básico sin denoising
    const result = {
      processId: processId,
      processedAudio: audioData, // Sin modificar
      originalAudio: audioData,
      denoisingResult: null,
      qualityMetrics: null,
      processingTime: Date.now() - startTime,
      usedDenoising: false,
      persistenceId: null,
      fallbackMode: true,
      pipelineLog: this.pipelineLog.filter(log => log.processId === processId),
      metadata: {
        environment: options.environment || 'unknown',
        enabledFeatures: {
          denoising: false,
          persistence: false,
          qualityMetrics: false
        }
      }
    };
    
    this.updateProcessingStats(result);
    
    return result;
  }

  /**
   * CALCULAR MÉTRICAS DE CALIDAD - algoritmo PÚBLICO
   */
  async calculateQualityMetrics(originalAudio, processedAudio) {
    const metrics = {
      noiseReduction: 0,
      signalPreservation: 0,
      processingArtifacts: 0,
      overallQuality: 0
    };
    
    try {
      // Calcular reducción de ruido
      const originalNoise = this.calculateNoiseLevel(originalAudio);
      const processedNoise = this.calculateNoiseLevel(processedAudio);
      metrics.noiseReduction = ((originalNoise - processedNoise) / originalNoise) * 100;
      
      // Calcular preservación de señal
      const originalSignal = this.calculateSignalLevel(originalAudio);
      const processedSignal = this.calculateSignalLevel(processedAudio);
      metrics.signalPreservation = (processedSignal / originalSignal) * 100;
      
      // Detectar artefactos de procesamiento
      metrics.processingArtifacts = this.detectProcessingArtifacts(originalAudio, processedAudio);
      
      // Calcular calidad general
      metrics.overallQuality = (
        (metrics.noiseReduction * 0.4) + 
        (metrics.signalPreservation * 0.4) + 
        ((100 - metrics.processingArtifacts) * 0.2)
      );
      
      // Guardar métricas para análisis
      this.qualityMetrics.push({
        timestamp: new Date(),
        metrics: metrics
      });
      
      // Mantener solo últimas 100 métricas
      if (this.qualityMetrics.length > 100) {
        this.qualityMetrics.shift();
      }
      
      return metrics;
      
    } catch (error) {
      console.error('Error calculating quality metrics:', error);
      return metrics;
    }
  }

  /**
   * CALCULAR NIVEL DE RUIDO - algoritmo PÚBLICO
   */
  calculateNoiseLevel(audioData) {
    let noiseLevel = 0;
    const windowSize = 1024;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      
      // Calcular varianza como proxy del ruido
      let mean = 0;
      for (let j = 0; j < window.length; j++) {
        mean += window[j];
      }
      mean /= window.length;
      
      let variance = 0;
      for (let j = 0; j < window.length; j++) {
        variance += (window[j] - mean) ** 2;
      }
      variance /= window.length;
      
      noiseLevel += Math.sqrt(variance);
    }
    
    return noiseLevel / Math.floor(audioData.length / windowSize);
  }

  /**
   * CALCULAR NIVEL DE SEÑAL - algoritmo PÚBLICO
   */
  calculateSignalLevel(audioData) {
    let signalLevel = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      signalLevel += Math.abs(audioData[i]);
    }
    
    return signalLevel / audioData.length;
  }

  /**
   * DETECTAR ARTEFACTOS DE PROCESAMIENTO - algoritmo PÚBLICO
   */
  detectProcessingArtifacts(originalAudio, processedAudio) {
    let artifactScore = 0;
    
    // Detectar clipping
    let clippingCount = 0;
    for (let i = 0; i < processedAudio.length; i++) {
      if (Math.abs(processedAudio[i]) > 0.95) {
        clippingCount++;
      }
    }
    artifactScore += (clippingCount / processedAudio.length) * 100;
    
    // Detectar distorsión espectral básica
    const originalSpectrum = this.calculateSimpleSpectrum(originalAudio);
    const processedSpectrum = this.calculateSimpleSpectrum(processedAudio);
    
    let spectralDistortion = 0;
    for (let i = 0; i < Math.min(originalSpectrum.length, processedSpectrum.length); i++) {
      spectralDistortion += Math.abs(originalSpectrum[i] - processedSpectrum[i]);
    }
    artifactScore += (spectralDistortion / originalSpectrum.length) * 50;
    
    return Math.min(artifactScore, 100);
  }

  /**
   * CALCULAR ESPECTRO SIMPLE - algoritmo PÚBLICO
   */
  calculateSimpleSpectrum(audioData) {
    const spectrum = new Array(16).fill(0);
    const windowSize = Math.floor(audioData.length / 16);
    
    for (let i = 0; i < 16; i++) {
      const start = i * windowSize;
      const end = Math.min(start + windowSize, audioData.length);
      
      let energy = 0;
      for (let j = start; j < end; j++) {
        energy += audioData[j] * audioData[j];
      }
      
      spectrum[i] = energy / (end - start);
    }
    
    return spectrum;
  }

  /**
   * ACTUALIZAR ESTADÍSTICAS - métricas PÚBLICAS
   */
  updateProcessingStats(result) {
    this.processingStats.totalProcessed++;
    
    if (result.usedDenoising) {
      this.processingStats.denoisingEnabled++;
    }
    
    if (result.fallbackMode) {
      this.processingStats.fallbackUsed++;
    }
    
    // Actualizar tiempo promedio
    this.processingStats.averageProcessingTime = 
      ((this.processingStats.averageProcessingTime * (this.processingStats.totalProcessed - 1)) + 
       result.processingTime) / this.processingStats.totalProcessed;
    
    // Actualizar mejora de calidad promedio
    if (result.qualityMetrics) {
      this.processingStats.qualityImprovement = 
        ((this.processingStats.qualityImprovement * (this.processingStats.denoisingEnabled - 1)) + 
         result.qualityMetrics.overallQuality) / this.processingStats.denoisingEnabled;
    }
  }

  /**
   * LOGGING DEL PIPELINE - cada paso visible
   */
  logPipeline(processId, stage, message) {
    const logEntry = {
      processId: processId,
      timestamp: new Date(),
      stage: stage,
      message: message,
      level: this.getLogLevel(stage)
    };
    
    this.pipelineLog.push(logEntry);
    
    // Mantener solo últimas 1000 entradas
    if (this.pipelineLog.length > 1000) {
      this.pipelineLog.shift();
    }
    
    // Log en consola según nivel
    if (this.shouldLog(logEntry.level)) {
      console.log(`[AudioPipeline] ${processId}:${stage} - ${message}`);
    }
  }

  /**
   * OBTENER NIVEL DE LOG - configuración PÚBLICA
   */
  getLogLevel(stage) {
    const stageLevels = {
      'start': 'info',
      'complete': 'info',
      'error': 'error',
      'fallback_start': 'warn',
      'fallback_success': 'warn',
      'fallback_failed': 'error',
      'denoising_start': 'debug',
      'denoising_success': 'info',
      'denoising_error': 'error',
      'persistence_success': 'debug',
      'persistence_error': 'warn',
      'quality_metrics': 'debug'
    };
    
    return stageLevels[stage] || 'info';
  }

  /**
   * VERIFICAR SI DEBE LOGGEAR - configuración PÚBLICA
   */
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.pipelineConfig.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * CONFIGURAR PIPELINE - configuración PÚBLICA
   */
  configure(config) {
    this.pipelineConfig = {
      ...this.pipelineConfig,
      ...config
    };
    
    this.logPipeline('system', 'configure', `Pipeline configured: ${JSON.stringify(config)}`);
  }

  /**
   * HABILITAR/DESHABILITAR DENOISING - control PÚBLICO
   */
  setDenoisingEnabled(enabled) {
    this.pipelineConfig.enableDenoising = enabled;
    this.logPipeline('system', 'denoising_toggle', `Denoising ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * HABILITAR/DESHABILITAR MODO FALLBACK - control PÚBLICO
   */
  setFallbackMode(enabled) {
    this.fallbackMode = enabled;
    this.logPipeline('system', 'fallback_toggle', `Fallback mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * OBTENER ESTADÍSTICAS - métricas PÚBLICAS
   */
  getStats() {
    return {
      processing: this.processingStats,
      config: this.pipelineConfig,
      qualityHistory: this.qualityMetrics.slice(-20),
      recentLogs: this.pipelineLog.slice(-50),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * OBTENER LOG COMPLETO - auditoría PÚBLICA
   */
  getFullLog(processId = null) {
    if (processId) {
      return this.pipelineLog.filter(log => log.processId === processId);
    }
    
    return this.pipelineLog;
  }

  /**
   * LIMPIAR LOGS - mantenimiento PÚBLICO
   */
  clearLogs() {
    this.pipelineLog = [];
    this.qualityMetrics = [];
    this.logPipeline('system', 'logs_cleared', 'All logs cleared');
  }

  /**
   * RESET ESTADÍSTICAS - mantenimiento PÚBLICO
   */
  resetStats() {
    this.processingStats = {
      totalProcessed: 0,
      denoisingEnabled: 0,
      fallbackUsed: 0,
      errors: 0,
      averageProcessingTime: 0,
      qualityImprovement: 0
    };
    
    this.logPipeline('system', 'stats_reset', 'Processing statistics reset');
  }
}

// INSTANCIA SINGLETON - acceso PÚBLICO
export const audioPipelineIntegration = new AudioPipelineIntegration();

// CONFIGURACIÓN POR DEFECTO - PÚBLICA
export const DEFAULT_PIPELINE_CONFIG = {
  enableDenoising: true,
  enableFallback: true,
  enableQualityMetrics: true,
  enablePersistence: true,
  maxRetries: 3,
  timeoutMs: 30000,
  qualityThreshold: 0.5,
  logLevel: 'info'
};