/**
 * Components Index
 * 
 * Central export point for all application components
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

// Re-export commonly used components directly
export { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Alert,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui';

export {
  ConversationCapture,
  DialogueFlow,
  ClinicalNotes,
  OrderEntry,
  SummaryExport
} from './medical';

export {
  ThemeToggle,
  BraveCacheBuster,
  GlobalLanguageSwitcher
} from './layout';