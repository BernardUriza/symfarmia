// Zustand store types for SYMFARMIA
import { User } from '@/types/medical';

// User Store Types
export interface UserStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  loginStart: () => void;
  loginSuccess: (user: User) => void;
  logout: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  setError: (error: string | null) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// System Store Types  
export interface SystemStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
}

// Consultation Store Types
export interface ConsultationStore {
  consultations: Consultation[];
  activeConsultation: Consultation | null;
  transcriptions: Transcription[];
  activeTranscription: Transcription | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setConsultations: (consultations: Consultation[]) => void;
  addConsultation: (consultation: Consultation) => void;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  setActiveConsultation: (consultation: Consultation | null) => void;
  deleteConsultation: (id: string) => void;
  
  // Transcription actions
  addTranscription: (transcription: Transcription) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  setActiveTranscription: (transcription: Transcription | null) => void;
  
  // Async operations
  fetchConsultations: () => Promise<void>;
  createConsultationWithTranscription: (
    consultationData: CreateConsultationData,
    transcriptionData: CreateTranscriptionData
  ) => Promise<void>;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  transcriptionIds: string[];
  duration?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transcription {
  id: string;
  consultationId: string;
  content: string;
  status: 'recording' | 'processing' | 'completed';
  confidence?: number;
  speakerLabels?: SpeakerLabel[];
  createdAt: number;
  updatedAt: number;
}

export interface SpeakerLabel {
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: number;
  confidence: number;
}

export interface CreateConsultationData {
  patientId: string;
  patientName: string;
  date: string;
  notes?: string;
}

export interface CreateTranscriptionData {
  content: string;
  speakerLabels?: SpeakerLabel[];
}

// Audit Types for HIPAA Compliance
export interface AuditLog {
  id: string;
  action: string;
  timestamp: number;
  userId: string | null;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  resourceType: 'consultation' | 'transcription' | 'user' | 'system';
  resourceId?: string;
}

// Performance Tracking Types
export interface PerformanceMetric {
  action: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}