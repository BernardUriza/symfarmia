'use client';
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface VoiceReactiveRingsProps {
  isRecording: boolean;
  audioLevel: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'normal' | 'dramatic';
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'medical';
  className?: string;
  children?: ReactNode;
  minLevel?: number; // Nuevo: mínimo tolerable
  maxLevel?: number; // Nuevo: máximo tolerable
}

const SIZE_CONFIG = {
  sm: { base: 40, rings: [50, 65, 80, 100] },
  md: { base: 60, rings: [75, 95, 120, 150] },
  lg: { base: 80, rings: [100, 130, 170, 220] },
  xl: { base: 100, rings: [130, 170, 220, 280] }
};

const COLOR_SCHEMES = {
  blue: {
    core: 'rgb(59, 130, 246)',
    rings: [
      'rgba(59, 130, 246, 0.4)',
      'rgba(59, 130, 246, 0.25)',
      'rgba(59, 130, 246, 0.15)',
      'rgba(59, 130, 246, 0.08)'
    ]
  },
  red: {
    core: 'rgb(239, 68, 68)',
    rings: [
      'rgba(239, 68, 68, 0.5)',
      'rgba(239, 68, 68, 0.3)',
      'rgba(239, 68, 68, 0.2)',
      'rgba(239, 68, 68, 0.1)'
    ]
  },
  green: {
    core: 'rgb(34, 197, 94)',
    rings: [
      'rgba(34, 197, 94, 0.4)',
      'rgba(34, 197, 94, 0.25)',
      'rgba(34, 197, 94, 0.15)',
      'rgba(34, 197, 94, 0.08)'
    ]
  },
  purple: {
    core: 'rgb(168, 85, 247)',
    rings: [
      'rgba(168, 85, 247, 0.4)',
      'rgba(168, 85, 247, 0.25)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(168, 85, 247, 0.08)'
    ]
  },
  medical: {
    core: 'rgb(16, 185, 129)',
    rings: [
      'rgba(16, 185, 129, 0.4)',
      'rgba(16, 185, 129, 0.25)',
      'rgba(16, 185, 129, 0.15)',
      'rgba(16, 185, 129, 0.08)'
    ]
  }
};

// --- Rango por default ---
const DEFAULT_MIN = 8;
const DEFAULT_MAX = 60;

export const VoiceReactiveRings = ({
  isRecording,
  size = 'lg',
  intensity = 'normal',
  colorScheme = 'medical',
  className = '',
  audioLevel = 0,
  children,
  minLevel = DEFAULT_MIN,
  maxLevel = DEFAULT_MAX
}: VoiceReactiveRingsProps) => {
  const [ringLevels, setRingLevels] = useState([0, 0, 0, 0]);
  const smoothingFactors = [0.8, 0.6, 0.4, 0.2];

  useEffect(() => {
    if (!isRecording) {
      setRingLevels([0, 0, 0, 0]);
      return;
    }
    const intervalId = setInterval(() => {
      setRingLevels(prev =>
        prev.map((currentLevel, index) => {
          const smoothing = smoothingFactors[index];
          const targetLevel = (audioLevel / 255) *
            (intensity === 'subtle' ? 0.5 : intensity === 'dramatic' ? 1.5 : 1);
          return currentLevel + (targetLevel - currentLevel) * smoothing;
        })
      );
    }, 16);
    return () => clearInterval(intervalId);
  }, [audioLevel, isRecording, intensity]);

  const config = SIZE_CONFIG[size];
  const colors = COLOR_SCHEMES[colorScheme];

  // NIVELES visuales
  let levelStyle = 'font-bold transition-all select-none';
  let ringPulseClass = '';
  let text = `${audioLevel}`;

  if (audioLevel < minLevel) {
    levelStyle += ' text-gray-400 opacity-60 text-sm blur-[1px]';
    text = `⭑${audioLevel}`;
  } else if (audioLevel >= minLevel && audioLevel < maxLevel) {
    levelStyle += ' text-white text-xl drop-shadow';
    text = `${audioLevel}`;
  } else if (audioLevel >= maxLevel) {
    levelStyle += ' text-4xl text-white animate-pulse-explode drop-shadow-xl';
    ringPulseClass = 'animate-pulse-ring';
    text = `¡${audioLevel}!`;
  }

  const getRingScale = (ringIndex: number) => {
    if (!isRecording) return 1;
    const level = ringLevels[ringIndex];
    return 1 + level * (0.3 + ringIndex * 0.1);
  };

  const getRingOpacity = (ringIndex: number) => {
    if (!isRecording) return 0.1;
    const level = ringLevels[ringIndex];
    return Math.min(1, 0.2 + level * 0.6);
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
  
      <div className="relative flex items-center justify-center">
        <div
          className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-300 bg-opacity-90 ${ringPulseClass}`}
          style={{
            width: config.base,
            height: config.base,
            backgroundColor: colors.core,
            transform: `scale(${1 + ringLevels[0] * 0.1})`
          }}
        >
          <div className={`flex flex-col items-center w-full h-full justify-center ${levelStyle}`}>
            {children ?? null}
          </div>
        </div>
        {config.rings.map((ringSize, index) => (
          <div
            key={index}
            className="absolute rounded-full border-2 transition-all duration-75 ease-out"
            style={{
              width: ringSize,
              height: ringSize,
              borderColor: colors.rings[index],
              backgroundColor: 'transparent',
              transform: `scale(${getRingScale(index)})`,
              opacity: getRingOpacity(index)
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VoiceReactiveRings;
