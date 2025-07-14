/**
 * UI Components
 * 
 * Core UI components for the application
 */

// Basic UI Components
export { AlertDialog } from './alert-dialog';
export { Alert } from './alert';
export { Badge } from './badge';
export { Button } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Progress } from './progress';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Textarea } from './textarea';
export { default as ActionButton } from './ActionButton';
export { default as LanguageSwitcher } from './LanguageSwitcher';

// Enhanced Transcription UI Components
export { VoiceReactiveMicrophone } from './VoiceReactiveMicrophone';
export { AudioSpectrum } from './AudioSpectrum';
export { LiveTranscriptionDisplay } from './LiveTranscriptionDisplay';
export { TranscriptionModelInfo } from './TranscriptionModelInfo';

// Utilities
export { cn } from './utils';
export { useIsMobile } from './use-mobile';

// Network Indicators
export { default as VisualNetworkIndicator } from './VisualNetworkIndicator';

// Types
export type {
  Word,
  EnhancedTranscriptionResult,
  UseEnhancedTranscriptionProps,
  TranscriptionStatus,
  TranscriptionService,
  TranscriptionModelInfo as TranscriptionModelInfoType
} from '../../types/transcription';