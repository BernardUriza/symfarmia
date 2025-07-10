/**
 * Voice-Reactive Microphone Component
 * 
 * Advanced microphone visualization that responds to voice input
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

interface VoiceReactiveMicrophoneProps {
  audioLevel: number;
  isRecording: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceReactiveMicrophone = ({
  audioLevel,
  isRecording,
  size = 'md',
  className = ''
}: VoiceReactiveMicrophoneProps) => {
  // Size configurations
  const sizeConfig = {
    sm: { mic: 'w-10 h-10', icon: 'w-5 h-5' },
    md: { mic: 'w-16 h-16', icon: 'w-8 h-8' },
    lg: { mic: 'w-24 h-24', icon: 'w-12 h-12' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-blue-500"
        animate={{
          scale: isRecording ? [1, 1.3, 1] : 1,
          opacity: isRecording ? [0.2, 0.5, 0.2] : 0.2
        }}
        transition={{
          duration: 1.5,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Voice-reactive rings */}
      {[1, 2, 3].map(ring => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border-2 border-green-400"
          animate={{
            scale: isRecording ? 1 + (audioLevel / 80) + (ring * 0.15) : 1,
            opacity: isRecording ? Math.max(0.1, (audioLevel / 120) - (ring * 0.08)) : 0
          }}
          transition={{ 
            duration: 0.15,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Center microphone */}
      <motion.div
        className={`relative z-10 ${config.mic} rounded-full flex items-center justify-center shadow-lg`}
        animate={{
          backgroundColor: isRecording 
            ? audioLevel > 50 
              ? '#dc2626' // red-600
              : '#2563eb' // blue-600
            : '#6b7280', // gray-500
          scale: isRecording ? 1 + (audioLevel / 400) : 1
        }}
        transition={{ duration: 0.1 }}
      >
        <MicrophoneIcon className={`${config.icon} text-white`} />
      </motion.div>

      {/* Recording indicator dot */}
      {isRecording && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse z-20">
          <div className="absolute inset-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceReactiveMicrophone;