/**
 * Development Logger Utility
 * Provides enhanced logging capabilities for development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

interface User {
  id: string | number;
  email: string;
}

type LogData = any;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

class Logger {
  static log(message: string, data: LogData = null): void {
    if (isDevelopment) {
      console.log(`[SYMFARMIA] ${message}`, data || '');
    }
  }

  static error(message: string, error: Error | LogData = null): void {
    if (isDevelopment) {
      console.error(`[SYMFARMIA ERROR] ${message}`, error || '');
    }
  }

  static warn(message: string, data: LogData = null): void {
    if (isDevelopment) {
      console.warn(`[SYMFARMIA WARNING] ${message}`, data || '');
    }
  }

  static info(message: string, data: LogData = null): void {
    if (isDevelopment) {
      console.info(`[SYMFARMIA INFO] ${message}`, data || '');
    }
  }

  static debug(message: string, data: LogData = null): void {
    if (isDevelopment) {
      console.debug(`[SYMFARMIA DEBUG] ${message}`, data || '');
    }
  }

  static api(endpoint: string, method: HttpMethod, data: LogData = null): void {
    if (isDevelopment) {
      console.group(`[SYMFARMIA API] ${method} ${endpoint}`);
      if (data) {
        console.log('Data:', data);
      }
      console.groupEnd();
    }
  }

  static user(action: string, user: User | null = null): void {
    if (isDevelopment) {
      console.log(`[SYMFARMIA USER] ${action}`, user ? { id: user.id, email: user.email } : 'No user');
    }
  }

  static component(componentName: string, props: Record<string, any> | null = null): void {
    if (isDevelopment) {
      console.log(`[SYMFARMIA COMPONENT] ${componentName} rendered`, props ? Object.keys(props) : 'No props');
    }
  }
}

export default Logger;