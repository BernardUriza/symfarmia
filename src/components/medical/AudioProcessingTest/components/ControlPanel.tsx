import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { EngineStatus } from '@/src/domains/medical-ai/hooks/aux_hooks/types';

interface ControlPanelProps {
  isRecording: boolean;
  engineStatus: EngineStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRecording,
  engineStatus,
  onStart,
  onStop,
  onReset,
}) => {
  const { t } = useMedicalTranslation();

  const getMainButtonClass = () => {
    const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105';
    
    if (isRecording) {
      return `${baseClasses} bg-red-500 hover:bg-red-600 text-white shadow-lg`;
    }
    
    if (engineStatus === 'ready') {
      return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white shadow-lg`;
    }
    
    return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
  };

  const getMainButtonText = () => {
    if (isRecording) {
      return `⏹️ ${t('transcription.stop_recording_btn')}`;
    }
    return `🎤 ${t('transcription.start_recording_btn')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={engineStatus !== 'ready'}
        className={getMainButtonClass()}
        aria-label={isRecording ? t('transcription.stop_recording_btn') : t('transcription.start_recording_btn')}
      >
        {getMainButtonText()}
      </button>

      <button
        onClick={onReset}
        className="px-4 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
        aria-label={t('transcription.clear_btn')}
      >
        🔄 {t('transcription.clear_btn')}
      </button>
    </div>
  );
};