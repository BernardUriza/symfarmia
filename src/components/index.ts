/**
 * Components Index
 * 
 * Central export point for all components
 * Use specific exports for better tree-shaking
 */

// Re-export all UI components
export * from './ui';

// Re-export all medical components
export * from './medical';

// Re-export all layout components
export * from './layout';

// Re-export all dashboard components
export * from './dashboard';

// Re-export all patient components
export * from './patient';

// Re-export specific commonly used components for convenience
export { 
  Button, 
  Card, 
  Badge, 
  Alert,
  Progress,
  ActionButton 
} from './ui';

export { 
  ConversationCapture,
  DialogueFlow,
  ClinicalNotes 
} from './medical';

export { 
  ThemeToggle,
  GlobalLanguageSwitcher,
  HeaderLanguageSwitcher 
} from './layout';