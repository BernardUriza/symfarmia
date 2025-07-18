import React from 'react';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';
import { ChunkWithProgress, ChunkProgressMap } from '../types';

interface CurrentChunkDisplayProps {
  currentChunk: ChunkWithProgress | null;
  chunkProgress: ChunkProgressMap;
  isRecording: boolean;
}

export const CurrentChunkDisplay: React.FC<CurrentChunkDisplayProps> = ({
  currentChunk,
  chunkProgress,
  isRecording,
}) => {
  const { t } = useMedicalTranslation();

  const getChunkProgressText = () => {
    if (!currentChunk) return null;
    
    const progress = chunkProgress[currentChunk.number];
    if (progress === undefined) return null;
    
    if (progress === 100) {
      return t('transcription.processing_text');
    }
    return t('transcription.analyzing_audio');
  };

  const renderProgressBar = () => {
    if (!currentChunk) return null;
    
    const progress = chunkProgress[currentChunk.number];
    if (progress === undefined) return null;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="text-sm font-medium text-gray-600 mb-1">
        {t('transcription.current_chunk')}:
      </div>
      
      {currentChunk ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-600">
              {t('transcription.chunk_number')}{currentChunk.number}
            </span>
            {chunkProgress[currentChunk.number] !== undefined && (
              <span className="text-xs font-medium text-gray-600">
                {chunkProgress[currentChunk.number]}%
              </span>
            )}
          </div>
          
          {renderProgressBar()}
          
          <div className="text-sm text-gray-700 line-clamp-3">
            {currentChunk.text || (
              <em className="text-gray-400">
                {getChunkProgressText()}
              </em>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">
          {isRecording ? t('transcription.waiting_for_audio') : t('transcription.no_data')}
        </div>
      )}
    </div>
  );
};