"use client";

import React from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { useMicrophoneLevel } from '../../../hooks/useMicrophoneLevel';
import { useTranscription } from '../../../src/domains/medical-ai/hooks/useTranscription';
import { TranscriptionStatus } from '../../../src/domains/medical-ai/types';
// Codex: integrated useTranscription for real-time Whisper transcription
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Volume2, ChevronRight, Activity } from 'lucide-react';

export function ConversationCapture({ onNext, isRecording, setIsRecording }) {
  const { t } = useTranslation();
  const {
    transcription,
    status,
    startTranscription,
    stopTranscription,
  } = useTranscription({ realTimeUpdates: true });

  const audioLevel = useMicrophoneLevel(isRecording);

  const toggleRecording = async () => {
    if (isRecording) {
      await stopTranscription();
      setIsRecording(false);
    } else {
      const started = await startTranscription();
      if (started) setIsRecording(true);
    }
  };

  // The useMicrophoneLevel hook handles microphone setup and cleanup

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">{t('conversation.capture.title')}</h1>
        <p className="text-gray-700 bg-white">{t('conversation.capture.subtitle')}</p>
      </div>

      {/* Tarjeta de Estado de Grabación */}
      <Card className="border-2 border-dashed border-blue-200 bg-white shadow-sm">
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
                {isRecording ? t('conversation.capture.recording_active') : t('conversation.capture.ready_to_record')}
              </Badge>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="h-4 w-4" />
                  <span>{t('conversation.capture.audio_level')}:</span>
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
              onClick={toggleRecording}
              className="px-8"
              aria-label={isRecording ? t('transcription.stop_recording') : t('transcription.start_recording')}
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
            {t('conversation.capture.live_transcription')}
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse text-blue-600">
                LIVE
              </Badge>
            )}
            <Badge variant="outline" className="ml-auto">
              {t('conversation.capture.powered_by_ai')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto" role="log" aria-live="polite" aria-label="Medical conversation transcript">
            {transcription?.segments.map((segment, index) => (
              <div key={index} className="flex gap-4 p-3 rounded-lg bg-slate-50 shadow-sm border-2 leading-relaxed" role="article" aria-labelledby={`speaker-${index}`}>
                <div className="flex flex-col items-center">
                  <Badge
                    variant={segment.speaker === 'doctor' ? 'default' : 'secondary'}
                    className="text-xs mb-1 font-semibold"
                    id={`speaker-${index}`}
                  >
                    {segment.speaker}
                  </Badge>
                  <span className="text-xs text-slate-500" aria-label={`Time: ${new Date(segment.startTime).toLocaleTimeString('es-ES')}`}>{new Date(segment.startTime).toLocaleTimeString('es-ES')}</span>
                </div>
                <p className="flex-1 text-slate-700 font-medium" aria-label={`${segment.speaker} says: ${segment.text}`}>{segment.text}</p>
              </div>
            ))}
            {status === TranscriptionStatus.PROCESSING && (
              <div className="flex gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex flex-col items-center">
                  <Badge variant="secondary" className="text-xs mb-1">
                    {t('conversation.speakers.ai_medical')}
                  </Badge>
                  <span className="text-xs text-slate-500">{t('conversation.processing.processing_status')}</span>
                </div>
                <p className="flex-1 text-slate-700">
                  {t('conversation.processing.ai_processing')}
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
        <Button onClick={onNext} className="flex items-center gap-2" aria-label={t('conversation.capture.review_dialog_flow')}>
          {t('conversation.capture.review_dialog_flow')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}