# Whisper Preload Multiple Initialization Fix

## Problem
The Whisper model was being preloaded multiple times during development, especially during Fast Refresh/HMR (Hot Module Replacement). This caused:
- Multiple loading toasts appearing
- Redundant network requests
- Poor developer experience

## Root Causes
1. **Component Remounting**: During Fast Refresh, React components are remounted, causing `useEffect` hooks to re-run
2. **State Loss**: The WhisperPreloadManager's state was lost during HMR
3. **No Persistence**: The loaded model wasn't persisted across module reloads

## Solution Implemented

### 1. Global Variable Persistence
Added global variables that survive HMR:
```typescript
declare global {
  var __WHISPER_MODEL_CACHE__: Pipeline | undefined;
  var __WHISPER_PRELOAD_STATE__: PreloadState | undefined;
  var __WHISPER_HAS_INITIALIZED__: boolean | undefined;
}
```

### 2. Enhanced WhisperPreloadManager
- Constructor now restores state from global cache
- `updateState` persists state to global variables
- `initializePreload` checks global cache before starting

### 3. Improved WhisperPreloadInitializer
- Added `hasShownLoadingToast` ref to prevent duplicate toasts
- Enhanced mount detection to check if model is already loaded
- Skip success toast if no loading toast was shown

### 4. Better Hook Management
- `useWhisperPreload` now uses a ref to ensure single initialization
- Only initializes if model isn't already loaded or loading

## Benefits
- **Single Load**: Model loads only once per session
- **Survives HMR**: State persists through Fast Refresh
- **No Duplicate Toasts**: UI notifications show only when appropriate
- **Better Performance**: Avoids redundant network requests

## Technical Details

### Memory Management
The global variables are attached to the `window` object (in browser) and persist through:
- Fast Refresh / HMR
- Component remounts
- Route changes

They are cleared only when:
- Page is fully reloaded
- Browser tab is closed
- Memory is manually cleared

### IndexedDB Considerations
While we created a WhisperModelCache service for IndexedDB, the Whisper model contains:
- Functions and methods that can't be serialized
- WebAssembly modules
- Complex object structures

Therefore, memory-based caching is more appropriate for this use case.

## Future Improvements
1. Add service worker caching for the actual model files
2. Implement model versioning and updates
3. Add telemetry for preload performance
4. Consider lazy loading based on user interaction patterns