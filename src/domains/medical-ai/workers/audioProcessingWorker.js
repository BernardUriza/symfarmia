// audioProcessingWorker.js - Simplified version without ES6 imports
// Global cache for the pipeline model
let pipeline = null;
let modelInitialized = false;
let initializationPromise = null;
let createPipeline = null;

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

async function loadTransformers() {
  try {
    console.log('[Worker] Loading Transformers.js...');
    // Try multiple CDN sources
    const cdnUrls = [
      'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js',
      'https://unpkg.com/@xenova/transformers@2.17.2/dist/transformers.min.js',
      'https://esm.sh/@xenova/transformers@2.17.2/dist/transformers.min.js'
    ];
    
    for (const url of cdnUrls) {
      try {
        console.log(`[Worker] Trying CDN: ${url}`);
        importScripts(url);
        
        if (typeof Transformers !== 'undefined') {
          createPipeline = Transformers.pipeline;
          console.log(`[Worker] Transformers.js loaded successfully from ${url}`);
          return true;
        }
      } catch (error) {
        console.warn(`[Worker] Failed to load from ${url}:`, error);
        continue;
      }
    }
    
    // If all CDNs fail, try local fallback
    console.log('[Worker] All CDNs failed, trying local fallback...');
    return await loadLocalTransformers();
  } catch (error) {
    console.error('[Worker] Failed to load Transformers.js:', error);
    return false;
  }
}

async function loadLocalTransformers() {
  // No fallback - if we can't load real Transformers, we fail
  console.error('[Worker] Cannot load Transformers.js - no local fallback available');
  return false;
}

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
    
    // Load Transformers.js if not already loaded
    if (!createPipeline) {
      const loaded = await loadTransformers();
      if (!loaded) {
        throw new Error('Failed to load Transformers.js');
      }
    }
    
    // Configure Transformers settings
    if (typeof Transformers !== 'undefined' && Transformers.env) {
      Transformers.env.allowLocalModels = true;
      Transformers.env.localURL = '/models/';
      Transformers.env.backends.onnx.wasm.proxy = false;
    }
    
    // Send loading updates
    self.postMessage({ 
      type: 'MODEL_LOADING_PROGRESS', 
      progress: 0, 
      status: 'Initializing Whisper model...' 
    });
    
    // Create the pipeline with progress callback
    pipeline = await createPipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base',
      {
        progress_callback: (progress) => {
          if (progress.status === 'progress' && progress.progress) {
            const percent = Math.round(progress.progress);
            self.postMessage({ 
              type: 'MODEL_LOADING_PROGRESS', 
              progress: percent,
              status: `Downloading model: ${percent}%`
            });
          }
        }
      }
    );
    
    modelInitialized = true;
    console.log('[Worker] Model initialized successfully');
    self.postMessage({ type: 'MODEL_READY' });
    
    return pipeline;
  } catch (error) {
    console.error('[Worker] Failed to initialize model:', error);
    self.postMessage({ 
      type: 'MODEL_ERROR', 
      error: error.message 
    });
    throw error;
  }
}

async function processAudioChunk(data) {
  if (!pipeline || !modelInitialized) {
    console.error('[Worker] Model not initialized');
    self.postMessage({ 
      type: 'CHUNK_ERROR', 
      error: 'Model not initialized',
      chunkId: data.chunkId 
    });
    return;
  }

  try {
    const { audioData, chunkId, metadata } = data;
    
    console.log(`[Worker] Processing chunk ${chunkId}, samples: ${audioData.length}`);
    
    // Start processing
    self.postMessage({ 
      type: 'CHUNK_PROCESSING_START', 
      chunkId 
    });
    
    const startTime = performance.now();
    
    // Process with Whisper using Spanish language
    const result = await pipeline(audioData, {
      language: 'es',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5
    });
    
    const processingTime = performance.now() - startTime;
    
    console.log(`[Worker] Chunk ${chunkId} processed in ${processingTime.toFixed(2)}ms`);
    console.log(`[Worker] Transcription: "${result.text}"`);
    
    // Send the result
    self.postMessage({
      type: 'CHUNK_PROCESSED',
      chunkId,
      text: result.text || '',
      processingTime,
      metadata
    });
    
  } catch (error) {
    console.error(`[Worker] Error processing chunk ${data.chunkId}:`, error);
    self.postMessage({ 
      type: 'CHUNK_ERROR', 
      error: error.message,
      chunkId: data.chunkId 
    });
  }
}

function reset() {
  console.log('[Worker] Resetting state');
  // Keep the model loaded, just notify reset complete
  self.postMessage({ type: 'RESET_COMPLETE' });
}

// Log worker start
console.log('[Worker] Audio processing worker started');