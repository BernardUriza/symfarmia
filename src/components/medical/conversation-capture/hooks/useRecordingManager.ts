import { useCallback, useRef } from 'react';
import { diarizationService, DiarizationUtils } from '@/src/domains/medical-ai/services/DiarizationService';
import type { 
  TranscriptionService, 
  WebSpeechService,
  TranscriptionHandlers,
  ConversationCaptureProps 
} from '../types';

interface UseRecordingManagerProps {
  transcriptionService: TranscriptionService;
  webSpeechService: WebSpeechService;
  transcriptionState: {
    webSpeechText: string;
    minuteTranscriptions: Array<{ text: string }>;
  };
  uiState: {
    isManualMode: boolean;
  };
  diarizationHandlers: {
    setDiarizationProcessing: (processing: boolean) => void;
    setDiarizationResult: (result: any) => void;
    setDiarizationError: (error: string | null) => void;
  };
  stateHandlers: {
    setShowPermissionDialog: (show: boolean) => void;
    savePartialMinuteTranscription: () => void;
    showCopySuccessFeedback: () => void;
  };
  callbacks: Pick<ConversationCaptureProps, 'onTranscriptionComplete'>;
}

export const useRecordingManager = ({
  transcriptionService,
  webSpeechService,
  transcriptionState,
  uiState,
  diarizationHandlers,
  stateHandlers,
  callbacks
}: UseRecordingManagerProps): TranscriptionHandlers => {
  const audioDataRef = useRef<Float32Array>(new Float32Array());

  // Process diarization after recording
  const processDiarization = useCallback(async () => {
    console.log('[RecordingManager] Starting diarization...');
    
    const allMinutesText = transcriptionState.minuteTranscriptions
      .map(m => m.text)
      .join(' ')
      .trim();
    
    if (!allMinutesText && !transcriptionState.webSpeechText) {
      console.warn('[RecordingManager] No text available for diarization');
      return;
    }
    
    diarizationHandlers.setDiarizationProcessing(true);
    diarizationHandlers.setDiarizationError(null);
    
    try {
      const denoisedText = allMinutesText || '';
      const mergedText = DiarizationUtils.mergeTranscriptions(
        denoisedText, 
        transcriptionState.webSpeechText
      );
      
      if (audioDataRef.current.length === 0) {
        throw new Error('No audio data available for diarization');
      }
      
      const result = await diarizationService.diarizeAudio(audioDataRef.current);
      diarizationHandlers.setDiarizationResult(result);
      
    } catch (error) {
      console.error('[RecordingManager] Diarization error:', error);
      diarizationHandlers.setDiarizationError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      diarizationHandlers.setDiarizationProcessing(false);
    }
  }, [
    transcriptionState.minuteTranscriptions,
    transcriptionState.webSpeechText,
    diarizationHandlers
  ]);

  const onStartRecording = useCallback(async () => {
    console.log('[RecordingManager] Starting recording...');
    const started = await transcriptionService.startTranscription();
    
    if (!started && transcriptionService.error?.includes('permiso')) {
      stateHandlers.setShowPermissionDialog(true);
    } else if (started && webSpeechService.isAvailable) {
      const liveStarted = await webSpeechService.startRecording();
      if (!liveStarted && webSpeechService.error) {
        console.warn('Live transcription not available:', webSpeechService.error);
      }
    }
    
    return started;
  }, [transcriptionService, webSpeechService, stateHandlers]);

  const onStopRecording = useCallback(async () => {
    webSpeechService.stopRecording();
    stateHandlers.savePartialMinuteTranscription();
    
    const success = await transcriptionService.stopTranscription();
    
    if (success && transcriptionService.transcription?.text && callbacks.onTranscriptionComplete) {
      callbacks.onTranscriptionComplete(transcriptionService.transcription.text);
    }
    
    await processDiarization();
    return success;
  }, [
    webSpeechService,
    transcriptionService,
    stateHandlers,
    callbacks,
    processDiarization
  ]);

  const onToggleRecording = useCallback(async () => {
    try {
      const isRecording = transcriptionService.status === 'recording';
      if (isRecording) {
        await onStopRecording();
      } else {
        await onStartRecording();
      }
    } catch (error) {
      console.error('[RecordingManager] Toggle recording error:', error);
    }
  }, [transcriptionService.status, onStartRecording, onStopRecording]);

  const onCopy = useCallback(async () => {
    const textToCopy = uiState.isManualMode 
      ? transcriptionState.webSpeechText 
      : transcriptionService.transcription?.text;
      
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      stateHandlers.showCopySuccessFeedback();
    }
  }, [
    uiState.isManualMode,
    transcriptionState.webSpeechText,
    transcriptionService.transcription,
    stateHandlers
  ]);

  const onReset = useCallback(() => {
    transcriptionService.resetTranscription();
    audioDataRef.current = new Float32Array();
    if (webSpeechService.error) {
      console.clear();
    }
  }, [transcriptionService, webSpeechService.error]);

  const onToggleMode = useCallback(() => {
    // Mode toggle is handled by the UI state hook
    const isRecording = transcriptionService.status === 'recording';
    if (isRecording) {
      onToggleRecording();
    }
  }, [transcriptionService.status, onToggleRecording]);

  return {
    onStartRecording,
    onStopRecording,
    onToggleRecording,
    onReset,
    onCopy,
    onToggleMode
  };
};
