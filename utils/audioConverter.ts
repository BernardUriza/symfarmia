/**
 * Convert audio blob to WAV format for better compatibility with Whisper
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  console.log('🔄 Converting audio to WAV format...');
  
  try {
    // Create AudioContext
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000 // Whisper prefers 16kHz
    });
    
    // Decode audio data
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    console.log('📊 Audio decoded:', {
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      duration: audioBuffer.duration,
      length: audioBuffer.length
    });
    
    // Get audio data as Float32Array
    const channelData = audioBuffer.getChannelData(0); // Get first channel
    
    // Create WAV file
    const wavBlob = createWavBlob(channelData, audioBuffer.sampleRate);
    
    console.log('✅ WAV created:', {
      size: wavBlob.size,
      type: wavBlob.type
    });
    
    return wavBlob;
  } catch (error) {
    console.error('❌ Error converting to WAV:', error);
    throw error;
  }
}

function createWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const length = samples.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  
  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, 1, true); // NumChannels (mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  
  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}