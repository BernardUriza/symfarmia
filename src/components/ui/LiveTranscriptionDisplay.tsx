/**
 * Live Transcription Display Component
 * 
 * Real-time transcription display with word-by-word updates
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LiveTranscriptionDisplayProps {
  liveTranscript: string;
  finalTranscript: string;
  isRecording: boolean;
  className?: string;
}

export const LiveTranscriptionDisplay = ({
  liveTranscript,
  finalTranscript,
  isRecording,
  className = ''
}: LiveTranscriptionDisplayProps) => {
  const totalWords = (finalTranscript + ' ' + liveTranscript).split(' ').filter(w => w.length > 0).length;

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Transcripción en Tiempo Real
        </h3>
        <div className="flex items-center space-x-2">
          {isRecording && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">En vivo</span>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Final transcript */}
        <div className="text-gray-900 dark:text-white leading-relaxed">
          {finalTranscript}
        </div>
        
        {/* Live transcript with typing effect */}
        <div className="text-blue-600 dark:text-blue-400 leading-relaxed">
          {liveTranscript}
          {isRecording && (
            <motion.span
              className="inline-block w-0.5 h-5 bg-blue-600 ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Word count and stats */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>{totalWords} palabras</span>
          {isRecording && (
            <span className="flex items-center">
              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
              Transcribiendo...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscriptionDisplay;