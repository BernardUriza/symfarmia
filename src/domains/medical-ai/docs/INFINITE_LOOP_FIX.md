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

## Solution
Wrapped `log` and `errorLog` in `useCallback` to memoize them:

```javascript
// Before - recreated on every render
const log = (...args: unknown[]) => logger.log(...args);
const errorLog = (...args: unknown[]) => logger.error(...args);

// After - memoized with useCallback
const log = useCallback((...args: unknown[]) => logger.log(...args), [logger]);
const errorLog = useCallback((...args: unknown[]) => logger.error(...args), [logger]);
```

## Why This Works
1. `useCallback` memoizes the functions
2. They only recreate if `logger` changes (which should be stable)
3. This stabilizes `preloadModel` 
4. The `useEffect` only runs when truly needed
5. No more infinite loop

## Additional Considerations
- `setupAudioMonitoring` already had `[log]` as dependency, so it's properly set up
- The `logger` prop defaults to `DefaultLogger` which should be a stable reference
- If the error persists, check if a custom logger is being passed that changes on every render