'use client';

import React from 'react';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface ProcessingStatusProps {
  isProcessing: boolean;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ isProcessing }) => {
  const { t } = useI18n();

  if (!isProcessing) return null;

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-sm">{t('conversation.capture.processing_with_whisper')}</span>
      </div>
    </div>
  );
};