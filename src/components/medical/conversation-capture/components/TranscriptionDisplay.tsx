import React from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { TranscriptionResult } from './TranscriptionResult';
import type { DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';

interface TranscriptionDisplayProps {
  show: boolean;
  isManualMode: boolean;
  manualTranscript: string;
  transcription: any;
  audioUrl: string | null;
  webSpeechText: string;
  diarizationResult: DiarizationResult | null;
  isDiarizationProcessing: boolean;
  diarizationError: string | null;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  show,
  isManualMode,
  manualTranscript,
  transcription,
  audioUrl,
  webSpeechText,
  diarizationResult,
  isDiarizationProcessing,
  diarizationError
}) => {
  if (!show) return null;

  console.log('[TranscriptionDisplay] Showing final transcription:', transcription);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Transcripción completa
      </h3>
      {isManualMode ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {manualTranscript}
            </p>
          </CardContent>
        </Card>
      ) : (
        <TranscriptionResult 
          transcription={transcription} 
          audioUrl={audioUrl}
          webSpeechText={webSpeechText}
          diarizationResult={diarizationResult}
          isDiarizationProcessing={isDiarizationProcessing}
          diarizationError={diarizationError}
        />
      )}
    </div>
  );
};