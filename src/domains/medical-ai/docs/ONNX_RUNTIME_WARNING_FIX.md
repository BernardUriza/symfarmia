# ONNX Runtime Warning Fix

## Problem
The application was throwing an error:
```
Error: Cannot set properties of undefined (setting 'logLevel')
```

This occurred at `env.wasm.logLevel = 'error'` in `transformersConfig.ts`.

## Root Cause
The `env` object from `@xenova/transformers` doesn't always have a `wasm` property initialized when the configuration runs. This can happen due to:
1. Version differences in the transformers library
2. Timing issues during initialization
3. Different runtime environments

## Solution
Added defensive checks before setting properties:

```typescript
// Check if wasm object exists before setting properties
if (env.wasm) {
  env.wasm.logLevel = 'error'; // Only show errors, not warnings
} else if (env.onnx) {
  // Alternative: Some versions might use env.onnx instead
  env.onnx.logLevel = 'error';
}

// Alternative method to suppress warnings globally
if (typeof env.logLevel !== 'undefined') {
  env.logLevel = 'error';
}
```

## Why This Works
1. **Defensive Programming**: Checks for existence before accessing properties
2. **Multiple Fallbacks**: Tries different possible property locations
3. **Version Compatibility**: Works with different versions of the library
4. **No Runtime Errors**: Gracefully handles undefined properties

## Additional Notes
- The ONNX runtime warnings about missing .onnx files are now suppressed
- The app will still function normally even if warning suppression fails
- Console will be cleaner without the repetitive warning messages