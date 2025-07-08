import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { useMicrophoneLevel } from '../../../hooks/useMicrophoneLevel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Volume2, ChevronRight, Activity } from 'lucide-react';

export function ConversationCapture({ onNext, isRecording, setIsRecording }) {
  const { t } = useTranslation();
  const audioLevel = useMicrophoneLevel(isRecording);
  const [transcriptSegments, setTranscriptSegments] = useState([
    { speaker: 'Doctor', text: 'Buenos días, María. ¿Cómo se siente hoy?', time: '00:00:15' },
    { speaker: 'Paciente', text: 'He tenido este dolor de cabeza persistente durante los últimos tres días.', time: '00:00:22' },
    { speaker: 'Doctor', text: '¿Puede describir el dolor? ¿Es pulsátil, punzante o sordo?', time: '00:00:35' },
    { speaker: 'Paciente', text: 'Es más bien un dolor sordo y constante, especialmente en el lado derecho de mi cabeza.', time: '00:00:42' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate AI processing and add new segments
  useEffect(() => {
    if (isRecording && !isProcessing) {
      const timer = setTimeout(() => {
        setIsProcessing(true);
        // Simulate AI processing with medical-ai API
        const simulateAIResponse = async () => {
          try {
            const response = await fetch('/api/medical-ai/demo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input: 'dolor de cabeza persistente' })
            });
            const data = await response.json();
            
            if (data.success) {
              const newSegment = {
                speaker: 'IA Médica',
                text: data.response || 'Analizando síntomas...',
                time: new Date().toLocaleTimeString('es-ES', { hour12: false }).slice(0, 8)
              };
              setTranscriptSegments(prev => [...prev, newSegment]);
            }
          } catch (error) {
            console.error('AI processing error:', error);
          } finally {
            setIsProcessing(false);
          }
        };
        
        simulateAIResponse();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isRecording, isProcessing]);

  // The useMicrophoneLevel hook handles microphone setup and cleanup

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl text-slate-900 mb-2">Captura de Conversación</h1>
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
                {isRecording ? t('demo.recording_active') : t('transcription.ready_to_record')}
              </Badge>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="h-4 w-4" />
                  <span>{t('demo.audio_level')}:</span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-200"
                      style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
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
                  {t('transcription.stop_recording')}
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  {t('transcription.start_recording')}
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
            {t('demo.live_transcription')}
            <Badge variant="outline" className="ml-auto">
              {t('demo.powered_by_ai')}
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
            {isProcessing && (
              <div className="flex gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex flex-col items-center">
                  <Badge variant="secondary" className="text-xs mb-1">
                    IA Médica
                  </Badge>
                  <span className="text-xs text-slate-500">procesando...</span>
                </div>
                <p className="flex-1 text-slate-700">
                  Analizando síntomas médicos...
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
          {t('demo.review_dialog_flow')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}