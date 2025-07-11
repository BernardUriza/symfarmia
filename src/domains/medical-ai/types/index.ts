/**
 * Medical AI Domain Types
 * 
 * Core type definitions for medical AI functionality and transcription resilience
 */

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  language: string;
  medicalTerms: MedicalTerm[];
  segments: TranscriptionSegment[];
  status: TranscriptionStatus;
}

export interface TranscriptionSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speaker?: string;
}

export interface MedicalTerm {
  term: string;
  definition: string;
  category: MedicalCategory;
  confidence: number;
  synonyms: string[];
}

export interface MedicalAnalysis {
  patientId?: string;
  consultationId?: string;
  analysis: {
    symptoms: string[];
    potentialDiagnoses: string[];
    recommendedActions: string[];
    urgencyLevel: UrgencyLevel;
    specialty: MedicalSpecialty;
  };
  confidence: ConfidenceLevel;
  timestamp: Date;
  aiModel: string;
  medicalContext: MedicalContext;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: AudioFormat;
  noiseReduction: boolean;
  medicalOptimization: boolean;
  realTimeProcessing: boolean;
  maxDuration: number;
}

export interface MedicalContext {
  patientId?: string;
  consultationId?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  emergencyContact?: string;
  specialty: MedicalSpecialty;
  urgencyLevel: UrgencyLevel;
}

export interface ConfidenceMetrics {
  overall: number;
  transcription: number;
  medicalAnalysis: number;
  termRecognition: number;
  contextAccuracy: number;
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface MedicalStrategy {
  id: string;
  name: string;
  description: string;
  specialty: MedicalSpecialty;
  optimizations: StrategyOptimization[];
  threshold: number;
  enabled: boolean;
}

export interface StrategyOptimization {
  type: 'vocabulary' | 'context' | 'confidence' | 'speed';
  value: string | number;
  description: string;
}

// Enums
export enum TranscriptionStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum MedicalCategory {
  SYMPTOM = 'symptom',
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  ANATOMY = 'anatomy',
  PROCEDURE = 'procedure',
  LABORATORY = 'laboratory'
}

export type UrgencyLevel = 'routine' | 'urgent' | 'emergency' | 'critical';

export type MedicalSpecialty = 
  | 'general'
  | 'cardiology'
  | 'pediatrics'
  | 'emergency'
  | 'obstetrics'
  | 'neurology'
  | 'psychiatry'
  | 'dermatology'
  | 'orthopedics'
  | 'oncology';

export enum AudioFormat {
  WAV = 'wav',
  MP3 = 'mp3',
  OGG = 'ogg',
  WEBM = 'webm'
}

// Error Types
export class MedicalAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MedicalAIError';
  }
}

export class TranscriptionError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TRANSCRIPTION_ERROR', context);
    this.name = 'TranscriptionError';
  }
}

export class MedicalValidationError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MEDICAL_VALIDATION_ERROR', context);
    this.name = 'MedicalValidationError';
  }
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface MedicalAIServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  medicalModel: string;
  specialty: MedicalSpecialty;
}

// =============================================================================
// MEDICAL TRANSCRIPTION RESILIENCE TYPES
// =============================================================================

// Network Status and Quality Types
export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown';
  downlink: number;
  rtt: number;
  quality: NetworkQuality;
  medicalGrade: boolean;
  timestamp: Date;
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline' | 'unknown';

export interface NetworkPerformanceMetrics {
  latency: number[];
  bandwidth: number[];
  stability: number[];
  packetLoss: number[];
  timestamp: Date;
}

// Transcription Quality Types
export interface TranscriptionQualityMetrics {
  transcriptionAccuracy: number;
  networkLatency: number;
  audioQuality: number;
  overallQuality: number;
  confidenceScore: number;
  errorRate: number;
  throughput: number;
  availability: number;
  timestamp: Date;
}

