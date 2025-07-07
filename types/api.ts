import { NextRequest, NextResponse } from 'next/server';
import { 
  Patient, 
  MedicalReport, 
  Study, 
  StudyType, 
  Category,
  CreatePatientData,
  UpdatePatientData,
  CreateMedicalReportData,
  UpdateMedicalReportData,
  CreateStudyData,
  UpdateStudyData,
  CreateStudyTypeData,
  UpdateStudyTypeData,
  CreateCategoryData,
  UpdateCategoryData,
  PaginatedResponse
} from './index';

/**
 * Standard API response format used throughout the application
 * @template T - The type of data returned in the response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Supported HTTP methods for API endpoints */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** Type definitions for Next.js API route handlers */
export type ApiHandler = (
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) => Promise<NextResponse>;

export type ApiRouteHandler = {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  DELETE?: ApiHandler;
  PATCH?: ApiHandler;
};

/** Request and response types for each entity in the system */

/** Patient-related API types */
export interface PatientsGetResponse extends ApiResponse<PaginatedResponse<Patient>> {}
export interface PatientGetResponse extends ApiResponse<Patient> {}
export interface PatientCreateRequest extends CreatePatientData {}
export interface PatientCreateResponse extends ApiResponse<Patient> {}
export interface PatientUpdateRequest extends UpdatePatientData {}
export interface PatientUpdateResponse extends ApiResponse<Patient> {}
export interface PatientDeleteResponse extends ApiResponse<{ deleted: boolean }> {}

/** Medical Report-related API types */
export interface MedicalReportsGetResponse extends ApiResponse<PaginatedResponse<MedicalReport>> {}
export interface MedicalReportGetResponse extends ApiResponse<MedicalReport> {}
export interface MedicalReportCreateRequest extends CreateMedicalReportData {}
export interface MedicalReportCreateResponse extends ApiResponse<MedicalReport> {}
export interface MedicalReportUpdateRequest extends UpdateMedicalReportData {}
export interface MedicalReportUpdateResponse extends ApiResponse<MedicalReport> {}
export interface MedicalReportDeleteResponse extends ApiResponse<{ deleted: boolean }> {}

/** Study-related API types */
export interface StudiesGetResponse extends ApiResponse<PaginatedResponse<Study>> {}
export interface StudyGetResponse extends ApiResponse<Study> {}
export interface StudyCreateRequest extends CreateStudyData {}
export interface StudyCreateResponse extends ApiResponse<Study> {}
export interface StudyUpdateRequest extends UpdateStudyData {}
export interface StudyUpdateResponse extends ApiResponse<Study> {}
export interface StudyDeleteResponse extends ApiResponse<{ deleted: boolean }> {}

/** Study Type-related API types */
export interface StudyTypesGetResponse extends ApiResponse<PaginatedResponse<StudyType>> {}
export interface StudyTypeGetResponse extends ApiResponse<StudyType> {}
export interface StudyTypeCreateRequest extends CreateStudyTypeData {}
export interface StudyTypeCreateResponse extends ApiResponse<StudyType> {}
export interface StudyTypeUpdateRequest extends UpdateStudyTypeData {}
export interface StudyTypeUpdateResponse extends ApiResponse<StudyType> {}
export interface StudyTypeDeleteResponse extends ApiResponse<{ deleted: boolean }> {}

/** Category-related API types */
export interface CategoriesGetResponse extends ApiResponse<PaginatedResponse<Category>> {}
export interface CategoryGetResponse extends ApiResponse<Category> {}
export interface CategoryCreateRequest extends CreateCategoryData {}
export interface CategoryCreateResponse extends ApiResponse<Category> {}
export interface CategoryUpdateRequest extends UpdateCategoryData {}
export interface CategoryUpdateResponse extends ApiResponse<Category> {}
export interface CategoryDeleteResponse extends ApiResponse<{ deleted: boolean }> {}

// Special API Types
export interface TokenValidationResponse extends ApiResponse<{
  valid: boolean;
  medicalReport?: MedicalReport;
}> {}

export interface PdfMergeRequest {
  files: Array<{
    name: string;
    content: string; // base64 encoded
  }>;
  outputName: string;
}

export interface PdfMergeResponse extends ApiResponse<{
  mergedPdfUrl: string;
  fileName: string;
}> {}

export interface EmailSendRequest {
  to: string;
  subject: string;
  templateData: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    contentType: string;
  }>;
}

export interface EmailSendResponse extends ApiResponse<{
  messageId: string;
  sent: boolean;
}> {}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams, SearchParams, SortParams {}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ValidationError extends ApiError {
  field: string;
  value: unknown;
}

export interface AuthError extends ApiError {
  type: 'unauthorized' | 'forbidden' | 'token_expired' | 'invalid_token';
}

// Middleware Types
export interface ApiMiddleware {
  (request: NextRequest, context: { params: Record<string, string | string[]> }): Promise<NextRequest | NextResponse>;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: string;
  tags?: string[];
}

// WebSocket Types (if needed for real-time features)
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  userId?: string;
}

export interface WebSocketEvent {
  event: string;
  data: unknown;
  room?: string;
}

// File Upload Types
export interface FileUploadRequest {
  files: File[];
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse extends ApiResponse<{
  uploadedFiles: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
}> {}

// Health Check Types
export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'pass' | 'fail';
    message?: string;
    duration?: number;
  }>;
  timestamp: string;
  version: string;
}> {}

// Metrics Types
export interface MetricsResponse extends ApiResponse<{
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    activeQueries: number;
    averageQueryTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: string;
}> {}

// Batch Operations
export interface BatchRequest<T> {
  operations: Array<{
    operation: 'create' | 'update' | 'delete';
    data: T;
  }>;
}

export interface BatchResponse<T> extends ApiResponse<{
  results: Array<{
    success: boolean;
    data?: T;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export interface ModuleStatus {
  status: 'healthy' | 'degraded' | 'failed';
  critical: boolean;
  error?: string;
  responseTime?: number;
}

export interface SystemHealthReport {
  timestamp: Date;
  overall: 'healthy' | 'degraded';
  modules: Record<string, ModuleStatus>;
  criticalFailures: ModuleStatus[];
}