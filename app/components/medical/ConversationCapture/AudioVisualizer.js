"use client";

import React from 'react';
import { Activity } from 'lucide-react';
import { calculateAudioLevel } from './utils';

export function AudioVisualizer({ audioLevel, isActive, className = '' }) {
  if (!isActive) return null;

  const level = calculateAudioLevel(audioLevel);

  return (
    <div className={`flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 ${className}`}>
      <Activity className="h-4 w-4" />
      <span>Nivel de audio:</span>
      <div className="flex items-center gap-1">
        <div className="w-32 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-200 ease-out"
            style={{ width: `${level}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-gray-400 min-w-[40px] text-right">
          {Math.round(level)}%
        </span>
      </div>
    </div>
  );
}