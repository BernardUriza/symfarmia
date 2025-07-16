// Configure Xenova Transformers to use CDN instead of local models
export const configureTransformers = async () => {
  try {
    const { env } = await import('@xenova/transformers');
    
    // Use Hugging Face CDN for model files
    env.allowRemoteModels = true;
    env.remoteURL = 'https://huggingface.co/';
    
    // Disable local model path to prevent 404s
    env.localModelPath = '';
    
    // Suppress ONNX Runtime warnings
    env.wasm.logLevel = 'error'; // Only show errors, not warnings
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[TransformersConfig] Configured to use Hugging Face CDN');
    }
  } catch (error) {
    console.error('[TransformersConfig] Failed to configure transformers:', error);
  }
};

// Call this early in your app initialization
if (typeof window !== 'undefined') {
  configureTransformers();
}