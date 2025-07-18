import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { EngineStatus } from '@/src/domains/medical-ai/hooks/aux_hooks/types';
import { formatTime, normalizeAudioLevel } from '../utils';

interface SystemStatusPanelProps {
  engineStatus: EngineStatus;
  isRecording: boolean;
  recordingTime: number;
  audioLevel: number;
  error?: string;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  engineStatus,
  isRecording,
  recordingTime,
  audioLevel,
  error,
}) => {
  const { t } = useMedicalTranslation();

  const getEngineStatusDisplay = () => {
    const statusConfig = {
      ready: { color: 'text-green-600', icon: '✅', text: t('transcription.ready') },
      loading: { color: 'text-yellow-600', icon: '⏳', text: t('transcription.loading') },
      error: { color: 'text-red-600', icon: '❌', text: t('transcription.error') },
      processing: { color: 'text-blue-600', icon: '⚙️', text: t('transcription.processing') },
    };

    const config = statusConfig[engineStatus] || statusConfig.error;
    return (
      <span className={`font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getRecordingStatusDisplay = () => {
    return isRecording ? (
      <>
        <span className="animate-pulse">🔴</span>
        {t('transcription.recording_active')}
      </>
    ) : (
      <>⚪ {t('transcription.stopped')}</>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>{t('transcription.whisper_engine')}:</span>
            {getEngineStatusDisplay()}
          </div>

          <div className="flex items-center justify-between">
            <span>{t('transcription.status')}:</span>
            <span className="font-medium flex items-center gap-2">
              {getRecordingStatusDisplay()}
            </span>
          </div>

          {isRecording && (
            <>
              <div className="flex items-center justify-between">
                <span>{t('transcription.time')}:</span>
                <span className="font-mono">{formatTime(recordingTime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>{t('transcription.audio_level')}:</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${normalizeAudioLevel(audioLevel)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Real-time Info */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">
            {t('transcription.system_info')}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Sample Rate: 16kHz</div>
            <div>Chunk Size: 16384 samples</div>
            <div>Mode: Real-time Processing</div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">
            {t('transcription.error')}: {error}
          </p>
        </div>
      )}
    </div>
  );
};