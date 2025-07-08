/**
 * Demo Domain Types
 * 
 * Type definitions for demo functionality
 */

export interface DemoMode {
  isActive: boolean;
  strategy: string;
  patient: DemoPatient | null;
  scenario: DemoScenario | null;
  settings: DemoSettings;
  startTime: Date | null;
  duration: number;
}

export interface DemoStrategy {
  id: string;
  name: string;
  description: string;
  specialty: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedDuration: number;
  medicalContext: DemoMedicalContext;
  execute(input: DemoInput): Promise<DemoResult>;
  validate(input: DemoInput): DemoValidationResult;
  getNextStep(currentState: DemoState): DemoStep;
}

export interface DemoInput {
  userInput: string;
  timestamp: Date;
  confidence?: number;
  medicalTerms?: string[];
  context: DemoContext;
}

export interface DemoResult {
  id: string;
  response: string;
  confidence: number;
  medicalAnalysis: DemoMedicalAnalysis;
  nextSteps: DemoStep[];
  metadata: DemoMetadata;
  timestamp: Date;
}

export interface DemoSimulation {
  id: string;
  strategy: DemoStrategy;
  state: DemoState;
  history: DemoInput[];
  results: DemoResult[];
  isActive: boolean;
  settings: DemoSimulationSettings;
  startTime: Date;
  lastUpdate: Date;
}

export interface DemoPatient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  currentSymptoms: string[];
  medications: string[];
  allergies: string[];
  vitalSigns: DemoVitalSigns;
  scenario: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  specialty: string;
  patient: DemoPatient;
  expectedOutcomes: string[];
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps: DemoScenarioStep[];
}

export interface DemoSettings {
  autoAdvance: boolean;
  showHints: boolean;
  realtimeValidation: boolean;
  confidenceThreshold: number;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  language: 'es' | 'en';
  medicalTerminology: boolean;
  debugMode: boolean;
}

export interface DemoTranscription {
  id: string;
  text: string;
  confidence: number;
  medicalTerms: string[];
  strategy: string;
  timestamp: Date;
  isSimulated: true;
  originalInput?: string;
}

export interface DemoContext {
  currentStep: number;
  totalSteps: number;
  patientId: string;
  strategyId: string;
  sessionId: string;
  medicalSpecialty: string;
}

export interface DemoMedicalContext {
  specialty: string;
  commonSymptoms: string[];
  typicalDiagnoses: string[];
  standardProcedures: string[];
  criticalSigns: string[];
  urgencyIndicators: string[];
}

export interface DemoMedicalAnalysis {
  symptoms: string[];
  possibleDiagnoses: string[];
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  medicalReasoning: string;
}

export interface DemoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  confidence: number;
}

export interface DemoState {
  currentStep: number;
  completedSteps: string[];
  patientResponses: DemoPatientResponse[];
  clinicalFindings: string[];
  workingDiagnosis: string[];
  treatmentPlan: string[];
  isCompleted: boolean;
}

export interface DemoStep {
  id: string;
  type: 'question' | 'examination' | 'procedure' | 'diagnosis' | 'treatment';
  title: string;
  description: string;
  expectedInput: string[];
  validResponses: string[];
  points: number;
  isRequired: boolean;
  hints: string[];
}

export interface DemoMetadata {
  strategyUsed: string;
  processingTime: number;
  confidence: number;
  medicalTermsDetected: number;
  stepAccuracy: number;
  totalScore: number;
}

export interface DemoPatientResponse {
  question: string;
  response: string;
  timestamp: Date;
  isRealistic: boolean;
}

export interface DemoVitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel: number;
}

export interface DemoScenarioStep {
  id: string;
  order: number;
  type: 'history' | 'physical' | 'investigation' | 'diagnosis' | 'treatment';
  title: string;
  content: string;
  expectedActions: string[];
  patientResponse: string;
  hints: string[];
  isOptional: boolean;
}

export interface DemoSimulationSettings {
  realtimeMode: boolean;
  medicalValidation: boolean;
  confidenceSimulation: boolean;
  patientResponseDelay: number;
  autoAdvanceSteps: boolean;
  showMedicalReasoning: boolean;
}

// Enums
export enum DemoStrategyType {
  HIV_PREGNANCY = 'hiv-pregnancy',
  EMERGENCY = 'emergency',
  PEDIATRIC = 'pediatric',
  GENERAL_MEDICINE = 'general-medicine',
  CARDIOLOGY = 'cardiology',
  MENTAL_HEALTH = 'mental-health'
}

export enum DemoStepType {
  HISTORY_TAKING = 'history',
  PHYSICAL_EXAMINATION = 'physical',
  DIAGNOSTIC_TESTS = 'investigation',
  DIAGNOSIS = 'diagnosis',
  TREATMENT_PLAN = 'treatment',
  FOLLOW_UP = 'follow-up'
}

export enum DemoComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  EXPERT = 'expert'
}

// Error Types
export class DemoError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DemoError';
  }
}

export class DemoStrategyError extends DemoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DEMO_STRATEGY_ERROR', context);
    this.name = 'DemoStrategyError';
  }
}

export class DemoValidationError extends DemoError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DEMO_VALIDATION_ERROR', context);
    this.name = 'DemoValidationError';
  }
}

// Service Response Types
export interface DemoServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}