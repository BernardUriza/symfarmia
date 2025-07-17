import { useState, useCallback } from 'react';
import type { TranscriptionState, MinuteTranscription } from '../types';
import { extractMedicalTermsFromText } from '@/src/domains/medical-ai/utils/medicalTerms';

export const useTranscriptionState = () => {
  const [state, setState] = useState<TranscriptionState>({
    liveTranscript: '',
    manualTranscript: '',
    webSpeechText: '',
    minuteTranscriptions: [],
    currentChunkTexts: []
  });

  const updateLiveTranscript = useCallback((transcript: string) => {
    setState(prev => ({
      ...prev,
      liveTranscript: transcript,
      webSpeechText: transcript
    }));
  }, []);

  const updateManualTranscript = useCallback((transcript: string) => {
    setState(prev => ({
      ...prev,
      manualTranscript: transcript
    }));
  }, []);

  const addChunkText = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      currentChunkTexts: [...prev.currentChunkTexts, text]
    }));
  }, []);

  const savePartialMinuteTranscription = useCallback(() => {
    setState(prev => {
      if (prev.currentChunkTexts.length === 0) return prev;

      const minuteNumber = prev.minuteTranscriptions.length + 1;
      const minuteText = prev.currentChunkTexts.join(' ').trim();
      const medicalTerms = extractMedicalTermsFromText(minuteText).map(t => t.term);
      
      const partialMinute: MinuteTranscription = {
        id: `minute_${minuteNumber}_partial`,
        text: minuteText,
        timestamp: Date.now(),
        confidence: 0.95,
        medicalTerms,
        processingTime: 0,
        minuteNumber
      };

      return {
        ...prev,
        minuteTranscriptions: [...prev.minuteTranscriptions, partialMinute],
        currentChunkTexts: []
      };
    });
  }, []);

  const resetTranscriptionState = useCallback(() => {
    setState({
      liveTranscript: '',
      manualTranscript: '',
      webSpeechText: '',
      minuteTranscriptions: [],
      currentChunkTexts: []
    });
  }, []);

  return {
    ...state,
    updateLiveTranscript,
    updateManualTranscript,
    addChunkText,
    savePartialMinuteTranscription,
    resetTranscriptionState
  };
};