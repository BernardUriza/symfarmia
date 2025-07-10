/**
 * Audio Spectrum Visualization Component
 * 
 * Displays real-time audio frequency spectrum
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AudioSpectrumProps {
  audioLevel: number;
  isRecording: boolean;
  barCount?: number;
  height?: number;
  className?: string;
}

export const AudioSpectrum = ({
  audioLevel,
  isRecording,
  barCount = 12,
  height = 64,
  className = ''
}: AudioSpectrumProps) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`} style={{ height }}>
      {bars.map(bar => {
        // Create varied heights for different bars
        const heightMultiplier = Math.sin((bar / barCount) * Math.PI) * 0.5 + 0.5;
        const randomVariation = Math.random() * 0.3 + 0.7;
        const barHeight = isRecording 
          ? Math.max(4, (audioLevel / 100) * height * heightMultiplier * randomVariation)
          : 4;

        return (
          <motion.div
            key={bar}
            className="bg-gradient-to-t from-blue-500 to-green-400 rounded-t"
            style={{ width: '4px', minHeight: '4px' }}
            animate={{
              height: barHeight,
              opacity: isRecording ? 0.7 + (audioLevel / 200) : 0.3
            }}
            transition={{ 
              duration: 0.1,
              ease: "easeOut"
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioSpectrum;