# WhisperPreloadInitializer Layout Integration

## Problem
When trying to import `WhisperPreloadInitializer` directly in the server-side layout, Next.js throws errors about client-only hooks (useState, useEffect, etc.) being used in server components.

## Solution
Created a client wrapper component that uses dynamic imports to safely integrate the preloader in server layouts.

## Implementation

### 1. Client Wrapper Component
Created `/src/components/layout/WhisperPreloadClient.tsx`:
```tsx
'use client';

import dynamic from 'next/dynamic';

const WhisperPreloadInitializer = dynamic(
  () => import('@/src/domains/medical-ai/components/WhisperPreloadInitializer')
    .then(mod => mod.WhisperPreloadInitializer),
  { 
    ssr: false,
    loading: () => null
  }
);
```

### 2. Layout Integration
In `app/layout.js`:
```jsx
import { WhisperPreloadClient } from "@/src/components/layout";

// In the layout body:
<WhisperPreloadClient 
  priority="auto"
  delay={3000}
  showProgress={false}
/>
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