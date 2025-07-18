/**
 * Medical Components
 * 
 * Components for medical workflows and AI assistance
 */

export { ConversationCapture } from './ConversationCapture';
export { SOAPNotesManager } from './SOAPNotesManager';
export { default as AudioDenoisingDashboard } from './AudioDenoisingDashboard';
export { DialogueFlow } from './DialogueFlow';
export { ClinicalNotes } from './ClinicalNotes';
export { OrderEntry } from './OrderEntry';
export { SummaryExport } from './SummaryExport';
export { VoiceReactiveRings } from './VoiceReactiveRings';
export { default as MedicalAssistantWrapper } from './MedicalAssistantWrapper';
export { default as ModelManager } from './ModelManager';
export { WhisperDebugPanel } from './WhisperDebugPanel';

// Re-export types for convenience
export type { SOAPNotes, SOAPConfig } from '@/src/types/medical';