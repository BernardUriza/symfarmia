// audioProcessingService.ts - Simple and working implementation based on checkpoint1
import type { 
  AutomaticSpeechRecognitionPipeline,
  AutomaticSpeechRecognitionOutput 
} from '@xenova/transformers';

let whisperModel: AutomaticSpeechRecognitionPipeline | null = null;
let loadPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

interface LoadWhisperModelOptions {
  retryCount?: number;
  retryDelay?: number;
  onProgress?: (progress: any) => void;
}

export async function loadWhisperModel(options: LoadWhisperModelOptions = {}): Promise<AutomaticSpeechRecognitionPipeline> {
  const { retryCount = 3, retryDelay = 1000, onProgress } = options;
  
  if (whisperModel) {
    console.log('🎯 [AudioProcessing] Model already loaded, returning cached instance');
    return whisperModel;
  }
  
  if (loadPromise) {
    console.log('⏳ [AudioProcessing] Model loading in progress, waiting for completion...');
    return loadPromise;
  }

  loadPromise = (async () => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`🔄 [AudioProcessing] Loading Whisper model, attempt ${attempt}/${retryCount}`);
        const { pipeline } = await import('@xenova/transformers');
        
        // Try to load from CDN with explicit quantized model
        const modelId = 'Xenova/whisper-tiny';
        console.log(`🎯 [AudioProcessing] Loading model: ${modelId}`);
        
        const model = await pipeline('automatic-speech-recognition', modelId, {
          progress_callback: (progress: any) => {
            console.log(`📊 [AudioProcessing] Download progress:`, progress);
            if (onProgress) onProgress(progress);
          },
          // Force use of remote models
          local_files_only: false,
          // Use quantized model for faster loading
          quantized: true
        });
        
        whisperModel = model;
        console.log('✅ [AudioProcessing] Whisper model loaded successfully!');
        console.log('🔍 [AudioProcessing] Model type:', typeof model, 'Model:', model);
        return model;
      } catch (err) {
        console.warn(`❌ [AudioProcessing] Attempt ${attempt} failed:`, err);
        if (attempt < retryCount) {
          console.log(`⏱️ [AudioProcessing] Waiting ${retryDelay}ms before retry...`);
          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          loadPromise = null;
          console.error('💥 [AudioProcessing] All attempts failed, throwing error');
          throw err;
        }
      }
    }
    
    // This should never be reached due to the throw above, but TypeScript needs it
    throw new Error('Failed to load model after all attempts');
  })();

  return loadPromise;
}

interface TranscribeOptions {
  language?: string;
  task?: string;
  [key: string]: any;
}

export async function transcribeAudio(
  float32Audio: Float32Array, 
  modelOptions: TranscribeOptions = {}
): Promise<{ text: string; [key: string]: any }> {
  if (!whisperModel) {
    console.error('🚫 [AudioProcessing] Model not loaded, cannot transcribe');
    throw new Error('Whisper model not loaded');
  }
  
  console.log(`🎤 [AudioProcessing] Transcribing audio with ${float32Audio.length} samples`);
  console.log('⚙️ [AudioProcessing] Model options:', modelOptions);
  
  try {
    console.log('🔧 [AudioProcessing] Calling whisperModel with audio...');
    console.log('🔍 [AudioProcessing] Model is:', whisperModel);
    
    // Check if model is a function
    if (typeof whisperModel !== 'function') {
      console.error('❌ [AudioProcessing] Model is not a function, cannot transcribe');
      throw new Error('Whisper model not properly loaded');
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transcription timeout after 10s')), 10000)
    );
    
    const result = await Promise.race([
      whisperModel(float32Audio, modelOptions),
      timeoutPromise
    ]);
    
    console.log('📋 [AudioProcessing] Raw result from model:', result);
    
    // Handle both single output and array output
    let transcriptionResult: { text: string; [key: string]: any };
    
    if (Array.isArray(result)) {
      // If array, take the first result
      console.log(`📊 [AudioProcessing] Received array result with ${result.length} items`);
      const firstResult = result[0] as AutomaticSpeechRecognitionOutput;
      transcriptionResult = {
        ...(firstResult || {}),
        text: firstResult?.text || '',
        chunks: firstResult?.chunks || []
      };
    } else {
      // Single result
      const singleResult = result as AutomaticSpeechRecognitionOutput;
      transcriptionResult = {
        ...singleResult,
        text: singleResult?.text || '',
        chunks: singleResult?.chunks || []
      };
    }
    
    console.log(`📝 [AudioProcessing] Transcription result:`, transcriptionResult.text);
    console.log('✨ [AudioProcessing] Transcription completed successfully');
    return transcriptionResult;
  } catch (error) {
    console.error('💥 [AudioProcessing] Transcription failed:', error);
    // Return empty result instead of throwing
    return {
      text: '[Error: Could not transcribe audio]',
      error: error instanceof Error ? error.message : 'Unknown error',
      chunks: []
    };
  }
}

// Utility function to check if model is loaded
export function isModelLoaded(): boolean {
  const loaded = whisperModel !== null;
  console.log(`🔍 [AudioProcessing] Model loaded status: ${loaded ? '✅ Yes' : '❌ No'}`);
  return loaded;
}

// Utility function to reset the model (for testing or recovery)
export function resetModel(): void {
  console.log('🔄 [AudioProcessing] Resetting model...');
  whisperModel = null;
  loadPromise = null;
  console.log('✅ [AudioProcessing] Model reset complete');
}