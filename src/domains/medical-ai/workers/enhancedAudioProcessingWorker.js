/**
 * Enhanced Audio Processing Worker - "BAZAAR MODE"
 * 
 * WORKER MEJORADO con integración de denoising:
 * - Proceso PRE-Whisper con denoising
 * - Fallback automático
 * - Logging completo
 * - Métricas de calidad
 * 
 * FLUJO:
 * Audio Raw → [Denoising] → Whisper → Transcripción
 */

import { pipeline as createPipeline } from '@xenova/transformers';
import { configureTransformers } from '../config/transformersConfig';
import { audioPipelineIntegration } from '../services/AudioPipelineIntegration';

// Global cache for the pipeline model
let pipeline = null;
let modelInitialized = false;
let initializationPromise = null;

// Denoising configuration
let denoisingEnabled = true;
let currentEnvironment = 'consultorio';
let processingStats = {
  totalProcessed: 0,
  denoisingUsed: 0,
  fallbackUsed: 0,
  averageProcessingTime: 0,
  qualityImprovement: 0
};

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'INIT':
      await initializeModel();
      break;
    
    case 'PROCESS_CHUNK':
      await processAudioChunk(data);
      break;
    
    case 'CONFIGURE_DENOISING':
      configureDenoising(data);
      break;
    
    case 'GET_STATS':
      getProcessingStats();
      break;
    
    case 'RESET':
      reset();
      break;
  }
});

async function initializeModel() {
  // If already initialized, just notify ready
  if (modelInitialized && pipeline) {
    console.log('[Enhanced Worker] Model already initialized, skipping download');
    self.postMessage({ type: 'MODEL_READY' });
    return;
  }
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[Enhanced Worker] Waiting for existing initialization');
    await initializationPromise;
    self.postMessage({ type: 'MODEL_READY' });
    return;
  }
  
  // Start new initialization
  initializationPromise = performInitialization();
  await initializationPromise;
}

async function performInitialization() {
  try {
    console.log('[Enhanced Worker] Starting model initialization');
    self.postMessage({ type: 'MODEL_LOADING', progress: 0 });
    
    // Use global transformers configuration
    await configureTransformers();
    
    // Initialize pipeline integration
    await audioPipelineIntegration.configure({
      enableDenoising: denoisingEnabled,
      enableFallback: true,
      enableQualityMetrics: true,
      enablePersistence: false, // No persistence in worker
      logLevel: 'info'
    });
    
    pipeline = await createPipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base',
      {
        progress_callback: (progress) => {
          self.postMessage({ 
            type: 'MODEL_LOADING', 
            progress: progress.progress || 0 
          });
        },
        revision: 'main'
      }
    );
    
    modelInitialized = true;
    console.log('[Enhanced Worker] Model and denoising initialized successfully');
    
    self.postMessage({ 
      type: 'MODEL_READY',
      denoisingEnabled: denoisingEnabled,
      currentEnvironment: currentEnvironment
    });
    
  } catch (error) {
    console.error('[Enhanced Worker] Failed to initialize model:', error);
    initializationPromise = null;
    self.postMessage({ 
      type: 'ERROR', 
      error: `Failed to initialize model: ${error.message}` 
    });
    throw error;
  }
}

