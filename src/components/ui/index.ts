// Enhanced Transcription UI Components
export { VoiceReactiveMicrophone } from './VoiceReactiveMicrophone';
export { AudioSpectrum } from './AudioSpectrum';
export { LiveTranscriptionDisplay } from './LiveTranscriptionDisplay';
export { TranscriptionModelInfo } from './TranscriptionModelInfo';

// Enhanced Transcription Hook
// Note: useEnhancedTranscription is now exported from @/domains/medical-ai
// Import it directly from there instead of re-exporting here

// Enhanced Transcription Panel
export { EnhancedTranscriptionPanel } from '../consultation/EnhancedTranscriptionPanel';

// Types
export type {
  Word,
  EnhancedTranscriptionResult,
  UseEnhancedTranscriptionProps,
  TranscriptionStatus,
  TranscriptionService,
  TranscriptionModelInfo as TranscriptionModelInfoType
} from '../../types/transcription';