'use client';

import React from 'react';
import '../styles.css';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface TranscriptionResultProps {
  transcription: {
    text: string;
    confidence: number;
    processingTime: number;
    medicalTerms: string[];
  };
  audioUrl?: string;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ 
  transcription, 
  audioUrl 
}) => {
  const { t } = useI18n();

  return (
    <Card className="mt-4 transition-all duration-300 ease-in-out slide-in">
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">
          {t('conversation.capture.transcription_result')}:
        </h3>
        <div className="bg-gray-50 p-3 rounded text-sm mb-3">
          {transcription.text}
        </div>
        
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
        </div>
        
        {transcription.medicalTerms.length > 0 && (
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