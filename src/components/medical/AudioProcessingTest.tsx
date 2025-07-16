'use client';
import React, { useState } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useI18n } from '@/src/domains/core/hooks/useI18n';

const AudioProcessingTest = () => {
  const { t } = useI18n();
  const [chunks, setChunks] = useState<Array<{ text: string; chunkNumber: number }>>([]);
  const [accumulatedText, setAccumulatedText] = useState<string>('');
  
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
    processingMode: 'direct', // Modo direct para procesamiento rápido
    chunkSize: 160000, // 10 segundos a 16kHz para chunks gordos
    onChunkProcessed: (text, chunkNumber) => {
      console.log(`[AudioTest] Chunk ${chunkNumber} procesado: "${text}"`);
      setChunks(prev => [...prev, { text, chunkNumber }]);
      setAccumulatedText(prev => {
        const combined = prev + ' ' + text;
        return combined.trim();
      });
    }
  });

  const handleStart = async () => {
    try {
      setChunks([]);
      setAccumulatedText('');
      const success = await startTranscription();
      if (!success) {
        console.error('Failed to start transcription');
      }
    } catch (err) {
      console.error('Error starting:', err);
    }
  };

  const handleStop = async () => {
    await stopTranscription();
  };

  const handleReset = () => {
    resetTranscription();
    setChunks([]);
    setAccumulatedText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Prueba de Transcripción en Tiempo Real
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Modo Direct - Procesamiento por chunks de 10 segundos
        </p>
      </div>
      
      {/* Estado del sistema */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span>Motor Whisper:</span>
          <span className={`font-medium ${engineStatus === 'ready' ? 'text-green-600' : engineStatus === 'loading' ? 'text-yellow-600' : 'text-red-600'}`}>
            {engineStatus === 'ready' ? '✅ Listo' : engineStatus === 'loading' ? '⏳ Cargando...' : '❌ Error'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estado:</span>
          <span className="font-medium flex items-center gap-2">
            {isRecording ? (
              <>
                <span className="animate-pulse">🔴</span> Grabando
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
              <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
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
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRecording ? '⏹️ Detener' : '🎤 Iniciar'} Grabación
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
        >
          🔄 Limpiar
        </button>
      </div>

      {/* Caja de texto principal para transcripción acumulada */}
      {(accumulatedText || isRecording) && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Transcripción en tiempo real:
          </h3>
          <textarea
            value={accumulatedText}
            readOnly
            className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none text-gray-700 dark:text-gray-300"
            placeholder="El texto aparecerá aquí mientras hablas..."
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {accumulatedText.trim().split(' ').filter(w => w).length} palabras
          </p>
        </div>
      )}

      {/* Chunks individuales */}
      {chunks.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Chunks procesados ({chunks.length}):
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {chunks.map((chunk, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Chunk #{chunk.chunkNumber}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {chunk.text || <em className="text-gray-400">{'<vacío>'}</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcripción final */}
      {transcription && !isRecording && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">
            Transcripción completa:
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{transcription.text}</p>
          {transcription.medicalTerms?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Términos médicos detectados:
              </p>
              <div className="flex flex-wrap gap-1">
                {transcription.medicalTerms.map((term, i) => (
                  <span key={i} className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
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