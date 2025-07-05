// Middleware factory functions - simplified implementations
import type { AppState, MedicalStateAction, StoreConfig } from '../types';
import { PerformanceManager } from '../utils/performanceManager';
import { ErrorRecoveryManager } from '../utils/errorRecoveryManager';

export function createAuditMiddleware(_config: StoreConfig) {
  return (_store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) =>
    (next: (action: MedicalStateAction) => void) =>
    (action: MedicalStateAction) => {
      // Simple audit logging
      if (action.type.includes('CONSULTATION') || action.type.includes('MEDICAL')) {
        console.log(`Audit: ${action.type} at ${new Date().toISOString()}`);
      }
      return next(action);
    };
}

export function createErrorMiddleware(errorManager: ErrorRecoveryManager) {
  return (store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) =>
    (next: (action: MedicalStateAction) => void) =>
    (action: MedicalStateAction) => {
      try {
        return next(action);
      } catch (error) {
        console.error('Middleware error:', error);
        const medicalError = errorManager.createError(
          'SYSTEM_ERROR',
          error instanceof Error ? error.message : 'Unknown error',
          { action },
          'medium'
        );
        
        store.dispatch({
          type: 'ADD_ERROR',
          timestamp: new Date(),
          payload: { error: medicalError }
        });
        
        return next(action);
      }
    };
}

export function createPerformanceMiddleware(performanceManager: PerformanceManager) {
  return (_store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) =>
    (next: (action: MedicalStateAction) => void) =>
    (action: MedicalStateAction) => {
      const startTime = performance.now();
      const result = next(action);
      const endTime = performance.now();
      
      performanceManager.updateMetric('renderTime', endTime - startTime);
      
      return result;
    };
}

export function createPersistenceMiddleware(_storageManager: unknown) {
  return (store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) =>
    (next: (action: MedicalStateAction) => void) =>
    (action: MedicalStateAction) => {
      const result = next(action);
      
      // Skip saving for certain action types
      const skipSaveActions = [
        'UPDATE_LIVE_TRANSCRIPT',
        'UPDATE_AUDIO_LEVEL',
        'SET_LOADING'
      ];
      
      if (!skipSaveActions.includes(action.type)) {
        // Debounced save would be implemented here
        setTimeout(() => {
          try {
            localStorage.setItem('medical_state_simple', JSON.stringify(store.getState()));
          } catch (error) {
            console.warn('Failed to persist state:', error);
          }
        }, 1000);
      }
      
      return result;
    };
}