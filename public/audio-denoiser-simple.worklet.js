// audio-denoiser-simple.worklet.js
// Simplified version without RNNoise for testing

class AudioDenoiserProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.buffer = [];
    this.bufferSize = 16384; // Accumulate samples before sending
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
      
      // Accumulate samples in buffer
      for (let i = 0; i < input[0].length; i++) {
        this.buffer.push(input[0][i]);
      }
      
      // Send buffer when it reaches the desired size
      if (this.buffer.length >= this.bufferSize) {
        const chunk = new Float32Array(this.buffer.splice(0, this.bufferSize));
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