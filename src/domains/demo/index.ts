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
export { useDemoTranscription } from './hooks/useDemoTranscription';
export { useDemoPatients } from './hooks/useDemoPatients';
export { useDemoSettings } from './hooks/useDemoSettings';

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