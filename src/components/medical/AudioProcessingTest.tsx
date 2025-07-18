'use client';
import React, { useState } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useMedicalTranslation } from '@/src/domains/medical-ai/hooks/useMedicalTranslation';

interface ChunkData {
  text: string;
  chunkNumber: number;
  timestamp?: number;
}

interface ChunkWithProgress {
  text: string;
  number: number;
  progress?: number;
}

const AudioProcessingTest = React.memo(() => {
  const { t } = useMedicalTranslation();
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [currentChunk, setCurrentChunk] = useState<ChunkWithProgress | null>(null);
  const [chunkProgress, setChunkProgress] = useState<{ [key: number]: number }>({});

  const {
    transcription,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    audioBlob,
    startTranscription,
    stopTranscription,
    resetTranscription,
  } = useSimpleWhisper({
    autoPreload: true,
    processingMode: 'direct', // Use direct mode for better chunk processing
    chunkSize: 16384,
    sampleRate: 16000,
    onChunkProcessed: (text, chunkNumber) => {
      const newChunk: ChunkData = { text, chunkNumber, timestamp: Date.now() };
      setChunks(prev => [...prev, newChunk]);
      setCurrentChunk({ text, number: chunkNumber });
    },
    onChunkProgress: (chunkNumber, progress) => {
      setChunkProgress(prev => ({ ...prev, [chunkNumber]: progress }));
      setCurrentChunk(curr => 
        curr && curr.number === chunkNumber 
          ? { ...curr, progress } 
          : curr
      );
    }
  });

  const handleStart = async () => {
    try {
      setChunks([]);
      setCurrentChunk(null);
      setChunkProgress({});
      const success = await startTranscription();
      if (!success) {
        console.error('Failed to start transcription');
      }
    } catch (err) {
      console.error('Error starting transcription:', err);
    }
  };

  const handleStop = async () => {
    try {
      const success = await stopTranscription();
      if (!success) {
        console.error('Failed to stop transcription');
      }
    } catch (err) {
      console.error('Error stopping transcription:', err);
    }
  };

  const handleReset = () => {
    try {
      resetTranscription();
      setChunks([]);
      setCurrentChunk(null);
      setChunkProgress({});
    } catch (err) {
      console.error('Error resetting transcription:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          {t('transcription.test_title')}
        </h2>
        <p className="text-gray-600">
          {t('transcription.test_description')}
        </p>
      </div>

      {/* Estado del sistema con chunk actual */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna izquierda - Estado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>{t('transcription.whisper_engine')}:</span>
              <span className={`font-medium ${
                engineStatus === 'ready' ? 'text-green-600' : 
                engineStatus === 'loading' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {engineStatus === 'ready' ? `✅ ${t('transcription.ready')}` : 
                 engineStatus === 'loading' ? `⏳ ${t('transcription.loading')}` : 
                 `❌ ${t('transcription.error')}`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t('transcription.status')}:</span>
              <span className="font-medium flex items-center gap-2">
                {isRecording ? (
                  <>
                    <span className="animate-pulse">🔴</span>
                    {t('transcription.recording_active')}
                  </>
                ) : (
                  <>⚪ {t('transcription.stopped')}</>
                )}
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
                      style={{ width: `${Math.min(audioLevel, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Columna derecha - Chunk actual */}
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
                {chunkProgress[currentChunk.number] !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${chunkProgress[currentChunk.number]}%` }}
                    />
                  </div>
                )}
                <div className="text-sm text-gray-700 line-clamp-3">
                  {currentChunk.text || (
                    <em className="text-gray-400">
                      {chunkProgress[currentChunk.number] === 100 
                        ? t('transcription.processing_text')
                        : t('transcription.analyzing_audio')}
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
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{t('transcription.error')}: {error}</p>}
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={isRecording ? handleStop : handleStart}
          disabled={engineStatus !== 'ready'}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
              : engineStatus === 'ready'
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRecording ? `⏹️ ${t('transcription.stop_recording_btn')}` : `🎤 ${t('transcription.start_recording_btn')}`}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
        >
          🔄 {t('transcription.clear_btn')}
        </button>
      </div>

      {/* Transcripción en tiempo real separada por chunks */}
      {(chunks.length > 0 || isRecording) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-900">
            {t('transcription.realtime_transcription')}:
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chunks.length === 0 && isRecording ? (
              <p className="text-gray-400 italic">{t('transcription.waiting_transcription')}</p>
            ) : (
              chunks.map((chunk, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">
                      {t('transcription.chunk_number')}{chunk.chunkNumber}
                    </span>
                    {chunkProgress[chunk.chunkNumber] !== undefined && 
                     chunkProgress[chunk.chunkNumber] < 100 && (
                      <span className="text-xs text-gray-500">
                        {chunkProgress[chunk.chunkNumber]}%
                      </span>
                    )}
                    {chunkProgress[chunk.chunkNumber] === 100 && (
                      <span className="text-xs text-green-600">
                        ✓ {t('transcription.completed')}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700">
                    {chunk.text || <em className="text-gray-400">{t('transcription.empty_placeholder')}</em>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('transcription.total_words')}: {chunks.reduce((acc, chunk) => acc + chunk.text.split(' ').filter(w => w).length, 0)} {t('transcription.words_in_chunks')} {chunks.length} {t('transcription.chunks_text')}
            </p>
          </div>
        </div>
      )}

      {/* Transcripción final */}
      {transcription && !isRecording && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-green-900">
            {t('transcription.complete_transcription')}:
          </h3>
          <p className="text-gray-700">
            {transcription.text}
          </p>
          {transcription.medicalTerms && transcription.medicalTerms.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">
                {t('transcription.detected_medical_terms')}:
              </p>
              <div className="flex flex-wrap gap-1">
                {transcription.medicalTerms.map((term, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio grabado */}
      {audioUrl && !isRecording && (
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
              >
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <a
                href={audioUrl}
                download={`medical-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {t('transcription.download_audio')}
              </a>
            </div>

            {/* Audio Info */}
            <div className="text-sm text-gray-600 text-center">
              <p>{t('transcription.audio_format')}: WAV • {t('transcription.duration')}: {formatTime(recordingTime)}</p>
              {transcription && (
                <p className="mt-1">
                  {t('transcription.processing_time')}: {transcription.processingTime || 0}ms • 
                  {t('transcription.confidence')}: {Math.round((transcription.confidence || 0) * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AudioProcessingTest;
