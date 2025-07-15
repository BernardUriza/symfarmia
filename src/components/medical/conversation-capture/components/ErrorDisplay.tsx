'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
      <div className="flex items-center">
        <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
        <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
      </div>
    </div>
  );
};