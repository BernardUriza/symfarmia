/**
 * Transcription Model Info Component
 * 
 * Development overlay showing transcription model information
 */

import React from 'react';
import type { TranscriptionService } from '../../types/transcription';

interface TranscriptionModelInfoProps {
  service: TranscriptionService;
  className?: string;
}

export const TranscriptionModelInfo = ({
  service,
  className = ''
}: TranscriptionModelInfoProps) => {
  const modelInfo = {
    browser: {
      name: "Web Speech API",
      provider: "Browser Native",
      language: "es-ES",
      latency: "~100ms",
      color: "bg-blue-600"
    },
    whisper: {
      name: "OpenAI Whisper",
      provider: "Hugging Face",
      model: "openai/whisper-medium",
      language: "Multilingual",
      latency: "~2-5s",
      color: "bg-green-600"
    },
    deepgram: {
      name: "Deepgram Nova",
      provider: "Deepgram API",
      model: "nova-2",
      language: "Spanish",
      latency: "~200ms",
      color: "bg-purple-600"
    }
  };

  const info = modelInfo[service];

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs max-w-xs shadow-lg border border-gray-600 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${info.color}`}></div>
        <span className="font-medium text-white">Transcription Model</span>
      </div>
      <div className="space-y-1 text-gray-300">
        <div><span className="text-gray-400">Model:</span> {info.name}</div>
        <div><span className="text-gray-400">Provider:</span> {info.provider}</div>
        {'model' in info && <div><span className="text-gray-400">Version:</span> {info.model}</div>}
        <div><span className="text-gray-400">Language:</span> {info.language}</div>
        <div><span className="text-gray-400">Latency:</span> {info.latency}</div>
      </div>
    </div>
  );
};

export default TranscriptionModelInfo;