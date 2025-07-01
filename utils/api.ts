/**
 * API utility functions
 * Pure functions for API interactions and data handling
 */

import { ApiResponse, ApiConfig } from '@/types/api';
import { HTTP_STATUS } from '@/types/constants';
import Logger from './logger';

/**
 * Default API configuration
 */
const defaultConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * HTTP client with retry logic and error handling
 * Provides a comprehensive API client with automatic retries, timeout handling,
 * and authentication support for Next.js applications
 */
export class ApiClient {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
          ...(this.config.auth && this.getAuthHeaders()),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;

      Logger.api({
        endpoint,
        method: options.method || 'GET',
        data: options.body ? JSON.parse(options.body as string) : undefined,
        responseTime,
        statusCode: response.status,
      });

      if (!response.ok) {
        if (response.status >= 500 && retryCount < this.config.retries) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      Logger.error('API Request failed', {
        endpoint,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        retryCount,
      });

      if (retryCount < this.config.retries && this.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === 'NetworkError' ||
        error.name === 'TimeoutError' ||
        error.message.includes('fetch')
      );
    }
    return false;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.config.auth) return {};

    switch (this.config.auth.type) {
      case 'bearer':
        return { Authorization: `Bearer ${this.config.auth.token}` };
      case 'basic':
        const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
        return { Authorization: `Basic ${credentials}` };
      case 'api-key':
        return { 'X-API-Key': this.config.auth.apiKey || '' };
      default:
        return {};
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Helper function to handle API responses
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(response.error || 'API request failed');
  }
  
  if (!response.data) {
    throw new Error('No data received from API');
  }
  
  return response.data;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * Parse error response
 */
export function parseApiError(error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    return {
      message: String(errorObj.message || 'Unknown error'),
      code: String(errorObj.code || 'UNKNOWN_ERROR'),
      statusCode: Number(errorObj.statusCode) || undefined,
    };
  }
  
  return {
    message: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Check if response indicates client error
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if response indicates server error
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500;
}

/**
 * Get error message based on status code
 */
export function getErrorMessageForStatus(statusCode: number): string {
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'Bad request. Please check your input.';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'You are not authorized. Please log in.';
    case HTTP_STATUS.FORBIDDEN:
      return 'Access forbidden. You do not have permission.';
    case HTTP_STATUS.NOT_FOUND:
      return 'Resource not found.';
    case HTTP_STATUS.METHOD_NOT_ALLOWED:
      return 'Method not allowed.';
    case HTTP_STATUS.CONFLICT:
      return 'Conflict. Resource already exists.';
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return 'Validation error. Please check your input.';
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'Too many requests. Please try again later.';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return 'Internal server error. Please try again later.';
    case HTTP_STATUS.BAD_GATEWAY:
      return 'Bad gateway. Please try again later.';
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return 'Service unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for API calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create AbortController for request cancellation
 */
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();
  
  if (timeoutMs) {
    setTimeout(() => controller.abort(), timeoutMs);
  }
  
  return controller;
}

/**
 * Transform response data
 */
export function transformResponse<T, U>(
  response: ApiResponse<T>,
  transformer: (data: T) => U
): ApiResponse<U> {
  if (!response.success || !response.data) {
    return response as ApiResponse<U>;
  }
  
  try {
    const transformedData = transformer(response.data);
    return {
      ...response,
      data: transformedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transformation failed',
    };
  }
}

/**
 * Retry failed requests
 */
export async function retryRequest<T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await requestFn();
      if (response.success) {
        return response;
      }
      lastError = response.error;
    } catch (error) {
      lastError = error;
    }
    
    if (i < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Request failed after retries',
  };
}

/**
 * Batch multiple API requests
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<ApiResponse<T>>>,
  concurrency: number = 5
): Promise<Array<ApiResponse<T>>> {
  const results: Array<ApiResponse<T>> = [];
  
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(request => request()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Cache API responses
 */
export class ApiCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

/**
 * Default cache instance
 */
export const apiCache = new ApiCache();