async function processAudioChunk(data) {
  try {
    if (!pipeline) {
      throw new Error('Model not initialized');
    }

    const { audioData, chunkId, options = {} } = data;
    const startTime = Date.now();
    
    // Validar tamaño del chunk
    const minChunkSize = 32000; // 2 segundos a 16kHz
    if (!audioData || audioData.length < minChunkSize) {
      console.warn(`[Enhanced Worker] Chunk muy pequeño: ${audioData?.length || 0} samples`);
      self.postMessage({ 
        type: 'CHUNK_TOO_SMALL',
        chunkId,
        size: audioData?.length || 0,
        minSize: minChunkSize,
        error: `Chunk de audio muy pequeño para procesar`
      });
      return;
    }
    
    console.log(`[Enhanced Worker] Procesando chunk ${chunkId}: ${audioData.length} samples`);
    
    // Enviar progreso inicial
    self.postMessage({ 
      type: 'PROCESSING_START', 
      chunkId,
      denoisingEnabled: denoisingEnabled,
      environment: currentEnvironment
    });

    self.postMessage({ 
      type: 'CHUNK_PROGRESS', 
      chunkId,
      progress: 5,
      stage: 'preprocessing'
    });

    // PASO 1: Aplicar denoising PRE-Whisper
    let enhancedAudioData = audioData;
    let denoisingResult = null;
    let usedDenoising = false;
    
    if (denoisingEnabled) {
      try {
        console.log(`[Enhanced Worker] Aplicando denoising para chunk ${chunkId}`);
        
        self.postMessage({ 
          type: 'CHUNK_PROGRESS', 
          chunkId,
          progress: 15,
          stage: 'denoising'
        });
        
        const pipelineResult = await audioPipelineIntegration.processAudioWithDenoising(
          audioData,
          {
            environment: currentEnvironment,
            enableQualityMetrics: true,
            enablePersistence: false,
            fallbackOnError: true,
            ...options
          }
        );
        
        if (pipelineResult.processedAudio) {
          enhancedAudioData = pipelineResult.processedAudio;
          denoisingResult = pipelineResult.denoisingResult;
          usedDenoising = pipelineResult.usedDenoising;
          
          console.log(`[Enhanced Worker] Denoising completado para chunk ${chunkId}. ` +
                     `Usado: ${usedDenoising}, Filtros: ${denoisingResult ? Object.keys(denoisingResult.activeFilters).join(', ') : 'none'}`);
          
          self.postMessage({ 
            type: 'DENOISING_COMPLETE',
            chunkId,
            usedDenoising: usedDenoising,
            activeFilters: denoisingResult ? Object.keys(denoisingResult.activeFilters) : [],
            qualityMetrics: pipelineResult.qualityMetrics,
            processingTime: pipelineResult.processingTime
          });
        }
        
      } catch (denoisingError) {
        console.warn(`[Enhanced Worker] Denoising falló para chunk ${chunkId}: ${denoisingError.message}`);
        
        self.postMessage({ 
          type: 'DENOISING_ERROR',
          chunkId,
          error: denoisingError.message,
          fallbackUsed: true
        });
        
        // Continuar con audio original
        enhancedAudioData = audioData;
        usedDenoising = false;
      }
    }

    // PASO 2: Procesar con Whisper
    console.log(`[Enhanced Worker] Procesando con Whisper chunk ${chunkId}`);
    
    self.postMessage({ 
      type: 'CHUNK_PROGRESS', 
      chunkId,
      progress: 30,
      stage: 'transcription'
    });

    // Simular progreso durante transcripción
    let currentProgress = 30;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(90, currentProgress + Math.random() * 15 + 5);
      try {
        self.postMessage({ 
          type: 'CHUNK_PROGRESS', 
          chunkId,
          progress: Math.round(currentProgress),
          stage: 'transcription'
        });
      } catch (error) {
        clearInterval(progressInterval);
      }
    }, 500);

    const result = await pipeline(enhancedAudioData, {
      return_timestamps: false,
      chunk_length_s: 60,
      stride_length_s: 10,
      language: 'es',
      no_speech_threshold: 0.3,
      task: 'transcribe'
    });

    // Limpiar intervalo de progreso
    clearInterval(progressInterval);
    
    // Enviar progreso final
    try {
      self.postMessage({ 
        type: 'CHUNK_PROGRESS', 
        chunkId,
        progress: 100,
        stage: 'complete'
      });
    } catch (error) {
      console.log('[Enhanced Worker] Error posting final progress');
    }

    // PASO 3: Procesar resultado
    let transcribedText = result.text || '';
    console.log(`[Enhanced Worker] TRANSCRIPCIÓN OBTENIDA para chunk ${chunkId}: \"${transcribedText}\" (${transcribedText.length} caracteres)`);
    
    // Filtro de palabras en español
    if (transcribedText) {
      const spanishWordFilter = /^[a-záéíóúñü\\s.,;:!¡?¿\\-()]+$/i;
      const words = transcribedText.split(' ');
      const filteredWords = words.filter(word => {
        if (!word.trim()) return true;
        return spanishWordFilter.test(word.trim());
      });
      
      if (filteredWords.length !== words.length) {
        console.log(`[Enhanced Worker] Filtro español aplicado: ${words.length} -> ${filteredWords.length} palabras`);
      }
      
      transcribedText = filteredWords.join(' ').trim();
    }

    // Actualizar estadísticas
    const processingTime = Date.now() - startTime;
    updateProcessingStats(processingTime, usedDenoising, transcribedText.length > 0);

    // Enviar resultado
    if (!transcribedText || transcribedText.length === 0) {
      console.warn(`[Enhanced Worker] CHUNK ${chunkId} NO GENERÓ TEXTO`);
      try {
        self.postMessage({ 
          type: 'CHUNK_PROCESSED', 
          chunkId,
          text: '',
          timestamp: Date.now(),
          warning: 'No text generated - possible silent audio',
          denoisingUsed: usedDenoising,
          processingTime: processingTime,
          qualityMetrics: denoisingResult ? denoisingResult.qualityMetrics : null
        });
      } catch (error) {
        console.log('[Enhanced Worker] Error posting empty result');
      }
    } else {
      console.log(`[Enhanced Worker] ENVIANDO TRANSCRIPCIÓN: \"${transcribedText}\"`);
      try {
        self.postMessage({ 
          type: 'CHUNK_PROCESSED', 
          chunkId,
          text: transcribedText,
          timestamp: Date.now(),
          denoisingUsed: usedDenoising,
          activeFilters: denoisingResult ? Object.keys(denoisingResult.activeFilters) : [],
          processingTime: processingTime,
          qualityMetrics: denoisingResult ? denoisingResult.qualityMetrics : null,
          pipelineStats: processingStats
        });
      } catch (error) {
        console.log('[Enhanced Worker] Error posting result');
      }
    }
    
  } catch (error) {
    console.error('[Enhanced Worker] Processing error:', error);
    try {
      self.postMessage({ 
        type: 'PROCESSING_ERROR', 
        error: error.message || 'Unknown processing error',
        chunkId: data.chunkId || 'unknown',
        denoisingEnabled: denoisingEnabled
      });
    } catch (postError) {
      console.log('[Enhanced Worker] Error posting error message');
    }
  }
}

function configureDenoising(config) {
  const { enabled, environment, options = {} } = config;
  
  denoisingEnabled = enabled !== false;
  currentEnvironment = environment || 'consultorio';
  
  // Configurar pipeline
  audioPipelineIntegration.configure({
    enableDenoising: denoisingEnabled,
    ...options
  });
  
  console.log(`[Enhanced Worker] Denoising configurado: enabled=${denoisingEnabled}, environment=${currentEnvironment}`);
  
  self.postMessage({
    type: 'DENOISING_CONFIGURED',
    enabled: denoisingEnabled,
    environment: currentEnvironment,
    options: options
  });
}

function getProcessingStats() {
  const stats = {
    worker: processingStats,
    pipeline: audioPipelineIntegration.getStats(),
    timestamp: Date.now()
  };
  
  self.postMessage({
    type: 'PROCESSING_STATS',
    stats: stats
  });
}

function updateProcessingStats(processingTime, usedDenoising, hasText) {
  processingStats.totalProcessed++;
  
  if (usedDenoising) {
    processingStats.denoisingUsed++;
  }
  
  if (!usedDenoising && denoisingEnabled) {
    processingStats.fallbackUsed++;
  }
  
  // Actualizar tiempo promedio
  processingStats.averageProcessingTime = 
    ((processingStats.averageProcessingTime * (processingStats.totalProcessed - 1)) + 
     processingTime) / processingStats.totalProcessed;
  
  // Estimar mejora de calidad (simplificado)
  if (usedDenoising && hasText) {
    const currentImprovement = 15; // Asumimos 15% de mejora con denoising
    processingStats.qualityImprovement = 
      ((processingStats.qualityImprovement * (processingStats.denoisingUsed - 1)) + 
       currentImprovement) / processingStats.denoisingUsed;
  }
}

function reset() {
  // Reset estadísticas
  processingStats = {
    totalProcessed: 0,
    denoisingUsed: 0,
    fallbackUsed: 0,
    averageProcessingTime: 0,
    qualityImprovement: 0
  };
  
  // Reset pipeline
  audioPipelineIntegration.resetStats();
  
  self.postMessage({ 
    type: 'RESET_COMPLETE',
    denoisingEnabled: denoisingEnabled,
    currentEnvironment: currentEnvironment
  });
}