import { pipeline as createPipeline } from '@xenova/transformers';
import { configureTransformers } from '../config/transformersConfig';

// Global cache for the pipeline model
let pipeline = null;
let modelInitialized = false;
let initializationPromise = null;

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'INIT':
      await initializeModel();
      break;
    
    case 'PROCESS_CHUNK':
      await processAudioChunk(data);
      break;
    
    case 'RESET':
      reset();
      break;
  }
});

async function initializeModel() {
  // If already initialized, just notify ready
  if (modelInitialized && pipeline) {
    console.log('[Worker] Model already initialized, skipping download');
    self.postMessage({ type: 'MODEL_READY' });
    return;
  }
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[Worker] Waiting for existing initialization');
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
    console.log('[Worker] Starting model initialization');
    self.postMessage({ type: 'MODEL_LOADING', progress: 0 });
    
    // Use global transformers configuration
    await configureTransformers();
    
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
    console.log('[Worker] Model initialized successfully');
    self.postMessage({ type: 'MODEL_READY' });
  } catch (error) {
    console.error('[Worker] Failed to initialize model:', error);
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

    const { audioData, chunkId } = data;
    
    // Validar tamaño del chunk - MÍNIMO 1 SEGUNDO PARA STREAMING
    const minChunkSize = 16000; // 1 segundo a 16kHz - permite streaming chunks pequeños
    if (!audioData || audioData.length < minChunkSize) {
      console.warn(`[Worker] Chunk muy pequeño: ${audioData?.length || 0} samples (mínimo: ${minChunkSize})`);
      self.postMessage({ 
        type: 'CHUNK_TOO_SMALL',
        chunkId,
        size: audioData?.length || 0,
        minSize: minChunkSize,
        error: `Chunk de audio muy pequeño para procesar. Recibido: ${audioData?.length || 0} samples, mínimo requerido: ${minChunkSize} (1 segundo)`
      });
      return;
    }
    
    console.log(`[Worker] Procesando chunk ${chunkId}: ${audioData.length} samples`);
    
    // Debug: Check audio data - avoid spread operator for large arrays
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let silentSamples = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const sample = audioData[i];
      if (sample < min) min = sample;
      if (sample > max) max = sample;
      sum += Math.abs(sample);
      if (Math.abs(sample) < 0.001) silentSamples++;
    }
    
    const audioStats = {
      length: audioData.length,
      min: min,
      max: max,
      avg: sum / audioData.length,
      silent: silentSamples === audioData.length
    };
    
    console.log(`[Worker] Audio stats for ${chunkId}:`, audioStats);
    
    if (audioStats.silent) {
      console.warn(`[Worker] AUDIO SILENCIOSO DETECTADO - chunk ${chunkId}`);
    }
    
    self.postMessage({ 
      type: 'PROCESSING_START', 
      chunkId 
    });

    // Send initial progress
    self.postMessage({ 
      type: 'CHUNK_PROGRESS', 
      chunkId,
      progress: 5
    });

    console.log(`[Worker] Llamando a pipeline para chunk ${chunkId} en español (es)...`);
    
    // Simulate progress during processing
    let currentProgress = 5;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(90, currentProgress + Math.random() * 15 + 5);
      try {
        self.postMessage({ 
          type: 'CHUNK_PROGRESS', 
          chunkId,
          progress: Math.round(currentProgress)
        });
      } catch (error) {
        // Worker might be terminating, clear interval
        console.log('[Worker] Error posting progress, likely terminating');
        clearInterval(progressInterval);
      }
    }, 500);

    const result = await pipeline(audioData, {
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5,
      // Use ISO 639-1 language code for Spanish ('es' not 'spanish')
      // This ensures Whisper transcribes in Spanish instead of defaulting to English
      language: 'es',
      // Lower the minimum speech probability threshold
      no_speech_threshold: 0.3
    });

    // Clear progress interval
    clearInterval(progressInterval);
    
    // Send final progress
    try {
      self.postMessage({ 
        type: 'CHUNK_PROGRESS', 
        chunkId,
        progress: 100
      });
    } catch (error) {
      console.log('[Worker] Error posting final progress, worker might be terminating');
    }

    const transcribedText = result.text || '';
    console.log(`[Worker] TRANSCRIPCIÓN OBTENIDA para chunk ${chunkId}: "${transcribedText}" (${transcribedText.length} caracteres)`);
    
    // Log language detection info if available
    if (result.language) {
      console.log(`[Worker] Idioma detectado: ${result.language}`);
    }

    if (!transcribedText || transcribedText.length === 0) {
      console.warn(`[Worker] CHUNK ${chunkId} NO GENERÓ TEXTO - posible audio silencioso`);
      // Enviar resultado vacío para que el sistema sepa que fue procesado
      try {
        self.postMessage({ 
          type: 'CHUNK_PROCESSED', 
          chunkId,
          text: '',
          timestamp: Date.now(),
          warning: 'No text generated - possible silent audio'
        });
      } catch (error) {
        console.log('[Worker] Error posting empty chunk result, worker might be terminating');
      }
    } else {
      console.log(`[Worker] ENVIANDO TRANSCRIPCIÓN: "${transcribedText}"`);
      try {
        self.postMessage({ 
          type: 'CHUNK_PROCESSED', 
          chunkId,
          text: transcribedText,
          timestamp: Date.now()
        });
      } catch (error) {
        console.log('[Worker] Error posting chunk result, worker might be terminating');
      }
    }
  } catch (error) {
    console.error('[Worker] Processing error:', error);
    try {
      self.postMessage({ 
        type: 'PROCESSING_ERROR', 
        error: error.message || 'Unknown processing error',
        chunkId: data.chunkId || 'unknown'
      });
    } catch (postError) {
      console.log('[Worker] Error posting error message, worker might be terminating');
    }
  }
}

function reset() {
  self.postMessage({ type: 'RESET_COMPLETE' });
}