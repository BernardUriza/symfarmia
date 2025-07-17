/**
 * Clinical Audio Enhancer - "BAZAAR MODE"
 * 
 * FILOSOFÍA BAZAR:
 * - Ningún algoritmo oculto
 * - Cada cambio es commit público
 * - Proceso completamente auditable
 * - Forking y mejoras sin fricción
 * 
 * OBJETIVO: Eliminar ruido clínico del audio PRE-Whisper
 * PRINCIPIO: Modular, documentado, endpoints abiertos
 */

import { pipeline as createPipeline } from '@xenova/transformers';
import { configureTransformers } from '../config/transformersConfig';

export class ClinicalAudioEnhancer {
  constructor() {
    this.modelName = 'Xenova/speech-enhancement'; // PÚBLICO - cambiar aquí y hacer commit
    this.isInitialized = false;
    this.pipeline = null;
    this.initializationPromise = null;
    
    // CONFIGURACIÓN AUDITABLE - TODO visible y parametrizable
    this.config = {
      // Tipos de ruido clínico - catálogo PÚBLICO
      noiseTypes: {
        monitors: { enabled: true, threshold: 0.7, filterStrength: 0.8 },
        alarms: { enabled: true, threshold: 0.6, filterStrength: 0.4 }, // MÁS SUAVE para alarmas
        ventilators: { enabled: true, threshold: 0.8, filterStrength: 0.9 },
        airconditioner: { enabled: true, threshold: 0.5, filterStrength: 0.7 },
        footsteps: { enabled: true, threshold: 0.4, filterStrength: 0.6 },
        paperwork: { enabled: true, threshold: 0.3, filterStrength: 0.5 },
        keyboard: { enabled: true, threshold: 0.2, filterStrength: 0.4 },
        phoneRings: { enabled: true, threshold: 0.7, filterStrength: 0.8 },
        doorSlams: { enabled: true, threshold: 0.8, filterStrength: 0.9 },
        conversations: { enabled: false, threshold: 0.1, filterStrength: 0.1 } // DESHABILITADO por defecto
      },
      
      // Ambientes configurables - profiles import/export
      environments: {
        consultorio: {
          name: 'Consultorio General',
          enabledNoises: ['monitors', 'airconditioner', 'footsteps', 'paperwork'],
          globalThreshold: 0.5,
          preserveAlarms: true,
          aggressiveness: 0.6
        },
        urgencias: {
          name: 'Urgencias',
          enabledNoises: ['monitors', 'alarms', 'ventilators', 'footsteps', 'conversations'],
          globalThreshold: 0.4,
          preserveAlarms: true,
          aggressiveness: 0.7
        },
        uci: {
          name: 'UCI',
          enabledNoises: ['monitors', 'alarms', 'ventilators'],
          globalThreshold: 0.3,
          preserveAlarms: true,
          aggressiveness: 0.5 // MÁS SUAVE en UCI
        },
        cirugia: {
          name: 'Cirugía',
          enabledNoises: ['monitors', 'alarms', 'ventilators', 'footsteps'],
          globalThreshold: 0.6,
          preserveAlarms: true,
          aggressiveness: 0.8
        }
      },
      
      // Configuración global - TODO parametrizable
      global: {
        preserveCriticalAlarms: true,
        enableRealTimeMetrics: true,
        logAllAdjustments: true,
        enableAuditMode: true,
        maxProcessingTime: 30000, // 30 segundos máximo
        enableFallbackMode: true,
        fallbackThreshold: 0.3
      }
    };
    
    // Métricas y logging - TODO accesible públicamente
    this.metrics = {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      noiseReductionEffectiveness: 0,
      alarmPreservationRate: 0,
      errorCount: 0,
      lastProcessingTime: null,
      performanceHistory: []
    };
    
    // Logging auditable - cada ajuste debe ser visible
    this.auditLog = [];
    this.processingLog = [];
    
    // Clasificador de ruidos - algoritmo PÚBLICO
    this.noiseClassifier = null;
    
    // Estado del sistema - siempre visible
    this.systemState = {
      isProcessing: false,
      currentEnvironment: 'consultorio',
      lastError: null,
      modelVersion: null,
      configVersion: '1.0.0',
      debugMode: false
    };
  }

