// Comprehensive TypeScript types for medical state management
import type { 
  MedicalTranscription, 
  SOAPNotes, 
  ClinicalAlert, 
  ConsultationSession,
  AIMessage,
  VitalSigns,
  PatientInfo,
  MedicalSymptom,
  DiagnosisCandidate,
  TreatmentPlan,
  ConsultationSettings,
  AnalyticsEvent
} from '../types/medical';

// Enhanced error types with recovery strategies
export interface MedicalError {
  id: string;
  code: 'TRANSCRIPTION_ERROR' | 'AI_ERROR' | 'MEDICAL_VALIDATION_ERROR' | 'API_ERROR' | 'PERMISSION_ERROR' | 'NETWORK_ERROR' | 'STORAGE_ERROR' | 'SYSTEM_ERROR';
  category: 'technical' | 'medical' | 'user' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  recoveryStrategy?: 'retry' | 'fallback' | 'user_action' | 'skip';
  retryCount?: number;
  maxRetries?: number;
  recoverable: boolean;
}

// Performance monitoring types
export interface PerformanceMetrics {
  transcriptionLatency: number;
  aiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  batteryImpact?: 'low' | 'medium' | 'high';
  networkUsage: number;
  storageUsage: number;
}

// Multi-consultation state
export interface ConsultationState {
  id: string;
  session: ConsultationSession;
  status: 'initializing' | 'active' | 'paused' | 'completed' | 'error' | 'archived';
  transcription: {
    isRecording: boolean;
    isPaused: boolean;
    liveTranscript: string;
    finalTranscript: string;
    confidence: number;
    transcriptions: MedicalTranscription[];
    audioLevel: number;
    quality?: 'poor' | 'fair' | 'good' | 'excellent';
  };
  ai: {
    isThinking: boolean;
    mode: 'basic' | 'advanced' | 'expert';
    messages: AIMessage[];
    suggestions?: string[];
    clinicalAlerts: ClinicalAlert[];
    analysisCache?: Map<string, unknown>;
  };
  documentation: {
    soapNotes: SOAPNotes;
    isGenerating: boolean;
    generationProgress: number;
    autoSave?: boolean;
    lastSaved?: Date;
    editHistory: Array<{
      section: keyof SOAPNotes;
      previousValue: string;
      newValue: string;
      timestamp: Date;
      userId?: string;
    }>;
  };
  patient?: PatientInfo;
  vitalSigns?: VitalSigns;
  symptoms: MedicalSymptom[];
  diagnoses: DiagnosisCandidate[];
  treatmentPlan?: TreatmentPlan;
  settings?: ConsultationSettings;
  errors?: MedicalError[];
  performance?: PerformanceMetrics;
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    deviceInfo?: {
      userAgent: string;
      platform: string;
      isMobile: boolean;
      screenSize: { width: number; height: number };
      memoryLimit?: number;
    };
    userId?: string;
    version: string | number;
  };
}

// Global application state
export interface AppState {
  consultations: {
    active: Record<string, ConsultationState>;
    archived: Record<string, Partial<ConsultationState>>;
    current?: string; // Current active consultation ID
    history: string[]; // Recently accessed consultation IDs
  };
  user: {
    id?: string;
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      language: 'es' | 'en';
      notifications: boolean;
      autoSave: boolean;
      transcriptionService: 'browser' | 'whisper' | 'custom';
      aiModel: 'basic' | 'advanced' | 'expert';
      dataRetention: number; // days
    };
    permissions: {
      microphone: boolean;
      notifications: boolean;
      location?: boolean;
    };
    statistics: {
      totalConsultations: number;
      totalDuration: number; // seconds
      averageSessionLength: number;
      lastActivity: Date;
    };
  };
  system: {
    online: boolean;
    loading: boolean;
    initializing: boolean;
    errors: MedicalError[];
    notifications: Array<{
      id: string;
      type: 'info' | 'warning' | 'error' | 'success';
      title: string;
      message: string;
      timestamp: Date;
      read: boolean;
      persistent: boolean;
    }>;
    performance: {
      globalMetrics: PerformanceMetrics;
      memoryThreshold: number;
      performanceMode: 'high' | 'balanced' | 'battery_saver';
    };
    cache: {
      size: number;
      maxSize: number;
      hitRate: number;
      lastCleaned: Date;
    };
    storage: {
      used: number;
      available: number;
      quota: number;
      persistent: boolean;
    };
  };
  analytics: {
    events: AnalyticsEvent[];
    session: {
      id: string;
      startTime: Date;
      pageViews: number;
      interactions: number;
    };
    performance: {
      loadTime: number;
      renderMetrics: Record<string, number>;
      errorRate: number;
    };
  };
}

// Action types for state management
export interface BaseAction {
  type: string;
  timestamp: Date;
  meta?: {
    consultationId?: string;
    userId?: string;
    source?: 'user' | 'system' | 'ai' | 'transcription';
    undoable?: boolean;
  };
}

// Consultation actions
export interface ConsultationActions {
  // Session management
  START_CONSULTATION: BaseAction & { payload: { patientInfo?: PatientInfo; settings?: Partial<ConsultationSettings> } };
  END_CONSULTATION: BaseAction & { payload: { consultationId: string; reason: 'completed' | 'cancelled' | 'error' } };
  PAUSE_CONSULTATION: BaseAction & { payload: { consultationId: string } };
  RESUME_CONSULTATION: BaseAction & { payload: { consultationId: string } };
  ARCHIVE_CONSULTATION: BaseAction & { payload: { consultationId: string } };
  
  // Transcription actions
  START_RECORDING: BaseAction & { payload: { consultationId: string } };
  STOP_RECORDING: BaseAction & { payload: { consultationId: string; duration: number } };
  UPDATE_LIVE_TRANSCRIPT: BaseAction & { payload: { consultationId: string; text: string; confidence: number } };
  FINALIZE_TRANSCRIPT: BaseAction & { payload: { consultationId: string; transcription: MedicalTranscription } };
  UPDATE_AUDIO_LEVEL: BaseAction & { payload: { consultationId: string; level: number } };
  
  // AI actions
  ADD_AI_MESSAGE: BaseAction & { payload: { consultationId: string; message: AIMessage } };
  SET_AI_THINKING: BaseAction & { payload: { consultationId: string; thinking: boolean } };
  UPDATE_AI_MODE: BaseAction & { payload: { consultationId: string; mode: 'basic' | 'advanced' | 'expert' } };
  ADD_CLINICAL_ALERT: BaseAction & { payload: { consultationId: string; alert: ClinicalAlert } };
  DISMISS_ALERT: BaseAction & { payload: { consultationId: string; alertId: string } };
  
  // Documentation actions
  UPDATE_SOAP_SECTION: BaseAction & { payload: { consultationId: string; section: keyof SOAPNotes; content: string } };
  START_SOAP_GENERATION: BaseAction & { payload: { consultationId: string } };
  UPDATE_SOAP_PROGRESS: BaseAction & { payload: { consultationId: string; progress: number } };
  COMPLETE_SOAP_GENERATION: BaseAction & { payload: { consultationId: string; soapNotes: SOAPNotes } };
  
  // Medical data actions
  ADD_SYMPTOM: BaseAction & { payload: { consultationId: string; symptom: MedicalSymptom } };
  UPDATE_VITAL_SIGNS: BaseAction & { payload: { consultationId: string; vitalSigns: VitalSigns } };
  ADD_DIAGNOSIS: BaseAction & { payload: { consultationId: string; diagnosis: DiagnosisCandidate } };
  UPDATE_TREATMENT_PLAN: BaseAction & { payload: { consultationId: string; treatmentPlan: TreatmentPlan } };
}

// System actions
export interface SystemActions {
  SET_ONLINE_STATUS: BaseAction & { payload: { online: boolean } };
  SET_LOADING: BaseAction & { payload: { loading: boolean } };
  ADD_ERROR: BaseAction & { payload: { error: MedicalError } };
  CLEAR_ERROR: BaseAction & { payload: { errorId: string } };
  UPDATE_PERFORMANCE: BaseAction & { payload: { metrics: Partial<PerformanceMetrics> } };
  CLEAN_CACHE: BaseAction & { payload: { force?: boolean } };
  UPDATE_STORAGE_INFO: BaseAction & { payload: { used: number; available: number } };
  SET_PERFORMANCE_MODE: BaseAction & { payload: { mode: 'high' | 'balanced' | 'battery_saver' } };
  ADD_NOTIFICATION: BaseAction & { payload: { notification: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    persistent: boolean;
  } } };
  ARCHIVE_OLD_CONSULTATIONS: BaseAction & { payload: { maxAge: number } };
  CLEAR_AI_CACHE: BaseAction & { payload: { consultationId: string } };
  HYDRATE_STATE: BaseAction & { payload: Partial<AppState> };
}

