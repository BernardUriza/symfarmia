# Audio Processing Flow

This document summarizes the new audio capture architecture.

1. **AudioChunkManager** collects raw audio data from `useAudioProcessor` and emits fixed-size chunks.
2. **useAudioDenoising** centralizes capture and applies denoising via `AudioPipelineIntegration`.
3. **whisperModelCache** provides a single worker instance and exposes `sendMessage` and `addMessageListener` for communication.
4. **useWhisperWorker** subscribes to the cache, sends chunks for processing and gathers results.
5. **useSimpleWhisper** provides high-level controls via its React hook interface (no context wrapper).

With this flow, audio moves cleanly from capture to transcription, reducing the risk of stack overflows from recursive listeners.
