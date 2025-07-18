import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulate browser environment
global.window = global;
global.document = {};
global.navigator = {};
global.AudioContext = class AudioContext {
  decodeAudioData(buffer) {
    // Simple WAV decoder
    const view = new DataView(buffer);
    const sampleRate = view.getUint32(24, true);
    const channels = view.getUint16(22, true);
    const samples = new Float32Array((buffer.byteLength - 44) / 2);
    
    for (let i = 0; i < samples.length; i++) {
      samples[i] = view.getInt16(44 + i * 2, true) / 32768.0;
    }
    
    return Promise.resolve({
      sampleRate,
      duration: samples.length / sampleRate,
      numberOfChannels: channels,
      length: samples.length,
      getChannelData: () => samples
    });
  }
};

async function test() {
  try {
    console.log('Loading Transformers.js...');
    const { pipeline } = await import('@xenova/transformers');
    
    console.log('Creating pipeline...');
    const transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-base'
    );
    
    console.log('Loading sample.wav...');
    const wavBuffer = await fs.readFile(join(__dirname, 'public/test-audio/sample.wav'));
    
    // Decode WAV
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(wavBuffer.buffer);
    const audioData = audioBuffer.getChannelData(0);
    
    console.log(`Audio: ${audioBuffer.duration.toFixed(2)}s, ${audioData.length} samples`);
    
    console.log('Transcribing...');
    const result = await transcriber(audioData, {
      language: 'es',
      task: 'transcribe'
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('TRANSCRIPTION:');
    console.log('='.repeat(50));
    console.log(result.text);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();