  /**
   * INICIALIZACIÓN PÚBLICA - proceso completamente auditable
   */
  async initialize() {
    if (this.isInitialized) {
      this.logAudit('initialize', 'Already initialized - skipping');
      return;
    }
    
    if (this.initializationPromise) {
      this.logAudit('initialize', 'Waiting for existing initialization');
      await this.initializationPromise;
      return;
    }
    
    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  /**
   * INICIALIZACIÓN REAL - TODO visible y auditable
   */
  async performInitialization() {
    try {
      this.logAudit('performInitialization', 'Starting model initialization');
      
      // Configurar transformers
      await configureTransformers();
      
      // Cargar modelo de denoising - PÚBLICO
      this.pipeline = await createPipeline(
        'audio-classification', // Cambiar por 'speech-enhancement' cuando esté disponible
        this.modelName,
        {
          progress_callback: (progress) => {
            this.logAudit('modelLoading', `Progress: ${progress.progress || 0}%`);
          },
          revision: 'main'
        }
      );
      
      // Inicializar clasificador de ruidos
      await this.initializeNoiseClassifier();
      
      this.isInitialized = true;
      this.systemState.modelVersion = this.modelName;
      this.systemState.lastError = null;
      
      this.logAudit('performInitialization', 'Model initialized successfully');
      
    } catch (error) {
      this.systemState.lastError = error.message;
      this.logAudit('performInitialization', `Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * INICIALIZAR CLASIFICADOR DE RUIDOS - algoritmo PÚBLICO
   */
  async initializeNoiseClassifier() {
    // ALGORITMO PÚBLICO - classification basada en características de audio
    this.noiseClassifier = {
      // Frecuencias características de cada tipo de ruido (Hz)
      signatures: {
        monitors: { freq: [800, 1200, 2000], pattern: 'beep' },
        alarms: { freq: [1000, 1500, 2500], pattern: 'continuous' },
        ventilators: { freq: [200, 400, 600], pattern: 'rhythmic' },
        airconditioner: { freq: [100, 200, 300], pattern: 'white_noise' },
        footsteps: { freq: [50, 100, 200], pattern: 'transient' },
        paperwork: { freq: [1000, 2000, 4000], pattern: 'crinkle' },
        keyboard: { freq: [2000, 4000, 8000], pattern: 'click' },
        phoneRings: { freq: [440, 880, 1320], pattern: 'ring' },
        doorSlams: { freq: [80, 160, 320], pattern: 'bang' },
        conversations: { freq: [300, 1000, 3000], pattern: 'speech' }
      },
      
      // Método de clasificación - PÚBLICO y auditable
      classify: (audioFeatures) => {
        // Simple frequency-based classification
        const classifications = {};
        
        Object.entries(this.noiseClassifier.signatures).forEach(([noiseType, signature]) => {
          const confidence = this.calculateNoiseConfidence(audioFeatures, signature);
          classifications[noiseType] = confidence;
        });
        
        return classifications;
      }
    };
    
    this.logAudit('initializeNoiseClassifier', 'Noise classifier initialized');
  }

  /**
   * CALCULAR CONFIANZA DE RUIDO - algoritmo PÚBLICO
   */
  calculateNoiseConfidence(audioFeatures, signature) {
    // ALGORITMO SIMPLE Y AUDITABLE
    let confidence = 0;
    
    // Análisis básico de frecuencias
    if (audioFeatures.dominantFrequencies) {
      const freqMatch = signature.freq.some(freq => 
        audioFeatures.dominantFrequencies.some(audioFreq => 
          Math.abs(audioFreq - freq) < 50 // Tolerancia de 50Hz
        )
      );
      
      if (freqMatch) confidence += 0.5;
    }
    
    // Análisis básico de patrón
    if (audioFeatures.pattern === signature.pattern) {
      confidence += 0.3;
    }
    
    // Análisis de energía
    if (audioFeatures.energy > 0.1) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * PROCESAR AUDIO - función principal PÚBLICA
   */
  async processAudio(audioData, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.systemState.isProcessing = true;
    const startTime = Date.now();
    
    try {
      this.logAudit('processAudio', `Starting audio processing (${audioData.length} samples)`);
      
      // Aplicar ambiente si está especificado
      if (options.environment) {
        this.applyEnvironmentProfile(options.environment);
      }
      
      // Analizar características del audio
      const audioFeatures = this.analyzeAudioFeatures(audioData);
      
      // Clasificar ruidos presentes
      const noiseClassifications = this.noiseClassifier.classify(audioFeatures);
      
      // Determinar qué filtros aplicar
      const activeFilters = this.determineActiveFilters(noiseClassifications);
      
      // Aplicar filtros de denoising
      const enhancedAudio = await this.applyDenoising(audioData, activeFilters);
      
      // Verificar preservación de alarmas críticas
      if (this.config.global.preserveCriticalAlarms) {
        await this.verifyAlarmPreservation(audioData, enhancedAudio, noiseClassifications);
      }
      
      // Actualizar métricas
      this.updateMetrics(startTime, true);
      
      this.logAudit('processAudio', 'Audio processing completed successfully');
      
      return {
        enhancedAudio: enhancedAudio,
        originalAudio: audioData,
        noiseClassifications: noiseClassifications,
        activeFilters: activeFilters,
        metrics: this.getProcessingMetrics(),
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      this.updateMetrics(startTime, false);
      this.systemState.lastError = error.message;
      this.logAudit('processAudio', `Processing failed: ${error.message}`);
      
      // Fallback mode
      if (this.config.global.enableFallbackMode) {
        return this.fallbackProcessing(audioData, options);
      }
      
      throw error;
    } finally {
      this.systemState.isProcessing = false;
    }
  }

  /**
   * ANALIZAR CARACTERÍSTICAS DE AUDIO - algoritmo PÚBLICO
   */
  analyzeAudioFeatures(audioData) {
    // ANÁLISIS BÁSICO Y AUDITABLE
    const features = {
      length: audioData.length,
      sampleRate: 16000, // Asumido
      energy: 0,
      dominantFrequencies: [],
      pattern: 'unknown',
      silenceRatio: 0,
      dynamicRange: 0
    };
    
    // Calcular energía total
    let totalEnergy = 0;
    let silentSamples = 0;
    let min = Infinity;
    let max = -Infinity;
    
    for (let i = 0; i < audioData.length; i++) {
      const sample = audioData[i];
      totalEnergy += sample * sample;
      
      if (Math.abs(sample) < 0.001) {
        silentSamples++;
      }
      
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    
    features.energy = totalEnergy / audioData.length;
    features.silenceRatio = silentSamples / audioData.length;
    features.dynamicRange = max - min;
    
    // Análisis de frecuencias simplificado (FFT básico sería ideal)
    features.dominantFrequencies = this.extractDominantFrequencies(audioData);
    
    // Clasificación de patrón básica
    features.pattern = this.classifyAudioPattern(audioData);
    
    return features;
  }

  /**
   * EXTRAER FRECUENCIAS DOMINANTES - algoritmo PÚBLICO
   */
  extractDominantFrequencies(audioData) {
    // IMPLEMENTACIÓN BÁSICA - mejorar con FFT real
    const frequencies = [];
    const windowSize = 1024;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const dominantFreq = this.findDominantFrequency(window);
      if (dominantFreq > 0) {
        frequencies.push(dominantFreq);
      }
    }
    
    return frequencies;
  }

  /**
   * ENCONTRAR FRECUENCIA DOMINANTE - algoritmo PÚBLICO
   */
  findDominantFrequency(window) {
    // IMPLEMENTACIÓN BÁSICA - zero-crossing rate
    let crossings = 0;
    
    for (let i = 1; i < window.length; i++) {
      if ((window[i] > 0 && window[i-1] < 0) || (window[i] < 0 && window[i-1] > 0)) {
        crossings++;
      }
    }
    
    const sampleRate = 16000;
    const frequency = (crossings / 2) * (sampleRate / window.length);
    
    return frequency;
  }

  /**
   * CLASIFICAR PATRÓN DE AUDIO - algoritmo PÚBLICO
   */
  classifyAudioPattern(audioData) {
    const features = {
      variance: 0,
      peakCount: 0,
      rhythmicity: 0
    };
    
    // Calcular varianza
    let mean = 0;
    for (let i = 0; i < audioData.length; i++) {
      mean += audioData[i];
    }
    mean /= audioData.length;
    
    for (let i = 0; i < audioData.length; i++) {
      features.variance += (audioData[i] - mean) ** 2;
    }
    features.variance /= audioData.length;
    
    // Contar picos
    for (let i = 1; i < audioData.length - 1; i++) {
      if (audioData[i] > audioData[i-1] && audioData[i] > audioData[i+1] && Math.abs(audioData[i]) > 0.1) {
        features.peakCount++;
      }
    }
    
    // Clasificar patrón
    if (features.peakCount > 100) return 'beep';
    if (features.variance > 0.1) return 'white_noise';
    if (features.peakCount > 20) return 'click';
    if (features.peakCount > 5) return 'transient';
    return 'continuous';
  }

  /**
   * DETERMINAR FILTROS ACTIVOS - lógica PÚBLICA
   */
  determineActiveFilters(noiseClassifications) {
    const activeFilters = {};
    const currentEnv = this.config.environments[this.systemState.currentEnvironment];
    
    Object.entries(noiseClassifications).forEach(([noiseType, confidence]) => {
      const noiseConfig = this.config.noiseTypes[noiseType];
      
      if (noiseConfig && noiseConfig.enabled && 
          currentEnv.enabledNoises.includes(noiseType) &&
          confidence > noiseConfig.threshold) {
        
        activeFilters[noiseType] = {
          confidence: confidence,
          strength: noiseConfig.filterStrength,
          threshold: noiseConfig.threshold
        };
      }
    });
    
    this.logAudit('determineActiveFilters', `Active filters: ${Object.keys(activeFilters).join(', ')}`);
    
    return activeFilters;
  }

  /**
   * APLICAR DENOISING - proceso PÚBLICO
   */
  async applyDenoising(audioData, activeFilters) {
    if (Object.keys(activeFilters).length === 0) {
      this.logAudit('applyDenoising', 'No filters needed - returning original audio');
      return audioData;
    }
    
    // IMPLEMENTACIÓN BÁSICA - espectral subtraction
    let enhancedAudio = new Float32Array(audioData);
    
    Object.entries(activeFilters).forEach(([noiseType, filter]) => {
      enhancedAudio = this.applySpectralSubtraction(enhancedAudio, filter);
      this.logAudit('applyDenoising', `Applied ${noiseType} filter (strength: ${filter.strength})`);
    });
    
    return enhancedAudio;
  }

  /**
   * APLICAR SUSTRACCIÓN ESPECTRAL - algoritmo PÚBLICO
   */
  applySpectralSubtraction(audioData, filter) {
    // IMPLEMENTACIÓN BÁSICA - filtro pasa-altos/bajos simple
    const enhanced = new Float32Array(audioData.length);
    const alpha = 1 - filter.strength;
    
    for (let i = 1; i < audioData.length - 1; i++) {
      // Filtro básico
      enhanced[i] = alpha * audioData[i] + (1 - alpha) * (audioData[i-1] + audioData[i+1]) / 2;
    }
    
    // Preservar bordes
    enhanced[0] = audioData[0];
    enhanced[audioData.length - 1] = audioData[audioData.length - 1];
    
    return enhanced;
  }

  /**
   * VERIFICAR PRESERVACIÓN DE ALARMAS - CRÍTICO
   */
  async verifyAlarmPreservation(originalAudio, enhancedAudio, noiseClassifications) {
    const alarmConfidence = noiseClassifications.alarms || 0;
    
    if (alarmConfidence > 0.5) {
      // Verificar que las alarmas no se hayan eliminado
      const originalAlarmLevel = this.calculateAlarmLevel(originalAudio);
      const enhancedAlarmLevel = this.calculateAlarmLevel(enhancedAudio);
      
      const preservationRate = enhancedAlarmLevel / originalAlarmLevel;
      
      if (preservationRate < 0.7) {
        // ALARMA CRÍTICA - raise issue inmediato
        const issue = {
          timestamp: new Date(),
          type: 'CRITICAL_ALARM_LOSS',
          originalLevel: originalAlarmLevel,
          enhancedLevel: enhancedAlarmLevel,
          preservationRate: preservationRate,
          threshold: 0.7
        };
        
        this.logAudit('verifyAlarmPreservation', `CRITICAL: Alarm preservation failed - ${JSON.stringify(issue)}`);
        
        // Enviar alerta inmediata
        await this.raiseAlarmPreservationIssue(issue);
      }
    }
  }

  /**
   * CALCULAR NIVEL DE ALARMA - algoritmo PÚBLICO
   */
  calculateAlarmLevel(audioData) {
    // Buscar características típicas de alarmas médicas
    const alarmFreqs = [1000, 1500, 2500]; // Hz típicas de alarmas
    let alarmLevel = 0;
    
    // Análisis básico de energía en frecuencias de alarma
    const windowSize = 1024;
    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const dominantFreq = this.findDominantFrequency(window);
      
      if (alarmFreqs.some(freq => Math.abs(dominantFreq - freq) < 100)) {
        alarmLevel += this.calculateWindowEnergy(window);
      }
    }
    
    return alarmLevel;
  }

  /**
   * CALCULAR ENERGÍA DE VENTANA - algoritmo PÚBLICO
   */
  calculateWindowEnergy(window) {
    let energy = 0;
    for (let i = 0; i < window.length; i++) {
      energy += window[i] * window[i];
    }
    return energy / window.length;
  }

  /**
   * RAISE ISSUE DE PRESERVACIÓN DE ALARMA - CRÍTICO
   */
  async raiseAlarmPreservationIssue(issue) {
    // LOGGING PÚBLICO - visible a todos los devs
    console.error('🚨 CRITICAL ALARM PRESERVATION ISSUE:', issue);
    
    // Guardar en audit log
    this.logAudit('raiseAlarmPreservationIssue', `CRITICAL ISSUE: ${JSON.stringify(issue)}`);
    
    // En producción, esto enviaría alertas al equipo
    // TODO: Implementar sistema de alertas
  }

  /**
   * APLICAR PERFIL DE AMBIENTE - configuración PÚBLICA
   */
  applyEnvironmentProfile(environmentName) {
    if (!this.config.environments[environmentName]) {
      throw new Error(`Environment profile not found: ${environmentName}`);
    }
    
    this.systemState.currentEnvironment = environmentName;
    this.logAudit('applyEnvironmentProfile', `Applied environment: ${environmentName}`);
  }

  /**
   * PROCESAMIENTO FALLBACK - modo seguro PÚBLICO
   */
  fallbackProcessing(audioData, options) {
    this.logAudit('fallbackProcessing', 'Using fallback processing mode');
    
    // Aplicar filtro básico
    const enhanced = new Float32Array(audioData.length);
    const alpha = this.config.global.fallbackThreshold;
    
    for (let i = 1; i < audioData.length - 1; i++) {
      enhanced[i] = alpha * audioData[i] + (1 - alpha) * (audioData[i-1] + audioData[i+1]) / 2;
    }
    
    return {
      enhancedAudio: enhanced,
      originalAudio: audioData,
      noiseClassifications: {},
      activeFilters: { fallback: { strength: alpha } },
      metrics: this.getProcessingMetrics(),
      processingTime: 0,
      fallbackMode: true
    };
  }

  /**
   * ACTUALIZAR MÉTRICAS - siempre visible
   */
  updateMetrics(startTime, success) {
    const processingTime = Date.now() - startTime;
    
    this.metrics.totalProcessed++;
    this.metrics.lastProcessingTime = processingTime;
    
    if (success) {
      this.metrics.successRate = ((this.metrics.successRate * (this.metrics.totalProcessed - 1)) + 1) / this.metrics.totalProcessed;
    } else {
      this.metrics.errorCount++;
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.totalProcessed - 1)) / this.metrics.totalProcessed;
    }
    
    this.metrics.averageProcessingTime = ((this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1)) + processingTime) / this.metrics.totalProcessed;
    
    // Mantener historial de rendimiento
    this.metrics.performanceHistory.push({
      timestamp: new Date(),
      processingTime: processingTime,
      success: success
    });
    
    // Mantener solo últimas 100 entradas
    if (this.metrics.performanceHistory.length > 100) {
      this.metrics.performanceHistory.shift();
    }
  }

  /**
   * OBTENER MÉTRICAS DE PROCESAMIENTO - PÚBLICO
   */
  getProcessingMetrics() {
    return {
      ...this.metrics,
      systemState: this.systemState,
      config: this.config
    };
  }

  /**
   * OBTENER ESTADO COMPLETO - PÚBLICO
   */
  getFullState() {
    return {
      isInitialized: this.isInitialized,
      modelName: this.modelName,
      config: this.config,
      metrics: this.metrics,
      systemState: this.systemState,
      auditLog: this.auditLog.slice(-50), // Últimas 50 entradas
      processingLog: this.processingLog.slice(-50)
    };
  }

  /**
   * CONFIGURAR SISTEMA - PÚBLICO
   */
  configure(newConfig) {
    const oldConfig = JSON.parse(JSON.stringify(this.config));
    
    // Merge configurations
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.logAudit('configure', `Configuration updated. Changes: ${JSON.stringify(this.getConfigDiff(oldConfig, this.config))}`);
  }

  /**
   * OBTENER DIFERENCIAS DE CONFIGURACIÓN - PÚBLICO
   */
  getConfigDiff(oldConfig, newConfig) {
    const diff = {};
    
    function compare(obj1, obj2, path = '') {
      Object.keys(obj2).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (obj1[key] !== obj2[key]) {
          if (typeof obj2[key] === 'object' && obj2[key] !== null) {
            compare(obj1[key] || {}, obj2[key], fullPath);
          } else {
            diff[fullPath] = {
              old: obj1[key],
              new: obj2[key]
            };
          }
        }
      });
    }
    
    compare(oldConfig, newConfig);
    return diff;
  }

  /**
   * LOGGING AUDITABLE - cada acción visible
   */
  logAudit(action, message) {
    const logEntry = {
      timestamp: new Date(),
      action: action,
      message: message,
      systemState: this.systemState.currentEnvironment,
      configVersion: this.systemState.configVersion
    };
    
    this.auditLog.push(logEntry);
    
    // Mantener solo últimas 1000 entradas
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
    
    // Log también en consola si debug está habilitado
    if (this.systemState.debugMode) {
      console.log(`[ClinicalAudioEnhancer] ${action}: ${message}`);
    }
  }

  /**
   * EXPORTAR CONFIGURACIÓN - import/export PÚBLICO
   */
  exportConfiguration() {
    return {
      version: this.systemState.configVersion,
      exportDate: new Date(),
      config: this.config,
      metrics: this.metrics,
      systemState: this.systemState
    };
  }

  /**
   * IMPORTAR CONFIGURACIÓN - import/export PÚBLICO
   */
  importConfiguration(configData) {
    if (!configData.version) {
      throw new Error('Invalid configuration data - missing version');
    }
    
    this.config = configData.config;
    this.systemState.configVersion = configData.version;
    
    this.logAudit('importConfiguration', `Imported configuration version: ${configData.version}`);
  }

  /**
   * HABILITAR DEBUG - modo desarrollo PÚBLICO
   */
  enableDebugMode() {
    this.systemState.debugMode = true;
    this.logAudit('enableDebugMode', 'Debug mode enabled');
  }

  /**
   * DESHABILITAR DEBUG - modo producción PÚBLICO
   */
  disableDebugMode() {
    this.systemState.debugMode = false;
    this.logAudit('disableDebugMode', 'Debug mode disabled');
  }

  /**
   * BENCHMARK DE MODELO - comparativa PÚBLICA
   */
  async benchmarkModel(testAudioSamples) {
    const results = {
      modelName: this.modelName,
      benchmarkDate: new Date(),
      testSamples: testAudioSamples.length,
      results: []
    };
    
    for (let i = 0; i < testAudioSamples.length; i++) {
      const sample = testAudioSamples[i];
      const startTime = Date.now();
      
      try {
        const result = await this.processAudio(sample.audioData, sample.options);
        
        results.results.push({
          sampleId: sample.id,
          processingTime: Date.now() - startTime,
          success: true,
          noiseReduction: this.calculateNoiseReduction(sample.audioData, result.enhancedAudio),
          activeFilters: Object.keys(result.activeFilters).length
        });
        
      } catch (error) {
        results.results.push({
          sampleId: sample.id,
          processingTime: Date.now() - startTime,
          success: false,
          error: error.message
        });
      }
    }
    
    // Calcular estadísticas
    const successResults = results.results.filter(r => r.success);
    results.summary = {
      successRate: successResults.length / results.results.length,
      averageProcessingTime: successResults.reduce((sum, r) => sum + r.processingTime, 0) / successResults.length,
      averageNoiseReduction: successResults.reduce((sum, r) => sum + (r.noiseReduction || 0), 0) / successResults.length
    };
    
    this.logAudit('benchmarkModel', `Benchmark completed: ${JSON.stringify(results.summary)}`);
    
    return results;
  }

  /**
   * CALCULAR REDUCCIÓN DE RUIDO - métricas PÚBLICAS
   */
  calculateNoiseReduction(originalAudio, enhancedAudio) {
    const originalNoise = this.calculateNoiseLevel(originalAudio);
    const enhancedNoise = this.calculateNoiseLevel(enhancedAudio);
    
    return ((originalNoise - enhancedNoise) / originalNoise) * 100;
  }

  /**
   * CALCULAR NIVEL DE RUIDO - algoritmo PÚBLICO
   */
  calculateNoiseLevel(audioData) {
    // Estimación básica de nivel de ruido
    let noiseLevel = 0;
    const windowSize = 1024;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const windowNoise = this.calculateWindowNoise(window);
      noiseLevel += windowNoise;
    }
    
    return noiseLevel / Math.floor(audioData.length / windowSize);
  }

  /**
   * CALCULAR RUIDO DE VENTANA - algoritmo PÚBLICO
   */
  calculateWindowNoise(window) {
    // Usar desviación estándar como proxy del ruido
    let mean = 0;
    for (let i = 0; i < window.length; i++) {
      mean += window[i];
    }
    mean /= window.length;
    
    let variance = 0;
    for (let i = 0; i < window.length; i++) {
      variance += (window[i] - mean) ** 2;
    }
    variance /= window.length;
    
    return Math.sqrt(variance);
  }

  /**
   * DESTRUIR INSTANCIA - cleanup PÚBLICO
   */
  async destroy() {
    this.logAudit('destroy', 'Destroying ClinicalAudioEnhancer instance');
    
    this.isInitialized = false;
    this.pipeline = null;
    this.initializationPromise = null;
    this.noiseClassifier = null;
    
    // Limpiar logs
    this.auditLog = [];
    this.processingLog = [];
    
    // Reset métricas
    this.metrics = {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      noiseReductionEffectiveness: 0,
      alarmPreservationRate: 0,
      errorCount: 0,
      lastProcessingTime: null,
      performanceHistory: []
    };
  }
}

// INSTANCIA SINGLETON - acceso PÚBLICO
export const clinicalAudioEnhancer = new ClinicalAudioEnhancer();

// CONFIGURACIÓN DE DESARROLLO - PÚBLICA
export const DEVELOPMENT_CONFIG = {
  enableDebugMode: true,
  enableAuditLogging: true,
  enablePerformanceMetrics: true,
  enableBenchmarking: true
};

// CONFIGURACIÓN DE PRODUCCIÓN - PÚBLICA
export const PRODUCTION_CONFIG = {
  enableDebugMode: false,
  enableAuditLogging: true,
  enablePerformanceMetrics: true,
  enableBenchmarking: false
};