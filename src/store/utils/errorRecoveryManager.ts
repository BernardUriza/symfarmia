// Advanced error recovery system with automatic retry strategies
import type { MedicalError, MedicalStateAction } from '../types';

export interface RecoveryStrategy {
  name: string;
  canRecover: (error: MedicalError) => boolean;
  recover: (error: MedicalError, dispatch: (action: MedicalStateAction) => void) => Promise<boolean>;
  maxAttempts: number;
  backoffMs: number;
}

export class ErrorRecoveryManager {
  private recoveryStrategies: RecoveryStrategy[] = [];
  private recoveryAttempts: Map<string, number> = new Map();
  
  constructor() {
    this.initializeStrategies();
  }
  
  private initializeStrategies() {
    this.recoveryStrategies = [
      // Network error recovery
      {
        name: 'network_retry',
        canRecover: (error) => error.code === 'NETWORK_ERROR' || error.code === 'API_ERROR',
        recover: async (error, dispatch) => {
          await this.waitForNetwork();
          
          // Retry the original action if available
          if (error.context?.originalAction) {
            dispatch(error.context.originalAction as MedicalStateAction);
            return true;
          }
          
          return false;
        },
        maxAttempts: 3,
        backoffMs: 2000
      },
      
      // Transcription error recovery
      {
        name: 'transcription_fallback',
        canRecover: (error) => error.code === 'TRANSCRIPTION_ERROR',
        recover: async (error, dispatch) => {
          // Try alternative transcription service
          dispatch({
            type: 'UPDATE_PREFERENCES',
            timestamp: new Date(),
            payload: {
              preferences: {
                transcriptionService: 'browser' // Fallback to browser
              }
            }
          });
          
          // Add notification about fallback
          dispatch({
            type: 'ADD_NOTIFICATION',
            timestamp: new Date(),
            payload: {
              notification: {
                id: crypto.randomUUID(),
                type: 'info',
                title: 'Servicio de transcripción cambiado',
                message: 'Se cambió al servicio del navegador debido a un error.',
                timestamp: new Date(),
                read: false,
                persistent: false
              }
            }
          });
          
          return true;
        },
        maxAttempts: 1,
        backoffMs: 0
      },
      
      // AI service recovery
      {
        name: 'ai_service_fallback',
        canRecover: (error) => error.code === 'AI_ERROR',
        recover: async (error, dispatch) => {
          // Downgrade AI mode for better reliability
          const consultationId = error.context?.consultationId as string;
          
          if (consultationId) {
            dispatch({
              type: 'UPDATE_AI_MODE',
              timestamp: new Date(),
              payload: {
                consultationId,
                mode: 'basic'
              }
            });
          }
          
          // Add notification about downgrade
          dispatch({
            type: 'ADD_NOTIFICATION',
            timestamp: new Date(),
            payload: {
              notification: {
                id: crypto.randomUUID(),
                type: 'warning',
                title: 'Modo IA reducido',
                message: 'Se cambió a modo básico debido a errores del servicio.',
                timestamp: new Date(),
                read: false,
                persistent: false
              }
            }
          });
          
          return true;
        },
        maxAttempts: 1,
        backoffMs: 0
      },
      
      // Storage error recovery
      {
        name: 'storage_cleanup',
        canRecover: (error) => error.code === 'STORAGE_ERROR',
        recover: async (error, dispatch) => {
          // Clear old data to free up storage
          dispatch({
            type: 'CLEAN_CACHE',
            timestamp: new Date(),
            payload: { force: true }
          });
          
          // Archive old consultations
          dispatch({
            type: 'ARCHIVE_OLD_CONSULTATIONS',
            timestamp: new Date(),
            payload: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
          });
          
          return true;
        },
        maxAttempts: 1,
        backoffMs: 0
      },
      
      // Permission error recovery
      {
        name: 'permission_request',
        canRecover: (error) => error.code === 'PERMISSION_ERROR',
        recover: async (error, dispatch) => {
          // Request permissions again
          try {
            if (error.context?.permission === 'microphone') {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
              
              dispatch({
                type: 'UPDATE_PERMISSIONS',
                timestamp: new Date(),
                payload: {
                  permissions: { microphone: true }
                }
              });
              
              return true;
            }
            
            if (error.context?.permission === 'notifications') {
              const permission = await Notification.requestPermission();
              
              dispatch({
                type: 'UPDATE_PERMISSIONS',
                timestamp: new Date(),
                payload: {
                  permissions: { notifications: permission === 'granted' }
                }
              });
              
              return permission === 'granted';
            }
          } catch (permissionError) {
            console.error('Permission recovery failed:', permissionError);
            return false;
          }
          
          return false;
        },
        maxAttempts: 2,
        backoffMs: 1000
      },
      
      // Memory pressure recovery
      {
        name: 'memory_pressure_relief',
        canRecover: (error) => error.context?.memoryPressure === true,
        recover: async (error, dispatch) => {
          // Aggressive memory cleanup
          dispatch({
            type: 'SET_PERFORMANCE_MODE',
            timestamp: new Date(),
            payload: { mode: 'battery_saver' }
          });
          
          dispatch({
            type: 'CLEAN_CACHE',
            timestamp: new Date(),
            payload: { force: true }
          });
          
          // Reduce AI cache
          const consultationId = error.context?.consultationId as string;
          if (consultationId) {
            dispatch({
              type: 'CLEAR_AI_CACHE',
              timestamp: new Date(),
              payload: { consultationId }
            });
          }
          
          return true;
        },
        maxAttempts: 1,
        backoffMs: 0
      }
    ];
  }
  
  async recoverFromError(
    error: MedicalError, 
    dispatch: (action: MedicalStateAction) => void
  ): Promise<boolean> {
    const errorKey = `${error.code}_${error.message}`;
    const attempts = this.recoveryAttempts.get(errorKey) || 0;
    
    // Find applicable recovery strategy
    const strategy = this.recoveryStrategies.find(s => s.canRecover(error));
    
    if (!strategy) {
      console.warn('No recovery strategy found for error:', error);
      return false;
    }
    
    if (attempts >= strategy.maxAttempts) {
      console.warn('Max recovery attempts exceeded for error:', error);
      this.recoveryAttempts.delete(errorKey);
      return false;
    }
    
    try {
      // Increment attempt counter
      this.recoveryAttempts.set(errorKey, attempts + 1);
      
      // Apply backoff delay
      if (strategy.backoffMs > 0 && attempts > 0) {
        const delay = strategy.backoffMs * Math.pow(2, attempts - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Attempt recovery
      const recovered = await strategy.recover(error, dispatch);
      
      if (recovered) {
        console.log(`Successfully recovered from error using strategy: ${strategy.name}`);
        this.recoveryAttempts.delete(errorKey);
        
        // Log successful recovery
        dispatch({
          type: 'LOG_ANALYTICS_EVENT',
          timestamp: new Date(),
          payload: {
            event: {
              type: 'error_recovery_success',
              timestamp: new Date(),
              sessionId: crypto.randomUUID(),
              data: {
                errorCode: error.code,
                strategy: strategy.name,
                attempts: attempts + 1
              }
            }
          }
        });
        
        return true;
      } else {
        console.log(`Recovery strategy ${strategy.name} failed for error:`, error);
        return false;
      }
    } catch (recoveryError) {
      console.error('Recovery strategy failed with error:', recoveryError);
      
      // Log failed recovery
      dispatch({
        type: 'LOG_ANALYTICS_EVENT',
        timestamp: new Date(),
        payload: {
          event: {
            type: 'error_recovery_failed',
            timestamp: new Date(),
            sessionId: crypto.randomUUID(),
            data: {
              errorCode: error.code,
              strategy: strategy.name,
              attempts: attempts + 1,
              recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown error'
            }
          }
        }
      });
      
      return false;
    }
  }
  
  private async waitForNetwork(): Promise<void> {
    if (navigator.onLine) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      
      window.addEventListener('online', handleOnline);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('online', handleOnline);
        resolve();
      }, 30000);
    });
  }
  
  // Create error with context
  createError(
    code: MedicalError['code'],
    message: string,
    context?: Record<string, unknown>,
    severity: MedicalError['severity'] = 'medium'
  ): MedicalError {
    return {
      id: crypto.randomUUID(),
      code,
      category: this.getCategoryFromCode(code),
      severity,
      message,
      context,
      timestamp: new Date(),
      recoverable: this.isRecoverable(code),
      recoveryStrategy: this.getRecoveryStrategy(code)
    };
  }
  
  private getCategoryFromCode(code: MedicalError['code']): MedicalError['category'] {
    switch (code) {
      case 'TRANSCRIPTION_ERROR':
      case 'AI_ERROR':
      case 'MEDICAL_VALIDATION_ERROR':
        return 'medical';
      case 'API_ERROR':
      case 'NETWORK_ERROR':
      case 'STORAGE_ERROR':
        return 'technical';
      case 'PERMISSION_ERROR':
        return 'user';
      default:
        return 'system';
    }
  }
  
  private isRecoverable(code: MedicalError['code']): boolean {
    const nonRecoverableCodes: MedicalError['code'][] = [];
    return !nonRecoverableCodes.includes(code);
  }
  
  private getRecoveryStrategy(code: MedicalError['code']): MedicalError['recoveryStrategy'] {
    const strategyMap: Record<MedicalError['code'], MedicalError['recoveryStrategy']> = {
      'NETWORK_ERROR': 'retry',
      'API_ERROR': 'retry',
      'TRANSCRIPTION_ERROR': 'fallback',
      'AI_ERROR': 'fallback',
      'PERMISSION_ERROR': 'user_action',
      'STORAGE_ERROR': 'fallback',
      'MEDICAL_VALIDATION_ERROR': 'user_action'
    };
    
    return strategyMap[code] || 'retry';
  }
  
  // Get error statistics
  getErrorStatistics(): {
    totalErrors: number;
    recoveredErrors: number;
    activeAttempts: number;
    errorsByCode: Record<string, number>;
  } {
    const activeAttempts = Array.from(this.recoveryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0);
    
    return {
      totalErrors: this.recoveryAttempts.size,
      recoveredErrors: 0, // Would need to track this separately
      activeAttempts,
      errorsByCode: {} // Would need to track this separately
    };
  }
  
  // Clear recovery attempts (cleanup)
  clearRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
  }
}