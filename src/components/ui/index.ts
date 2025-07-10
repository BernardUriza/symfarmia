// Enhanced Transcription UI Components
export { VoiceReactiveMicrophone } from './VoiceReactiveMicrophone';
export { AudioSpectrum } from './AudioSpectrum';
export { LiveTranscriptionDisplay } from './LiveTranscriptionDisplay';
export { TranscriptionModelInfo } from './TranscriptionModelInfo';

// Enhanced Transcription Hook
export { useEnhancedTranscription } from '../../hooks/useEnhancedTranscription';

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