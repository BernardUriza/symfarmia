/**
 * Production Logger with Advanced Conditional Logging
 * Extends the existing logger with production-safe, configurable logging levels
 */

import Logger from '../logger';

// Log levels hierarchy: ERROR < WARN < INFO < DEBUG
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class ProductionLogger {
  static isProduction = process.env.NODE_ENV === 'production';
  static isDevelopment = process.env.NODE_ENV === 'development';
  static isTest = process.env.NODE_ENV === 'test';
  
  // Current log level based on environment
  static currentLevel = ProductionLogger.isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
  
  // Override log level via environment variable
  static {
    const envLevel = process.env.REACT_APP_LOG_LEVEL || process.env.LOG_LEVEL;
    if (envLevel) {
      const levelKey = envLevel.toUpperCase();
      if (LOG_LEVELS[levelKey] !== undefined) {
        ProductionLogger.currentLevel = LOG_LEVELS[levelKey];
      }
    }
  }

  // Runtime debug toggle (for development)
  static debugEnabled = ProductionLogger.isDevelopment;

  /**
   * Enable/disable debug logging at runtime
   */
  static setDebugEnabled(enabled) {
    ProductionLogger.debugEnabled = enabled;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('symfarmia-debug', enabled ? '1' : '0');
    }
  }

  /**
   * Check if debug is enabled from localStorage
   */
  static {
    if (typeof window !== 'undefined' && ProductionLogger.isDevelopment) {
      const stored = window.localStorage.getItem('symfarmia-debug');
      if (stored === '1') {
        ProductionLogger.debugEnabled = true;
      }
    }
  }

  /**
   * Check if logging should occur based on level
   */
  static shouldLog(level) {
    return level <= ProductionLogger.currentLevel;
  }

  /**
   * Enhanced error logging - always logs in production
   */
  static error(message, error, context = {}) {
    if (ProductionLogger.shouldLog(LOG_LEVELS.ERROR)) {
      const errorData = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        context,
        ...(error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: ProductionLogger.isProduction ? undefined : error.stack
        } : { errorData: error })
      };

      // In production, send to error tracking service
      if (ProductionLogger.isProduction) {
        console.error(`[SYMFARMIA ERROR] ${message}`, errorData);
        // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
      } else {
        Logger.error(message, errorData);
      }
    }
  }

  /**
   * Warning logging - logs in production and development
   */
  static warn(message, data = {}) {
    if (ProductionLogger.shouldLog(LOG_LEVELS.WARN)) {
      const warnData = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        ...data
      };

      if (ProductionLogger.isProduction) {
        console.warn(`[SYMFARMIA WARN] ${message}`, warnData);
      } else {
        Logger.warn(message, warnData);
      }
    }
  }

  /**
   * Info logging - development and explicit info level
   */
  static info(message, data = {}) {
    if (ProductionLogger.shouldLog(LOG_LEVELS.INFO)) {
      const infoData = {
        timestamp: new Date().toISOString(),
        ...data
      };

      if (ProductionLogger.isProduction) {
        // In production, only log critical info
        if (data.critical) {
          console.info(`[SYMFARMIA INFO] ${message}`, infoData);
        }
      } else {
        Logger.info(message, infoData);
      }
    }
  }

  /**
   * Debug logging - development only or when explicitly enabled
   */
  static debug(message, data = {}) {
    if (ProductionLogger.shouldLog(LOG_LEVELS.DEBUG) && ProductionLogger.debugEnabled) {
      if (!ProductionLogger.isProduction) {
        Logger.debug(message, data);
      }
    }
  }

  /**
   * Component logging with conditional verbosity
   */
  static component(componentName, props, renderTime, options = {}) {
    if (ProductionLogger.debugEnabled && !ProductionLogger.isProduction) {
      const shouldLogProps = options.logProps !== false;
      const componentData = {
        componentName,
        ...(shouldLogProps && props ? { props } : {}),
        ...(renderTime ? { renderTime } : {})
      };

      Logger.component(componentData);
    }
  }

  /**
   * Performance logging with thresholds
   */
  static performance(label, startTime, threshold = 100) {
    if (ProductionLogger.debugEnabled || ProductionLogger.isProduction) {
      const duration = performance.now() - startTime;
      
      // In production, only log if exceeds threshold
      if (ProductionLogger.isProduction && duration > threshold) {
        console.warn(`[SYMFARMIA PERF] ${label}: ${duration.toFixed(2)}ms (exceeded ${threshold}ms threshold)`);
      } else if (!ProductionLogger.isProduction) {
        Logger.performance(label, startTime);
      }
    }
  }

  /**
   * API logging with request/response filtering
   */
  static api(endpoint, method, data, responseTime, statusCode, options = {}) {
    const logData = {
      endpoint,
      method,
      responseTime,
      statusCode,
      ...(options.logData !== false && data ? { data } : {})
    };

    if (ProductionLogger.isProduction) {
      // In production, only log errors or slow requests
      if (statusCode >= 400 || (responseTime && responseTime > 1000)) {
        console.warn(`[SYMFARMIA API] ${method} ${endpoint}`, logData);
      }
    } else if (ProductionLogger.debugEnabled) {
      Logger.api(logData);
    }
  }

  /**
   * User action logging with PII protection
   */
  static user(action, user, metadata = {}) {
    if (ProductionLogger.debugEnabled && !ProductionLogger.isProduction) {
      const safeUser = user ? { id: user.id, email: user.email } : null;
      Logger.user({ action, user: safeUser, metadata });
    } else if (ProductionLogger.isProduction && metadata.critical) {
      // In production, only log critical user actions without PII
      console.info(`[SYMFARMIA USER] ${action}`, { userId: user?.id });
    }
  }

  /**
   * Theme-specific logging (for ThemeProvider)
   */
  static theme(message, data = {}) {
    if (ProductionLogger.debugEnabled && !ProductionLogger.isProduction) {
      Logger.debug(`[THEME] ${message}`, data);
    }
  }

  /**
   * Cache-specific logging (for cache operations)
   */
  static cache(operation, key, hit = null, data = {}) {
    if (ProductionLogger.debugEnabled && !ProductionLogger.isProduction) {
      Logger.debug(`[CACHE] ${operation} - ${key}`, { hit, ...data });
    }
  }

  /**
   * Critical system logging - always logs regardless of level
   */
  static critical(message, data = {}) {
    const criticalData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      critical: true,
      ...data
    };

    console.error(`[SYMFARMIA CRITICAL] ${message}`, criticalData);
  }

  /**
   * Create a performance timer with threshold-based logging
   */
  static timer(label, threshold = 100) {
    const startTime = performance.now();
    
    return () => {
      ProductionLogger.performance(label, startTime, threshold);
    };
  }

  /**
   * Group logging for related operations
   */
  static group(label, callback) {
    if (ProductionLogger.debugEnabled && !ProductionLogger.isProduction) {
      Logger.group(label, callback);
    } else {
      // In production, just execute without grouping
      callback();
    }
  }

  /**
   * Get current logging configuration
   */
  static getConfig() {
    return {
      environment: process.env.NODE_ENV,
      currentLevel: ProductionLogger.currentLevel,
      debugEnabled: ProductionLogger.debugEnabled,
      isProduction: ProductionLogger.isProduction,
      isDevelopment: ProductionLogger.isDevelopment
    };
  }
}

export default ProductionLogger;

// Convenience exports for common patterns
export const logError = (message, error, context) => ProductionLogger.error(message, error, context);
export const logWarn = (message, data) => ProductionLogger.warn(message, data);
export const logInfo = (message, data) => ProductionLogger.info(message, data);
export const logDebug = (message, data) => ProductionLogger.debug(message, data);
export const logCritical = (message, data) => ProductionLogger.critical(message, data);
export const logTheme = (message, data) => ProductionLogger.theme(message, data);
export const logCache = (operation, key, hit, data) => ProductionLogger.cache(operation, key, hit, data);
export const createPerfTimer = (label, threshold) => ProductionLogger.timer(label, threshold);