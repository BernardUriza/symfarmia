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
        return 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'processing':
      default:
        return 'bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-primary dark:text-primary/90';
    }
  };

  const getSpinnerStyle = () => {
    switch (currentStatus) {
      case 'collecting-residues':
        return 'border-amber-500 dark:border-amber-400';
      case 'processing':
      default:
        return 'border-primary';
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