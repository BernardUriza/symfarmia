/**
 * Live Transcription Display Component
 * 
 * Real-time transcription display with word-by-word updates
 * Shows only the last 3 lines of live transcription
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveTranscriptionDisplayProps {
  liveTranscript: string;
  finalTranscript?: string;
  isRecording: boolean;
  className?: string;
  maxLines?: number;
  showFinalTranscript?: boolean;
}

/**
 * Extract the last N lines from a text string
 */
const getLastLines = (text: string, maxLines: number): string => {
  if (!text) return '';
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // If text doesn't have newlines, approximate lines by word count (about 10 words per line)
  if (lines.length === 1 && text.length > 0) {
    const words = text.split(' ').filter(word => word.trim() !== '');
    const wordsPerLine = 10;
    
    if (words.length > maxLines * wordsPerLine) {
      // Take only the last maxLines worth of words
      const startIndex = words.length - (maxLines * wordsPerLine);
      return words.slice(startIndex).join(' ');
    }
  }
  
  // Return the last N lines
  return lines.slice(-maxLines).join('\n');
};

export const LiveTranscriptionDisplay = ({
  liveTranscript,
  finalTranscript = '',
  isRecording,
  className = '',
  maxLines = 3,
  showFinalTranscript = false
}: LiveTranscriptionDisplayProps) => {
  // Get only the last 3 lines of live transcript
  const displayedLiveTranscript = useMemo(() => 
    getLastLines(liveTranscript, maxLines),
    [liveTranscript, maxLines]
  );

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}>
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
        {/* Final transcript - only show if requested */}
        {showFinalTranscript && finalTranscript && (
          <div className="text-gray-900 dark:text-white leading-relaxed">
            {finalTranscript}
          </div>
        )}
        
        {/* Live transcript with typing effect and fade-in animation */}
        <AnimatePresence mode="wait">
          {displayedLiveTranscript && (
            <motion.div
              key={displayedLiveTranscript}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-blue-600 dark:text-blue-400 leading-relaxed min-h-[60px]"
            >
              {displayedLiveTranscript}
              {isRecording && (
                <motion.span
                  className="inline-block w-0.5 h-5 bg-blue-600 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Simple status indicator */}
        {isRecording && (
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <span className="flex items-center">
              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
              Escuchando...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscriptionDisplay;