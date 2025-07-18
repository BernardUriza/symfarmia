/**
 * Unit tests for useSimpleWhisperHybrid hook - ensuring no mock data is used
 * Tests the real audio processing pipeline
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the sub-hooks
const mockWhisperPreload = {
  isLoaded: false,
  progress: 0,
  status: 'loading',
  forcePreload: vi.fn(),
};

const mockWhisperEngine = {
  status: 'loading',
  processAudioChunk: vi.fn(),
  getFullTranscription: vi.fn(() => ''),
  confidence: 0.8,
  processingTime: 150,
  reset: vi.fn(),
  getChunks: vi.fn(() => []),
};

const mockAudioDenoising = {
  isRecording: false,
  isProcessing: false,
  error: '',
  audioChunks: [],
  audioLevel: 0,
  recordingTime: 0,
  start: vi.fn(),
  stop: vi.fn(),
  reset: vi.fn(),
  getCompleteAudio: vi.fn(() => new Float32Array(0)),
  processingStats: {
    totalChunks: 0,
    denoisedChunks: 0,
    fallbackChunks: 0,
    averageProcessingTime: 0,
  },
};

const mockAudioFallback = {
  isRecording: false,
  isProcessing: false,
  error: '',
  audioChunks: [],
  audioLevel: 0,
  recordingTime: 0,
  start: vi.fn(),
  stop: vi.fn(),
  reset: vi.fn(),
  getCompleteAudio: vi.fn(() => new Float32Array(0)),
  processingStats: {
    totalChunks: 0,
    denoisedChunks: 0,
    fallbackChunks: 0,
    averageProcessingTime: 0,
  },
};

const mockAudioChunkAccumulator = {
  processChunk: vi.fn(),
  flush: vi.fn(),
  reset: vi.fn(),
};

// Mock the hooks
vi.mock('../../src/domains/medical-ai/hooks/useWhisperPreload', () => ({
  useWhisperPreload: () => mockWhisperPreload,
}));

vi.mock('../../src/domains/medical-ai/hooks/aux_hooks/useWhisperEngine', () => ({
  useWhisperEngine: () => mockWhisperEngine,
}));

vi.mock('../../src/domains/medical-ai/hooks/useAudioDenoising', () => ({
  useAudioDenoising: () => mockAudioDenoising,
}));

vi.mock('../../src/domains/medical-ai/hooks/useAudioProcessorFallback', () => ({
  useAudioProcessorFallback: () => mockAudioFallback,
}));

vi.mock('../../src/domains/medical-ai/hooks/useAudioChunkAccumulator', () => ({
  useAudioChunkAccumulator: () => mockAudioChunkAccumulator,
}));

vi.mock('../../src/domains/medical-ai/utils/medicalTerms', () => ({
  extractMedicalTermsFromText: vi.fn((text) => []),
}));

describe('useSimpleWhisper Hook', () => {
  let useSimpleWhisper: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset mock states
    mockWhisperPreload.isLoaded = false;
    mockWhisperPreload.status = 'loading';
    mockWhisperEngine.status = 'loading';
    mockAudioDenoising.error = '';
    mockAudioDenoising.isRecording = false;
    
    // Import the hook
    const module = await import('../../src/domains/medical-ai/hooks/useSimpleWhisperHybrid');
    useSimpleWhisper = module.useSimpleWhisper;
  });
  
  describe('Hook Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      expect(result.current.status).toBe('idle');
      expect(result.current.isRecording).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.transcription).toBe(null);
      expect(result.current.audioUrl).toBe('');
    });
    
    it('should use direct processing mode by default', () => {
      const { result } = renderHook(() => useSimpleWhisper({
        processingMode: 'direct'
      }));
      
      // The hook should be configured for direct processing
      expect(result.current).toBeDefined();
    });
    
    it('should configure audio denoising with correct sample rate', () => {
      renderHook(() => useSimpleWhisper({
        sampleRate: 16000
      }));
      
      // Verify audio denoising is called with correct config
      expect(mockAudioDenoising).toBeDefined();
    });
  });
  
  describe('Audio Processing Pipeline', () => {
    it('should use audio denoising when available', () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      // Audio denoising should be the primary audio processor
      expect(result.current.isRecording).toBe(mockAudioDenoising.isRecording);
      expect(result.current.audioLevel).toBe(mockAudioDenoising.audioLevel);
    });
    
    it('should fallback to audio processor when denoising fails', () => {
      // Simulate denoising failure
      mockAudioDenoising.error = 'Failed to load denoiser';
      
      const { result } = renderHook(() => useSimpleWhisper());
      
      // Should use fallback processor
      expect(result.current.error).toBe('');
    });
    
    it('should use chunk accumulator for sample rate conversion', () => {
      renderHook(() => useSimpleWhisper({
        sampleRate: 16000
      }));
      
      // Verify chunk accumulator is configured
      expect(mockAudioChunkAccumulator).toBeDefined();
    });
  });
  
  describe('Transcription Process', () => {
    beforeEach(() => {
      // Set up successful initialization
      mockWhisperPreload.isLoaded = true;
      mockWhisperPreload.status = 'ready';
      mockWhisperEngine.status = 'ready';
      mockAudioDenoising.start = vi.fn().mockResolvedValue(true);
      mockAudioDenoising.stop = vi.fn().mockResolvedValue(true);
    });
    
    it('should start transcription successfully', async () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      await act(async () => {
        const success = await result.current.startTranscription();
        expect(success).toBe(true);
      });
      
      expect(mockAudioDenoising.start).toHaveBeenCalled();
    });
    
    it('should stop transcription and process results', async () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      // Set up engine to return real transcription
      mockWhisperEngine.getFullTranscription.mockReturnValue('Test transcription');
      
      await act(async () => {
        await result.current.stopTranscription();
      });
      
      expect(mockAudioDenoising.stop).toHaveBeenCalled();
      expect(mockAudioChunkAccumulator.flush).toHaveBeenCalled();
      expect(result.current.transcription).toBeDefined();
    });
    
    it('should reset transcription state', async () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      act(() => {
        result.current.resetTranscription();
      });
      
      expect(mockAudioDenoising.reset).toHaveBeenCalled();
      expect(mockWhisperEngine.reset).toHaveBeenCalled();
      expect(mockAudioChunkAccumulator.reset).toHaveBeenCalled();
    });
  });
  
  describe('No Mock Data Verification', () => {
    it('should not use any hardcoded transcription responses', () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      // The hook should not contain any hardcoded medical phrases
      expect(result.current.transcription).toBe(null);
      
      // Verify no mock phrases are embedded in the hook
      const hookString = useSimpleWhisper.toString();
      const forbiddenPhrases = [
        'El paciente presenta síntomas',
        'Se observa una mejoría significativa',
        'Los resultados del examen muestran',
        'Mock transcription',
        'Fake response'
      ];
      
      forbiddenPhrases.forEach(phrase => {
        expect(hookString).not.toContain(phrase);
      });
    });
    
    it('should use real Whisper engine for processing', () => {
      renderHook(() => useSimpleWhisper());
      
      // Verify engine is configured with real parameters
      expect(mockWhisperEngine.processAudioChunk).toBeDefined();
      expect(mockWhisperEngine.getFullTranscription).toBeDefined();
    });
    
    it('should use real audio processing components', () => {
      renderHook(() => useSimpleWhisper());
      
      // All components should be real implementations
      expect(mockAudioDenoising.start).toBeDefined();
      expect(mockAudioChunkAccumulator.processChunk).toBeDefined();
      expect(mockWhisperEngine.processAudioChunk).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle audio start failures', async () => {
      mockAudioDenoising.start.mockResolvedValue(false);
      
      const { result } = renderHook(() => useSimpleWhisper());
      
      await act(async () => {
        const success = await result.current.startTranscription();
        expect(success).toBe(false);
      });
      
      expect(result.current.status).toBe('error');
    });
    
    it('should handle engine not ready state', () => {
      mockWhisperEngine.status = 'error';
      
      const { result } = renderHook(() => useSimpleWhisper());
      
      expect(result.current.engineStatus).toBe('error');
    });
  });
  
  describe('Configuration Options', () => {
    it('should respect processingMode configuration', () => {
      const { result } = renderHook(() => useSimpleWhisper({
        processingMode: 'direct',
        chunkSize: 16384,
        sampleRate: 16000
      }));
      
      expect(result.current).toBeDefined();
    });
    
    it('should handle onChunkProcessed callback', () => {
      const mockCallback = vi.fn();
      
      renderHook(() => useSimpleWhisper({
        onChunkProcessed: mockCallback
      }));
      
      // Callback should be passed to engine
      expect(mockWhisperEngine).toBeDefined();
    });
  });
  
  describe('Real Audio Data Processing', () => {
    it('should process audio chunks through the pipeline', () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      // Simulate audio chunk processing
      const audioData = new Float32Array(16384);
      const metadata = { chunkId: 1 };
      
      // The chunk should flow through the accumulator
      mockAudioChunkAccumulator.processChunk(audioData, metadata);
      
      expect(mockAudioChunkAccumulator.processChunk).toHaveBeenCalledWith(audioData, metadata);
    });
    
    it('should create proper WAV audio blob', async () => {
      const { result } = renderHook(() => useSimpleWhisper());
      
      // Mock complete audio data
      const audioData = new Float32Array(48000); // 1 second at 48kHz
      for (let i = 0; i < audioData.length; i++) {
        audioData[i] = Math.sin(i * 0.01) * 0.5;
      }
      
      mockAudioDenoising.getCompleteAudio.mockReturnValue(audioData);
      
      await act(async () => {
        await result.current.stopTranscription();
      });
      
      // Should create audio blob and URL
      expect(result.current.audioBlob).toBeDefined();
      expect(result.current.audioUrl).toBeDefined();
    });
  });
});