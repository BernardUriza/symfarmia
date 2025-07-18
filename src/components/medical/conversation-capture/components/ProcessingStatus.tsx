'use client';

import React from 'react';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface ProcessingStatusProps {
  status?: 'processing' | 'collecting-residues' | null;
  isProcessing?: boolean; // Legacy prop for backwards compatibility
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, isProcessing }) => {
  const { t } = useI18n();

  // Handle legacy prop
  const currentStatus = status || (isProcessing ? 'processing' : null);
  
  if (!currentStatus) return null;

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'collecting-residues':
        return 'Colectando residuos...';
      case 'processing':
      default:
        return t('conversation.capture.processing_with_whisper');
    }
  };

  const getStatusStyle = () => {
    switch (currentStatus) {
      case 'collecting-residues':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'processing':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getSpinnerStyle = () => {
    switch (currentStatus) {
      case 'collecting-residues':
        return 'border-amber-500';
      case 'processing':
      default:
        return 'border-blue-500';
    }
  };

  return (
    <div className={`mt-4 border px-4 py-3 rounded ${getStatusStyle()}`}>
      <div className="flex items-center">
        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${getSpinnerStyle()}`}></div>
        <span className="text-sm">{getStatusMessage()}</span>
      </div>
    </div>
  );
};