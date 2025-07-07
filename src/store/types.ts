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
// Generic base action with typed `type` and `payload` for proper discrimination
export interface BaseAction<T extends string, P = undefined> {
  type: T;
  timestamp: Date;
  payload: P;
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
  START_CONSULTATION: BaseAction<'START_CONSULTATION', { patientInfo?: PatientInfo; settings?: Partial<ConsultationSettings> }>;
  END_CONSULTATION: BaseAction<'END_CONSULTATION', { consultationId: string; reason: 'completed' | 'cancelled' | 'error' }>;
  PAUSE_CONSULTATION: BaseAction<'PAUSE_CONSULTATION', { consultationId: string }>;
  RESUME_CONSULTATION: BaseAction<'RESUME_CONSULTATION', { consultationId: string }>;
  ARCHIVE_CONSULTATION: BaseAction<'ARCHIVE_CONSULTATION', { consultationId: string }>;
  
  // Transcription actions
  START_RECORDING: BaseAction<'START_RECORDING', { consultationId: string }>;
  STOP_RECORDING: BaseAction<'STOP_RECORDING', { consultationId: string; duration: number }>;
  UPDATE_LIVE_TRANSCRIPT: BaseAction<'UPDATE_LIVE_TRANSCRIPT', { consultationId: string; text: string; confidence: number }>;
  FINALIZE_TRANSCRIPT: BaseAction<'FINALIZE_TRANSCRIPT', { consultationId: string; transcription: MedicalTranscription }>;
  UPDATE_AUDIO_LEVEL: BaseAction<'UPDATE_AUDIO_LEVEL', { consultationId: string; level: number }>;
  
  // AI actions
  ADD_AI_MESSAGE: BaseAction<'ADD_AI_MESSAGE', { consultationId: string; message: AIMessage }>;
  SET_AI_THINKING: BaseAction<'SET_AI_THINKING', { consultationId: string; thinking: boolean }>;
  UPDATE_AI_MODE: BaseAction<'UPDATE_AI_MODE', { consultationId: string; mode: 'basic' | 'advanced' | 'expert' }>;
  ADD_CLINICAL_ALERT: BaseAction<'ADD_CLINICAL_ALERT', { consultationId: string; alert: ClinicalAlert }>;
  DISMISS_ALERT: BaseAction<'DISMISS_ALERT', { consultationId: string; alertId: string }>;
  
  // Documentation actions
  UPDATE_SOAP_SECTION: BaseAction<'UPDATE_SOAP_SECTION', { consultationId: string; section: keyof SOAPNotes; content: string }>;
  START_SOAP_GENERATION: BaseAction<'START_SOAP_GENERATION', { consultationId: string }>;
  UPDATE_SOAP_PROGRESS: BaseAction<'UPDATE_SOAP_PROGRESS', { consultationId: string; progress: number }>;
  COMPLETE_SOAP_GENERATION: BaseAction<'COMPLETE_SOAP_GENERATION', { consultationId: string; soapNotes: SOAPNotes }>;
  
  // Medical data actions
  ADD_SYMPTOM: BaseAction<'ADD_SYMPTOM', { consultationId: string; symptom: MedicalSymptom }>;
  UPDATE_VITAL_SIGNS: BaseAction<'UPDATE_VITAL_SIGNS', { consultationId: string; vitalSigns: VitalSigns }>;
  ADD_DIAGNOSIS: BaseAction<'ADD_DIAGNOSIS', { consultationId: string; diagnosis: DiagnosisCandidate }>;
  UPDATE_TREATMENT_PLAN: BaseAction<'UPDATE_TREATMENT_PLAN', { consultationId: string; treatmentPlan: TreatmentPlan }>;
}

// System actions
export interface SystemActions {
  SET_ONLINE_STATUS: BaseAction<'SET_ONLINE_STATUS', { online: boolean }>;
  SET_LOADING: BaseAction<'SET_LOADING', { loading: boolean }>;
  ADD_ERROR: BaseAction<'ADD_ERROR', { error: MedicalError }>;
  CLEAR_ERROR: BaseAction<'CLEAR_ERROR', { errorId: string }>;
  UPDATE_PERFORMANCE: BaseAction<'UPDATE_PERFORMANCE', { metrics: Partial<PerformanceMetrics> }>;
  CLEAN_CACHE: BaseAction<'CLEAN_CACHE', { force?: boolean }>;
  UPDATE_STORAGE_INFO: BaseAction<'UPDATE_STORAGE_INFO', { used: number; available: number }>;
  SET_PERFORMANCE_MODE: BaseAction<'SET_PERFORMANCE_MODE', { mode: 'high' | 'balanced' | 'battery_saver' }>;
  ADD_NOTIFICATION: BaseAction<'ADD_NOTIFICATION', { notification: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    persistent: boolean;
  } }>;
  DISMISS_NOTIFICATION: BaseAction<'DISMISS_NOTIFICATION', { notificationId: string }>;
  CLEAR_OLD_NOTIFICATIONS: BaseAction<'CLEAR_OLD_NOTIFICATIONS'>;
  ARCHIVE_OLD_CONSULTATIONS: BaseAction<'ARCHIVE_OLD_CONSULTATIONS', { maxAge: number }>;
  CLEAR_AI_CACHE: BaseAction<'CLEAR_AI_CACHE', { consultationId: string }>;
  HYDRATE_STATE: BaseAction<'HYDRATE_STATE', Partial<AppState>>;
  RESET_SYSTEM_STATE: BaseAction<'RESET_SYSTEM_STATE'>;
}

// User actions
export interface UserActions {
  UPDATE_PREFERENCES: BaseAction<'UPDATE_PREFERENCES', { preferences: Partial<AppState['user']['preferences']> }>;
  UPDATE_PERMISSIONS: BaseAction<'UPDATE_PERMISSIONS', { permissions: Partial<AppState['user']['permissions']> }>;
  LOG_ANALYTICS_EVENT: BaseAction<'LOG_ANALYTICS_EVENT', { event: AnalyticsEvent }>;
  RESET_USER_STATISTICS: BaseAction<'RESET_USER_STATISTICS'>;
  UPDATE_USER_PROFILE: BaseAction<'UPDATE_USER_PROFILE', { profile: Partial<AppState['user']> }>;
  EXPORT_USER_DATA: BaseAction<'EXPORT_USER_DATA'>;
  DELETE_USER_DATA: BaseAction<'DELETE_USER_DATA'>;
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