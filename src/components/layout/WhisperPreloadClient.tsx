'use client';

/**
 * Client-side wrapper for WhisperPreloadInitializer
 * This allows the server layout to include the preloader without import errors
 */

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { whisperModelManager } from '@/src/domains/medical-ai/services/WhisperModelManager';

// Dynamic import with no SSR to avoid any server-side issues
const WhisperPreloadInitializer = dynamic(
  () => import('@/src/domains/medical-ai/components/WhisperPreloadInitializer').then(
    mod => mod.WhisperPreloadInitializer
  ),
  { 
    ssr: false,
    loading: () => null // No loading state needed
  }
);

interface WhisperPreloadClientProps {
  priority?: 'high' | 'low' | 'auto';
  delay?: number;
  showProgress?: boolean;
  showToasts?: boolean;
}

export function WhisperPreloadClient({
  priority = 'auto',
  delay = 3000,
  showProgress = false,
  showToasts = true
}: WhisperPreloadClientProps) {
  // Initialize WhisperModelManager on mount
  useEffect(() => {
    console.log('[WhisperPreloadClient] Initializing WhisperModelManager');
    whisperModelManager.initialize().catch(error => {
      console.error('[WhisperPreloadClient] Failed to initialize:', error);
    });
    
    // Log status periodically in development
    if (process.env.NODE_ENV === 'development') {
      const intervalId = setInterval(() => {
        const status = whisperModelManager.getStatus();
        console.log('[WhisperPreloadClient] Model status:', status);
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  return (
    <WhisperPreloadInitializer
      priority={priority}
      delay={delay}
      showProgress={showProgress}
      showToasts={showToasts}
    />
  );
}

// Default export for easier importing
export default WhisperPreloadClient;