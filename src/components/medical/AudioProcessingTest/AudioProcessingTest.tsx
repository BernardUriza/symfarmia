'use client';

import React, { useMemo } from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { useSimpleWhisperHybrid } from '@/src/domains/medical-ai/hooks/useSimpleWhisperHybrid';

// Local imports
import { useAudioProcessingState } from './hooks/useAudioProcessingState';
import { useAudioProcessingActions } from './hooks/useAudioProcessingActions';
import {
  SystemStatusPanel,
  CurrentChunkDisplay,
  ControlPanel,
  RealtimeTranscriptionPanel,
  FinalTranscriptionPanel,
  AudioRecordingPanel,
} from './components';
import { AudioProcessingTestProps, DEFAULT_AUDIO_CONFIG } from './types';
import { formatTime } from './utils';

/**
 * AudioProcessingTest - A comprehensive real-time audio transcription test component
 * 
 * Features:
 * - Real-time audio processing with visual feedback
 * - Chunk-based transcription with progress tracking
 * - Audio recording and playback
 * - Medical term detection
 * - Multi-language support
 * - Error handling and recovery
 * - Configurable audio parameters
 * 
 * @example
 * <AudioProcessingTest
 *   onTranscriptionComplete={(transcription) => console.log(transcription)}
 *   onAudioRecorded={(url, blob) => console.log('Audio recorded:', url)}
 * />
 */
const AudioProcessingTest: React.FC<AudioProcessingTestProps> = ({
  className = '',
  maxHeight = 'max-h-64',
  onTranscriptionComplete,
  onAudioRecorded,
}) => {
  const { t } = useMedicalTranslation();
  
  // State management
  const {
    chunks,
    currentChunk,
    chunkProgress,
    handleChunkProcessed,
    handleChunkProgress,
    resetState,
  } = useAudioProcessingState();

  // Audio processing configuration
  const audioConfig = useMemo(() => ({
    ...DEFAULT_AUDIO_CONFIG,
    onChunkProcessed: handleChunkProcessed,
    onChunkProgress: handleChunkProgress,
  }), [handleChunkProcessed, handleChunkProgress]);

  // Whisper hook integration - hybrid approach (worker + main thread fallback)
  const whisperHook = useSimpleWhisperHybrid({
    autoPreload: true,
    preferWorker: false, // Start with main thread since worker CDN is failing
    retryCount: 3,
    retryDelay: 1000
  });
  
  const {
    transcription,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    processingMode,
  } = whisperHook;

  // Show processing mode instead of RNNoise stats
  const isProcessingModeActive = processingMode === 'worker' || processingMode === 'main';
  
  // These variables are not provided by the hook, so we'll set them to false/null for now
  const isRNNoiseActive = false;
  const processingStats = null;

  // Action handlers
  const {
    handleStart,
    handleStop,
    handleReset,
  } = useAudioProcessingActions({
    whisperActions: {
      startTranscription: whisperHook.startTranscription,
      stopTranscription: whisperHook.stopTranscription,
      resetTranscription: whisperHook.resetTranscription,
    },
    onStart: resetState,
    onStop: () => {
      if (transcription) {
        onTranscriptionComplete?.(transcription);
      }
      if (audioUrl && audioBlob) {
        onAudioRecorded?.(audioUrl, audioBlob);
      }
    },
    onReset: resetState,
  });

  // Render main container
  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <header className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          {t('transcription.test_title')}
        </h2>
        <p className="text-gray-600">
          {t('transcription.test_description')}
        </p>
      </header>

      {/* System Status with Current Chunk Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - System Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>{t('transcription.whisper_engine')}:</span>
              <span className={`font-medium ${
                engineStatus === 'ready' ? 'text-green-600' : 
                engineStatus === 'loading' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {engineStatus === 'ready' ? `✅ ${t('transcription.ready')}` : 
                 engineStatus === 'loading' ? `⏳ ${t('transcription.loading')}` : 
                 `❌ ${t('transcription.error')}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t('transcription.status')}:</span>
              <span className="font-medium flex items-center gap-2">
                {isRecording ? (
                  <>
                    <span className="animate-pulse">🔴</span>
                    {t('transcription.recording_active')}
                  </>
                ) : (
                  <>⚪ {t('transcription.stopped')}</>
                )}
              </span>
            </div>

            {/* RNNoise Victory Message */}
            {isRNNoiseActive && (
              <div className="flex items-center justify-between">
                <span>RNNoise Denoising:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <span className="animate-pulse">🎉</span>
                  ¡Victoria! Audio limpio
                </span>
              </div>
            )}

            {/* Processing Stats */}
            {processingStats && processingStats.totalChunks > 0 && (
              <div className="flex items-center justify-between">
                <span>Audio procesado:</span>
                <span className="font-medium text-blue-600">
                  {processingStats.denoisedChunks}/{processingStats.totalChunks} chunks
                </span>
              </div>
            )}

            {isRecording && (
              <>
                <div className="flex items-center justify-between">
                  <span>{t('transcription.time')}:</span>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t('transcription.audio_level')}:</span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Current Chunk */}
          <CurrentChunkDisplay
            currentChunk={currentChunk}
            chunkProgress={chunkProgress}
            isRecording={isRecording}
          />
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">
              {t('transcription.error')}: {error}
            </p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <ControlPanel
        isRecording={isRecording}
        engineStatus={engineStatus}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
      />

      {/* Real-time Transcription */}
      <RealtimeTranscriptionPanel
        chunks={chunks}
        chunkProgress={chunkProgress}
        isRecording={isRecording}
        maxHeight={maxHeight}
      />

      {/* Final Transcription */}
      {transcription && (
        <FinalTranscriptionPanel
          transcription={transcription}
          isRecording={isRecording}
        />
      )}

      {/* Audio Recording */}
      {audioUrl && (
        <AudioRecordingPanel
          audioUrl={audioUrl}
          transcription={transcription}
          recordingTime={recordingTime}
          isRecording={isRecording}
          audioBlob={audioBlob}
          onAudioDownload={(url) => console.log('Audio downloaded:', url)}
        />
      )}
    </div>
  );
};

// Use React.memo for performance optimization
const MemoizedAudioProcessingTest = React.memo(AudioProcessingTest);

// Add display name for debugging
MemoizedAudioProcessingTest.displayName = 'AudioProcessingTest';

export default MemoizedAudioProcessingTest;