// User actions
export interface UserActions {
  UPDATE_PREFERENCES: BaseAction & { payload: { preferences: Partial<AppState['user']['preferences']> } };
  UPDATE_PERMISSIONS: BaseAction & { payload: { permissions: Partial<AppState['user']['permissions']> } };
  LOG_ANALYTICS_EVENT: BaseAction & { payload: { event: AnalyticsEvent } };
}

export type MedicalStateAction = 
  | ConsultationActions[keyof ConsultationActions]
  | SystemActions[keyof SystemActions] 
  | UserActions[keyof UserActions];

// Store configuration
export interface StoreConfig {
  persistenceKey: string;
  persistenceVersion: number;
  maxConsultations: number;
  maxErrors: number;
  performanceThresholds: {
    memoryWarning: number;
    memoryLimit: number;
    responseTimeWarning: number;
    batteryWarning: number;
  };
  cacheConfig: {
    maxSize: number;
    ttl: number; // milliseconds
    cleanupInterval: number;
  };
  analyticsConfig: {
    maxEvents: number;
    batchSize: number;
    flushInterval: number;
  };
}

// Middleware types
export interface MiddlewareAPI {
  getState: () => AppState;
  dispatch: (action: MedicalStateAction) => MedicalStateAction;
}

export type Middleware = (api: MiddlewareAPI) => (next: (action: MedicalStateAction) => MedicalStateAction) => (action: MedicalStateAction) => MedicalStateAction;

// Selectors
export interface StateSelectors {
  // Consultation selectors
  getCurrentConsultation: (state: AppState) => ConsultationState | undefined;
  getConsultationById: (state: AppState, id: string) => ConsultationState | undefined;
  getActiveConsultations: (state: AppState) => ConsultationState[];
  getConsultationHistory: (state: AppState) => Partial<ConsultationState>[];
  
  // Medical data selectors
  getCurrentTranscript: (state: AppState) => string;
  getClinicalAlerts: (state: AppState, consultationId?: string) => ClinicalAlert[];
  getSOAPNotes: (state: AppState, consultationId?: string) => SOAPNotes | undefined;
  getCurrentSymptoms: (state: AppState) => MedicalSymptom[];
  
  // System selectors
  getErrors: (state: AppState) => MedicalError[];
  getCriticalErrors: (state: AppState) => MedicalError[];
  getPerformanceMetrics: (state: AppState) => PerformanceMetrics;
  getStorageInfo: (state: AppState) => AppState['system']['storage'];
  
  // User selectors
  getUserPreferences: (state: AppState) => AppState['user']['preferences'];
  getUserStatistics: (state: AppState) => AppState['user']['statistics'];
}

// Hook types for React integration
export interface UseConsultationReturn {
  // Current consultation state
  consultation: ConsultationState | null;
  isActive: boolean;
  isPaused: boolean;
  
  // Session management
  startConsultation: (patientInfo?: PatientInfo, settings?: Partial<ConsultationSettings>) => Promise<string>;
  endConsultation: (reason?: 'completed' | 'cancelled') => Promise<void>;
  pauseConsultation: () => void;
  resumeConsultation: () => void;
  
  // Transcription
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  updateLiveTranscript: (text: string, confidence: number) => void;
  finalizeTranscript: (transcription: MedicalTranscription) => void;
  
  // AI interaction
  sendMessage: (message: string) => Promise<void>;
  setAIMode: (mode: 'basic' | 'advanced' | 'expert') => void;
  
  // Documentation
  updateSOAPSection: (section: keyof SOAPNotes, content: string) => void;
  generateSOAP: () => Promise<void>;
  
  // Medical data
  addSymptom: (symptom: MedicalSymptom) => void;
  updateVitalSigns: (vitalSigns: VitalSigns) => void;
  addDiagnosis: (diagnosis: DiagnosisCandidate) => void;
  
  // Utilities
  exportConsultation: (format: 'pdf' | 'json' | 'docx') => Promise<Blob>;
  duplicateConsultation: () => Promise<string>;
}