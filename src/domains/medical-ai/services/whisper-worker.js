/**
 * Whisper.cpp WASM Web Worker
 * 
 * Real Whisper.cpp WebAssembly implementation for browser-based transcription
 * Handles model loading, audio processing, and transcription
 */

// Global variables for Whisper WASM
let whisperModule = null;
let whisperContext = null;
let modelBuffer = null;
let audioBuffer = null;
let isInitialized = false;
let currentConfig = null;

// Audio processing constants
const WHISPER_SAMPLE_RATE = 16000;
const WHISPER_N_SAMPLES = 30 * WHISPER_SAMPLE_RATE; // 30 seconds max
const WHISPER_N_THREADS = Math.min(navigator.hardwareConcurrency || 4, 8);

// Message handler
self.onmessage = async function(event) {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'initialize':
        result = await initializeWhisper(data);
        break;
        
      case 'transcribe':
        result = await transcribeAudio(data);
        break;
        
      case 'loadModel':
        result = await loadModel(data);
        break;
        
      case 'cleanup':
        result = await cleanup();
        break;
        
      case 'getStatus':
        result = getStatus();
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    self.postMessage({ type: 'success', data: result, id });
    
  } catch (error) {
    console.error('Whisper Worker Error:', error);
    self.postMessage({ 
      type: 'error', 
      data: { 
        message: error.message, 
        stack: error.stack,
        type: type 
      }, 
      id 
    });
  }
};

/**
 * Initialize Whisper.cpp WASM module
 */
