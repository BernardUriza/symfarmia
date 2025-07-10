/**
 * Enhanced Transcription Panel Component
 * 
 * Professional medical transcription interface with voice-reactive microphone,
 * real-time word display, and advanced visualization
 */

import React, { useState } from 'react';
import { useEnhancedTranscription } from '../../hooks/useEnhancedTranscription';
import { VoiceReactiveMicrophone } from '../ui/VoiceReactiveMicrophone';
import { AudioSpectrum } from '../ui/AudioSpectrum';
import { LiveTranscriptionDisplay } from '../ui/LiveTranscriptionDisplay';
import { TranscriptionModelInfo } from '../ui/TranscriptionModelInfo';
import { 
  PlayIcon, 
  StopIcon, 
  PauseIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon 
} from '@heroicons/react/24/solid';

interface EnhancedTranscriptionPanelProps {
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
  showModelInfo?: boolean;
  showSpectrum?: boolean;
  microphoneSize?: 'sm' | 'md' | 'lg';
}

export const EnhancedTranscriptionPanel = ({
  onTranscriptionComplete,
  className = '',
  showModelInfo = process.env.NODE_ENV === 'development',
  showSpectrum = true,
  microphoneSize = 'lg'
}: EnhancedTranscriptionPanelProps) => {
  const {
    words,
    currentWord,
    finalTranscript,
    liveTranscript,
    totalWords,
    confidence,
    medicalTerms,
    isRecording,
    status,
    error,
    audioLevel,
    service,
    startTranscription,
    stopTranscription,
    resetTranscription,
    getTranscriptionText
  } = useEnhancedTranscription({
    realTimeUpdates: true,
    medicalOptimization: true,
    language: 'es-ES',
    service: 'browser'
  });

  const [showStats, setShowStats] = useState(false);

  const handleStartRecording = async () => {
    await startTranscription();
  };

  const handleStopRecording = async () => {
    await stopTranscription();
    const text = getTranscriptionText();
    if (text && onTranscriptionComplete) {
      onTranscriptionComplete(text);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Listo para transcribir';
      case 'recording': return 'Grabando conversación...';
      case 'processing': return 'Procesando audio...';
      case 'completed': return 'Transcripción completada';
      case 'error': return 'Error en transcripción';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Captura de Conversación
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Mostrar estadísticas"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
              <div className="text-gray-600 dark:text-gray-400">Palabras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(confidence * 100)}%</div>
              <div className="text-gray-600 dark:text-gray-400">Confianza</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{medicalTerms.length}</div>
              <div className="text-gray-600 dark:text-gray-400">Términos médicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(audioLevel)}</div>
              <div className="text-gray-600 dark:text-gray-400">Nivel audio</div>
            </div>
          </div>
        </div>
      )}

      {/* Voice-reactive microphone */}
      <div className="text-center mb-6">
        <VoiceReactiveMicrophone 
          audioLevel={audioLevel} 
          isRecording={isRecording}
          size={microphoneSize}
        />
        
        {/* Audio spectrum */}
        {showSpectrum && isRecording && (
          <div className="mt-4">
            <AudioSpectrum 
              audioLevel={audioLevel} 
              isRecording={isRecording}
              barCount={16}
              height={48}
            />
          </div>
        )}
      </div>

      {/* Real-time transcription display */}
      <LiveTranscriptionDisplay 
        liveTranscript={liveTranscript}
        finalTranscript={finalTranscript}
        isRecording={isRecording}
        className="mb-6"
      />

      {/* Medical Terms Display */}
      {medicalTerms.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Términos médicos detectados:
          </h4>
          <div className="flex flex-wrap gap-2">
            {medicalTerms.map((term, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={status === 'processing'}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Iniciar Grabación
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <StopIcon className="w-5 h-5 mr-2" />
            Detener Grabación
          </button>
        )}

        {finalTranscript && (
          <button
            onClick={resetTranscription}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Reiniciar
          </button>
        )}

        {finalTranscript && (
          <button
            onClick={() => navigator.clipboard.writeText(finalTranscript)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Copiar
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Model Info Overlay */}
      {showModelInfo && (
        <TranscriptionModelInfo service={service} />
      )}
    </div>
  );
};

export default EnhancedTranscriptionPanel;