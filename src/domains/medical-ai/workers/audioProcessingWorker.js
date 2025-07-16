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
    
    // Configure transformers to cache models
    const { env, pipeline: pipelineConstructor } = await import('@xenova/transformers');
    
    // Enable caching
    env.allowLocalModels = true;
    env.localModelPath = 'models';
    env.cacheDir = 'models';
    
    pipeline = await pipelineConstructor(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        progress_callback: (progress) => {
          self.postMessage({ 
            type: 'MODEL_LOADING', 
            progress: progress.progress || 0 
          });
        },
        revision: 'main',
        cache_dir: 'models'
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
    
    // Validar tamaño del chunk - MÍNIMO 10 SEGUNDOS PARA CHUNKS GORDOS
    const minChunkSize = 160000; // 10 segundos a 16kHz
    if (!audioData || audioData.length < minChunkSize) {
      console.error(`[Worker] Chunk demasiado pequeño: ${audioData?.length || 0} samples (mínimo: ${minChunkSize})`);
      self.postMessage({ 
        type: 'CHUNK_TOO_SMALL',
        chunkId,
        size: audioData?.length || 0,
        minSize: minChunkSize,
        error: `Chunk de audio muy pequeño para procesar. Recibido: ${audioData?.length || 0} samples, mínimo requerido: ${minChunkSize} (10 segundos)`
      });
      return;
    }
    
    console.log(`[Worker] Procesando chunk ${chunkId}: ${audioData.length} samples`);
    
    self.postMessage({ 
      type: 'PROCESSING_START', 
      chunkId 
    });

    const result = await pipeline(audioData, {
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5
    });

    const transcribedText = result.text || '';
    console.log(`[Worker] TRANSCRIPCIÓN OBTENIDA: "${transcribedText}" (${transcribedText.length} caracteres)`);

    self.postMessage({ 
      type: 'CHUNK_PROCESSED', 
      chunkId,
      text: transcribedText,
      timestamp: Date.now()
    });
  } catch (error) {
    self.postMessage({ 
      type: 'PROCESSING_ERROR', 
      error: error.message,
      chunkId: data.chunkId 
    });
  }
}

function reset() {
  self.postMessage({ type: 'RESET_COMPLETE' });
}