import path from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import crypto from 'crypto';

// Set required environment variables before importing transformers
if (typeof process !== 'undefined' && !process.env.TRANSFORMERS_CACHE) {
  process.env.TRANSFORMERS_CACHE = '/tmp/.cache';
}

// Global variables for lazy loading
let pipeline = null;
let env = null;
let transformersLoaded = false;

// Global pipeline cache for warm starts
let transcriptionPipeline = null;

/**
 * Lazy load transformers module
 */
async function loadTransformers() {
  if (transformersLoaded) return { pipeline, env };
  
  try {
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
    env = transformers.env;
    
    // Configure Xenova environment for serverless
    if (env) {
      env.cacheDir = '/tmp/.cache';
      env.allowRemoteModels = true;
      env.allowLocalModels = false;
      env.backends = {
        onnx: {
          wasm: {
            proxy: false,
            numThreads: 1
          }
        }
      };
    }
    
    transformersLoaded = true;
    return { pipeline, env };
  } catch (error) {
    console.error('Failed to import transformers:', error.message);
    throw new Error('Transformers.js is not available in this environment');
  }
}

/**
 * Get or initialize the Whisper transcription pipeline
 * Uses global cache to optimize cold/warm starts
 */
export async function getTranscriptionPipeline() {
  // Ensure transformers is loaded
  const { pipeline: pipelineFunc } = await loadTransformers();
  
  if (!pipelineFunc) {
    throw new Error('Pipeline function is not available');
  }
  
  if (!transcriptionPipeline) {
    const startTime = Date.now();
    
    try {
      transcriptionPipeline = await pipelineFunc(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
          quantized: true,
          revision: 'main'
        }
      );
    } catch (error) {
      throw new Error(`Failed to initialize Whisper model: ${error.message}`);
    }
  }
  
  return transcriptionPipeline;
}

/**
 * Transcribe audio from buffer with optimized settings
 * @param {Buffer|Uint8Array} audioBuffer - Audio data buffer
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} Transcription result
 */
export async function transcribeAudio(audioBuffer, options = {}) {
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
  
  // In serverless Node.js, Xenova/Transformers expects a file path
  // We need to write the buffer to a temporary file
  const tempFileName = `audio_${crypto.randomBytes(16).toString('hex')}.wav`;
  const tempFilePath = path.join('/tmp', tempFileName);
  
  let result;
  
  try {
    // Write buffer to temporary file
    writeFileSync(tempFilePath, audioBuffer);
    
    // Pass the file path to the transcriber
    result = await transcriber(tempFilePath, transcriptionOptions);
    
  } catch (error) {
    console.error('Transcription error:', error.message);
    throw new Error(`Transcription failed: ${error.message}`);
  } finally {
    // Always clean up the temporary file
    try {
      unlinkSync(tempFilePath);
    } catch (cleanupError) {
      console.error('Failed to clean up temp file:', cleanupError.message);
    }
  }
  
  return result;
}

/**
 * Validate audio file
 * @param {Object} audioFile - Audio file object with content and filename
 * @throws {Error} If file is invalid
 */
export function validateAudioFile(audioFile) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FORMATS = ['.wav', '.mp3', '.m4a', '.ogg', '.webm', '.flac', '.aac'];
  
  if (audioFile.content && audioFile.content.length > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el límite de 10MB (${Math.round(audioFile.content.length / 1024 / 1024)}MB)`);
  }
  
  if (audioFile.filename) {
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
export function getErrorResponse(error) {
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
  } else if (error.message.includes('Transformers.js is not available')) {
    statusCode = 503;
    errorResponse.error = 'Servicio de transcripción no disponible';
    errorResponse.help = 'El módulo de transcripción no pudo cargarse en este entorno';
  }
  
  return { statusCode, errorResponse };
}

/**
 * Get CORS headers for responses
 */
export function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}
