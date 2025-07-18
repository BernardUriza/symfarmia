import { useState, useCallback } from 'react';

export interface ErrorState {
  whisperError: string | null;
  webSpeechError: string | null;
  llmError: string | null;
  diarizationError: string | null;
  generalError: string | null;
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorState>({
    whisperError: null,
    webSpeechError: null,
    llmError: null,
    diarizationError: null,
    generalError: null
  });

  const setError = useCallback((type: keyof ErrorState, error: string | null) => {
    setErrors(prev => ({ ...prev, [type]: error }));
    
    // Log specific error without clearing console
    if (error) {
      console.error(`[ConversationCapture] ${type}:`, error);
    }
  }, []);

  const clearError = useCallback((type: keyof ErrorState) => {
    setErrors(prev => ({ ...prev, [type]: null }));
    console.log(`[ConversationCapture] ${type} cleared`);
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({
      whisperError: null,
      webSpeechError: null,
      llmError: null,
      diarizationError: null,
      generalError: null
    });
    console.log('[ConversationCapture] All errors cleared');
  }, []);

  const hasAnyError = Object.values(errors).some(error => error !== null);

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasAnyError
  };
}