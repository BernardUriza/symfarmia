import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { ChunkData, ChunkProgressMap } from '../types';
import { calculateTotalWords } from '../utils';

interface RealtimeTranscriptionPanelProps {
  chunks: ChunkData[];
  chunkProgress: ChunkProgressMap;
  isRecording: boolean;
  maxHeight?: string;
}

export const RealtimeTranscriptionPanel: React.FC<RealtimeTranscriptionPanelProps> = ({
  chunks,
  chunkProgress,
  isRecording,
  maxHeight = 'max-h-64',
}) => {
  const { t } = useMedicalTranslation();

  const renderChunk = (chunk: ChunkData, index: number) => {
    const progress = chunkProgress[chunk.chunkNumber];
    
    return (
      <div key={index} className="border-l-4 border-blue-500 pl-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-600 font-medium">
            {t('transcription.chunk_number')}{chunk.chunkNumber}
          </span>
          
          {progress !== undefined && progress < 100 && (
            <span className="text-xs text-gray-500">
              {progress}%
            </span>
          )}
          
          {progress === 100 && (
            <span className="text-xs text-green-600">
              ✓ {t('transcription.completed')}
            </span>
          )}
        </div>
        
        <div className="text-gray-700">
          {chunk.text || (
            <em className="text-gray-400">
              {t('transcription.empty_placeholder')}
            </em>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (chunks.length === 0 && isRecording) {
      return (
        <p className="text-gray-400 italic">
          {t('transcription.waiting_transcription')}
        </p>
      );
    }

    return (
      <div className={`space-y-3 ${maxHeight} overflow-y-auto`}>
        {chunks.map(renderChunk)}
      </div>
    );
  };

  const renderStatistics = () => {
    const totalWords = calculateTotalWords(chunks);
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {t('transcription.total_words')}: {totalWords} {' '}
          {t('transcription.words_in_chunks')} {chunks.length} {' '}
          {t('transcription.chunks_text')}
        </p>
      </div>
    );
  };

  if (chunks.length === 0 && !isRecording) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold mb-3 text-gray-900">
        {t('transcription.realtime_transcription')}:
      </h3>
      
      {renderContent()}
      {renderStatistics()}
    </div>
  );
};