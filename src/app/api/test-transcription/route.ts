import { NextResponse } from 'next/server';
import { loadWhisperModel, transcribeAudio } from '@/src/domains/medical-ai/services/audioProcessingService';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    console.log('🎯 API: Starting transcription test...');
    
    // Load the model
    console.log('📥 API: Loading Whisper model...');
    await loadWhisperModel();
    
    // Read sample.wav
    const wavPath = path.join(process.cwd(), 'public', 'test-audio', 'sample.wav');
    console.log('📁 API: Reading WAV from:', wavPath);
    
    const wavBuffer = await fs.readFile(wavPath);
    console.log('✅ API: WAV loaded:', wavBuffer.length, 'bytes');
    
    // Simple WAV decoder for Node.js
    const view = new DataView(wavBuffer.buffer);
    const sampleRate = view.getUint32(24, true);
    const channels = view.getUint16(22, true);
    const bitDepth = view.getUint16(34, true);
    const dataOffset = 44;
    
    const numSamples = Math.floor((wavBuffer.length - dataOffset) / (bitDepth / 8) / channels);
    const audioData = new Float32Array(numSamples);
    
    // Convert 16-bit PCM to Float32
    for (let i = 0; i < numSamples; i++) {
      const sample = view.getInt16(dataOffset + i * 2, true);
      audioData[i] = sample / 32768.0;
    }
    
    console.log('🎵 API: Audio decoded:', {
      sampleRate,
      channels,
      duration: numSamples / sampleRate,
      samples: numSamples
    });
    
    // Transcribe
    console.log('🎤 API: Starting transcription...');
    const result = await transcribeAudio(audioData, {
      language: 'es',
      task: 'transcribe'
    });
    
    console.log('✅ API: Transcription result:', result);
    
    return NextResponse.json({
      success: true,
      transcription: result.text || '[No transcription]',
      audioInfo: {
        duration: numSamples / sampleRate,
        sampleRate,
        samples: numSamples
      },
      result
    });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}