import type { Pipeline } from '@xenova/transformers';
import { configureTransformers } from '../config/transformersConfig';

let whisperModel: Pipeline | null = null;
let loadPromise: Promise<Pipeline> | null = null;

export interface WhisperPipelineOptions {
  progress_callback?: (progress: { progress: number }) => void;
  [key: string]: any;
}

export interface LoadWhisperModelOptions extends WhisperPipelineOptions {
  retryCount?: number;
  retryDelay?: number;
}

// Carga y memoiza el modelo Whisper
export async function loadWhisperModel({
  retryCount = 3,
  retryDelay = 1000,
  ...pipelineOptions
}: LoadWhisperModelOptions = {}): Promise<Pipeline> {
  // First, check if we already have a loaded model
  if (whisperModel) return whisperModel;
  
  // Check if there's an ongoing load
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Ensure transformers is configured
    await configureTransformers();
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const { pipeline } = await import('@xenova/transformers');
        whisperModel = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-base',
          pipelineOptions // <-- Ahora tipado y extensible
        );
        return whisperModel;
      } catch (err) {
        if (attempt < retryCount) {
          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          loadPromise = null;
          throw err;
        }
      }
    }
    throw new Error('Failed to load Whisper model.');
  })();

  return loadPromise;
}

export async function transcribeAudio(
  float32Audio: Float32Array,
  options?: Record<string, any>
): Promise<any> {
  // Load model if not already loaded
  if (!whisperModel) {
    await loadWhisperModel();
  }
  
  if (!whisperModel) throw new Error('Whisper model not loaded');
  return whisperModel(float32Audio, options);
}

export function resetWhisperModel() {
  whisperModel = null;
  loadPromise = null;
}

// Note: This service provides direct (non-worker) model usage
// For most use cases, use the worker-based approach via whisperModelCache
// This is kept for compatibility but should be avoided to prevent duplicate model loading
