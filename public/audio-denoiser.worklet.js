// audio-denoiser.worklet.js

// Configure Module before importing
self.Module = {
  locateFile: (filename) => {
    if (filename.endsWith('.wasm')) {
      return '/rnnoise.wasm';
    }
    return filename;
  }
};

// Import the sync version of RNNoise
importScripts('/rnnoise-sync.js');

let rnnoise = null;
let buffer = [];
const FRAME_SIZE = 480;

class AudioDenoiserProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    console.log('[Worklet] AudioDenoiserProcessor created, waiting for init message...');
  }

  async initializeRNNoise() {
    try {
      console.log('[Worklet] Initializing RNNoise...');
      
      // createRNNWasmModuleSync should be available from the imported script
      if (typeof createRNNWasmModuleSync !== 'undefined') {
        console.log('[Worklet] createRNNWasmModuleSync found, creating module...');
        const rnnoiseModule = createRNNWasmModuleSync();
        
        // Wait for module to be ready
        if (rnnoiseModule.calledRun === false) {
          await new Promise(resolve => {
            rnnoiseModule.onRuntimeInitialized = resolve;
          });
        }
        
        console.log('[Worklet] RNNoise module ready, creating denoiser...');
        
        // Create denoiser instance
        const state = rnnoiseModule._rnnoise_create();
        if (!state) {
          throw new Error('Failed to create RNNoise state');
        }
        
        rnnoise = {
          state: state,
          process: (frame) => {
            const ptr = rnnoiseModule._malloc(frame.length * 2);
            rnnoiseModule.HEAP16.set(frame, ptr >> 1);
            rnnoiseModule._rnnoise_process_frame(rnnoise.state, ptr, ptr);
            const result = new Int16Array(frame.length);
            result.set(rnnoiseModule.HEAP16.subarray(ptr >> 1, (ptr >> 1) + frame.length));
            rnnoiseModule._free(ptr);
            return result;
          },
          module: rnnoiseModule
        };
        
        console.log('[Worklet] RNNoise initialized successfully');
        this.port.postMessage({ type: 'init-complete' });
      } else {
        throw new Error('createRNNWasmModuleSync not found');
      }
    } catch (error) {
      console.error('[Worklet] RNNoise initialization error:', error);
      this.port.postMessage({ type: 'init-error', error: error.message });
    }
  }

  handleMessage(event) {
    if (event.data.type === 'init') {
      console.log('[Worklet] Received init message');
      this.initializeRNNoise();
    }
  }

  process(inputs) {
    if (!rnnoise) return true;
    const input = inputs[0][0];
    if (!input) return true;

    for (let i = 0; i < input.length; i++) buffer.push(input[i]);
    while (buffer.length >= FRAME_SIZE) {
      const frame = buffer.splice(0, FRAME_SIZE);
      const int16Frame = new Int16Array(FRAME_SIZE);
      for (let i = 0; i < FRAME_SIZE; i++) {
        int16Frame[i] = Math.max(-32768, Math.min(32767, frame[i] * 32767));
      }
      const out16 = rnnoise.process(int16Frame);
      const outFloat = new Float32Array(FRAME_SIZE);
      for (let i = 0; i < FRAME_SIZE; i++) {
        outFloat[i] = out16[i] / 32767;
      }
      this.port.postMessage({ type: 'denoised', data: outFloat.buffer }, [outFloat.buffer]);
    }
    return true;
  }
}

registerProcessor('audio-denoiser-processor', AudioDenoiserProcessor);
