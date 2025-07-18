import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { Transcription } from '@/src/domains/medical-ai/hooks/aux_hooks/types';
import { formatTime, formatConfidence, generateAudioFilename } from '../utils';

interface AudioRecordingPanelProps {
  audioUrl: string;
  transcription?: Transcription | null;
  recordingTime: number;
  isRecording: boolean;
  onAudioDownload?: (url: string) => void;
}

export const AudioRecordingPanel: React.FC<AudioRecordingPanelProps> = ({
  audioUrl,
  transcription,
  recordingTime,
  isRecording,
  onAudioDownload,
}) => {
  const { t } = useMedicalTranslation();

  const handleDownload = () => {
    onAudioDownload?.(audioUrl);
  };

  if (!audioUrl || isRecording) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold mb-3 text-blue-900">
        🎵 {t('transcription.recorded_audio')}:
      </h3>
      
      <div className="space-y-4">
        {/* Audio Player */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <audio 
            controls 
            src={audioUrl}
            className="w-full"
            preload="metadata"
            aria-label={t('transcription.recorded_audio')}
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <a
            href={audioUrl}
            download={generateAudioFilename()}
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            aria-label={t('transcription.download_audio')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {t('transcription.download_audio')}
          </a>
        </div>

        {/* Audio Info */}
        <div className="text-sm text-gray-600 text-center">
          <p>
            {t('transcription.audio_format')}: WAV • {' '}
            {t('transcription.duration')}: {formatTime(recordingTime)}
          </p>
          
          {transcription && (
            <p className="mt-1">
              {t('transcription.processing_time')}: {transcription.processingTime || 0}ms • {' '}
              {t('transcription.confidence')}: {formatConfidence(transcription.confidence)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};