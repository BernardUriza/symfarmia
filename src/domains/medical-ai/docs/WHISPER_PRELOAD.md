# Whisper Model Preloading System

## Overview
The Whisper preloading system allows the AI model to load in the background when users first visit the app, providing instant transcription when needed.

## Key Features
- **Non-blocking**: Uses `requestIdleCallback` to load only when browser is idle
- **Smart detection**: Checks connection speed, device memory, and network type
- **Progressive**: Tracks loading progress in real-time
- **Singleton pattern**: Ensures only one model instance is loaded
- **Auto-integration**: Works seamlessly with existing hooks

## Quick Start

### 1. Add to Root Layout (Recommended)
```tsx
// app/layout.tsx
import WhisperPreloaderGlobal from '@/src/domains/medical-ai/components/WhisperPreloaderGlobal';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <WhisperPreloaderGlobal />
      </body>
    </html>
  );
}
```

### 2. Use in Components
```tsx
import { useWhisperPreload } from '@/src/domains/medical-ai';

function MyComponent() {
  const { 
    isLoaded,      // boolean
    isLoading,     // boolean
    progress,      // 0-100
    status,        // 'idle' | 'loading' | 'loaded' | 'failed'
    forcePreload   // () => Promise<void>
  } = useWhisperPreload();

  return (
    <div>
      {isLoaded ? (
        <span>✅ AI Ready</span>
      ) : (
        <button onClick={forcePreload}>
          Load AI Model
        </button>
      )}
    </div>
  );
}
```

### 3. Manual Control
```tsx
import { whisperPreloadManager } from '@/src/domains/medical-ai';

// Start preloading
whisperPreloadManager.initializePreload({
  priority: 'auto',
  delay: 5000
});

// Check status
const state = whisperPreloadManager.getState();
console.log(state.status); // 'idle' | 'loading' | 'loaded' | 'failed'

// Force load
await whisperPreloadManager.forcePreload();
```

## Preload Priorities

- **`auto`** (default): Smart detection based on device/network
- **`high`**: Load immediately, no delays
- **`low`**: Load only when truly idle

## Smart Loading Conditions

The preloader checks:
1. **Connection**: Skips on slow 2G or data saver mode
2. **Device Memory**: Skips on devices with < 4GB RAM
3. **Mobile**: Only loads on 4G connections
4. **Browser Support**: Falls back gracefully

## Integration with useSimpleWhisper

The hook automatically uses preloaded models:
```tsx
const { 
  startTranscription,
  engineStatus  // Will show 'ready' if preloaded
} = useSimpleWhisper();
```

## Performance Benefits

- **First transcription**: ~5-10x faster (model already loaded)
- **No UI blocking**: Loads in background during idle time
- **Memory efficient**: Single shared model instance
- **Network aware**: Respects user's data preferences

## Debug Mode

In development, check console for preload status:
```
🎯 Starting Whisper model preload...
✨ Using pre-loaded Whisper model
✅ Whisper model preloaded successfully
```

## Best Practices

1. **Initialize early**: Add to root layout for best results
2. **Show status**: Consider showing loading state for transparency
3. **Fallback ready**: Always handle the case where preload fails
4. **Test on slow networks**: Verify behavior on throttled connections