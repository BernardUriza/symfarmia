'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleWhisper } from '../domains/medical-ai/hooks/useSimpleWhisper';
import { useRealAudioCapture } from '../domains/medical-ai/hooks/useRealAudioCapture';
import { Button } from '../ui/button';
import { WhisperPreloader } from '../domains/medical-ai/components/WhisperPreloader';
import { useI18n } from '@/src/domains/core/hooks/useI18n';
import {
  PermissionDialog,
  EngineStatus,
  RecordingCard,
  TranscriptionResult,
  ErrorDisplay,
  ProcessingStatus
} from './conversation-capture/components';

interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
}

export const ConversationCapture = ({ 
  onNext, 
  onTranscriptionComplete,
  className = ''
}: ConversationCaptureProps) => {
  const { t } = useI18n();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useSimpleWhisper();

  const {
    transcript: liveTranscriptData,
    startRecording: startLiveTranscription,
    stopRecording: stopLiveTranscription
  } = useRealAudioCapture();

  useEffect(() => {
    if (liveTranscriptData) {
      setLiveTranscript(liveTranscriptData);
    }
  }, [liveTranscriptData]);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        stopLiveTranscription();
        await stopTranscription();
        if (transcription?.text && onTranscriptionComplete) {
          onTranscriptionComplete(transcription.text);
        }
      } else {
        const started = await startTranscription();
        if (!started && error?.includes('permiso')) {
          setShowPermissionDialog(true);
        } else if (started) {
          startLiveTranscription();
        }
      }
    } catch (error) {
      console.error(t('conversation.capture.error_toggling_recording'), error);
    }
  };
  
  const handleCopy = async () => {
    if (transcription?.text) {
      await navigator.clipboard.writeText(transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleReset = () => {
    resetTranscription();
    setLiveTranscript('');
  };
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <PermissionDialog 
        isOpen={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)} 
      />

      <WhisperPreloader retryCount={3} retryDelay={1000} />
      
      <EngineStatus status={engineStatus} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t('conversation.capture.title')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('conversation.capture.subtitle')}
        </p>
      </div>

      <RecordingCard
        isRecording={isRecording}
        audioLevel={audioLevel}
        recordingTime={recordingTime}
        liveTranscript={liveTranscript}
        status={status}
        engineStatus={engineStatus}
        transcription={transcription}
        copySuccess={copySuccess}
        onToggleRecording={toggleRecording}
        onReset={handleReset}
        onCopy={handleCopy}
      />

      {transcription && (
        <TranscriptionResult 
          transcription={transcription} 
          audioUrl={audioUrl} 
        />
      )}

      <ErrorDisplay error={error} />

      <ProcessingStatus isProcessing={status === 'processing'} />

      {onNext && transcription && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default">
            {t('conversation.capture.next')}
          </Button>
        </div>
      )}
    </div>
  );
};