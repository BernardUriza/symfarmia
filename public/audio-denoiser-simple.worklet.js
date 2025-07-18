// audio-denoiser-simple.worklet.js
// Simplified version without RNNoise for testing

class AudioDenoiserProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    console.log('[SimpleWorklet] AudioDenoiserProcessor created');
  }

  handleMessage(event) {
    console.log('[SimpleWorklet] Received message:', event.data);
    
    if (event.data.type === 'init') {
      console.log('[SimpleWorklet] Processing init message');
      // Send immediate response since AudioWorklet doesn't have setTimeout
      console.log('[SimpleWorklet] Sending init-complete');
      this.port.postMessage({ type: 'init-complete' });
    }
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input && input[0] && output && output[0]) {
      // Simple passthrough for now
      output[0].set(input[0]);
      
      // Send chunks to main thread for processing
      if (Math.random() < 0.01) { // Send ~1% of chunks to avoid flooding
        const chunk = new Float32Array(input[0]);
        this.port.postMessage({ 
          type: 'denoised', 
          data: chunk.buffer 
        }, [chunk.buffer]);
      }
    }
    
    return true;
  }
}

registerProcessor('audio-denoiser-processor', AudioDenoiserProcessor);