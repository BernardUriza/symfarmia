'use client';

import React from 'react';
import '../styles.css';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

import { DiarizedTranscript } from '@/src/components/medical/DiarizedTranscript';
import { DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';

interface TranscriptionResultProps {
  transcription: {
    text: string;
    confidence: number;
    processingTime: number;
    medicalTerms: string[];
  };
  audioUrl?: string;
  webSpeechText?: string;
  diarizationResult?: DiarizationResult | null;
  isDiarizationProcessing?: boolean;
  diarizationError?: string | null;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ 
  transcription, 
  audioUrl,
  webSpeechText,
  diarizationResult,
  isDiarizationProcessing,
  diarizationError
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<'whisper' | 'webspeech' | 'diarization'>('whisper');

  return (
    <Card className="mt-4 transition-all duration-300 ease-in-out slide-in">
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">
          {t('conversation.capture.transcription_result')}:
        </h3>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-3">
          <button
            onClick={() => setActiveTab('whisper')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'whisper'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Whisper (Opción 1)
          </button>
          {webSpeechText && (
            <button
              onClick={() => setActiveTab('webspeech')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'webspeech'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Web Speech (Opción 2)
            </button>
          )}
          <button
            onClick={() => setActiveTab('diarization')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'diarization'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Diarización (Opción 3)
            {isDiarizationProcessing && (
              <span className="ml-2 animate-spin">⏳</span>
            )}
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'diarization' ? (
          <div className="mb-3">
            {isDiarizationProcessing ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Procesando diarización...</span>
              </div>
            ) : diarizationError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-700 font-medium">Error en diarización:</p>
                <p className="text-red-600 text-sm mt-1">{diarizationError}</p>
              </div>
            ) : diarizationResult ? (
              <DiarizedTranscript 
                segments={diarizationResult.segments}
                audioUrl={audioUrl}
                editable={true}
                showTimeline={true}
                className="border-0 p-0"
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded text-center">
                <p className="text-gray-500">
                  La diarización se procesará automáticamente al completar la transcripción.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded text-sm mb-3">
            {activeTab === 'whisper' ? (
              transcription.text
            ) : (
              webSpeechText || 'No hay transcripción de Web Speech disponible'
            )}
          </div>
        )}
        
        {audioUrl && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-2">
              {t('conversation.capture.recorded_audio')}
            </p>
            <audio 
              controls 
              className="w-full"
              src={audioUrl}
            >
              {t('conversation.capture.audio_not_supported')}
            </audio>
          </div>
        )}
        
        <div className="flex gap-4 text-xs text-gray-600">
          {activeTab === 'whisper' ? (
            <>
              <span>
                {t('conversation.capture.confidence')}: {Math.round(transcription.confidence * 100)}%
              </span>
              <span>
                {t('conversation.capture.processing_time')}: {transcription.processingTime}ms
              </span>
              {transcription.medicalTerms.length > 0 && (
                <span>
                  {t('conversation.capture.medical_terms')}: {transcription.medicalTerms.length}
                </span>
              )}
            </>
          ) : (
            <>
              <span>
                Fuente: Web Speech API
              </span>
              <span>
                Longitud: {webSpeechText?.length || 0} caracteres
              </span>
              <span>
                Palabras: {webSpeechText?.split(' ').length || 0}
              </span>
            </>
          )}
        </div>
        
        {(activeTab === 'whisper' && transcription.medicalTerms.length > 0) && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-1">
              {t('conversation.capture.medical_terms_detected')}
            </p>
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
  );
};