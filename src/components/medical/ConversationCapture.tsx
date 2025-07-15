'use client';

import React, { useState } from 'react';
import { useSimpleWhisper } from '../domains/medical-ai/hooks/useSimpleWhisper';
import { useRealAudioCapture } from '../domains/medical-ai/hooks/useRealAudioCapture';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import React, { useState } from 'react';
import { useSimpleWhisper } from '../../../src/domains/medical-ai/hooks/useSimpleWhisper';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WhisperPreloader } from '../domains/medical-ai/components/WhisperPreloader';
import { Activity, Play, Square as Stop, RotateCcw, Copy } from 'lucide-react';
import { VoiceReactiveMicrophone } from '../ui/VoiceReactiveMicrophone';

interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
}

export const ConversationCapture = ({ 
  onNext, 
  onTranscriptionComplete,
  className = ''
}: ConversationCaptureProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useSimpleWhisper();

  const {
    startLiveTranscription,
    stopLiveTranscription
  } = useRealAudioCapture();

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        stopLiveTranscription();
        await stopTranscription();
        if (transcription?.text && onTranscriptionComplete) {
          onTranscriptionComplete(transcription.text);
        }
      } else {
        const started = await startTranscription();
        if (!started && error?.includes('permiso')) {
          setShowPermissionDialog(true);
        } else if (started) {
          // Iniciar Web Speech API para transcripción en tiempo real
          startLiveTranscription();
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };
  
  const handleCopy = async () => {
    if (transcription?.text) {
      await navigator.clipboard.writeText(transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Dialog de Permisos */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Permisos de Micrófono</h3>
            <p className="text-gray-600 mb-4">
              Para poder transcribir tu voz, necesitamos acceso al micrófono. 
              Por favor, permite el acceso cuando el navegador lo solicite.
            </p>
            <Button 
              onClick={() => setShowPermissionDialog(false)} 
              variant="default"
              size="md"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      <WhisperPreloader retryCount={3} retryDelay={1000} />
      {/* Estado del Motor */}
      <div className={`px-4 py-3 rounded ${
        engineStatus === 'ready' ? 'bg-green-50 border border-green-200 text-green-700' :
        engineStatus === 'loading' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
        'bg-red-50 border border-red-200 text-red-700'
      }`}>
        <span className="text-sm">
          Estado del motor: {
            engineStatus === 'ready' ? 'Listo ✅' :
            engineStatus === 'loading' ? 'Cargando modelo...' :
            engineStatus === 'error' ? 'Error ❌' :
            engineStatus === 'fallback' ? 'Modo alternativo' :
            engineStatus
          }
        </span>
      </div>

      {/* Título */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          Captura de Conversación dolor puro
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Presiona el botón para grabar tu consulta médica
        </p>
      </div>

      {/* Tarjeta Principal de Grabación */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Micrófono con Animaciones Voice-Reactive */}
            <div className="mb-4">
              <VoiceReactiveMicrophone
                isRecording={isRecording}
                audioLevel={audioLevel}
                size="lg"
              />
            </div>
            
            {/* Badge de Estado */}
            <Badge
              variant={isRecording ? "destructive" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {isRecording ? 'Grabando...' : 'Listo para grabar'}
            </Badge>

            {/* Timer de Duración */}
            {isRecording && (
              <div className="text-3xl font-mono font-semibold text-blue-600 dark:text-blue-400 mb-4">
                {formatTime(recordingTime)}
              </div>
            )}
            
            {/* Transcripción en tiempo real */}
            {isRecording && liveTranscript && (
              <div className="w-full max-w-md mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transcripción en tiempo real:</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{liveTranscript}</p>
              </div>
            )}
            
            {/* Información de Grabación */}
            {isRecording && (
              <div className="space-y-2">
                
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                  <Activity className="h-4 w-4" />
                  <span>Nivel de audio:</span>
                  <div className="w-32 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-200"
                      style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs">{Math.round((audioLevel / 255) * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Control */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              disabled={status === 'processing' || engineStatus === 'loading'}
              className="px-8"
            >
              {isRecording ? (
                <>
                  <Stop className="w-5 h-5 mr-2" />
                  Detener grabación
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar grabación
                </>
              )}
            </Button>

            {transcription && (
              <>
                <Button 
                  variant="outline" 
                  size="md" 
                  className="px-8"
                  onClick={() => {
                    resetTranscription();
                    setLiveTranscript('');
                  }}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
                
                <Button
                  variant="outline"
                  size="md"
                  className="px-8"
                  onClick={handleCopy}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  {copySuccess ? 'Copiado!' : 'Copiar'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado de Transcripción */}
      {transcription && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Resultado de la transcripción:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm mb-3">
              {transcription.text}
            </div>
            
            {/* Reproductor de Audio */}
            {audioUrl && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Audio grabado:</p>
                <audio 
                  controls 
                  className="w-full"
                  src={audioUrl}
                >
                  Tu navegador no soporta el elemento de audio.
                </audio>
              </div>
            )}
            
            {/* Estadísticas */}
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Confianza: {Math.round(transcription.confidence * 100)}%</span>
              <span>Tiempo de procesamiento: {transcription.processingTime}ms</span>
              {transcription.medicalTerms.length > 0 && (
                <span>Términos médicos: {transcription.medicalTerms.length}</span>
              )}
            </div>
            
            {/* Términos Médicos Detectados */}
            {transcription.medicalTerms.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Términos médicos detectados:</p>
                <div className="flex flex-wrap gap-1">
                  {transcription.medicalTerms.map((term, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mostrar Errores */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Estado de Procesamiento */}
      {status === 'processing' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">Procesando audio con Whisper...</span>
          </div>
        </div>
      )}

      {/* Botón Siguiente */}
      {onNext && transcription && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default" className="">
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
