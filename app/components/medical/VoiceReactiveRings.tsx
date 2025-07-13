'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMicrophoneLevel } from '../../../src/domains/medical-ai/hooks/useMicrophoneLevel';

interface VoiceReactiveRingsProps {
  isRecording: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'normal' | 'dramatic';
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'medical';
  className?: string;
  children?: React.ReactNode;
}

// 🎨 Configuraciones de tamaño
const SIZE_CONFIG = {
  sm: { base: 40, rings: [50, 65, 80, 100] },
  md: { base: 60, rings: [75, 95, 120, 150] },
  lg: { base: 80, rings: [100, 130, 170, 220] },
  xl: { base: 100, rings: [130, 170, 220, 280] }
};

// 🌈 Esquemas de color
const COLOR_SCHEMES = {
  blue: {
    core: 'rgb(59, 130, 246)',      // blue-500
    rings: [
      'rgba(59, 130, 246, 0.4)',   // Ring 1
      'rgba(59, 130, 246, 0.25)',  // Ring 2  
      'rgba(59, 130, 246, 0.15)',  // Ring 3
      'rgba(59, 130, 246, 0.08)'   // Ring 4
    ]
  },
  red: {
    core: 'rgb(239, 68, 68)',       // red-500
    rings: [
      'rgba(239, 68, 68, 0.5)',
      'rgba(239, 68, 68, 0.3)',
      'rgba(239, 68, 68, 0.2)',
      'rgba(239, 68, 68, 0.1)'
    ]
  },
  green: {
    core: 'rgb(34, 197, 94)',       // green-500
    rings: [
      'rgba(34, 197, 94, 0.4)',
      'rgba(34, 197, 94, 0.25)',
      'rgba(34, 197, 94, 0.15)',
      'rgba(34, 197, 94, 0.08)'
    ]
  },
  purple: {
    core: 'rgb(168, 85, 247)',      // purple-500
    rings: [
      'rgba(168, 85, 247, 0.4)',
      'rgba(168, 85, 247, 0.25)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(168, 85, 247, 0.08)'
    ]
  },
  medical: {
    core: 'rgb(16, 185, 129)',      // emerald-500
    rings: [
      'rgba(16, 185, 129, 0.4)',
      'rgba(16, 185, 129, 0.25)',
      'rgba(16, 185, 129, 0.15)',
      'rgba(16, 185, 129, 0.08)'
    ]
  }
};

export const VoiceReactiveRings = ({
  isRecording,
  size = 'lg',
  intensity = 'normal',
  colorScheme = 'medical',
  className = '',
  children
}: VoiceReactiveRingsProps) => {
  // 🎤 Audio level desde el hook existente
  const audioLevel = useMicrophoneLevel(isRecording);
  
  // 🎯 Estados para cada anillo (con smoothing)
  const [ringLevels, setRingLevels] = useState([0, 0, 0, 0]);
  const smoothingFactors = [0.8, 0.6, 0.4, 0.2]; // Ring 1 más reactivo
  const ringDelays = useRef([0, 0, 0, 0]); // Para delays escalonados
  
  // ⚙️ Configuración
  const config = SIZE_CONFIG[size];
  const colors = COLOR_SCHEMES[colorScheme];
  const intensityMultiplier = intensity === 'subtle' ? 0.5 : intensity === 'dramatic' ? 1.5 : 1;
  
  // 🔄 Efecto para smoothing y delays
  useEffect(() => {
    if (!isRecording) {
      setRingLevels([0, 0, 0, 0]);
      return;
    }
    
    const updateRings = () => {
      setRingLevels(prev => {
        return prev.map((currentLevel, index) => {
          // Calcular target level con delay escalonado
          const delayedLevel = ringDelays.current?.[index] || audioLevel;
          if (ringDelays.current) {
            ringDelays.current[index] = audioLevel;
          }
          
          // Aplicar smoothing
          const smoothing = smoothingFactors[index];
          const targetLevel = (delayedLevel / 255) * intensityMultiplier;
          
          return currentLevel + (targetLevel - currentLevel) * smoothing;
        });
      });
    };
    
    const intervalId = setInterval(updateRings, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [audioLevel, isRecording, intensityMultiplier]);
  
  // 🎨 Calcular escalas para cada anillo
  const getRingScale = (ringIndex: number): number => {
    if (!isRecording) return 1;
    
    const level = ringLevels[ringIndex];
    const baseScale = 1;
    const scaleRange = 0.3 + (ringIndex * 0.1); // Anillos externos menos expansión
    
    return baseScale + (level * scaleRange);
  };
  
  // 🌊 Calcular opacidad reactiva
  const getRingOpacity = (ringIndex: number): number => {
    if (!isRecording) return 0.1;
    
    const level = ringLevels[ringIndex];
    const baseOpacity = 0.2;
    const opacityRange = 0.6;
    
    return Math.min(1, baseOpacity + (level * opacityRange));
  };
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      
      {/* 🎯 Micrófono Central */}
      <div 
        className="relative z-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: config.base,
          height: config.base,
          backgroundColor: colors.core,
          transform: `scale(${1 + (ringLevels[0] * 0.1)})`
        }}
      >
        {/* Icono del micrófono se pasa como children */}
        <div className="text-white">
          {children}
        </div>
      </div>
      
      {/* 🌊 Anillos Concéntricos */}
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
            opacity: getRingOpacity(index),
            animation: isRecording ? `pulse-ring-${index} 2s infinite ease-in-out` : 'none',
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
      
      {/* 💫 Partículas adicionales (opcional) */}
      {intensity === 'dramatic' && isRecording && ringLevels[0] > 0.7 && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: colors.core,
                top: `${20 + Math.sin(i * 60) * 30}%`,
                left: `${20 + Math.cos(i * 60) * 30}%`,
                animationDelay: `${i * 0.3}s`,
                opacity: ringLevels[0] * 0.6
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceReactiveRings;