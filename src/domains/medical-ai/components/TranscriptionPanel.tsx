/**
 * Transcription Panel Component
 * 
 * Medical transcription interface with real-time updates
 */

import React, { useState, useEffect } from 'react';
import { useTranscription } from '../hooks/useTranscription';
import { useMedicalAI } from '../hooks/useMedicalAI';
import {
  TranscriptionStatus,
  MedicalSpecialty,
  MedicalContext
} from '../types';

interface TranscriptionPanelProps {
  specialty?: MedicalSpecialty;
  patientContext?: MedicalContext;
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
  medicalOptimization?: boolean;
  realTimeAnalysis?: boolean;
}

export const TranscriptionPanel = ({
  specialty = 'general' as MedicalSpecialty,
  patientContext,
  onTranscriptionComplete,
  className = '',
  medicalOptimization = true,
  realTimeAnalysis = false
}) => {
  // Hooks
  const {
    transcription,
    status,
    isRecording,
    error,
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    resetTranscription,
    enhanceTranscription,
    getTranscriptionText
  } = useTranscription({
    realTimeUpdates: true,
    medicalOptimization,
    audioConfig: {
      medicalOptimization: true,
      noiseReduction: true
    }
  });

  const {
    analysis,
    loading: aiLoading,
    analyzeMedicalContent,
    validateMedicalTerms
  } = useMedicalAI({
    specialty,
    autoAnalysis: realTimeAnalysis,
    realTimeValidation: true
  });

  // Local state
  const [isPaused, setIsPaused] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [medicalTermsCount, setMedicalTermsCount] = useState(0);

  // Update confidence and medical terms count
  useEffect(() => {
    if (transcription) {
      setConfidence(transcription.confidence);
      setMedicalTermsCount(transcription.medicalTerms.length);
      
      // Auto-analyze if enabled
      if (realTimeAnalysis && patientContext && transcription.text.length > 50) {
        analyzeMedicalContent(transcription, patientContext);
      }
    }
  }, [transcription, realTimeAnalysis, patientContext, analyzeMedicalContent]);

  // Handle transcription completion
  useEffect(() => {
    if (status === TranscriptionStatus.COMPLETED && transcription) {
      onTranscriptionComplete?.(transcription.text);
    }
  }, [status, transcription, onTranscriptionComplete]);

  const handleStartRecording = async () => {
    const success = await startTranscription();
    if (!success && error) {
      console.error('Failed to start transcription:', error);
    }
  };

  const handleStopRecording = async () => {
    const success = await stopTranscription();
    if (success && transcription && patientContext) {
      // Enhance and analyze final transcription
      await enhanceTranscription();
      await analyzeMedicalContent(transcription, patientContext);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTranscription();
      setIsPaused(false);
    } else {
      pauseTranscription();
      setIsPaused(true);
    }
  };

  const getStatusColor = (status: TranscriptionStatus): string => {
    switch (status) {
      case TranscriptionStatus.RECORDING:
        return 'text-green-600';
      case TranscriptionStatus.PROCESSING:
        return 'text-yellow-600';
      case TranscriptionStatus.COMPLETED:
        return 'text-blue-600';
      case TranscriptionStatus.ERROR:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: TranscriptionStatus): string => {
    switch (status) {
      case TranscriptionStatus.IDLE:
        return 'Listo para transcribir';
      case TranscriptionStatus.RECORDING:
        return isPaused ? 'Pausado' : 'Grabando...';
      case TranscriptionStatus.PROCESSING:
        return 'Procesando...';
      case TranscriptionStatus.COMPLETED:
        return 'Transcripción completada';
      case TranscriptionStatus.ERROR:
        return 'Error en transcripción';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Transcripción Médica
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
          {isRecording && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={status === TranscriptionStatus.PROCESSING}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Iniciar Grabación
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {isPaused ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reanudar
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pausar
                </>
              )}
            </button>
            
            <button
              onClick={handleStopRecording}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
              </svg>
              Detener
            </button>
          </>
        )}

        {transcription && (
          <button
            onClick={resetTranscription}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reiniciar
          </button>
        )}
      </div>

      {/* Transcription Display */}
      {transcription && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Transcripción:</span>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Confianza: {Math.round(confidence * 100)}%</span>
              <span>Términos médicos: {medicalTermsCount}</span>
            </div>
          </div>
          
          <div className="min-h-[100px] p-3 bg-white rounded border text-gray-900 whitespace-pre-wrap">
            {transcription.text || 'La transcripción aparecerá aquí...'}
          </div>
          
          {/* Medical Terms Display */}
          {transcription.medicalTerms.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700">Términos médicos detectados:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {transcription.medicalTerms.map((term, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {term.term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Display */}
      {realTimeAnalysis && analysis && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Análisis Médico IA:</h4>
          
          {analysis.analysis?.symptoms && analysis.analysis.symptoms.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-800">Síntomas:</span>
              <div className="text-xs text-blue-700">
                {analysis.analysis?.symptoms.join(', ')}
              </div>
            </div>
          )}
          
          {analysis.analysis?.potentialDiagnoses && analysis.analysis.potentialDiagnoses.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-blue-800">Posibles diagnósticos:</span>
              <div className="text-xs text-blue-700">
                {analysis.analysis?.potentialDiagnoses.join(', ')}
              </div>
            </div>
          )}
          
          <div className="text-xs text-blue-600">
            Nivel de urgencia: {analysis.analysis?.urgencyLevel}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {(status === TranscriptionStatus.PROCESSING || aiLoading) && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            {aiLoading ? 'Analizando contenido médico...' : 'Procesando transcripción...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TranscriptionPanel;