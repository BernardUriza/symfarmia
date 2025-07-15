'use client';

import React, { useState } from 'react';
import { useTranscription } from '../../domains/medical-ai/hooks/useTranscription';
import { TranscriptionDebugPanel } from './TranscriptionDebugPanel';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Mic,
  Activity,
  Square as Stop, 
  RotateCcw, 
  Copy, 
  AlertCircle,
  PenTool,
  Keyboard
} from 'lucide-react';
import { VoiceReactiveRings } from './VoiceReactiveRings';

import type { SOAPNotes } from '../../domains/medical-ai/types';

interface ConversationCaptureEnhancedProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  onSoapGenerated?: (notes: SOAPNotes) => void;
  className?: string;
  showDebug?: boolean;
}

export const ConversationCaptureEnhanced = ({
  onNext,
  onTranscriptionComplete,
  onSoapGenerated,
  className = '',
  showDebug = false
}: ConversationCaptureEnhancedProps) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(showDebug);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    engineState,
    startTranscription,
    stopTranscription,
    resetTranscription,
    isManualMode,
    manualTranscript,
    setManualTranscript,
    enableManualMode,
    disableManualMode,
    soapNotes,
    isGeneratingSOAP,
    generateSOAPNotes
  } = useTranscription({
    debug: showDebugPanel,
    onTranscriptionUpdate: (result) => {
      console.log('Transcription update:', result);
    }
  });

  const toggleRecording = async () => {
    try {
      if (isListening) {
        stopTranscription();
        const finalTranscript = isManualMode ? manualTranscript : transcript;
        if (finalTranscript && onTranscriptionComplete) {
          onTranscriptionComplete(finalTranscript);
        }
        if (finalTranscript) {
          const notes = await generateSOAPNotes();
          if (notes && onSoapGenerated) {
            onSoapGenerated(notes);
          }
        }
      } else {
        const started = await startTranscription();
        if (!started) {
          console.error('Failed to start transcription');
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };
  
  const handleCopy = async () => {
    const textToCopy = isManualMode ? manualTranscript : transcript;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const handleReset = () => {
    resetTranscription();
    setCopySuccess(false);
  };

  const toggleMode = () => {
    if (isManualMode) {
      disableManualMode();
    } else {
      enableManualMode();
    }
  };

  const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');
  const displayTranscript = isManualMode ? manualTranscript : fullTranscript;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Error Alert */}
      {error && !error.recoverable && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Error de Transcripción</p>
            <p className="text-sm">{error.message}</p>
            {!isManualMode && (
              <Button
                onClick={enableManualMode}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Cambiar a modo manual
              </Button>
            )}
          </div>
          </div>
        )}

        {/* SOAP Notes Display */}
        {isGeneratingSOAP && (
          <p className="text-sm text-gray-500 mt-2">Generando notas...</p>
        )}
        {soapNotes && (
          <Card className="mt-4">
            <CardContent className="space-y-2">
              <h3 className="font-semibold text-gray-900">Notas SOAP</h3>
              <div className="text-sm">
                <strong>S:</strong> {soapNotes.subjective}
              </div>
              <div className="text-sm">
                <strong>O:</strong> {soapNotes.objective}
              </div>
              <div className="text-sm">
                <strong>A:</strong> {soapNotes.assessment}
              </div>
              <div className="text-sm">
                <strong>P:</strong> {soapNotes.plan}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Main Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Header with Mode Toggle */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Captura de Conversación Médica
            </h2>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleMode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isManualMode ? (
                  <>
                    <Mic className="w-4 h-4" />
                    Cambiar a voz
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    Modo manual
                  </>
                )}
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  variant="ghost"
                  size="sm"
                >
                  <Activity className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center gap-2">
            <Badge variant={isManualMode ? 'secondary' : 'default'}>
              {isManualMode ? 'Modo Manual' : 'Modo Voz'}
            </Badge>
            {!isManualMode && isListening && (
              <Badge variant="success" className="animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                Escuchando...
              </Badge>
            )}
          </div>

          {/* Voice Recording Interface */}
          {!isManualMode && (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {isListening && <VoiceReactiveRings isActive={isListening} />}
                <button
                  onClick={toggleRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-110' 
                      : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                  }`}
                >
                  {isListening ? (
                    <Stop className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
              </div>

              <p className="text-gray-600 text-center">
                {isListening 
                  ? 'Haz clic para detener la grabación' 
                  : 'Haz clic para comenzar a grabar'}
              </p>
            </div>
          )}

          {/* Manual Input Interface */}
          {isManualMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe la conversación manualmente:
                </label>
                <textarea
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={8}
                  placeholder="Escribe o pega la transcripción de la conversación médica aquí..."
                  autoFocus
                />
              </div>
              <p className="text-sm text-gray-500">
                Puedes escribir directamente o pegar texto desde otra fuente.
              </p>
            </div>
          )}

          {/* Transcription Display */}
          {displayTranscript && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                  {isManualMode ? 'Texto ingresado:' : 'Transcripción:'}
                </h3>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {transcript}
                  {!isManualMode && interimTranscript && (
                    <span className="text-gray-500 italic"> {interimTranscript}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>

            <div className="flex gap-3">
              {onNext && (
                <Button
                  onClick={() => {
                    const finalTranscript = isManualMode ? manualTranscript : transcript;
                    if (finalTranscript && onTranscriptionComplete) {
                      onTranscriptionComplete(finalTranscript);
                    }
                    if (finalTranscript) {
                      generateSOAPNotes().then(notes => {
                        if (notes && onSoapGenerated) onSoapGenerated(notes);
                      });
                    }
                    onNext();
                  }}
                  disabled={!displayTranscript}
                  variant="default"
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      {showDebugPanel && (
        <TranscriptionDebugPanel
          engineState={engineState}
          error={error}
          isListening={isListening}
          transcript={transcript}
          interimTranscript={interimTranscript}
        />
      )}
    </div>
  );
};

export default ConversationCaptureEnhanced;