export interface QualityThresholds {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface QualityAlert {
  type: 'quality_degradation' | 'quality_improvement' | 'quality_trend_down' | 'mode_switch_recommended';
  timestamp: Date;
  data: Record<string, any>;
}

// Audio Chunk Management Types
export interface AudioChunk {
  id: string;
  sequence: number;
  startTime: number;
  endTime: number;
  duration: number;
  audioData: ArrayBuffer;
  metadata: AudioChunkMetadata;
  status: AudioChunkStatus;
  processingAttempts: number;
  maxAttempts: number;
}

export interface AudioChunkMetadata {
  volume: number;
  networkQuality: NetworkQuality;
  chunkingReason: string;
  silenceDetected: boolean;
  hasOverlap: boolean;
  originalSize?: number;
  compressedSize?: number;
  compressed?: boolean;
  overlapDuration?: number;
}

export type AudioChunkStatus = 'recording' | 'processing' | 'completed' | 'failed';

export interface AudioChunkStats {
  totalChunks: number;
  recordingChunks: number;
  processingChunks: number;
  completedChunks: number;
  failedChunks: number;
  queueLength: number;
  averageChunkDuration: number;
  currentVolume: number;
  isProcessing: boolean;
}

// Offline Buffer Types
export interface OfflineQueueItem {
  id: string;
  timestamp: Date;
  audioData: ArrayBuffer;
  metadata: OfflineQueueMetadata;
  status: OfflineQueueStatus;
  retryCount: number;
  lastAttempt: Date | null;
  processingStarted: Date | null;
  processingCompleted: Date | null;
}

export interface OfflineQueueMetadata {
  originalSize: number;
  consultationId: string;
  patientId: string;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  maxAttempts: number;
}

export type OfflineQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OfflineQueueStats {
  totalItems: number;
  pendingItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
  currentBufferSize: number;
  maxBufferSize: number;
  bufferUsagePercent: number;
  isProcessing: boolean;
}

// Connection Recovery Types
export interface ConnectionRecoveryStatus {
  state: 'idle' | 'attempting' | 'backing_off' | 'failed';
  attempts: number;
  maxAttempts: number;
  strategy: RecoveryStrategy;
  circuitBreakerState: CircuitBreakerState;
  emergencyMode: boolean;
  lastConnectionTime: number | null;
  connectionQuality: NetworkQuality;
  isRecovering: boolean;
}

export type RecoveryStrategy = 'exponential_backoff' | 'linear_backoff' | 'fibonacci_backoff' | 'medical_priority';

export interface CircuitBreaker {
  state: CircuitBreakerState;
  failures: number;
  threshold: number;
  timeout: number;
  lastFailure: number | null;
}

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface ConnectionTest {
  success: boolean;
  duration: number;
  testResults: ConnectionTestResult[];
  successCount: number;
  totalTests: number;
  networkStatus: NetworkStatus;
  error?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  type: 'basic_connectivity' | 'service_endpoint' | 'bandwidth_quality';
  status?: number;
  data?: any;
  error?: string;
  speed?: number;
}

// Backup Strategy Types
export interface BackupRecord {
  id: string;
  sessionId: string;
  timestamp: Date;
  version: number;
  transcriptionData: any;
  metadata: BackupMetadata;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  size: number;
}

export interface BackupMetadata {
  consultationId: string;
  patientId: string;
  startTime: Date;
  duration: number;
  networkStatus: NetworkStatus;
  backupReason: string;
  originalSize?: number;
  compressedSize?: number;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  recoveredSessions: number;
  dataLossPrevented: number;
  isActive: boolean;
  currentSession: string | null;
  recoveryMode: boolean;
  backupInterval: number;
  queueLength: number;
}

// Audio Persistence Types
export interface AudioStorageRecord {
  id: string;
  timestamp: Date;
  expirationDate: Date;
  metadata: AudioStorageMetadata;
  classification: string;
  encrypted: boolean;
  compressed: boolean;
  accessCount: number;
  lastAccessed: Date;
  checksum: string;
  hipaaCompliant: boolean;
  auditTrail: AuditEntry[];
}

export interface AudioStorageMetadata {
  consultationId: string;
  patientId: string;
  duration: number;
  format: string;
  sampleRate: number;
  channels: number;
  originalSize: number;
  compressedSize?: number;
}

export interface AudioStorageStats {
  currentSize: number;
  maxSize: number;
  usagePercent: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  hipaaCompliant: boolean;
  isInitialized: boolean;
  accessLogSize: number;
  auditLogSize: number;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  recordId: string;
  metadata: Record<string, any>;
  userAgent: string;
  url: string;
}

// Service Worker Types
export interface BackgroundTask {
  id: string;
  type: 'TRANSCRIPTION' | 'AUDIO_CHUNK' | 'OFFLINE_SYNC';
  status: 'processing' | 'syncing';
  retryCount: number;
  createdAt: Date;
  lastError?: string;
}

export interface BackgroundProcessingStats {
  isRegistered: boolean;
  isAvailable: boolean;
  activeBackgroundTasks: number;
  activeSyncTasks: number;
  totalActiveTasks: number;
  queuedMessages: number;
  processingState: string;
}

// Medical Resilience Types
export interface MedicalResilienceStatus {
  mode: ResilienceMode;
  isActive: boolean;
  sessionId: string | null;
  continuity: ContinuityStatus;
  serviceHealth: ServiceHealthMap;
  emergencyMode: boolean;
  coordinationState: string;
}

export type ResilienceMode = 'online' | 'offline' | 'hybrid' | 'emergency';

export type ContinuityStatus = 'maintained' | 'interrupted' | 'restored';

export interface ServiceHealthMap {
  networkDetector: 'healthy' | 'unhealthy';
  qualityMonitor: 'healthy' | 'unhealthy';
  recoveryService: 'healthy' | 'unhealthy';
  offlineBuffer: 'healthy' | 'unhealthy';
  chunkManager: 'healthy' | 'unhealthy';
  persistence: 'healthy' | 'unhealthy';
  backupStrategy: 'healthy' | 'unhealthy';
}

export interface TranscriptionSession {
  id: string;
  startTime: Date;
  lastTranscriptionTime: Date;
  activeSegments: Map<string, any>;
  pendingSegments: Map<string, any>;
  completedSegments: Map<string, any>;
  totalSegments: number;
  processedSegments: number;
  errorSegments: number;
  continuity: ContinuityStatus;
}

export interface ModeTransition {
  from: ResilienceMode;
  to: ResilienceMode;
  timestamp: Date;
  context: Record<string, any>;
  duration: number;
  success: boolean;
}

export interface EmergencyProtocols {
  enabled: boolean;
  triggeredAt: Date | null;
  reason: string | null;
  escalationLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ResilienceConfiguration {
  autoModeSwitch: boolean;
  seamlessTransitions: boolean;
  medicalGradeReliability: boolean;
  emergencyModeEnabled: boolean;
  maxDataLossToleranceSec: number;
  qualityThreshold: number;
  networkQualityThreshold: number;
  backupFrequency: number;
  bufferSize: number;
}

export interface ResilienceMetrics {
  totalSessions: number;
  successfulSessions: number;
  interruptedSessions: number;
  dataLossIncidents: number;
  modeTransitions: number;
  averageRecoveryTime: number;
  uptime: number;
  lastIncident: Date | null;
  currentMode: ResilienceMode;
  isActive: boolean;
  serviceHealth: ServiceHealthMap;
  emergencyProtocols: EmergencyProtocols;
  transitionHistory: ModeTransition[];
}

// Error Handling Types
export interface TranscriptionErrorContext {
  errorType: 'network' | 'hardware' | 'api' | 'timeout' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryStrategy: 'retry' | 'fallback' | 'buffer' | 'abort';
  medicalContext: MedicalContext;
  timestamp: Date;
  retryAttempt: number;
}

export interface MedicalErrorContext {
  patientId?: string;
  consultationId?: string;
  sessionId?: string;
  component?: string;
  operation?: string;
  urgencyLevel?: UrgencyLevel;
  specialty?: string;
  errorType?: 'transcription' | 'network' | 'audio' | 'storage' | 'security';
  hipaaRelevant?: boolean;
  medicalDataInvolved?: boolean;
}

export interface ErrorLogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  medicalContext?: MedicalErrorContext;
  hash: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  suppressed: boolean;
}

export interface ErrorStatistics {
  totalErrors: number;
  suppressedErrors: number;
  medicalErrors: number;
  escalatedErrors: number;
  errorsByType: Record<string, number>;
}

// Fallback Configuration Types
export interface FallbackConfiguration {
  primaryService: TranscriptionService;
  fallbackServices: TranscriptionService[];
  retryAttempts: number;
  exponentialBackoffBase: number;
  maxRetryDelay: number;
  circuitBreakerThreshold: number;
}

export type TranscriptionService = 'browser' | 'whisper' | 'deepgram';

export interface ServiceHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
  averageLatency: number;
  reliability: number;
}

