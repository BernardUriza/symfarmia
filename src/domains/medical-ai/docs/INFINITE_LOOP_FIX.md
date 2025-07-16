# useSimpleWhisper Infinite Loop Fix

## Problem
The hook was causing a "Maximum update depth exceeded" error due to an infinite render loop.

## Root Cause
1. `log` and `errorLog` functions were being recreated on every render
2. `preloadModel` callback depended on `errorLog`
3. When `errorLog` changed, `preloadModel` was recreated
4. The `useEffect` that depends on `preloadModel` would run again
5. This would call `preloadModel()`, which sets state
6. Setting state causes a re-render, creating an infinite loop

## Solution Applied

### 1. Memoized Logger Functions
Wrapped `log` and `errorLog` in `useCallback` to prevent recreation:

```javascript
// Before - recreated on every render
const log = (...args: unknown[]) => logger.log(...args);
const errorLog = (...args: unknown[]) => logger.error(...args);

// After - memoized with useCallback
const log = useCallback((...args: unknown[]) => logger.log(...args), [logger]);
const errorLog = useCallback((...args: unknown[]) => logger.error(...args), [logger]);
```

### 2. Inline Preload Logic in useEffect
To avoid circular dependencies, moved the preload logic directly into the useEffect:

```javascript
// Added ref to track preload state
const isPreloadingRef = useRef(false);

// Inline preload in effect to avoid dependency issues
useEffect(() => {
  let isMounted = true;
  
  const doPreload = async () => {
    if (!autoPreload || !isMounted || isPreloadingRef.current) {
      return;
    }
    // ... preload logic ...
  };
  
  const timer = setTimeout(doPreload, 0);
  
  return () => {
    isMounted = false;
    clearTimeout(timer);
  };
}, [autoPreload, retryCount, retryDelay, errorLog]);
```

### 3. Preload State Tracking
Used a ref (`isPreloadingRef`) to prevent multiple simultaneous preloads without causing re-renders.

## Why This Works
1. Logger functions are stable (memoized)
2. No circular dependency between state and callbacks
3. Preload only happens once due to ref tracking
4. Clean separation of concerns
5. No infinite loops

## Key Lessons
- Avoid having callbacks that set state in their own dependency arrays
- Use refs for tracking state that shouldn't trigger re-renders
- Consider inlining logic when circular dependencies are unavoidable
- Always memoize functions created inside components if they're used as dependencies