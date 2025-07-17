'use client';

import React from 'react';
import '../styles.css';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Activity, Play, Square as Stop, RotateCcw, Copy } from 'lucide-react';
import { VoiceReactiveMicrophone } from '@/src/components/ui/VoiceReactiveMicrophone';
import { LiveTranscriptionDisplay } from '@/src/components/ui/LiveTranscriptionDisplay';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface RecordingCardProps {
  isRecording: boolean;
  audioLevel: number;
  recordingTime: number;
  liveTranscript: string;
  status: string;
  engineStatus: string;
  transcription: {
    text: string;
    confidence: number;
    processingTime: number;
    medicalTerms: string[];
  } | null;
  copySuccess: boolean;
  onToggleRecording: () => void;
  onReset: () => void;
  onCopy: () => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({
  isRecording,
  audioLevel,
  recordingTime,
  liveTranscript,
  status,
  engineStatus,
  transcription,
  copySuccess,
  onToggleRecording,
  onReset,
  onCopy
}) => {
  const { t } = useI18n();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 shadow-sm transition-all duration-300 ease-in-out slide-in">
      <CardContent className="p-8 text-center">
        {/* Show transcription result when completed */}
        {transcription && !isRecording && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {t('conversation.capture.transcription_result')}:
            </h3>
            <div className="flex justify-center gap-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                {t('conversation.capture.confidence')}: {Math.round(transcription.confidence * 100)}%
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {t('conversation.capture.processing_time')}: {transcription.processingTime}ms
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <div className="mb-4">
            <VoiceReactiveMicrophone
              isRecording={isRecording}
              audioLevel={audioLevel}
              size="lg"
            />
          </div>
          
          <Badge
            variant={isRecording ? "destructive" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {isRecording 
              ? t('conversation.capture.recording_active') + '...' 
              : t('conversation.capture.ready_to_record')}
          </Badge>

          {isRecording && (
            <div className="text-3xl font-mono font-semibold text-blue-600 mb-4">
              {formatTime(recordingTime)}
            </div>
          )}
          
          {isRecording && (
            <div className="w-full max-w-2xl mt-4">
              <LiveTranscriptionDisplay
                liveTranscript={liveTranscript}
                isRecording={isRecording}
                showFinalTranscript={false}
                maxLines={3}
                className="animate-fadeIn"
              />
            </div>
          )}
          
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Activity className="h-4 w-4" />
                <span>{t('conversation.capture.audio_level')}:</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
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

        <div className="flex justify-center gap-4 mt-6">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={onToggleRecording}
            disabled={status === 'processing' || engineStatus === 'loading'}
            className="px-8"
          >
            {isRecording ? (
              <>
                <Stop className="w-5 h-5 mr-2" />
                {t('conversation.capture.stop_recording')}
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {t('conversation.capture.start_recording')}
              </>
            )}
          </Button>

          {transcription && (
            <>
              <Button 
                variant="outline" 
                size="md" 
                className="px-8"
                onClick={onReset}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t('conversation.capture.reset')}
              </Button>
              
              <Button
                variant="outline"
                size="md"
                className="px-8"
                onClick={onCopy}
              >
                <Copy className="w-5 h-5 mr-2" />
                {copySuccess 
                  ? t('conversation.capture.copied') 
                  : t('conversation.capture.copy')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};