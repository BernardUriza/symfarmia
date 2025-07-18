// audio-denoiser.worklet.js

let rnnoise = null;
let buffer = [];
const FRAME_SIZE = 480;

class AudioDenoiserProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    if (event.data.type === 'rnnoise-init') {
      rnnoise = event.data.rnnoise;
      this.port.postMessage({ type: 'init-complete' });
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
