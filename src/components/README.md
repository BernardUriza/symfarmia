# Components Import Guide

## Quick Import Examples

### UI Components
```javascript
// Import individual components
import { Button, Card, Badge } from '@/src/components/ui';

// Or import from specific category
import { AlertDialog, Alert } from '@/src/components/ui';
```

### Medical Components
```javascript
// Import medical workflow components
import { 
  ConversationCapture, 
  DialogueFlow, 
  ClinicalNotes 
} from '@/src/components/medical';
```

### Layout Components
```javascript
// Import layout components
import { 
  ThemeToggle, 
  GlobalLanguageSwitcher,
  DemoModeBanner 
} from '@/src/components/layout';
```

### Dashboard Components
```javascript
// Import dashboard components
import { 
  DashboardLanding,
  DashboardMetrics,
  QuickActions 
} from '@/src/components/dashboard';
```

### Patient Components
```javascript
// Import patient management components
import { 
  NewPatientModal,
  PatientQuickSearch,
  PatientWorkflow 
} from '@/src/components/patient';
```

## Directory Structure

```
src/components/
├── index.ts              # Main export (re-exports all categories)
├── ui/                   # Basic UI components (buttons, cards, etc.)
│   └── index.ts         
├── medical/              # Medical workflow components
│   └── index.ts         
├── layout/               # Layout and structure components
│   └── index.ts         
├── dashboard/            # Dashboard and analytics components
│   └── index.ts         
├── patient/              # Patient management components
│   └── index.ts         
└── controls/             # Custom control components
    └── index.ts         
```

## Import Best Practices

1. **Use category imports for better organization:**
   ```javascript
   import { Button, Card } from '@/src/components/ui';
   ```

2. **Avoid importing from the main index for better tree-shaking:**
   ```javascript
   // ❌ Avoid
   import { Button } from '@/src/components';
   
   // ✅ Prefer
   import { Button } from '@/src/components/ui';
   ```

3. **Use named exports for consistency:**
   ```javascript
   // All components are exported as named exports
   import { ConversationCapture } from '@/src/components/medical';
   ```

## Adding New Components

When adding a new component:

1. Place it in the appropriate category folder
2. Export it from the category's `index.ts`
3. Follow the existing naming conventions
4. Use TypeScript/JSDoc for better IDE support