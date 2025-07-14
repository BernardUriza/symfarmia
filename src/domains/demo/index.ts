/**
 * Demo Domain - Public API
 * 
 * This domain handles all demo functionality including:
 * - Demo mode management
 * - Medical simulation strategies
 * - Real-time demo scenarios
 * - Demo data management
 */

// Components
export { DemoModeIndicator } from './components/DemoModeIndicator';
export { DemoTranscriptionPanel } from './components/DemoTranscriptionPanel';
export { DemoPatientSelector } from './components/DemoPatientSelector';
export { DemoResetButton } from './components/DemoResetButton';

// Hooks
export { useDemoMode } from './hooks/useDemoMode';
// Re-export demo transcription hook from the medical-ai legacy hooks.
// The previous local hook file was removed during the medical AI refactor
// but the public API still expects `useDemoTranscription` to be available
// from this domain. Redirect to the maintained implementation to avoid
// import errors during the build.
export { useDemoTranscription } from '../medical-ai/hooks/legacy/useDemoTranscription';
export { useDemoPatients } from './hooks/useDemoPatients';
export { useDemoSettings } from './hooks/useDemoSettings';
export { useDemoHighlight } from './hooks/useDemoHighlight';

// Services
export { demoDataService } from './services/demoDataService';
export { demoSimulationService } from './services/demoSimulationService';
export { DemoValidationService } from './services/demoValidationService';
export { DemoValidationService as demoValidationService } from './services/demoValidationService';

// Strategies
export { HIVPregnancyStrategy } from './strategies/hivPregnancyStrategy';
export { EmergencyStrategy } from './strategies/emergencyStrategy';
export { PediatricStrategy } from './strategies/pediatricStrategy';
export { GeneralMedicineStrategy } from './strategies/generalMedicineStrategy';

// Types
export type {
  DemoMode,
  DemoStrategy,
  DemoInput,
  DemoResult,
  DemoSimulation,
  DemoPatient,
  DemoScenario,
  DemoSettings,
  DemoTranscription
} from './types';

// Demo Configuration
export const demoConfig = {
  availableStrategies: [
    'hiv-pregnancy',
    'emergency',
    'pediatric',
    'general-medicine'
  ],
  defaultStrategy: 'general-medicine',
  realtimeSimulation: true,
  medicalValidation: true,
  confidenceSimulation: true,
  maxSimulationDuration: 1800, // 30 minutes
  autoReset: false,
  debugMode: process.env.NODE_ENV === 'development'
} as const;