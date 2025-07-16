// Global flag to track configuration
let isConfigured = false;

// Configure Xenova Transformers to use CDN and enable caching
export const configureTransformers = async () => {
  // Only configure once
  if (isConfigured) {
    return;
  }
  
  try {
    const { env } = await import('@xenova/transformers');
    
    // Use Hugging Face CDN for model files
    env.allowRemoteModels = true;
    env.remoteURL = 'https://huggingface.co/';
    
    // Enable local caching in IndexedDB
    env.allowLocalModels = true;
    env.localModelPath = '/models';
    env.cacheDir = '.transformers-cache';
    
    // Enable model caching
    env.useBrowserCache = true;
    env.useIndexedDB = true;
    
    // Suppress ONNX Runtime warnings
    // Check if wasm object exists before setting properties
    if (env.wasm) {
      env.wasm.logLevel = 'error'; // Only show errors, not warnings
      env.wasm.numThreads = 1; // Use single thread to avoid issues
    } else if (env.onnx) {
      // Alternative: Some versions might use env.onnx instead
      env.onnx.logLevel = 'error';
    }
    
    // Alternative method to suppress warnings globally
    if (typeof env.logLevel !== 'undefined') {
      env.logLevel = 'error';
    }
    
    isConfigured = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[TransformersConfig] Configured with caching enabled');
      console.log('[TransformersConfig] Cache settings:', {
        allowLocalModels: env.allowLocalModels,
        localModelPath: env.localModelPath,
        cacheDir: env.cacheDir,
        useBrowserCache: env.useBrowserCache,
        useIndexedDB: env.useIndexedDB
      });
    }
  } catch (error) {
    console.error('[TransformersConfig] Failed to configure transformers:', error);
  }
};

// Call this early in your app initialization
if (typeof window !== 'undefined') {
  configureTransformers();
}