'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  const isChunkError = error.includes('Chunk de audio muy pequeño') || error.includes('chunk');
  const bgClass = isChunkError 
    ? "bg-amber-500/5 dark:bg-amber-500/10" 
    : "bg-destructive/5 dark:bg-destructive/10";
  const borderClass = isChunkError 
    ? "border-amber-500/20 dark:border-amber-500/30" 
    : "border-destructive/20 dark:border-destructive/30";
  const textClass = isChunkError 
    ? "text-amber-700 dark:text-amber-400" 
    : "text-destructive dark:text-destructive/90";
  const icon = isChunkError ? "🎤" : "⚠️";

  return (
    <div className={`mt-4 ${bgClass} border ${borderClass} rounded-lg p-3`}>
      <div className="flex items-center">
        <div className="w-5 h-5 text-destructive dark:text-destructive/90 mr-2">{icon}</div>
        <span className={`text-sm ${textClass}`}>{error}</span>
      </div>
      {isChunkError && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          💡 Habla durante al menos 10 segundos para que el audio pueda ser procesado correctamente. ¡Dale contexto al sistema!
        </div>
      )}
    </div>
  );
};