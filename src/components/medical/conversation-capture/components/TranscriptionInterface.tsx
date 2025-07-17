import React from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { RecordingCard } from './RecordingCard';
import type { EngineStatus } from '../types';

interface TranscriptionInterfaceProps {
  isManualMode: boolean;
  manualTranscript: string;
  isRecording: boolean;
  audioLevel: number;
  recordingTime: number;
  liveTranscript: string;
  status: string;
  engineStatus: EngineStatus;
  transcription: any;
  copySuccess: boolean;
  onManualTranscriptChange: (transcript: string) => void;
  onToggleRecording: () => Promise<void>;
  onReset: () => void;
  onCopy: () => Promise<void>;
}

export const TranscriptionInterface: React.FC<TranscriptionInterfaceProps> = ({
  isManualMode,
  manualTranscript,
  isRecording,
  audioLevel,
  recordingTime,
  liveTranscript,
  status,
  engineStatus,
  transcription,
  copySuccess,
  onManualTranscriptChange,
  onToggleRecording,
  onReset,
  onCopy
}) => {
  if (isManualMode) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escribe la conversación manualmente:
            </label>
            <textarea
              value={manualTranscript}
              onChange={(e) => onManualTranscriptChange(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={8}
              placeholder="Escribe o pega la transcripción de la conversación médica aquí..."
              autoFocus
            />
          </div>
          <p className="text-sm">
            Puedes escribir directamente o pegar texto desde otra fuente.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
            >
              Limpiar
            </Button>
            <Button
              onClick={onCopy}
              variant="outline"
              size="sm"
              disabled={!manualTranscript}
            >
              {copySuccess ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <RecordingCard
      isRecording={isRecording}
      audioLevel={audioLevel}
      recordingTime={recordingTime}
      liveTranscript={liveTranscript}
      status={status}
      engineStatus={engineStatus}
      transcription={transcription}
      copySuccess={copySuccess}
      onToggleRecording={onToggleRecording}
      onReset={onReset}
      onCopy={onCopy}
    />
  );
};