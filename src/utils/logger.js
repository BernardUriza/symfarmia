/**
 * Development Logger Utility
 * Provides enhanced logging capabilities for development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development'

class Logger {
  static log(message, data = null) {
    if (isDevelopment) {
      console.log(`[SYMFARMIA] ${message}`, data || '')
    }
  }

  static error(message, error = null) {
    if (isDevelopment) {
      console.error(`[SYMFARMIA ERROR] ${message}`, error || '')
    }
  }

  static warn(message, data = null) {
    if (isDevelopment) {
      console.warn(`[SYMFARMIA WARNING] ${message}`, data || '')
    }
  }

  static info(message, data = null) {
    if (isDevelopment) {
      console.info(`[SYMFARMIA INFO] ${message}`, data || '')
    }
  }

  static debug(message, data = null) {
    if (isDevelopment) {
      console.debug(`[SYMFARMIA DEBUG] ${message}`, data || '')
    }
  }

  static api(endpoint, method, data = null) {
    if (isDevelopment) {
      console.group(`[SYMFARMIA API] ${method} ${endpoint}`)
      if (data) {
        console.log('Data:', data)
      }
      console.groupEnd()
    }
  }

  static user(action, user = null) {
    if (isDevelopment) {
      console.log(`[SYMFARMIA USER] ${action}`, user ? { id: user.id, email: user.email } : 'No user')
    }
  }

  static component(componentName, props = null) {
    if (isDevelopment) {
      console.log(`[SYMFARMIA COMPONENT] ${componentName} rendered`, props ? Object.keys(props) : 'No props')
    }
  }
}

export default Logger