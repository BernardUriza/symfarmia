import { useState, useCallback } from 'react';
import type { DiarizationState } from '../types';
import type { DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';

export const useDiarizationState = () => {
  const [state, setState] = useState<DiarizationState>({
    diarizationResult: null,
    isDiarizationProcessing: false,
    diarizationError: null
  });

  const setDiarizationProcessing = useCallback((processing: boolean) => {
    setState(prev => ({ ...prev, isDiarizationProcessing: processing }));
  }, []);

  const setDiarizationResult = useCallback((result: DiarizationResult | null) => {
    setState(prev => ({ ...prev, diarizationResult: result }));
  }, []);

  const setDiarizationError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, diarizationError: error }));
  }, []);

  const resetDiarization = useCallback(() => {
    setState({
      diarizationResult: null,
      isDiarizationProcessing: false,
      diarizationError: null
    });
  }, []);

  return {
    ...state,
    setDiarizationProcessing,
    setDiarizationResult,
    setDiarizationError,
    resetDiarization
  };
};