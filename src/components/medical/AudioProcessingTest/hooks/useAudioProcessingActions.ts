import { useCallback } from 'react';
import { safeAsync } from '../utils';

interface AudioProcessingActions {
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
}

interface UseAudioProcessingActionsProps {
  whisperActions: AudioProcessingActions;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

/**
 * Custom hook for handling audio processing actions with error management
 */
export const useAudioProcessingActions = ({
  whisperActions,
  onStart,
  onStop,
  onReset,
}: UseAudioProcessingActionsProps) => {
  
  const handleStart = useCallback(async () => {
    onStart?.();
    
    const result = await safeAsync(
      () => whisperActions.startTranscription(),
      'Failed to start transcription'
    );
    
    if (!result) {
      console.error('Transcription failed to start');
    }
    
    return result;
  }, [whisperActions, onStart]);

  const handleStop = useCallback(async () => {
    const result = await safeAsync(
      () => whisperActions.stopTranscription(),
      'Failed to stop transcription'
    );
    
    if (!result) {
      console.error('Transcription failed to stop');
    }
    
    onStop?.();
    return result;
  }, [whisperActions, onStop]);

  const handleReset = useCallback(() => {
    try {
      whisperActions.resetTranscription();
      onReset?.();
    } catch (error) {
      console.error('Error resetting transcription:', error);
    }
  }, [whisperActions, onReset]);

  return {
    handleStart,
    handleStop,
    handleReset,
  };
};