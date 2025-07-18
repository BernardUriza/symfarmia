// audioProcessingWorker.js - Real Whisper implementation without CDN
// This worker will be loaded by the WhisperModelCache which injects the Transformers module
let pipeline = null;
let modelInitialized = false;
let initializationPromise = null;

// The pipeline will be created by the main thread and passed to us
let transformers = null;

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'INIT':
      // Expect the main thread to provide the transformers module
      if (data && data.transformers) {
        transformers = data.transformers;
      }
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
    console.log('[Worker] Starting Whisper model initialization');
    
    // Check if we have the transformers module
    if (!transformers) {
      throw new Error('Transformers module not provided by main thread');
    }
    
    self.postMessage({ 
      type: 'MODEL_LOADING_PROGRESS', 
      progress: 0,
      status: 'Initializing Whisper model...'
    });
    
    console.log('[Worker] Using transformers module from main thread');
    
    // Use the transformers module provided by the main thread
    const { pipeline: createPipeline } = transformers;
    
    if (!createPipeline) {
      throw new Error('createPipeline function not found in transformers module');
    }
    
    console.log('[Worker] Creating Whisper pipeline...');
    
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
              status: `Downloading Whisper model: ${percent}%`
            });
          }
        },
        revision: 'main'
      }
    );
    
    modelInitialized = true;
    console.log('[Worker] Whisper model initialized successfully');
    self.postMessage({ type: 'MODEL_READY' });
    
  } catch (error) {
    console.error('[Worker] Failed to initialize Whisper model:', error);
    initializationPromise = null;
    self.postMessage({ 
      type: 'MODEL_ERROR', 
      error: `Failed to initialize Whisper model: ${error.message}` 
    });
    throw error;
  }
}

async function processAudioChunk(data) {
  try {
    if (!pipeline) {
      throw new Error('Whisper model not initialized');
    }

    const { audioData, chunkId, metadata } = data;
    
    // Validate chunk size - minimum 2 seconds for better quality
    const minChunkSize = 32000; // 2 seconds at 16kHz
    if (!audioData || audioData.length < minChunkSize) {
      console.warn(`[Worker] Chunk too small: ${audioData?.length || 0} samples (minimum: ${minChunkSize})`);
      self.postMessage({ 
        type: 'CHUNK_ERROR',
        chunkId,
        error: `Audio chunk too small for processing. Received: ${audioData?.length || 0} samples, minimum required: ${minChunkSize} (2 seconds)`
      });
      return;
    }
    
    console.log(`[Worker] Processing chunk ${chunkId} with Whisper: ${audioData.length} samples`);
    
    // Analyze audio data for debugging
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
    
    console.log(`[Worker] Audio stats for chunk ${chunkId}:`, audioStats);
    
    if (audioStats.silent) {
      console.warn(`[Worker] Silent audio detected - chunk ${chunkId}`);
    }
    
    // Notify processing start
    self.postMessage({ 
      type: 'CHUNK_PROCESSING_START', 
      chunkId 
    });

    console.log(`[Worker] Calling Whisper pipeline for chunk ${chunkId} in Spanish (es)...`);
    
    const startTime = performance.now();
    
    // Process with Whisper using Spanish language
    const result = await pipeline(audioData, {
      return_timestamps: false,
      chunk_length_s: 60, // Longer chunks for better context
      stride_length_s: 10, // More overlap
      language: 'es', // Spanish language
      no_speech_threshold: 0.3,
      task: 'transcribe' // Transcribe only, don't translate
    });
    
    const processingTime = performance.now() - startTime;

    let transcribedText = result.text || '';
    console.log(`[Worker] Whisper transcription for chunk ${chunkId}: "${transcribedText}" (${transcribedText.length} characters)`);
    
    // Log language detection info if available
    if (result.language) {
      console.log(`[Worker] Detected language: ${result.language}`);
    }
    
    // Filter for Spanish words only
    if (transcribedText) {
      const spanishWordFilter = /^[a-záéíóúñü\s.,;:!¡?¿\-()]+$/i;
      const words = transcribedText.split(' ');
      const filteredWords = words.filter(word => {
        // Allow empty words and punctuation
        if (!word.trim()) return true;
        // Filter only words with Spanish characters
        return spanishWordFilter.test(word.trim());
      });
      
      if (filteredWords.length !== words.length) {
        console.log(`[Worker] Spanish filter applied: ${words.length} -> ${filteredWords.length} words`);
      }
      
      transcribedText = filteredWords.join(' ').trim();
    }

    // Send result
    if (!transcribedText || transcribedText.length === 0) {
      console.warn(`[Worker] Chunk ${chunkId} generated no text - possible silent audio`);
      self.postMessage({ 
        type: 'CHUNK_PROCESSED', 
        chunkId,
        text: '',
        confidence: 0,
        processingTime: Math.round(processingTime),
        metadata,
        warning: 'No text generated - possible silent audio'
      });
    } else {
      console.log(`[Worker] Sending Whisper transcription: "${transcribedText}"`);
      self.postMessage({ 
        type: 'CHUNK_PROCESSED', 
        chunkId,
        text: transcribedText,
        confidence: result.confidence || 0.8,
        processingTime: Math.round(processingTime),
        metadata
      });
    }
    
  } catch (error) {
    console.error('[Worker] Whisper processing error:', error);
    self.postMessage({ 
      type: 'CHUNK_ERROR', 
      error: error.message || 'Unknown Whisper processing error',
      chunkId: data.chunkId || 'unknown'
    });
  }
}

function reset() {
  console.log('[Worker] Resetting Whisper worker state');
  self.postMessage({ type: 'RESET_COMPLETE' });
}

// Log worker start
console.log('[Worker] Real Whisper audio processing worker started (no CDN version)');