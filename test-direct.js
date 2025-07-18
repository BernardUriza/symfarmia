// Direct test using existing code
import { loadWhisperModel, transcribeAudio } from './src/domains/medical-ai/services/audioProcessingService.js';
import { promises as fs } from 'fs';

async function test() {
    try {
        console.log('Loading model...');
        await loadWhisperModel();
        
        console.log('Reading WAV file...');
        const audioBuffer = await fs.readFile('/workspaces/symfarmia/public/test-audio/sample.wav');
        
        // Create audio context (simulated for Node.js)
        // In a real browser environment, this would use Web Audio API
        console.log('Converting to Float32Array...');
        
        // For now, let's create a dummy Float32Array
        // In production, you'd properly decode the WAV file
        const float32Audio = new Float32Array(16000 * 3); // 3 seconds at 16kHz
        
        console.log('Transcribing...');
        const result = await transcribeAudio(float32Audio, {
            language: 'es',
            task: 'transcribe'
        });
        
        console.log('\nRESULT:', result.text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

test();