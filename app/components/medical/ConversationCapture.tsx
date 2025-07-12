'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTranslation } from '../../providers/I18nProvider';
import { useTranscription } from '../../../src/domains/medical-ai';
import { 
  Mic, 
  MicOff, 
  Activity, 
  Play as PlayIcon, 
  Square as StopIcon,
  RotateCcw as ArrowPathIcon,
  FileText as DocumentTextIcon 
} from 'lucide-react';

// 📊 TypeScript Interfaces
interface TranscriptionState {
  isRecording: boolean;
  transcript: string;
  confidence: number;
  audioLevel: number;
  recordingTime: number;
  error: string | null;
}

interface ConversationCaptureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
  showAdvancedFeatures?: boolean;
  showModelInfo?: boolean;
  showSpectrum?: boolean;
}

// 🎵 Sub-componentes Internos
const AudioSpectrumDisplay: React.FC<{ 
  audioLevel: number; 
  isRecording: boolean; 
}> = ({ audioLevel, isRecording }) => {
  // Migrar lógica de spectrum de EnhancedTranscriptionPanel
  return (
    <div className="audio-spectrum">
      {/* Enhanced visualization */}
    </div>
  );
};

const TranscriptionStats: React.FC<{
  transcript: string;
  confidence: number;
  processingTime: number;
}> = ({ transcript, confidence, processingTime }) => {
  const wordCount = transcript.split(' ').filter(w => w.length > 0).length;
  const medicalTerms = detectMedicalTerms(transcript);
  
  return (
    <div className="stats-panel">
      <div className="stat">📝 {wordCount} palabras</div>
      <div className="stat">🩺 {medicalTerms.length} términos médicos</div>
      <div className="stat">⚡ {Math.round(confidence * 100)}% confianza</div>
    </div>
  );
};

// 🎙️ Componente Principal
export const ConversationCapture: React.FC<ConversationCaptureProps> = ({
  onTranscriptionComplete,
  className = '',
  showAdvancedFeatures = true,
  showModelInfo = false,
  showSpectrum = true
}) => {
  const { t } = useTranslation();
  
  // 🔧 Hook principal de transcripción
  const {
    isRecording,
    transcript,
    audioLevel,
    recordingTime,
    confidence,
    error,
    isReady,
    startRecording,
    stopRecording,
    resetTranscription
  } = useTranscription({
    autoStart: false,
    chunkDuration: 10,
    medicalOptimization: true,
    debugMode: process.env.NODE_ENV === 'development'
  });

  // 🎬 Handlers
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleReset = useCallback(() => {
    resetTranscription();
  }, [resetTranscription]);

  const handleCopy = useCallback(async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      // TODO: Mostrar toast de confirmación
    }
  }, [transcript]);

  // 📤 Callback de transcripción completada
  useEffect(() => {
    if (transcript && onTranscriptionComplete) {
      onTranscriptionComplete(transcript);
    }
  }, [transcript, onTranscriptionComplete]);

  // 🎨 Render
  return (
    <div className={`conversation-capture ${className}`}>
      {/* Título */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t('conversation.capture.title')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('conversation.capture.subtitle')}
        </p>
      </div>

      {/* Card Principal */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-8 text-center">
          
          {/* Control de Micrófono Mejorado */}
          <div className="flex flex-col items-center space-y-4">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' 
                : 'bg-slate-200 dark:bg-gray-700'
            }`}>
              {isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-slate-500 dark:text-gray-300" />
              )}
              
              {/* Anillo de audio level */}
              {isRecording && (
                <div 
                  className="absolute inset-0 rounded-full border-4 border-red-300"
                  style={{
                    transform: `scale(${1 + (audioLevel / 255) * 0.3})`,
                    transition: 'transform 0.1s ease-out'
                  }}
                />
              )}
            </div>
            
            {/* Estado y Badge */}
            <Badge
              variant={isRecording ? "destructive" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {isRecording ? t('conversation.capture.recording_active') : t('conversation.capture.ready_to_record')}
            </Badge>

            {/* Audio Level Display Mejorado */}
            {isRecording && showAdvancedFeatures && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                <Activity className="h-4 w-4" />
                <span>{t('conversation.capture.audio_level')}:</span>
                <div className="w-32 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-200"
                    style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
                  />
                </div>
                <span className="text-xs">{Math.round((audioLevel / 255) * 100)}%</span>
              </div>
            )}

            {/* Spectrum Display */}
            {isRecording && showSpectrum && (
              <AudioSpectrumDisplay audioLevel={audioLevel} isRecording={isRecording} />
            )}

          </div>

          {/* Controles de Acción */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleToggleRecording}
              disabled={!isReady}
              className="px-8"
            >
              {isRecording ? (
                <>
                  <StopIcon className="w-5 h-5 mr-2" />
                  Detener Grabación
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Iniciar Grabación
                </>
              )}
            </Button>

            {transcript && (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
                
                <Button variant="outline" onClick={handleCopy}>
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Copiar
                </Button>
              </>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Estadísticas Avanzadas */}
      {transcript && showAdvancedFeatures && (
        <div className="mt-4">
          <TranscriptionStats 
            transcript={transcript}
            confidence={confidence}
            processingTime={recordingTime}
          />
        </div>
      )}

      {/* Transcripción Display */}
      {transcript && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">📝 Transcripción:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              {transcript}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

    </div>
  );
};

// 🔧 Utility Functions
function detectMedicalTerms(text: string): string[] {
  const medicalTerms = [
    'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón', 
    'respiración', 'síntoma', 'diagnóstico', 'tratamiento', 
    'medicamento', 'alergia', 'diabetes', 'hipertensión'
  ];
  
  const words = text.toLowerCase().split(' ');
  return medicalTerms.filter(term => 
    words.some(word => word.includes(term))
  );
}

export default ConversationCapture;