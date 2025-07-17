# WhisperPreloaderGlobal Layout Integration

## Problem
Previous versions used a `WhisperPreloadInitializer` component wrapped with `next/dynamic` to avoid server-side rendering errors. The logic has been simplified and now a single `WhisperPreloaderGlobal` component handles the preload without extra wrappers.

## Solution
Simply import the component directly in your client layout and drop it once in the tree.

## Implementation

### Example Layout

```jsx
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

## Key Points

1. **Dynamic Import**: Uses `next/dynamic` with `ssr: false` to prevent server-side rendering
2. **Client Directive**: The wrapper is marked with `'use client'`
3. **No Loading State**: Returns `null` during loading to avoid layout shifts
4. **Clean Imports**: Avoids importing from barrel exports that include hooks

## Benefits

- No server-side import errors
- Clean separation of client/server code
- Maintains the same API as the original component
- Zero impact on initial page load

## Error Prevention

This pattern prevents errors like:
```
Error: You're importing a component that needs `useState`. 
This React hook only works in a client component.
```

## Alternative Approaches

If you prefer not to use the wrapper:
1. Import directly in a client component instead of layout
2. Add to a client-side provider component
3. Initialize manually in `useEffect` in your app