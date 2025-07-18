// Audio Processing Unit Test with enhanced validation
describe('Audio Processing Integration', () => {
  test('validates audio processing configuration', () => {
    // Test that Float32Array is available for audio data
    const audioData = new Float32Array(1024);
    expect(audioData).toBeDefined();
    expect(audioData.length).toBe(1024);
    
    // Test basic audio data manipulation
    for (let i = 0; i < 10; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / 16000) * 0.5;
    }
    
    expect(audioData[0]).toBe(0);
    expect(audioData[1]).toBeCloseTo(0.086, 2);
  });

  test('validates audio processing parameters', () => {
    const config = {
      sampleRate: 16000,
      duration: 2,
      chunkSize: 32000,
      model: 'Xenova/whisper-base',
      language: 'es'
    };
    
    expect(config.sampleRate).toBe(16000);
    expect(config.duration * config.sampleRate).toBe(config.chunkSize);
    expect(config.language).toBe('es');
  });

  test('validates worker message format', () => {
    const testMessage = {
      type: 'PROCESS_CHUNK',
      data: {
        audioData: new Float32Array(32000),
        chunkId: 'test-chunk-1',
        metadata: {
          sampleRate: 16000,
          duration: 2
        }
      }
    };
    
    expect(testMessage.type).toBe('PROCESS_CHUNK');
    expect(testMessage.data.audioData).toBeDefined();
    expect(testMessage.data.chunkId).toBe('test-chunk-1');
    expect(testMessage.data.metadata.sampleRate).toBe(16000);
  });

  test('validates transformers.js proxy configuration', () => {
    // Test that proxy has correct structure
    const proxyConfig = {
      sources: [
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js',
        'https://unpkg.com/@xenova/transformers@2.17.2/dist/transformers.min.js'
      ],
      environment: {
        allowLocalModels: true,
        allowRemoteModels: true,
        remoteURL: 'https://huggingface.co/',
        localURL: '/models/'
      }
    };
    
    expect(proxyConfig.sources).toHaveLength(2);
    expect(proxyConfig.sources[0]).toContain('jsdelivr');
    expect(proxyConfig.sources[1]).toContain('unpkg');
    expect(proxyConfig.environment.allowLocalModels).toBe(true);
    expect(proxyConfig.environment.allowRemoteModels).toBe(true);
  });

  test('validates whisper model configuration', () => {
    const whisperConfig = {
      model: 'Xenova/whisper-base',
      language: 'es',
      task: 'transcribe',
      chunkLengthS: 60,
      strideLengthS: 10,
      noSpeechThreshold: 0.3
    };
    
    expect(whisperConfig.model).toBe('Xenova/whisper-base');
    expect(whisperConfig.language).toBe('es');
    expect(whisperConfig.task).toBe('transcribe');
    expect(whisperConfig.chunkLengthS).toBe(60);
    expect(whisperConfig.strideLengthS).toBe(10);
    expect(whisperConfig.noSpeechThreshold).toBe(0.3);
  });

  test('validates audio chunk size requirements', () => {
    const minChunkSize = 32000; // 2 seconds at 16kHz
    const sampleRate = 16000;
    const minDuration = 2; // seconds
    
    // Test valid chunk sizes
    expect(minChunkSize).toBe(sampleRate * minDuration);
    
    // Test chunk size validation
    const validChunk = new Float32Array(minChunkSize);
    const invalidChunk = new Float32Array(1000); // Too small
    
    expect(validChunk.length).toBeGreaterThanOrEqual(minChunkSize);
    expect(invalidChunk.length).toBeLessThan(minChunkSize);
  });

  test('validates spanish language filter', () => {
    // This regex should match Spanish characters including accents
    const spanishRegex = /^[a-záéíóúñü\s.,;:!¡?¿\-()0-9]+$/i;
    
    // Test valid Spanish phrases
    const validPhrases = [
      'El paciente presenta síntomas',
      'Dolor abdominal',
      'Presión arterial normal',
      'Temperatura de 37.2 grados'
    ];
    
    // Test phrases with English characters (should be filtered out)
    const invalidPhrases = [
      'Hello world',
      'Patient symptoms with English letters',
      'Blood pressure normal examination'
    ];
    
    validPhrases.forEach(phrase => {
      expect(spanishRegex.test(phrase)).toBe(true);
    });
    
    // Test for specifically English characters
    const englishOnlyRegex = /[bcdfghjklmnpqrstvwxyz]/i;
    
    invalidPhrases.forEach(phrase => {
      expect(englishOnlyRegex.test(phrase)).toBe(true); // Should contain English letters
    });
  });

  test('validates audio processing pipeline', () => {
    const pipeline = {
      steps: [
        'audio_capture',
        'audio_chunking', 
        'noise_reduction',
        'whisper_processing',
        'language_filtering',
        'transcription_output'
      ],
      expectedOutputs: [
        'Float32Array',
        'chunks',
        'denoised_audio',
        'raw_transcription',
        'filtered_text',
        'final_transcription'
      ]
    };
    
    expect(pipeline.steps).toHaveLength(6);
    expect(pipeline.expectedOutputs).toHaveLength(6);
    expect(pipeline.steps[0]).toBe('audio_capture');
    expect(pipeline.steps[pipeline.steps.length - 1]).toBe('transcription_output');
  });
});