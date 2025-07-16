// Example: How to integrate Whisper preloading in your app

// Option 1: Add to your root layout (app/layout.tsx)
/*
import { WhisperPreloadInitializer } from '@/src/domains/medical-ai/components/WhisperPreloadInitializer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <WhisperPreloadInitializer 
          priority="auto"  // 'high' | 'low' | 'auto'
          delay={3000}     // Wait 3 seconds after page load
          showProgress={false} // Show loading indicator
        />
      </body>
    </html>
  );
}
*/

// Option 2: Use the hook in a component
/*
import { useWhisperPreload } from '@/src/domains/medical-ai/hooks/useWhisperPreload';

export function MyComponent() {
  const { 
    isLoaded, 
    isLoading, 
    progress,
    forcePreload 
  } = useWhisperPreload({
    autoInit: true,
    priority: 'auto',
    delay: 2000
  });

  if (isLoading) {
    console.log(`Loading Whisper model: ${progress}%`);
  }

  return (
    <div>
      {isLoaded && <span>✅ AI Ready</span>}
      <button onClick={forcePreload}>Load AI Now</button>
    </div>
  );
}
*/

// Option 3: Manual control
/*
import { whisperPreloadManager } from '@/src/domains/medical-ai/services/WhisperPreloadManager';

// In your app initialization
whisperPreloadManager.initializePreload({
  priority: 'auto',
  delay: 5000
});

// Check status anywhere
const state = whisperPreloadManager.getState();
if (state.status === 'loaded') {
  console.log('Model is ready!');
}
*/

export {};