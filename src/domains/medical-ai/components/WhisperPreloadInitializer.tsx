'use client';

import { useEffect } from 'react';
import { useWhisperPreload } from '../hooks/useWhisperPreload';

interface WhisperPreloadInitializerProps {
  priority?: 'high' | 'low' | 'auto';
  delay?: number;
  showProgress?: boolean;
}

export function WhisperPreloadInitializer({ 
  priority = 'auto',
  delay = 3000,
  showProgress = false 
}: WhisperPreloadInitializerProps) {
  const { status, progress, isLoading } = useWhisperPreload({
    autoInit: true,
    priority,
    delay,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WhisperPreload] Status: ${status}, Progress: ${progress}%`);
    }
  }, [status, progress]);

  // Optionally show a subtle loading indicator
  if (showProgress && isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span>Preparando IA médica... {progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}