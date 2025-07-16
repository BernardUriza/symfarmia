'use client';
import './conversation-capture/styles.css';

import React, { useState, useEffect } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useRealAudioCapture } from '@/src/domains/medical-ai/hooks/useRealAudioCapture';
import { Button } from '@/src/components/ui/button';
import { useI18n } from '@/src/domains/core/hooks/useI18n';
import {
  PermissionDialog,
  RecordingCard,
  TranscriptionResult,
  ErrorDisplay,
  ProcessingStatus
} from '@/src/components/medical/conversation-capture/components';

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
  console.log('[ConversationCapture] Component mounting...');
  
  const { t } = useI18n();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  console.log('[ConversationCapture] About to call useSimpleWhisper...');
  
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
  } = useSimpleWhisper({ autoPreload: false });
  
  console.log('[ConversationCapture] useSimpleWhisper called successfully');

  const {
    transcript: liveTranscriptData,
    isAvailable: isWebSpeechAvailable,
    error: webSpeechError,
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
          // Only start live transcription if WebSpeech is available
          if (isWebSpeechAvailable) {
            const liveStarted = await startLiveTranscription();
            if (!liveStarted && webSpeechError) {
              console.warn('Live transcription not available:', webSpeechError);
            }
          } else {
            console.info('WebSpeech not available, using Whisper only');
          }
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
    // Clear any WebSpeech error
    if (webSpeechError) {
      console.clear();
    }
  };
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog 
        isOpen={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)} 
      />


      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t('conversation.capture.title')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('conversation.capture.subtitle')}
        </p>
      </div>

      {/* Info message when WebSpeech is not available */}
      {!isWebSpeechAvailable && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Transcripción en tiempo real no disponible</p>
              <p className="text-blue-700 dark:text-blue-300">
                La transcripción final con Whisper estará disponible al detener la grabación.
              </p>
            </div>
          </div>
        </div>
      )}

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
          <Button onClick={onNext} size="lg" variant="default" className="">
            {t('conversation.capture.next')}
          </Button>
        </div>
      )}
    </div>
  );
};