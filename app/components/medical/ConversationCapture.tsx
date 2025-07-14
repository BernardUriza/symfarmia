'use client';

import React from 'react';
import { useSimpleWhisper } from '../../../src/domains/medical-ai/hooks/useSimpleWhisper';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff } from 'lucide-react';
import { VoiceReactiveRings } from './VoiceReactiveRings';

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
  const { transcript, isRecording, status, startRecording, stopRecording } = useSimpleWhisper();

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
      if (transcript && onTranscriptionComplete) {
        onTranscriptionComplete(transcript);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Engine Status */}
      <div className="px-4 py-3 rounded bg-green-50 border border-green-200 text-green-700">
        <span className="text-sm">
          Estado del motor: Listo ✅
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          Captura de Conversación
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Presiona el botón para grabar
        </p>
      </div>

      {/* Main Recording Card */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Microphone with Voice Reactive Rings */}
            <VoiceReactiveRings
              isRecording={isRecording}
              size="lg"
              audioLevel={isRecording ? 128 : 0}
              intensity="normal" 
              colorScheme={isRecording ? "red" : "medical"}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </VoiceReactiveRings>
            
            {/* Status Badge */}
            <Badge
              variant={isRecording ? "destructive" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {status === 'recording' ? 'Grabando...' : 
               status === 'processing' ? 'Procesando...' : 
               transcript ? 'Transcripción completada' : 'Listo para grabar'}
            </Badge>

            {/* Recording Button */}
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleToggleRecording}
              disabled={status === 'processing'}
              className="px-8"
            >
              {isRecording ? 'Detener' : 'Iniciar'} Grabación
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transcription Result */}
      {transcript && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Transcripción:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
              {transcript}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {status === 'processing' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">Procesando audio con Whisper...</span>
          </div>
        </div>
      )}

      {/* Next Button */}
      {onNext && transcript && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default">
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationCapture;