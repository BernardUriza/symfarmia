'use client';
import React, { useState } from 'react';
import { useDirectAudioCapture } from '@/src/domains/medical-ai/hooks/useDirectAudioCapture';

const AudioProcessingTest = () => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { start, stop, isRecording, isWorkerReady } = useDirectAudioCapture({
    onChunkReady: (audioData) => {
      const chunkInfo = `Chunk: ${audioData.length} samples, avg: ${
        audioData.reduce((a, b) => a + Math.abs(b), 0) / audioData.length
      }`;
      setChunks(prev => [...prev, chunkInfo]);
      console.log(chunkInfo);
    },
    chunkSize: 8000, // 0.5 seconds
    sampleRate: 16000
  });

  const handleStart = async () => {
    try {
      setError(null);
      setChunks([]);
      const stream = await start();
      if (!stream) {
        setError('Failed to start audio capture');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Audio Processing Test</h2>
      
      <div className="mb-4 space-y-2">
        <p>Worker Ready: {isWorkerReady ? '✅' : '❌'}</p>
        <p>Recording: {isRecording ? '🔴' : '⚪'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={isRecording ? handleStop : handleStart}
          className={`px-4 py-2 rounded ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? 'Stop' : 'Start'} Test
        </button>
      </div>

      {chunks.length > 0 && (
        <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-2">Audio Chunks:</h3>
          {chunks.map((chunk, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
              {chunk}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioProcessingTest;