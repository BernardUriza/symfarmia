import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, MicOff, Volume2, ChevronRight, Activity } from 'lucide-react';

interface ConversationCaptureProps {
  onNext: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export function ConversationCapture({ onNext, isRecording, setIsRecording }: ConversationCaptureProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptSegments, setTranscriptSegments] = useState([
    { speaker: 'Doctor', text: 'Buenos días, María. ¿Cómo se siente hoy?', time: '00:00:15' },
    { speaker: 'Paciente', text: 'He tenido este dolor de cabeza persistente durante los últimos tres días.', time: '00:00:22' },
    { speaker: 'Doctor', text: '¿Puede describir el dolor? ¿Es pulsátil, punzante o sordo?', time: '00:00:35' },
    { speaker: 'Paciente', text: 'Es más bien un dolor sordo y constante, especialmente en el lado derecho de mi cabeza.', time: '00:00:42' },
  ]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">Captura de Conversjmación</h1>
        <p className="text-slate-600">La IA está escuchando y transcribiendo su consulta médica en tiempo real</p>
      </div>

      {/* Tarjeta de Estado de Grabación */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' 
                : 'bg-slate-200'
            }`}>
              {isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-slate-500" />
              )}
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
              )}
            </div>
            
            <div className="space-y-2">
              <Badge 
                variant={isRecording ? "destructive" : "secondary"}
                className="text-sm px-3 py-1"
              >
                {isRecording ? 'Grabación Activa' : 'Listo para Grabar'}
              </Badge>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="h-4 w-4" />
                  <span>Nivel de Audio:</span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-200"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={() => setIsRecording(!isRecording)}
              className="px-8"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Detener Grabación
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Iniciar Grabación
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transcripción en Vivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Transcripción en Vivo
            <Badge variant="outline" className="ml-auto">
              Impulsado por IA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcriptSegments.map((segment, index) => (
              <div key={index} className="flex gap-4 p-3 rounded-lg bg-slate-50">
                <div className="flex flex-col items-center">
                  <Badge 
                    variant={segment.speaker === 'Doctor' ? 'default' : 'secondary'}
                    className="text-xs mb-1"
                  >
                    {segment.speaker}
                  </Badge>
                  <span className="text-xs text-slate-500">{segment.time}</span>
                </div>
                <p className="flex-1 text-slate-700">{segment.text}</p>
              </div>
            ))}
            {isRecording && (
              <div className="flex gap-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex flex-col items-center">
                  <Badge variant="default" className="text-xs mb-1">
                    Doctor
                  </Badge>
                  <span className="text-xs text-slate-500">00:01:05</span>
                </div>
                <p className="flex-1 text-slate-700">
                  ¿Ha probado algún medicamento o tratamiento...
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-4">
        <div />
        <Button onClick={onNext} className="flex items-center gap-2">
          Revisar Flujo de Diálogo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}