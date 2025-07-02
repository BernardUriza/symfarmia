// Base Types
export interface BaseEntity {
  id: number;
  createdAt: Date;
}

// Patient Types
export interface Patient extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  information: string;
  dateOfBirth: Date;
  gender: string;
  status: string;
  medicalReports?: MedicalReport[];
}

export interface CreatePatientData {
  name: string;
  email: string;
  phone: string;
  information: string;
  dateOfBirth: Date;
  gender: string;
  status: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: number;
}

// Medical Report Types
export interface MedicalReport extends BaseEntity {
  name: string;
  status: string;
  diagnosis: string | null;
  date: Date;
  expirationDate: Date | null;
  patientId: number;
  patient?: Patient;
  studies?: Study[];
}

export interface CreateMedicalReportData {
  name: string;
  status: string;
  diagnosis?: string;
  date: Date;
  expirationDate?: Date;
  patientId: number;
}

export interface UpdateMedicalReportData extends Partial<CreateMedicalReportData> {
  id: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  studyTypes?: StudyType[];
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number;
}

// Study Type Types
export interface StudyType {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  category?: Category;
  studies?: Study[];
}

export interface CreateStudyTypeData {
  name: string;
  description: string;
  categoryId: number;
}

export interface UpdateStudyTypeData extends Partial<CreateStudyTypeData> {
  id: number;
}

// Study Types
export interface Study extends BaseEntity {
  name: string;
  title: string;
  medicalReportId: number;
  studyTypeId: number;
  type?: StudyType;
  medicalReport?: MedicalReport;
}

export interface CreateStudyData {
  name: string;
  title: string;
  medicalReportId: number;
  studyTypeId: number;
}

export interface UpdateStudyData extends Partial<CreateStudyData> {
  id: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  values: Record<string, unknown>;
}

// Modal Types
export interface ModalState {
  isOpen: boolean;
  title: string;
  content?: unknown;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Filter Types
export interface FilterState {
  search: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  category: string;
  studyType: string;
}

// Table Types
export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: unknown;
  active?: boolean;
  children?: NavigationItem[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Loading Types
export interface LoadingState {
  isLoading: boolean;
  message?: string | undefined;
}

// Confirmation Types
export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Email Types
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: ArrayBuffer;
    contentType: string;
  }>;
}

// JWT Token Types
export interface TokenPayload {
  medicalReportId: number;
  iat?: number;
  exp?: number;
}

// File Upload Types
export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

// Search Types
export interface SearchResult<T = unknown> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: unknown;
  id?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  label?: string;
  icon?: unknown;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  footer?: unknown;
}

// Hook Return Types
export interface UseAsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  execute: (...args: unknown[]) => Promise<void>;
}

export interface UseFormResult<T = Record<string, unknown>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T, value: unknown) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => void;
  reset: () => void;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;