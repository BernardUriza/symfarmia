'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../providers/I18nProvider';
import { useTranscription } from '../../../hooks/useTranscription';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Activity, Play, Square as Stop, RotateCcw, Copy } from 'lucide-react';
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
  const { t } = useTranslation();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  const {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useTranscription({ realTimeUpdates: true });

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await stopTranscription();
        if (transcription?.text && onTranscriptionComplete) {
          onTranscriptionComplete(transcription.text);
        }
      } else {
        const started = await startTranscription();
        if (!started && error?.includes('permission')) {
          setShowPermissionDialog(true);
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };
  
  const handleCopy = async () => {
    if (transcription?.text) {
      await navigator.clipboard.writeText(transcription.text);
      // TODO: Show toast notification
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Error Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">{t('conversation.capture.permission_title')}</h3>
            <p className="text-gray-600 mb-4">{t('conversation.capture.permission_message')}</p>
            <Button onClick={() => setShowPermissionDialog(false)}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Engine Status */}
      {engineStatus !== 'ready' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <span className="text-sm">
            {t('conversation.capture.engine_status')}: {
              engineStatus === 'loading' ? t('conversation.capture.engine_loading') :
              engineStatus === 'error' ? t('conversation.capture.engine_error') :
              engineStatus === 'fallback' ? t('conversation.capture.engine_fallback') :
              engineStatus
            }
          </span>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t('conversation.capture.title')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('conversation.capture.subtitle')}
        </p>
      </div>

      {/* Main Recording Card */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* 🎙️ Microphone with Voice Reactive Rings */}
            <VoiceReactiveRings
              isRecording={isRecording}
              size="lg"
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
              {isRecording ? t('conversation.capture.recording_active') : t('conversation.capture.ready_to_record')}
            </Badge>

            {/* Recording Info */}
            {isRecording && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('conversation.capture.recording_time')}: {formatTime(recordingTime)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
                  <Activity className="h-4 w-4" />
                  <span>{t('conversation.capture.audio_level')}:</span>
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

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              disabled={status === 'processing'}
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
                <Button variant="outline" onClick={resetTranscription}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t('common.reset')}
                </Button>
                
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="w-5 h-5 mr-2" />
                  {t('common.copy')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcription Result */}
      {transcription && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">{t('conversation.capture.transcription_result')}:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm mb-3">
              {transcription.text}
            </div>
            
            {/* Statistics */}
            <div className="flex gap-4 text-xs text-gray-600">
              <span>{t('conversation.capture.confidence')}: {Math.round(transcription.confidence * 100)}%</span>
              <span>{t('conversation.capture.processing_time')}: {transcription.processingTime}ms</span>
              {transcription.medicalTerms.length > 0 && (
                <span>{t('conversation.capture.medical_terms')}: {transcription.medicalTerms.length}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {status === 'processing' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm">{t('conversation.capture.processing')}</span>
          </div>
        </div>
      )}

      {/* Next Button */}
      {onNext && transcription && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default">
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationCapture;