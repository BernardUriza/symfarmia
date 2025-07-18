'use client';
import React, { useState } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
// import { useI18n } from '@/src/domains/core/hooks/useI18n';

interface ChunkData {
  text: string;
  chunkNumber: number;
}

const AudioProcessingTest = () => {
  // const { t } = useI18n();
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [currentChunk, setCurrentChunk] = useState<{ text: string; number: number } | null>(null);
  const [chunkProgress, setChunkProgress] = useState<{ [key: number]: number }>({});

  const {
    transcription,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription,
  } = useSimpleWhisper({
    autoPreload: true,
    processingMode: 'streaming', // Cambiar a streaming para ver el progreso
    chunkSize: 16384, // Must be a power of 2 between 256 and 16384 for createScriptProcessor
    onChunkProcessed: (text, chunkNumber) => {
      console.log(`[AudioTest] Chunk ${chunkNumber} procesado: "${text}"`);
      const newChunk: ChunkData = { text, chunkNumber };
      setChunks(prev => [...prev, newChunk]);
      setCurrentChunk({ text, number: chunkNumber });
    },
    onChunkProgress: (chunkNumber, progress) => {
      console.log(`[AudioTest] Chunk ${chunkNumber} progreso: ${progress}%`);
      setChunkProgress(prev => ({ ...prev, [chunkNumber]: progress }));
      // Update current chunk progress if it's the active one
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
    await startTranscription();
  } catch (err) {
    console.warn('Error starting transcription:', err);
    }
  };

  const handleStop = async () => {
    await stopTranscription();
  };

  const handleReset = () => {
    resetTranscription();
    setChunks([]);
    setCurrentChunk(null);
    setChunkProgress({});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 ">
          Prueba de Transcripción en Tiempo Real
        </h2>
        <p className="text-gray-600 ">
          Modo Direct - Procesamiento por chunks de 10 segundos
        </p>
      </div>

      {/* Estado del sistema con chunk actual */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna izquierda - Estado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Motor Whisper:</span>
              <span className={`font-medium ${
                engineStatus === 'ready' ? 'text-green-600' : 
                engineStatus === 'loading' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {engineStatus === 'ready' ? '✅ Listo' : 
                 engineStatus === 'loading' ? '⏳ Cargando...' : 
                 '❌ Error'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Estado:</span>
              <span className="font-medium flex items-center gap-2">
                {isRecording ? (
                  <>
                    <span className="animate-pulse">🔴</span>
                    Grabando
                  </>
                ) : (
                  <>⚪ Detenido</>
                )}
              </span>
            </div>

            {isRecording && (
              <>
                <div className="flex items-center justify-between">
                  <span>Tiempo:</span>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Nivel de audio:</span>
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
          <div className="bg-white rounded-lg p-3 border border-gray-200 ">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Chunk actual:
            </div>
            {currentChunk ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-600 ">
                    Chunk #{currentChunk.number}
                  </span>
                  {chunkProgress[currentChunk.number] !== undefined && (
                    <span className="text-xs font-medium text-gray-600 ">
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
                        ? 'Procesando texto...' 
                        : 'Analizando audio...'}
                    </em>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                {isRecording ? 'Esperando audio...' : 'Sin datos'}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
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
          {isRecording ? '⏹️ Detener' : '🎤 Iniciar'} Grabación
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
        >
          🔄 Limpiar
        </button>
      </div>

      {/* Transcripción en tiempo real separada por chunks */}
      {(chunks.length > 0 || isRecording) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-900 ">
            Transcripción en tiempo real:
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chunks.length === 0 && isRecording ? (
              <p className="text-gray-400 italic">Esperando transcripción...</p>
            ) : (
              chunks.map((chunk, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">
                      Chunk #{chunk.chunkNumber}
                    </span>
                    {chunkProgress[chunk.chunkNumber] !== undefined && 
                     chunkProgress[chunk.chunkNumber] < 100 && (
                      <span className="text-xs text-gray-500">
                        {chunkProgress[chunk.chunkNumber]}%
                      </span>
                    )}
                    {chunkProgress[chunk.chunkNumber] === 100 && (
                      <span className="text-xs text-green-600 ">
                        ✓ Completado
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 ">
                    {chunk.text || <em className="text-gray-400">{'<vacío>'}</em>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 ">
            <p className="text-sm text-gray-500 ">
              Total: {chunks.reduce((acc, chunk) => acc + chunk.text.split(' ').filter(w => w).length, 0)} palabras en {chunks.length} chunks
            </p>
          </div>
        </div>
      )}

      {/* Transcripción final */}
      {transcription && !isRecording && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-green-900 ">
            Transcripción completa:
          </h3>
          <p className="text-gray-700 ">
            {transcription.text}
          </p>
          {transcription.medicalTerms && transcription.medicalTerms.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">
                Términos médicos detectados:
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
    </div>
  );
};

export default AudioProcessingTest;
