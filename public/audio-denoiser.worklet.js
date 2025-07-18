// audio-denoiser.worklet.js

// Configure Module before importing
self.Module = {
  locateFile: (filename) => {
    console.log('[Worklet] Module.locateFile called for:', filename);
    if (filename.endsWith('.wasm')) {
      return '/rnnoise.wasm';
    }
    return filename;
  }
};

console.log('[Worklet] About to import rnnoise-sync.js...');

// Import the sync version of RNNoise
try {
  importScripts('/rnnoise-sync.js');
  console.log('[Worklet] rnnoise-sync.js imported successfully');
} catch (error) {
  console.error('[Worklet] Failed to import rnnoise-sync.js:', error);
}

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
      console.log('[Worklet] Checking available globals:', Object.keys(self).filter(k => k.includes('rnnoise') || k.includes('RNN') || k.includes('Module')));
      
      // Try different ways to access the module
      let moduleCreator = null;
      
      if (typeof createRNNWasmModuleSync !== 'undefined') {
        console.log('[Worklet] Found createRNNWasmModuleSync');
        moduleCreator = createRNNWasmModuleSync;
      } else if (typeof self.createRNNWasmModuleSync !== 'undefined') {
        console.log('[Worklet] Found self.createRNNWasmModuleSync');
        moduleCreator = self.createRNNWasmModuleSync;
      } else if (typeof Module !== 'undefined' && Module._rnnoise_create) {
        console.log('[Worklet] Found existing Module with _rnnoise_create');
        // Module might already be initialized
        const state = Module._rnnoise_create();
        if (state) {
          rnnoise = {
            state: state,
            process: (frame) => {
              const ptr = Module._malloc(frame.length * 2);
              Module.HEAP16.set(frame, ptr >> 1);
              Module._rnnoise_process_frame(rnnoise.state, ptr, ptr);
              const result = new Int16Array(frame.length);
              result.set(Module.HEAP16.subarray(ptr >> 1, (ptr >> 1) + frame.length));
              Module._free(ptr);
              return result;
            },
            module: Module
          };
          
          console.log('[Worklet] RNNoise initialized successfully using existing Module');
          this.port.postMessage({ type: 'init-complete' });
          return;
        }
      }
      
      if (!moduleCreator) {
        throw new Error('No RNNoise module creator function found. Available globals: ' + Object.keys(self).join(', '));
      }
      
      console.log('[Worklet] Creating RNNoise module...');
      const rnnoiseModule = moduleCreator();
      
      // Wait for module to be ready
      if (rnnoiseModule.calledRun === false) {
        console.log('[Worklet] Waiting for module runtime initialization...');
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
    } catch (error) {
      console.error('[Worklet] RNNoise initialization error:', error);
      console.error('[Worklet] Error stack:', error.stack);
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
