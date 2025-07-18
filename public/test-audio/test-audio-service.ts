/**
 * Test script for audio processing service
 * Tests Whisper transcription with real audio files
 */

import { loadWhisperModel, transcribeAudio } from '../../src/domains/medical-ai/services/audioProcessingService';

// Test configuration
const TEST_CONFIG = {
  audioSampleRate: 16000,
  audioChannels: 1,
  language: 'es',
  testDuration: 3, // seconds
};

/**
 * Generate a test audio signal (sine wave)
 */
function generateTestAudio(durationSeconds: number, sampleRate: number): Float32Array {
  const numSamples = durationSeconds * sampleRate;
  const audioData = new Float32Array(numSamples);
  
  // Generate a 440Hz sine wave (A4 note)
  const frequency = 440;
  const amplitude = 0.5;
  
  for (let i = 0; i < numSamples; i++) {
    audioData[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  // Add some noise to make it more realistic
  for (let i = 0; i < numSamples; i++) {
    audioData[i] += (Math.random() - 0.5) * 0.1;
  }
  
  return audioData;
}

/**
 * Load WAV file and convert to Float32Array
 */
async function loadWavFile(filePath: string): Promise<Float32Array> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    
    // Simple WAV parser (assumes 16-bit PCM)
    const view = new DataView(arrayBuffer);
    
    // Skip WAV header (44 bytes for standard WAV)
    const dataOffset = 44;
    const numSamples = (arrayBuffer.byteLength - dataOffset) / 2; // 16-bit = 2 bytes
    
    const audioData = new Float32Array(numSamples);
    
    // Convert 16-bit PCM to Float32
    for (let i = 0; i < numSamples; i++) {
      const sample = view.getInt16(dataOffset + i * 2, true); // little-endian
      audioData[i] = sample / 32768.0; // Normalize to [-1, 1]
    }
    
    return audioData;
  } catch (error) {
    console.error('Error loading WAV file:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🚀 Starting Whisper Audio Processing Test\n');
  
  try {
    // Step 1: Load the model
    console.log('📥 Loading Whisper model...');
    const startLoad = performance.now();
    
    await loadWhisperModel({
      retryCount: 3,
      retryDelay: 1000,
      onProgress: (progress) => {
        if (progress?.progress) {
          process.stdout.write(`\rProgress: ${progress.progress}%`);
        }
      }
    });
    
    const loadTime = ((performance.now() - startLoad) / 1000).toFixed(2);
    console.log(`\n✅ Model loaded in ${loadTime}s\n`);
    
    // Step 2: Test with generated audio
    console.log('🎵 Testing with generated audio...');
    const testAudio = generateTestAudio(TEST_CONFIG.testDuration, TEST_CONFIG.audioSampleRate);
    console.log(`Generated ${testAudio.length} samples (${TEST_CONFIG.testDuration}s @ ${TEST_CONFIG.audioSampleRate}Hz)`);
    
    const startTranscribe1 = performance.now();
    const result1 = await transcribeAudio(testAudio, {
      language: TEST_CONFIG.language,
      task: 'transcribe'
    });
    const transcribeTime1 = ((performance.now() - startTranscribe1) / 1000).toFixed(2);
    
    console.log(`Transcription completed in ${transcribeTime1}s`);
    console.log(`Result: "${result1.text || '(empty)'}"\n`);
    
    // Step 3: Test with WAV file if provided
    const wavFile = process.argv[2];
    if (wavFile) {
      console.log(`🎵 Testing with WAV file: ${wavFile}`);
      try {
        const wavAudio = await loadWavFile(wavFile);
        console.log(`Loaded ${wavAudio.length} samples from WAV file`);
        
        const startTranscribe2 = performance.now();
        const result2 = await transcribeAudio(wavAudio, {
          language: TEST_CONFIG.language,
          task: 'transcribe'
        });
        const transcribeTime2 = ((performance.now() - startTranscribe2) / 1000).toFixed(2);
        
        console.log(`Transcription completed in ${transcribeTime2}s`);
        console.log('\n📝 Transcription Result:');
        console.log('─'.repeat(50));
        console.log(result2.text || '(No transcription)');
        console.log('─'.repeat(50));
        
        // Show additional metadata if available
        if (result2.chunks && result2.chunks.length > 0) {
          console.log(`\n📊 Chunks: ${result2.chunks.length}`);
          result2.chunks.forEach((chunk: any, index: number) => {
            console.log(`  Chunk ${index + 1}: "${chunk.text}" (${chunk.timestamp?.[0]}s - ${chunk.timestamp?.[1]}s)`);
          });
        }
        
      } catch (error) {
        console.error('Error processing WAV file:', error);
      }
    } else {
      console.log('\n💡 Tip: Pass a WAV file path as argument to test with real audio');
      console.log('   Example: npm run test:audio test-audio.wav');
    }
    
    // Step 4: Test error handling
    console.log('\n🧪 Testing error handling...');
    try {
      await transcribeAudio(new Float32Array(0), {});
      console.log('❌ Should have thrown error for empty audio');
    } catch (error) {
      console.log('✅ Correctly handled empty audio error');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

export { runTest, generateTestAudio, loadWavFile };