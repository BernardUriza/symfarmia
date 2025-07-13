const { pipeline, env } = require('@xenova/transformers');

// Configure Xenova environment for serverless
env.cacheDir = '/tmp/.cache';
env.allowRemoteModels = true;
env.allowLocalModels = false;

// Global pipeline cache for warm starts
let transcriptionPipeline = null;

/**
 * Get or initialize the Whisper transcription pipeline
 * Uses global cache to optimize cold/warm starts
 */
async function getTranscriptionPipeline() {
  if (!transcriptionPipeline) {
    console.log('🚀 Initializing Whisper pipeline...');
    const startTime = Date.now();
    
    try {
      transcriptionPipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
          quantized: true,
          revision: 'main'
        }
      );
      
      console.log(`✅ Pipeline initialized in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('❌ Pipeline initialization error:', error);
      throw new Error(`Failed to initialize Whisper model: ${error.message}`);
    }
  }
  
  return transcriptionPipeline;
}

/**
 * Transcribe audio file with optimized settings
 * @param {string} audioPath - Path to audio file
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} Transcription result
 */
async function transcribeAudio(audioPath, options = {}) {
  const transcriber = await getTranscriptionPipeline();
  
  const defaultOptions = {
    language: null, // null for auto-detect
    task: 'transcribe',
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false, // Disabled for performance
    force_full_sequences: false,
    sampling_rate: 16000
  };
  
  const transcriptionOptions = { ...defaultOptions, ...options };
  
  console.log(`[${new Date().toISOString()}] Starting transcription with options:`, {
    language: transcriptionOptions.language || 'auto',
    chunk_length_s: transcriptionOptions.chunk_length_s,
    return_timestamps: transcriptionOptions.return_timestamps
  });
  
  const result = await transcriber(audioPath, transcriptionOptions);
  
  return result;
}

/**
 * Validate audio file
 * @param {Object} audioFile - Audio file object with content and filename
 * @throws {Error} If file is invalid
 */
function validateAudioFile(audioFile) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FORMATS = ['.wav', '.mp3', '.m4a', '.ogg', '.webm', '.flac', '.aac'];
  
  if (audioFile.content && audioFile.content.length > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el límite de 10MB (${Math.round(audioFile.content.length / 1024 / 1024)}MB)`);
  }
  
  if (audioFile.filename) {
    const path = require('path');
    const ext = path.extname(audioFile.filename).toLowerCase();
    if (!ALLOWED_FORMATS.includes(ext)) {
      throw new Error(`Formato no soportado: ${ext}. Formatos permitidos: ${ALLOWED_FORMATS.join(', ')}`);
    }
  }
  
  return true;
}

/**
 * Get standardized error response
 * @param {Error} error - Error object
 * @returns {Object} Error response with status code and body
 */
function getErrorResponse(error) {
  let statusCode = 500;
  let errorResponse = {
    error: 'Error al transcribir el archivo',
    details: error.message,
    timestamp: new Date().toISOString()
  };
  
  if (error.message.includes('límite') || error.message.includes('Formato no soportado')) {
    statusCode = 400;
    errorResponse.error = 'Archivo inválido';
  } else if (error.message.includes('Failed to initialize')) {
    statusCode = 503;
    errorResponse.error = 'Servicio temporalmente no disponible';
    errorResponse.retry_after = 30;
  } else if (error.message.includes('memory') || error.message.includes('timeout')) {
    statusCode = 504;
    errorResponse.error = 'Tiempo de procesamiento excedido';
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    errorResponse.error = 'Archivo no encontrado';
  }
  
  return { statusCode, errorResponse };
}

/**
 * Get CORS headers for responses
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

module.exports = {
  getTranscriptionPipeline,
  transcribeAudio,
  validateAudioFile,
  getErrorResponse,
  getCORSHeaders
};