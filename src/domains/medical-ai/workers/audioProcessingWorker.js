let pipeline = null;

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

async function initializeModel() {
  try {
    self.postMessage({ type: 'MODEL_LOADING', progress: 0 });
    
    const { pipeline: pipelineConstructor } = await import('@xenova/transformers');
    
    pipeline = await pipelineConstructor(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        progress_callback: (progress) => {
          self.postMessage({ 
            type: 'MODEL_LOADING', 
            progress: progress.progress || 0 
          });
        }
      }
    );
    
    self.postMessage({ type: 'MODEL_READY' });
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: `Failed to initialize model: ${error.message}` 
    });
  }
}

async function processAudioChunk(data) {
  try {
    if (!pipeline) {
      throw new Error('Model not initialized');
    }

    const { audioData, chunkId } = data;
    
    self.postMessage({ 
      type: 'PROCESSING_START', 
      chunkId 
    });

    const result = await pipeline(audioData, {
      return_timestamps: false,
      chunk_length_s: 30,
      stride_length_s: 5
    });

    self.postMessage({ 
      type: 'CHUNK_PROCESSED', 
      chunkId,
      text: result.text || '',
      timestamp: Date.now()
    });
  } catch (error) {
    self.postMessage({ 
      type: 'PROCESSING_ERROR', 
      error: error.message,
      chunkId: data.chunkId 
    });
  }
}

function reset() {
  self.postMessage({ type: 'RESET_COMPLETE' });
}