async function initializeWhisper(config) {
  console.log('Initializing Whisper.cpp WASM...', config);
  
  currentConfig = {
    wasmPath: config.wasmPath || '/whisper.wasm',
    modelPath: config.modelPath || '/models/whisper-base.bin',
    language: config.language || 'es',
    n_threads: config.n_threads || WHISPER_N_THREADS,
    translate: config.translate || false,
    no_context: config.no_context || false,
    single_segment: config.single_segment || false,
    print_special: config.print_special || false,
    print_progress: config.print_progress || false,
    print_realtime: config.print_realtime || false,
    print_timestamps: config.print_timestamps || true,
    ...config
  };
  
  try {
    // Load Whisper.cpp WASM module
    console.log('Loading WASM module from:', currentConfig.wasmPath);
    const wasmResponse = await fetch(currentConfig.wasmPath);
    
    if (!wasmResponse.ok) {
      throw new Error(`Failed to load WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
    }
    
    const wasmBytes = await wasmResponse.arrayBuffer();
    console.log('WASM module loaded:', wasmBytes.byteLength, 'bytes');
    
    // Initialize WebAssembly module
    // This assumes whisper.cpp is compiled with Emscripten
    const wasmModule = await WebAssembly.instantiate(wasmBytes);
    whisperModule = wasmModule.instance;
    
    // Initialize Whisper context
    whisperContext = whisperModule.exports.whisper_init_from_buffer || 
                    whisperModule.exports.whisper_init;
    
    if (!whisperContext) {
      throw new Error('Whisper initialization function not found in WASM module');
    }
    
    console.log('Whisper WASM module initialized successfully');
    
    // Load default model
    await loadModel({ modelPath: currentConfig.modelPath });
    
    isInitialized = true;
    
    return {
      success: true,
      message: 'Whisper.cpp WASM initialized',
      config: currentConfig
    };
    
  } catch (error) {
    console.error('Failed to initialize Whisper WASM:', error);
    isInitialized = false;
    throw error;
  }
}

/**
 * Load Whisper model from buffer
 */
async function loadModel(config) {
  console.log('Loading Whisper model from:', config.modelPath);
  
  try {
    const modelResponse = await fetch(config.modelPath);
    
    if (!modelResponse.ok) {
      throw new Error(`Failed to load model: ${modelResponse.status} ${modelResponse.statusText}`);
    }
    
    modelBuffer = await modelResponse.arrayBuffer();
    console.log('Model loaded:', modelBuffer.byteLength, 'bytes');
    
    // Create model in WASM memory
    if (whisperModule && whisperModule.exports.whisper_init_from_buffer) {
      // Allocate memory for model in WASM
      const modelPtr = whisperModule.exports.malloc(modelBuffer.byteLength);
      const modelView = new Uint8Array(whisperModule.exports.memory.buffer, modelPtr, modelBuffer.byteLength);
      modelView.set(new Uint8Array(modelBuffer));
      
      // Initialize Whisper context with model
      whisperContext = whisperModule.exports.whisper_init_from_buffer(modelPtr, modelBuffer.byteLength);
      
      if (!whisperContext) {
        throw new Error('Failed to initialize Whisper context from model');
      }
    }
    
    return {
      success: true,
      message: 'Model loaded successfully',
      modelSize: modelBuffer.byteLength
    };
    
  } catch (error) {
    console.error('Failed to load model:', error);
    throw error;
  }
}

/**
 * Transcribe audio using Whisper.cpp WASM
 */
async function transcribeAudio(audioData) {
  if (!isInitialized || !whisperContext) {
    throw new Error('Whisper not initialized or model not loaded');
  }
  
  try {
    console.log('Starting transcription...', audioData.length, 'samples');
    
    // Prepare audio data for Whisper
    const audioFloat32 = prepareAudioData(audioData);
    
    // Allocate audio buffer in WASM memory
    const audioPtr = whisperModule.exports.malloc(audioFloat32.length * 4); // 4 bytes per float32
    const audioView = new Float32Array(whisperModule.exports.memory.buffer, audioPtr, audioFloat32.length);
    audioView.set(audioFloat32);
    
    // Setup Whisper parameters
    const params = setupWhisperParams();
    
    // Run transcription
    console.log('Running Whisper transcription...');
    const result = whisperModule.exports.whisper_full(
      whisperContext,
      params,
      audioPtr,
      audioFloat32.length
    );
    
    if (result !== 0) {
      throw new Error(`Whisper transcription failed with code: ${result}`);
    }
    
    // Extract transcription results
    const transcriptionResult = extractTranscriptionResult();
    
    // Clean up audio buffer
    whisperModule.exports.free(audioPtr);
    
    console.log('Transcription completed:', transcriptionResult);
    
    return {
      success: true,
      transcription: transcriptionResult,
      audioLength: audioFloat32.length,
      sampleRate: WHISPER_SAMPLE_RATE
    };
    
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

/**
 * Prepare audio data for Whisper (convert to 16kHz mono float32)
 */
function prepareAudioData(inputAudio) {
  let audioFloat32;
  
  if (inputAudio instanceof Float32Array) {
    audioFloat32 = inputAudio;
  } else if (inputAudio instanceof ArrayBuffer) {
    audioFloat32 = new Float32Array(inputAudio);
  } else if (Array.isArray(inputAudio)) {
    audioFloat32 = new Float32Array(inputAudio);
  } else {
    throw new Error('Unsupported audio data format');
  }
  
  // Ensure audio is not too long (max 30 seconds)
  if (audioFloat32.length > WHISPER_N_SAMPLES) {
    console.warn('Audio too long, truncating to 30 seconds');
    audioFloat32 = audioFloat32.slice(0, WHISPER_N_SAMPLES);
  }
  
  // Pad with zeros if too short
  if (audioFloat32.length < WHISPER_SAMPLE_RATE) {
    const padded = new Float32Array(WHISPER_SAMPLE_RATE);
    padded.set(audioFloat32);
    audioFloat32 = padded;
  }
  
  return audioFloat32;
}

/**
 * Setup Whisper parameters structure
 */
function setupWhisperParams() {
  if (!whisperModule.exports.whisper_full_default_params) {
    throw new Error('Whisper params function not found');
  }
  
  // Get default parameters
  const params = whisperModule.exports.whisper_full_default_params(0); // WHISPER_SAMPLING_GREEDY
  
  if (!params) {
    throw new Error('Failed to get default Whisper parameters');
  }
  
  // Configure parameters based on current config
  if (whisperModule.exports.whisper_full_params_set_n_threads) {
    whisperModule.exports.whisper_full_params_set_n_threads(params, currentConfig.n_threads);
  }
  
  if (whisperModule.exports.whisper_full_params_set_language) {
    const langId = getLanguageId(currentConfig.language);
    whisperModule.exports.whisper_full_params_set_language(params, langId);
  }
  
  if (whisperModule.exports.whisper_full_params_set_translate) {
    whisperModule.exports.whisper_full_params_set_translate(params, currentConfig.translate ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_no_context) {
    whisperModule.exports.whisper_full_params_set_no_context(params, currentConfig.no_context ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_single_segment) {
    whisperModule.exports.whisper_full_params_set_single_segment(params, currentConfig.single_segment ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_print_special) {
    whisperModule.exports.whisper_full_params_set_print_special(params, currentConfig.print_special ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_print_progress) {
    whisperModule.exports.whisper_full_params_set_print_progress(params, currentConfig.print_progress ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_print_realtime) {
    whisperModule.exports.whisper_full_params_set_print_realtime(params, currentConfig.print_realtime ? 1 : 0);
  }
  
  if (whisperModule.exports.whisper_full_params_set_print_timestamps) {
    whisperModule.exports.whisper_full_params_set_print_timestamps(params, currentConfig.print_timestamps ? 1 : 0);
  }
  
  return params;
}

/**
 * Extract transcription result from Whisper context
 */
function extractTranscriptionResult() {
  if (!whisperModule.exports.whisper_full_n_segments) {
    throw new Error('Whisper result extraction functions not found');
  }
  
  const n_segments = whisperModule.exports.whisper_full_n_segments(whisperContext);
  console.log('Number of segments:', n_segments);
  
  const segments = [];
  let fullText = '';
  
  for (let i = 0; i < n_segments; i++) {
    const segment = extractSegment(i);
    segments.push(segment);
    fullText += segment.text;
  }
  
  return {
    text: fullText.trim(),
    segments: segments,
    language: currentConfig.language,
    n_segments: n_segments
  };
}

/**
 * Extract individual segment from Whisper context
 */
function extractSegment(segmentIndex) {
  const textPtr = whisperModule.exports.whisper_full_get_segment_text(whisperContext, segmentIndex);
  const startTime = whisperModule.exports.whisper_full_get_segment_t0(whisperContext, segmentIndex);
  const endTime = whisperModule.exports.whisper_full_get_segment_t1(whisperContext, segmentIndex);
  
  // Convert C string to JavaScript string
  const textBuffer = new Uint8Array(whisperModule.exports.memory.buffer, textPtr);
  let textLength = 0;
  while (textBuffer[textLength] !== 0) textLength++;
  
  const textArray = new Uint8Array(textLength);
  textArray.set(textBuffer.subarray(0, textLength));
  const text = new TextDecoder('utf-8').decode(textArray);
  
  return {
    id: segmentIndex,
    text: text,
    startTime: startTime * 10, // Convert to milliseconds
    endTime: endTime * 10,
    confidence: 0.9 // Whisper doesn't provide confidence scores
  };
}

/**
 * Get language ID for Whisper
 */
function getLanguageId(language) {
  const languageMap = {
    'es': 0, 'en': 1, 'fr': 2, 'de': 3, 'it': 4, 'pt': 5, 'ru': 6, 'ja': 7, 'ko': 8, 'zh': 9,
    'es-ES': 0, 'es-MX': 0, 'es-AR': 0, 'en-US': 1, 'en-GB': 1
  };
  
  return languageMap[language] || 0; // Default to Spanish
}

/**
 * Get worker status
 */
function getStatus() {
  return {
    isInitialized: isInitialized,
    hasModel: !!modelBuffer,
    hasContext: !!whisperContext,
    config: currentConfig,
    memoryUsage: whisperModule ? whisperModule.exports.memory.buffer.byteLength : 0
  };
}

/**
 * Cleanup Whisper resources
 */
async function cleanup() {
  try {
    if (whisperContext && whisperModule && whisperModule.exports.whisper_free) {
      whisperModule.exports.whisper_free(whisperContext);
      whisperContext = null;
    }
    
    if (modelBuffer) {
      modelBuffer = null;
    }
    
    if (audioBuffer) {
      audioBuffer = null;
    }
    
    whisperModule = null;
    isInitialized = false;
    currentConfig = null;
    
    console.log('Whisper Worker cleanup completed');
    
    return {
      success: true,
      message: 'Cleanup completed'
    };
    
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in Whisper Worker:', event.reason);
  self.postMessage({ 
    type: 'error', 
    data: { 
      message: 'Unhandled promise rejection', 
      error: event.reason 
    } 
  });
});

console.log('Whisper.cpp WASM Worker initialized');