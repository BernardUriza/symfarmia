import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import { Blob } from 'buffer';
import { writeFileSync, unlinkSync } from 'fs';
import crypto from 'crypto';

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
export async function getTranscriptionPipeline() {
  if (!transcriptionPipeline) {
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