export interface ServiceAnalytics {
  totalSwitches: number;
  switchHistory: any[];
  serviceReliability: Record<string, ServiceHealthStatus>;
  currentService: TranscriptionService;
  uptime: number;
}

// Visual Indicator Types
export interface VisualIndicatorProps {
  networkStatusDetector?: any;
  transcriptionQualityMonitor?: any;
  medicalTranscriptionResilience?: any;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

// Extended Error Types
export class NetworkError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class AudioError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUDIO_ERROR', context);
    this.name = 'AudioError';
  }
}

export class StorageError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

export class SecurityError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SECURITY_ERROR', context);
    this.name = 'SecurityError';
  }
}

export class ResilienceError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'RESILIENCE_ERROR', context);
    this.name = 'ResilienceError';
  }
}

export class MedicalComplianceError extends MedicalAIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MEDICAL_COMPLIANCE_ERROR', context);
    this.name = 'MedicalComplianceError';
  }
}

// Callback Types
export type NetworkStatusCallback = (status: NetworkStatus) => void;
export type QualityUpdateCallback = (metrics: TranscriptionQualityMetrics) => void;
export type ModeTransitionCallback = (transition: ModeTransition) => void;
export type ErrorCallback = (error: ErrorLogEntry) => void;
export type RecoveryCallback = (status: ConnectionRecoveryStatus) => void;
export type BackupCallback = (backup: BackupRecord) => void;
export type ChunkCallback = (chunk: AudioChunk) => void;
export type TaskCallback = (task: BackgroundTask) => void;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event Types
export type ResilienceEvent = 
  | 'sessionStarted'
  | 'sessionStopped'
  | 'modeTransitionCompleted'
  | 'modeTransitionFailed'
  | 'emergencyModeTriggered'
  | 'continuityBreak'
  | 'continuityRestored'
  | 'recoveryAvailable';

export type QualityEvent = 
  | 'qualityUpdated'
  | 'qualityDegraded'
  | 'qualityImproved'
  | 'qualityTrendDown'
  | 'modeSwitchRecommended'
  | 'networkChanged';

export type RecoveryEvent = 
  | 'connectionLost'
  | 'connectionRestored'
  | 'recoveryStarted'
  | 'recoverySuccessful'
  | 'recoveryFailed'
  | 'recoveryCancelled';

export type BackupEvent = 
  | 'backupStarted'
  | 'backupStopped'
  | 'backupCompleted'
  | 'backupFailed'
  | 'recoveryCompleted'
  | 'recoveryFailed';

export type ChunkEvent = 
  | 'chunkReady'
  | 'chunkProcessed'
  | 'chunkFailed'
  | 'networkChanged';

export type TaskEvent = 
  | 'taskCompleted'
  | 'taskFailed'
  | 'syncCompleted'
  | 'progressUpdate'
  | 'error';

// Configuration Validation Types
export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface MedicalComplianceCheck {
  hipaaCompliant: boolean;
  encryptionEnabled: boolean;
  auditTrailEnabled: boolean;
  accessControlEnabled: boolean;
  dataRetentionConfigured: boolean;
  issues: string[];
  recommendations: string[];
}