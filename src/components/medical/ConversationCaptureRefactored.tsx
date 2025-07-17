'use client';
import './conversation-capture/styles.css';

import React, { useEffect } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useWebSpeechCapture } from '@/src/domains/medical-ai/hooks/useWebSpeechCapture';
import { useI18n } from '@/src/domains/core/hooks/useI18n';
import { PermissionDialog } from '@/src/components/medical/conversation-capture/components';
import { SOAPNotesManager } from '@/src/components/medical/SOAPNotesManager';

// Custom hooks
import { useUIState } from './conversation-capture/hooks/useUIState';
import { useTranscriptionState } from './conversation-capture/hooks/useTranscriptionState';
import { useDiarizationState } from './conversation-capture/hooks/useDiarizationState';
import { useRecordingManager } from './conversation-capture/hooks/useRecordingManager';

// Components (following SRP)
import { ConversationHeader } from './conversation-capture/components/ConversationHeader';
import { TranscriptionInterface } from './conversation-capture/components/TranscriptionInterface';
import { TranscriptionDisplay } from './conversation-capture/components/TranscriptionDisplay';
import { RecordingProgress } from './conversation-capture/components/RecordingProgress';
import { WebSpeechWarning } from './conversation-capture/components/WebSpeechWarning';
import { ActionButtons } from './conversation-capture/components/ActionButtons';

// Types
import type { ConversationCaptureProps, TranscriptionConfig, SOAPConfig } from './conversation-capture/types';

// Constants (DRY)
const TRANSCRIPTION_CONFIG: TranscriptionConfig = {
  autoPreload: true,
  processingMode: 'direct',
  chunkSize: 32000,
  onChunkProcessed: (text, chunkNumber) => {
    console.log(`[ConversationCapture] Chunk #${chunkNumber}: ${text}`);
  }
};

const SOAP_CONFIG: SOAPConfig = {
  autoGenerate: false,
  style: 'detailed',
  includeTimestamps: true,
  includeConfidence: true,
  medicalTerminology: 'mixed'
};

export const ConversationCaptureRefactored: React.FC<ConversationCaptureProps> = ({ 
  onNext, 
  onTranscriptionComplete,
  onSoapGenerated,
  className = ''
}) => {  
  const { t } = useI18n();
  
  // State management using custom hooks (SRP)
  const uiState = useUIState();
  const transcriptionState = useTranscriptionState();
  const diarizationState = useDiarizationState();
  
  // Services (Dependency Inversion)
  const whisperService = useSimpleWhisper(TRANSCRIPTION_CONFIG);
  const webSpeechService = useWebSpeechCapture();
  
  // Recording manager (handles complex logic)
  const recordingHandlers = useRecordingManager({
    transcriptionService: whisperService,
    webSpeechService,
    transcriptionState,
    uiState,
    diarizationHandlers: {
      setDiarizationProcessing: diarizationState.setDiarizationProcessing,
      setDiarizationResult: diarizationState.setDiarizationResult,
      setDiarizationError: diarizationState.setDiarizationError
    },
    stateHandlers: {
      setShowPermissionDialog: uiState.setShowPermissionDialog,
      savePartialMinuteTranscription: transcriptionState.savePartialMinuteTranscription,
      showCopySuccessFeedback: uiState.showCopySuccessFeedback
    },
    callbacks: { onTranscriptionComplete }
  });

  // Derived state (DRY)
  const isRecording = whisperService.status === 'recording';
  const hasTranscription = !!(whisperService.transcription || 
    (uiState.isManualMode && transcriptionState.manualTranscript));
  const currentTranscript = uiState.isManualMode 
    ? transcriptionState.manualTranscript 
    : whisperService.transcription?.text;
  
  // Engine status (DRY)
  const engineStatus = { 
    whisper: whisperService.engineStatus, 
    webSpeech: webSpeechService.isAvailable ? 'ready' : 'unavailable' 
  };

  // Update live transcript when web speech data changes
  useEffect(() => {
    if (webSpeechService.transcript) {
      transcriptionState.updateLiveTranscript(webSpeechService.transcript);
    }
  }, [webSpeechService.transcript, transcriptionState.updateLiveTranscript]);

  // Log model status (keeping original functionality)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ConversationCapture] Global cache status:', {
        whisperWorker: !!(window as any).__WHISPER_WORKER_INSTANCE__,
        whisperModelLoaded: !!(window as any).__WHISPER_MODEL_LOADED__,
        whisperPreloadState: !!(window as any).__WHISPER_PRELOAD_STATE__,
        whisperModelCache: !!(window as any).__WHISPER_MODEL_CACHE__
      });
    }
  }, []);

  // Reset handler with all state cleanup
  const handleReset = () => {
    recordingHandlers.onReset();
    transcriptionState.resetTranscriptionState();
    diarizationState.resetDiarization();
  };

  // Mode toggle handler
  const handleModeToggle = () => {
    uiState.toggleMode();
    recordingHandlers.onToggleMode();
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog 
        isOpen={uiState.showPermissionDialog} 
        onClose={() => uiState.setShowPermissionDialog(false)} 
      />

      <ConversationHeader
        title={t('conversation.capture.title')}
        subtitle={t('conversation.capture.subtitle')}
        isManualMode={uiState.isManualMode}
        showDenoisingDashboard={uiState.showDenoisingDashboard}
        onToggleMode={handleModeToggle}
        onToggleDashboard={uiState.toggleDenoisingDashboard}
      />

      <WebSpeechWarning 
        show={!webSpeechService.isAvailable && !uiState.isManualMode}
      />

      <TranscriptionInterface
        isManualMode={uiState.isManualMode}
        manualTranscript={transcriptionState.manualTranscript}
        isRecording={isRecording}
        audioLevel={whisperService.audioLevel}
        recordingTime={whisperService.recordingTime}
        liveTranscript={transcriptionState.liveTranscript}
        status={whisperService.status}
        engineStatus={engineStatus}
        transcription={whisperService.transcription}
        copySuccess={uiState.copySuccess}
        onManualTranscriptChange={transcriptionState.updateManualTranscript}
        onToggleRecording={recordingHandlers.onToggleRecording}
        onReset={handleReset}
        onCopy={recordingHandlers.onCopy}
      />

      <RecordingProgress 
        show={isRecording && whisperService.status === 'recording'}
      />
      
      <TranscriptionDisplay
        show={hasTranscription && !isRecording}
        isManualMode={uiState.isManualMode}
        manualTranscript={transcriptionState.manualTranscript}
        transcription={whisperService.transcription}
        audioUrl={whisperService.audioUrl}
        webSpeechText={transcriptionState.webSpeechText}
        diarizationResult={diarizationState.diarizationResult}
        isDiarizationProcessing={diarizationState.isDiarizationProcessing}
        diarizationError={diarizationState.diarizationError}
      />

      {hasTranscription && !isRecording && (
        <SOAPNotesManager
          transcription={currentTranscript}
          onNotesGenerated={onSoapGenerated}
          config={SOAP_CONFIG}
          showActions={true}
          editable={true}
          className="mt-6"
        />
      )}

      <ActionButtons
        show={hasTranscription && !isRecording && !!onNext}
        onNext={() => {
          if (currentTranscript && onTranscriptionComplete) {
            onTranscriptionComplete(currentTranscript);
          }
          onNext?.();
        }}
        nextLabel={t('conversation.capture.next')}
      />
    </div>
  );
};