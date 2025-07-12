"use client";

import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Mic, MicOff } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { formatDuration } from './utils';
import { RECORDING_STATES } from './constants';

export function RecordingControls({
  recordingState,
  isTranscribing,
  audioLevel,
  duration,
  onToggleRecording,
  t
}) {
  const isRecording = recordingState === RECORDING_STATES.RECORDING;
  const isProcessing = recordingState === RECORDING_STATES.PROCESSING || isTranscribing;

  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Icono del micrófono */}
          <MicrophoneIcon isRecording={isRecording} />
          
          {/* Estado de grabación */}
          <RecordingStatus 
            isRecording={isRecording}
            isProcessing={isProcessing}
            duration={duration}
            t={t}
          />
          
          {/* Visualizador de audio */}
          <AudioVisualizer 
            audioLevel={audioLevel} 
            isActive={isRecording}
            className="min-h-[24px]"
          />
          
          {/* Botón de control */}
          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onToggleRecording={onToggleRecording}
            t={t}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MicrophoneIcon({ isRecording }) {
  return (
    <div className="relative">
      <div
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? "bg-red-500 shadow-lg shadow-red-200 animate-pulse"
            : "bg-slate-200 dark:bg-gray-700"
        }`}
      >
        <Mic className={`h-10 w-10 ${isRecording ? 'text-white' : 'text-slate-500 dark:text-gray-300'}`} />
      </div>
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
      )}
    </div>
  );
}

function RecordingStatus({ isRecording, isProcessing, duration, t }) {
  const getStatusText = () => {
    if (isRecording) return t("conversation.capture.recording_active");
    if (isProcessing) return t("transcription.processing");
    return t("conversation.capture.ready_to_record");
  };

  const getStatusVariant = () => {
    if (isRecording) return "destructive";
    if (isProcessing) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-2 text-center">
      <Badge
        variant={getStatusVariant()}
        className="text-sm px-3 py-1"
      >
        {getStatusText()}
      </Badge>
      
      {isRecording && duration > 0 && (
        <div className="text-lg font-mono text-gray-700 dark:text-gray-300">
          {formatDuration(duration)}
        </div>
      )}
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span>{t("transcription.processing")}</span>
        </div>
      )}
    </div>
  );
}

function RecordButton({ isRecording, isProcessing, onToggleRecording, t }) {
  return (
    <Button
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      onClick={onToggleRecording}
      disabled={isProcessing}
      className="px-8 min-w-[200px]"
      aria-label={
        isRecording
          ? t("transcription.stop_recording")
          : t("transcription.start_recording")
      }
    >
      {isRecording ? (
        <>
          <MicOff className="h-5 w-5 mr-2" />
          {t("transcription.stop_recording")}
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          {isProcessing ? t("transcription.processing") : t("transcription.start_recording")}
        </>
      )}
    </Button>
  );
}