"use client";

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from '../../../providers/I18nProvider';
import { useTranscription } from '@/domains/medical-ai';
import { useConversationState } from './hooks/useConversationState';
import { RecordingControls } from './RecordingControls';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { NavigationControls } from './NavigationControls';
import { ErrorDisplay } from './ErrorDisplay';
import { RECORDING_STATES } from './constants';

export function ConversationCapture({ onNext, isRecording, setIsRecording }) {
  const { t } = useTranslation();
  
  // Hook de transcripción principal
  const {
    transcription,
    status,
    error: transcriptionError,
    startTranscription,
    stopTranscription,
    resetTranscription,
    getTranscriptionText
  } = useTranscription({
    autoStart: false,
    realTimeUpdates: true,
    medicalOptimization: true
  });

  // Estado local del componente
  const {
    segments,
    engineError,
    audioLevel,
    duration,
    setEngineError,
    addSegment,
    clearSegments,
    startDurationTracking,
    stopDurationTracking,
    startAudioLevelAnalysis,
    stopAudioLevelAnalysis
  } = useConversationState();

  // Determinar estado de grabación basado en el status
  const getRecordingState = useCallback(() => {
    if (status === 'RECORDING') return RECORDING_STATES.RECORDING;
    if (status === 'PROCESSING') return RECORDING_STATES.PROCESSING;
    if (status === 'ERROR') return RECORDING_STATES.ERROR;
    return RECORDING_STATES.IDLE;
  }, [status]);

  const recordingState = getRecordingState();

  // Manejar toggle de grabación
  const handleToggleRecording = useCallback(async () => {
    try {
      setEngineError(null);
      
      if (isRecording) {
        // Detener grabación
        const success = await stopTranscription();
        
        if (success) {
          setIsRecording(false);
          stopDurationTracking();
          stopAudioLevelAnalysis();
          
          // Agregar segmento completado si hay texto
          const transcriptText = getTranscriptionText();
          if (transcriptText) {
            addSegment(transcriptText, 'patient');
            resetTranscription();
          }
        }
      } else {
        // Iniciar grabación
        const success = await startTranscription();
        
        if (success) {
          setIsRecording(true);
          startDurationTracking();
          
          // Intentar iniciar análisis de audio si hay stream disponible
          if (navigator.mediaDevices?.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              startAudioLevelAnalysis(stream);
            } catch (err) {
              console.warn('No se pudo iniciar análisis de audio:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error en toggle recording:', error);
      setEngineError(error.message || 'Error al cambiar estado de grabación');
      setIsRecording(false);
      stopDurationTracking();
      stopAudioLevelAnalysis();
    }
  }, [
    isRecording, 
    startTranscription, 
    stopTranscription,
    resetTranscription,
    getTranscriptionText,
    addSegment,
    setIsRecording,
    setEngineError,
    startDurationTracking,
    stopDurationTracking,
    startAudioLevelAnalysis,
    stopAudioLevelAnalysis
  ]);

  // Limpiar todo
  const handleClearAll = useCallback(() => {
    clearSegments();
    resetTranscription();
    setEngineError(null);
  }, [clearSegments, resetTranscription, setEngineError]);

  // Efecto para sincronizar errores
  useEffect(() => {
    if (transcriptionError && !engineError) {
      setEngineError(transcriptionError);
    }
  }, [transcriptionError, engineError, setEngineError]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopTranscription();
        stopDurationTracking();
        stopAudioLevelAnalysis();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Obtener texto actual de transcripción
  const currentTranscriptText = getTranscriptionText();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mostrar errores */}
      <ErrorDisplay 
        error={engineError || transcriptionError} 
        onDismiss={() => setEngineError(null)}
        t={t}
      />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t("conversation.capture.title")}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t("conversation.capture.subtitle")}
        </p>
      </div>
      
      {/* Controles de grabación */}
      <RecordingControls
        recordingState={recordingState}
        isTranscribing={status === 'PROCESSING'}
        audioLevel={audioLevel}
        duration={duration}
        onToggleRecording={handleToggleRecording}
        t={t}
      />
      
      {/* Display de transcripciones */}
      <TranscriptionDisplay
        segments={segments}
        currentTranscript={currentTranscriptText}
        isRecording={isRecording}
        isTranscribing={status === 'PROCESSING'}
        onClearAll={handleClearAll}
        t={t}
      />
      
      {/* Navegación */}
      <NavigationControls
        onNext={onNext}
        t={t}
      />
    </div>
  );
}

export default ConversationCapture;