# Audio Processing Flow

This document summarizes the new audio capture architecture.

1. **AudioChunkManager** collects raw audio data from `useAudioProcessor` and emits fixed-size chunks.
2. **useUnifiedAudioCapture** uses the manager to start and stop recording, flushing remaining data on stop.
3. **whisperModelCache** provides a single worker instance and exposes `sendMessage` and `addMessageListener` for communication.
4. **useWhisperWorker** subscribes to the cache, sends chunks for processing and gathers results.
5. **WhisperProvider** wraps `useSimpleWhisper` and exposes high-level controls via React context.

With this flow, audio moves cleanly from capture to transcription, reducing the risk of stack overflows from recursive listeners.
