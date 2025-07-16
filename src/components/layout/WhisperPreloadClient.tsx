'use client';

/**
 * Client-side wrapper for WhisperPreloadInitializer
 * This allows the server layout to include the preloader without import errors
 */

import dynamic from 'next/dynamic';

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
}

export function WhisperPreloadClient({
  priority = 'auto',
  delay = 3000,
  showProgress = false
}: WhisperPreloadClientProps) {
  return (
    <WhisperPreloadInitializer
      priority={priority}
      delay={delay}
      showProgress={showProgress}
    />
  );
}

// Default export for easier importing
export default WhisperPreloadClient;