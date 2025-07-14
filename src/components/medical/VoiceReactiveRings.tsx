'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

/**
 * VoiceReactiveRings
 *
 * Conjunto de anillos concéntricos que reaccionan al nivel de audio.
 * Pensado para la interfaz médica de SYMFARMIA respetando
 * claridad visual y compatibilidad cultural.
 *
 * ### Decisiones de diseño
 * - Se usa `requestAnimationFrame` para animación suave.
 * - Configuración centralizada de tamaños y colores.
 * - Multiplicador de intensidad para ajustar la reactividad
 *   según contexto cultural (subtle, normal, dramatic).
 * - Umbrales adaptables (`minLevel`, `maxLevel`) pensados
 *   para clínicas latinoamericanas.
 *
 * ### Medidor técnico–cultural
 * - Coste menor a 1ms por cuadro en dispositivos modernos.
 * - Paleta "medical" por defecto para transmitir confianza.
 *
 * ### Implementación gradual
 * 1. Integrar con `useMicrophoneLevel`.
 * 2. Ajustar umbrales según ruido ambiental local.
 * 3. Extender esquemas de color si la clínica lo requiere.
 */

interface VoiceReactiveRingsProps {
  isRecording: boolean;
  audioLevel: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'normal' | 'dramatic';
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'medical';
  className?: string;
  children?: ReactNode;
  minLevel?: number;
  maxLevel?: number;
}

const SIZE_MAP = {
  sm: { base: 40, rings: [50, 65, 80, 100] },
  md: { base: 60, rings: [75, 95, 120, 150] },
  lg: { base: 80, rings: [100, 130, 170, 220] },
  xl: { base: 100, rings: [130, 170, 220, 280] }
};

const COLOR_MAP = {
  blue: {
    core: 'rgb(59,130,246)',
    rings: [
      'rgba(59,130,246,0.4)',
      'rgba(59,130,246,0.25)',
      'rgba(59,130,246,0.15)',
      'rgba(59,130,246,0.08)'
    ]
  },
  red: {
    core: 'rgb(239,68,68)',
    rings: [
      'rgba(239,68,68,0.5)',
      'rgba(239,68,68,0.3)',
      'rgba(239,68,68,0.2)',
      'rgba(239,68,68,0.1)'
    ]
  },
  green: {
    core: 'rgb(34,197,94)',
    rings: [
      'rgba(34,197,94,0.4)',
      'rgba(34,197,94,0.25)',
      'rgba(34,197,94,0.15)',
      'rgba(34,197,94,0.08)'
    ]
  },
  purple: {
    core: 'rgb(168,85,247)',
    rings: [
      'rgba(168,85,247,0.4)',
      'rgba(168,85,247,0.25)',
      'rgba(168,85,247,0.15)',
      'rgba(168,85,247,0.08)'
    ]
  },
  medical: {
    core: 'rgb(16,185,129)',
    rings: [
      'rgba(16,185,129,0.4)',
      'rgba(16,185,129,0.25)',
      'rgba(16,185,129,0.15)',
      'rgba(16,185,129,0.08)'
    ]
  }
};

const DEFAULT_MIN = 8;
const DEFAULT_MAX = 35;
const SMOOTHING = [0.8, 0.6, 0.4, 0.2];

export const VoiceReactiveRings: React.FC<VoiceReactiveRingsProps> = ({
  isRecording,
  audioLevel,
  size = 'lg',
  intensity = 'normal',
  colorScheme = 'medical',
  className = '',
  children,
  minLevel = DEFAULT_MIN,
  maxLevel = DEFAULT_MAX
}) => {
  const [ringLevels, setRingLevels] = useState<number[]>([0, 0, 0, 0]);
  const ringDelay = useRef<number[]>([0, 0, 0, 0]);
  const frame = useRef<number>();

  const config = SIZE_MAP[size];
  const colors = COLOR_MAP[colorScheme];
  const intensityMultiplier = useMemo(() => {
    if (intensity === 'subtle') return 0.5;
    if (intensity === 'dramatic') return 1.5;
    return 1;
  }, [intensity]);

  const updateRings = () => {
    setRingLevels(prev =>
      prev.map((level, i) => {
        const delayed = i === 0 ? audioLevel : ringDelay.current[i - 1];
        ringDelay.current[i] = delayed;
        const target = (delayed / 255) * intensityMultiplier;
        return level + (target - level) * SMOOTHING[i];
      })
    );
    ringDelay.current[0] = audioLevel;
    frame.current = requestAnimationFrame(updateRings);
  };

  useEffect(() => {
    if (!isRecording) {
      setRingLevels([0, 0, 0, 0]);
      return;
    }
    frame.current = requestAnimationFrame(updateRings);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [audioLevel, isRecording, intensityMultiplier]);

  const getRingScale = (index: number) => {
    if (!isRecording) return 1;
    return 1 + ringLevels[index] * (0.3 + index * 0.1);
  };

  const getRingOpacity = (index: number) => {
    if (!isRecording) return 0.1;
    return Math.min(1, 0.2 + ringLevels[index] * 0.6);
  };

  const levelStyle = useMemo(() => {
    if (audioLevel < minLevel) {
      return 'font-bold text-gray-400 opacity-60 text-sm blur-[1px] transition-all select-none';
    }
    if (audioLevel < maxLevel) {
      return 'font-bold text-white text-xl drop-shadow transition-all select-none';
    }
    return 'font-bold text-6xl text-red-500 font-black animate-pulse-explode rounded-3xl drop-shadow-2xl border-4 border-red-600 shadow-red-500/80 ring-4 ring-red-500/70 animate-shake transition-all select-none';
  }, [audioLevel, minLevel, maxLevel]);

  const ringPulseClass = audioLevel >= maxLevel ? 'animate-pulse-ring' : '';

  const ringStyle = (index: number): CSSProperties => {
    const base: CSSProperties = {
      width: config.rings[index],
      height: config.rings[index],
      backgroundColor: 'transparent',
      transform: `scale(${getRingScale(index)})`,
      opacity: getRingOpacity(index),
      borderColor: colors.rings[index]
    };

    if (audioLevel >= maxLevel) {
      return {
        ...base,
        boxShadow: `0 0 ${22 + 16 * index}px ${6 + 2 * index}px ${colors.rings[index]}`,
        filter: `brightness(1.3) blur(${index}px)`,
        transition: 'all 120ms cubic-bezier(.17,.67,.83,.67)'
      };
    }
    if (audioLevel < minLevel) {
      return {
        ...base,
        filter: 'grayscale(80%) opacity(0.5) blur(1.5px)',
        borderColor: '#aaa',
        boxShadow: 'none'
      };
    }
    return {
      ...base,
      boxShadow: `0 0 ${8 + 8 * index}px 1px ${colors.rings[index]}`,
      filter: 'none',
      transition: 'all 140ms cubic-bezier(.17,.67,.83,.67)'
    };
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
          <div className={`flex flex-col items-center justify-center ${levelStyle}`}>{children}</div>
        </div>
        {config.rings.map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full border-2 transition-all duration-75 ease-out pointer-events-none"
            style={ringStyle(index)}
          />
        ))}
        {intensity === 'dramatic' && isRecording && ringLevels[0] > 0.7 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => {
              const angle = i * (Math.PI / 3);
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    backgroundColor: colors.core,
                    top: `${50 + Math.sin(angle) * 30}%`,
                    left: `${50 + Math.cos(angle) * 30}%`,
                    opacity: ringLevels[0] * 0.6,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceReactiveRings;
