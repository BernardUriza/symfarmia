/**
 * Demo Transcription Hook
 * Provides simulated transcription functionality for demo purposes
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface DemoTranscriptionState {
  isRecording: boolean;
  demoText: string;
  currentAnalysis: any;
  recommendations: string[];
  recordingTime: number;
  confidence: number;
  isAnalyzing: boolean;
  selectedSpecialty: string | null;
  showSpecialtyConfirmation: boolean;
  consultationGenerated: boolean;
  strategyName: string;
  availableSpecialties: string[];
  availableStrategies: string[];
}

const demoStrategies = {
  general_medicine: {
    name: 'Medicina General',
    specialties: ['general', 'family_medicine', 'internal_medicine'],
    demoText: 'Paciente presenta dolor de cabeza persistente...'
  },
  emergency: {
    name: 'Emergencias',
    specialties: ['emergency', 'trauma', 'critical_care'],
    demoText: 'Paciente llega con dolor torácico agudo...'
  },
  pediatric: {
    name: 'Pediatría',
    specialties: ['pediatrics', 'neonatology'],
    demoText: 'Niño de 5 años con fiebre alta...'
  }
};

export const useDemoTranscription = (strategy: string = 'general_medicine') => {
  const [state, setState] = useState<DemoTranscriptionState>({
    isRecording: false,
    demoText: '',
    currentAnalysis: null,
    recommendations: [],
    recordingTime: 0,
    confidence: 0,
    isAnalyzing: false,
    selectedSpecialty: null,
    showSpecialtyConfirmation: false,
    consultationGenerated: false,
    strategyName: demoStrategies[strategy]?.name || 'Demo',
    availableSpecialties: demoStrategies[strategy]?.specialties || [],
    availableStrategies: Object.keys(demoStrategies)
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startDemoRecording = useCallback(() => {
    setState(prev => ({ ...prev, isRecording: true, recordingTime: 0 }));
    
    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        recordingTime: prev.recordingTime + 1,
        demoText: demoStrategies[strategy]?.demoText || 'Demo transcription in progress...',
        confidence: Math.min(95, prev.confidence + 5)
      }));
    }, 1000);
  }, [strategy]);

  const stopDemoRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState(prev => ({
      ...prev,
      isRecording: false,
      isAnalyzing: true
    }));

    // Simulate analysis
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        currentAnalysis: {
          summary: 'Demo analysis completed',
          diagnosis: 'Demo diagnosis'
        },
        recommendations: ['Demo recommendation 1', 'Demo recommendation 2']
      }));
    }, 2000);
  }, []);

  const resetDemo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      isRecording: false,
      demoText: '',
      currentAnalysis: null,
      recommendations: [],
      recordingTime: 0,
      confidence: 0,
      isAnalyzing: false,
      selectedSpecialty: null,
      showSpecialtyConfirmation: false,
      consultationGenerated: false,
      strategyName: demoStrategies[strategy]?.name || 'Demo',
      availableSpecialties: demoStrategies[strategy]?.specialties || [],
      availableStrategies: Object.keys(demoStrategies)
    });
  }, [strategy]);

  const selectSpecialty = useCallback((specialty: string) => {
    setState(prev => ({
      ...prev,
      selectedSpecialty: specialty,
      showSpecialtyConfirmation: true
    }));
  }, []);

  const confirmSpecialtyAndGenerate = useCallback(() => {
    setState(prev => ({
      ...prev,
      consultationGenerated: true,
      showSpecialtyConfirmation: false
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startDemoRecording,
    stopDemoRecording,
    resetDemo,
    selectSpecialty,
    confirmSpecialtyAndGenerate
  };
};