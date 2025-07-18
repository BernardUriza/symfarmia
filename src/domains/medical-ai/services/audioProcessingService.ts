// audioProcessingService.ts - Simple and working implementation based on checkpoint1
let whisperModel = null;
let loadPromise = null;

export async function loadWhisperModel({ retryCount = 3, retryDelay = 1000, onProgress } = {}) {
  if (whisperModel) return whisperModel;
  if (loadPromise) return loadPromise; // prevent duplicate loads

  loadPromise = (async () => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`[AudioProcessing] Loading Whisper model, attempt ${attempt}/${retryCount}`);
        const { pipeline } = await import('@xenova/transformers');
        whisperModel = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
          progress_callback: onProgress,
        });
        console.log('[AudioProcessing] Whisper model loaded successfully');
        return whisperModel;
      } catch (err) {
        console.warn(`[AudioProcessing] Attempt ${attempt} failed:`, err);
        if (attempt < retryCount) {
          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          loadPromise = null;
          throw err;
        }
      }
    }
  })();

  return loadPromise;
}

export async function transcribeAudio(float32Audio, modelOptions = {}) {
  if (!whisperModel) throw new Error('Whisper model not loaded');
  console.log(`[AudioProcessing] Transcribing audio with ${float32Audio.length} samples`);
  const result = await whisperModel(float32Audio, modelOptions);
  console.log(`[AudioProcessing] Transcription result:`, result.text);
  return result;
}