"use client";
import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface VoiceReactiveRingsProps {
  isRecording: boolean;
  audioLevel: number;
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "subtle" | "normal" | "dramatic";
  colorScheme?: "blue" | "red" | "green" | "purple" | "medical";
  className?: string;
  children?: ReactNode;
  minLevel?: number;
  maxLevel?: number;
}

const SIZE_CONFIG = {
  sm: { base: 40, rings: [50, 65, 80, 100] },
  md: { base: 60, rings: [75, 95, 120, 150] },
  lg: { base: 80, rings: [100, 130, 170, 220] },
  xl: { base: 100, rings: [130, 170, 220, 280] },
};

const COLOR_SCHEMES = {
  blue: {
    core: "rgb(59, 130, 246)",
    rings: [
      "rgba(59, 130, 246, 0.4)",
      "rgba(59, 130, 246, 0.25)",
      "rgba(59, 130, 246, 0.15)",
      "rgba(59, 130, 246, 0.08)",
    ],
  },
  red: {
    core: "rgb(239, 68, 68)",
    rings: [
      "rgba(239, 68, 68, 0.5)",
      "rgba(239, 68, 68, 0.3)",
      "rgba(239, 68, 68, 0.2)",
      "rgba(239, 68, 68, 0.1)",
    ],
  },
  green: {
    core: "rgb(34, 197, 94)",
    rings: [
      "rgba(34, 197, 94, 0.4)",
      "rgba(34, 197, 94, 0.25)",
      "rgba(34, 197, 94, 0.15)",
      "rgba(34, 197, 94, 0.08)",
    ],
  },
  purple: {
    core: "rgb(168, 85, 247)",
    rings: [
      "rgba(168, 85, 247, 0.4)",
      "rgba(168, 85, 247, 0.25)",
      "rgba(168, 85, 247, 0.15)",
      "rgba(168, 85, 247, 0.08)",
    ],
  },
  medical: {
    core: "rgb(16, 185, 129)",
    rings: [
      "rgba(16, 185, 129, 0.4)",
      "rgba(16, 185, 129, 0.25)",
      "rgba(16, 185, 129, 0.15)",
      "rgba(16, 185, 129, 0.08)",
    ],
  },
};

const DEFAULT_MIN = 8;
const DEFAULT_MAX = 35;

export const VoiceReactiveRings = ({
  isRecording,
  size = "lg",
  intensity = "normal",
  colorScheme = "medical",
  className = "",
  audioLevel = 0,
  children,
  minLevel = DEFAULT_MIN,
  maxLevel = DEFAULT_MAX,
}: VoiceReactiveRingsProps) => {
  // Estados para cada anillo (con smoothing y delay)
  const [ringLevels, setRingLevels] = useState([0, 0, 0, 0]);
  const smoothingFactors = [0.8, 0.6, 0.4, 0.2];
  const ringDelays = useRef<number[]>([0, 0, 0, 0]);

  const config = SIZE_CONFIG[size];
  const colors = COLOR_SCHEMES[colorScheme];
  const intensityMultiplier =
    intensity === "subtle" ? 0.5 : intensity === "dramatic" ? 1.5 : 1;

  // Smoothing y delays
  useEffect(() => {
    if (!isRecording) {
      setRingLevels([0, 0, 0, 0]);
      ringDelays.current = [0, 0, 0, 0];
      return;
    }
    const intervalId = setInterval(() => {
      setRingLevels((prev) =>
        prev.map((currentLevel, index) => {
          // DELAY real: cada anillo recibe el nivel del anterior, el primero recibe el nivel actual
          const delays = ringDelays.current ?? [0, 0, 0, 0];
          const delayedLevel = index === 0 ? audioLevel : delays[index - 1];
          if (ringDelays.current) {
            ringDelays.current[index] = delayedLevel;
          }

          const smoothing = smoothingFactors[index];
          const targetLevel = (delayedLevel / 255) * intensityMultiplier;
          return currentLevel + (targetLevel - currentLevel) * smoothing;
        })
      );
      // Actualiza el delay para el siguiente ciclo (propaga el audioLevel)
      if (ringDelays.current) {
        ringDelays.current[0] = audioLevel;
      }
    }, 16);
    return () => clearInterval(intervalId);
  }, [audioLevel, isRecording, intensityMultiplier]);

  // Niveles visuales
  let levelStyle = "font-bold transition-all select-none";
  let ringPulseClass = "";

  if (audioLevel < minLevel) {
    levelStyle += " text-gray-400 opacity-60 text-sm blur-[1px]";
  } else if (audioLevel >= minLevel && audioLevel < maxLevel) {
    levelStyle += " text-white text-xl drop-shadow";
  } else if (audioLevel >= maxLevel) {
    levelStyle +=
      " text-6xl text-red-500 font-black animate-pulse-explode rounded-3xl drop-shadow-2xl border-4 border-red-600 shadow-red-500/80 ring-4 ring-red-500/70 animate-shake";
    ringPulseClass = "animate-pulse-ring";
  }

  const getRingScale = (ringIndex: number) => {
    if (!isRecording) return 1;
    const level = ringLevels[ringIndex];
    const baseScale = 1;
    const scaleRange = 0.3 + ringIndex * 0.1;
    return baseScale + level * scaleRange;
  };

  const getRingOpacity = (ringIndex: number) => {
    if (!isRecording) return 0.1;
    const level = ringLevels[ringIndex];
    const baseOpacity = 0.2;
    const opacityRange = 0.6;
    return Math.min(1, baseOpacity + level * opacityRange);
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
            transform: `scale(${1 + ringLevels[0] * 0.1})`,
          }}
        >
          <div
            className={`flex flex-col items-center justify-center ${levelStyle}`}
          >
            {children ?? null}
          </div>
        </div>
        {config.rings.map((ringSize, index) => {
          // Brutalidad visual: el ring explota en color y glow cuando gritas
          let extraStyle: React.CSSProperties = {};

          // Si el audioLevel está en modo grito, cambia color y añade glow
          if (audioLevel >= maxLevel) {
            extraStyle = {
              boxShadow: `0 0 ${22 + 16 * index}px ${6 + 2 * index}px ${colors.rings[index]}`,
              borderColor: colors.rings[0], // haz todos los anillos el color del primer ring para que el glow sea consistente
              filter: `brightness(1.3) blur(${index}px)`,
              transition: "all 120ms cubic-bezier(.17,.67,.83,.67)",
            };
          } else if (audioLevel < minLevel) {
            // Se apaga y desvanece
            extraStyle = {
              filter: "grayscale(80%) opacity(0.5) blur(1.5px)",
              borderColor: "#aaa",
              boxShadow: "none",
            };
          } else {
            // Normal: suave y visible pero no brutal
            extraStyle = {
              boxShadow: `0 0 ${8 + 8 * index}px 1px ${colors.rings[index]}`,
              filter: "none",
              borderColor: colors.rings[index],
              transition: "all 140ms cubic-bezier(.17,.67,.83,.67)",
            };
          }

          return (
            <div
              key={index}
              className="absolute rounded-full border-2 transition-all duration-75 ease-out pointer-events-none"
              style={{
                width: ringSize,
                height: ringSize,
                backgroundColor: "transparent",
                transform: `scale(${getRingScale(index)})`,
                opacity: getRingOpacity(index),
                ...extraStyle,
              }}
            />
          );
        })}

        {/* Dramatic mode: partículas cuando grita */}
        {intensity === "dramatic" && isRecording && ringLevels[0] > 0.7 && (
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
                    transform: "translate(-50%, -50%)",
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
