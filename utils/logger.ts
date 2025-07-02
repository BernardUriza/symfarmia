/**
 * Development Logger Utility
 * Provides enhanced logging capabilities with TypeScript support
 */

import { User } from '@/types';

interface LogData {
  [key: string]: unknown;
}

interface ApiLogData {
  endpoint: string;
  method: string;
  data?: unknown;
  responseTime?: number;
  statusCode?: number;
}

interface ComponentLogData {
  componentName: string;
  props?: Record<string, unknown>;
  renderTime?: number;
}

interface UserLogData {
  action: string;
  user?: Pick<User, 'id' | 'email'> | null;
  metadata?: Record<string, unknown>;
}

// Provide a minimal process type for environments without Node types
declare const process: {
  env: Record<string, string | undefined>;
};

class Logger {
  private static isDevelopment =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  private static prefix = '[SYMFARMIA]';

  /**
   * General purpose logging
   */
  static log(message: string, data?: LogData): void {
    if (Logger.isDevelopment) {
      console.log(`${Logger.prefix} ${message}`, data || '');
    }
  }

  /**
   * Error logging with enhanced error information
   */
  static error(message: string, error?: Error | unknown): void {
    if (Logger.isDevelopment) {
      const errorInfo = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;
      
      console.error(`${Logger.prefix} ERROR] ${message}`, errorInfo || '');
    }
  }

  /**
   * Warning logging
   */
  static warn(message: string, data?: LogData): void {
    if (Logger.isDevelopment) {
      console.warn(`${Logger.prefix} WARNING] ${message}`, data || '');
    }
  }

  /**
   * Info logging
   */
  static info(message: string, data?: LogData): void {
    if (Logger.isDevelopment) {
      console.info(`${Logger.prefix} INFO] ${message}`, data || '');
    }
  }

  /**
   * Debug logging
   */
  static debug(message: string, data?: LogData): void {
    if (Logger.isDevelopment) {
      console.debug(`${Logger.prefix} DEBUG] ${message}`, data || '');
    }
  }

  /**
   * API request/response logging
   */
  static api({ endpoint, method, data, responseTime, statusCode }: ApiLogData): void {
    if (Logger.isDevelopment) {
      console.group(`${Logger.prefix} API] ${method} ${endpoint}`);
      
      if (data) {
        console.log('Data:', data);
      }
      
      if (responseTime) {
        console.log('Response Time:', `${responseTime}ms`);
      }
      
      if (statusCode) {
        console.log('Status Code:', statusCode);
      }
      
      console.groupEnd();
    }
  }

  /**
   * User action logging
   */
  static user({ action, user, metadata }: UserLogData): void {
    if (Logger.isDevelopment) {
      const userInfo = user ? { id: user.id, email: user.email } : 'No user';
      console.log(`${Logger.prefix} USER] ${action}`, userInfo);
      
      if (metadata) {
        console.log('Metadata:', metadata);
      }
    }
  }

  /**
   * Component rendering logging
   */
  static component({ componentName, props, renderTime }: ComponentLogData): void {
    if (Logger.isDevelopment) {
      const propKeys = props ? Object.keys(props) : 'No props';
      console.log(`${Logger.prefix} COMPONENT] ${componentName} rendered`, propKeys);
      
      if (renderTime) {
        console.log('Render Time:', `${renderTime}ms`);
      }
    }
  }

  /**
   * Performance timing logging
   */
  static performance(label: string, startTime: number): void {
    if (Logger.isDevelopment) {
      const duration = performance.now() - startTime;
      console.log(`${Logger.prefix} PERFORMANCE] ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Database query logging
   */
  static database(query: string, params?: unknown[], duration?: number): void {
    if (Logger.isDevelopment) {
      console.group(`${Logger.prefix} DATABASE] Query executed`);
      console.log('Query:', query);
      
      if (params && params.length > 0) {
        console.log('Parameters:', params);
      }
      
      if (duration) {
        console.log('Duration:', `${duration}ms`);
      }
      
      console.groupEnd();
    }
  }

  /**
   * File operation logging
   */
  static file(operation: string, path: string, size?: number): void {
    if (Logger.isDevelopment) {
      console.log(`${Logger.prefix} FILE] ${operation}: ${path}`);
      
      if (size) {
        console.log('Size:', `${(size / 1024).toFixed(2)} KB`);
      }
    }
  }

  /**
   * Authentication logging
   */
  static auth(action: string, user?: Pick<User, 'id' | 'email'>, details?: Record<string, unknown>): void {
    if (Logger.isDevelopment) {
      const userInfo = user ? { id: user.id, email: user.email } : 'Anonymous';
      console.log(`${Logger.prefix} AUTH] ${action}`, userInfo);
      
      if (details) {
        console.log('Details:', details);
      }
    }
  }

  /**
   * Memory usage logging
   */
  static memory(label: string): void {
    if (Logger.isDevelopment && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100;
      const total = Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100;
      
      console.log(`${Logger.prefix} MEMORY] ${label} - Used: ${used}MB, Total: ${total}MB`);
    }
  }

  /**
   * Create a timer for measuring operation duration
   */
  static timer(label: string): () => void {
    if (!Logger.isDevelopment) {
      return () => {}; // No-op in production
    }

    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      Logger.performance(label, startTime);
    };
  }

  /**
   * Group logging for related operations
   */
  static group(label: string, callback: () => void): void {
    if (Logger.isDevelopment) {
      console.group(`${Logger.prefix} ${label}`);
      try {
        callback();
      } finally {
        console.groupEnd();
      }
    }
  }

  /**
   * Table logging for structured data
   */
  static table(data: Record<string, unknown>[] | Record<string, unknown>, columns?: string[]): void {
    if (Logger.isDevelopment) {
      console.log(`${Logger.prefix} TABLE]`);
      console.table(data, columns);
    }
  }

  /**
   * Trace logging with stack trace
   */
  static trace(message: string): void {
    if (Logger.isDevelopment) {
      console.trace(`${Logger.prefix} TRACE] ${message}`);
    }
  }
}

export default Logger;

// Convenience exports for common logging patterns
export const logError = (message: string, error?: Error | unknown) => Logger.error(message, error);
export const logInfo = (message: string, data?: LogData) => Logger.info(message, data);
export const logWarning = (message: string, data?: LogData) => Logger.warn(message, data);
export const logDebug = (message: string, data?: LogData) => Logger.debug(message, data);
export const logApi = (data: ApiLogData) => Logger.api(data);
export const logUser = (data: UserLogData) => Logger.user(data);
export const logComponent = (data: ComponentLogData) => Logger.component(data);
export const createTimer = (label: string) => Logger.timer(label);