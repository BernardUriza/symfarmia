// whisperService.js
let whisperModel = null;
let loadPromise = null;

export async function loadWhisperModel({ retryCount = 3, retryDelay = 1000, onProgress } = {}) {
  if (whisperModel) return whisperModel;
  if (loadPromise) return loadPromise; // prevent duplicate loads

  loadPromise = (async () => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const { pipeline } = await import('@xenova/transformers');
        whisperModel = await pipeline('automatic-speech-recognition', 'Xenova/whisper-medium', {
          progress_callback: onProgress,
        });
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
  })();

  return loadPromise;
}

export async function transcribeAudio(float32Audio, modelOptions = {}) {
  if (!whisperModel) throw new Error('Whisper model not loaded');
  return whisperModel(float32Audio, modelOptions);
}
