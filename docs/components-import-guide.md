# Components Import Guide

## 📦 Component Structure

All components are now organized under `src/components/` with the following structure:

```
src/components/
├── index.ts          # Main export point
├── ui/               # Base UI components (Button, Card, etc.)
├── medical/          # Medical workflow components
├── layout/           # Layout components (ThemeToggle, etc.)
├── dashboard/        # Dashboard components
└── patient/          # Patient management components
```

## 🚀 Import Examples

### Simple imports from main index:
```typescript
import { Button, Card, ConversationCapture } from '@/src/components';
```

### Category-specific imports:
```typescript
import { Button, Badge } from '@/src/components/ui';
import { ConversationCapture, DialogueFlow } from '@/src/components/medical';
import { ThemeToggle, BraveCacheBuster } from '@/src/components/layout';
```

`BraveCacheBuster` is a lightweight helper that displays a translucent **Brave Reload**
button while in development. Pressing the button forces the page to reload,
which helps bypass Brave's aggressive caching.

### Multiple components:
```typescript
import { 
  // UI Components
  Button, 
  Card, 
  CardContent,
  Badge,
  Progress,
  
  // Medical Components
  ConversationCapture,
  DialogueFlow,
  ClinicalNotes,
  
  // Layout Components
  ThemeToggle
} from '@/src/components';
```

## ✅ Benefits

1. **Shorter imports**: No more `../../../components/ui/button`
2. **Better IntelliSense**: IDE can autocomplete from index files
3. **Tree-shaking**: Named exports allow better optimization
4. **Consistency**: All imports follow the same pattern

## 🔄 Migration

If you have old imports like:
```typescript
// OLD
import { Button } from '../components/ui/button';
import ThemeToggle from '../../components/ThemeToggle';
```

Change them to:
```typescript
// NEW
import { Button, ThemeToggle } from '@/src/components';
```

## 📝 Notes

- The `@/` alias is configured in `jsconfig.json` to point to the project root
- All components are exported with named exports for consistency
- Each category folder has its own `index.ts` for organization
- The main `src/components/index.ts` re-exports everything for convenience