// Unified state management store with performance optimizations
import { useMemo, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import type { 
  AppState, 
  MedicalStateAction, 
  StoreConfig, 
  PerformanceMetrics
} from './types';
import { consultationReducer } from './reducers/consultationReducer';
import { systemReducer } from './reducers/systemReducer';
import { userReducer } from './reducers/userReducer';
import { 
  createAuditMiddleware,
  createErrorMiddleware, 
  createPerformanceMiddleware,
  createPersistenceMiddleware
} from './middleware/index';
import { PerformanceManager } from './utils/performanceManager';
import { ErrorRecoveryManager } from './utils/errorRecoveryManager';
import { StorageManager } from './utils/storageManager';

// Default store configuration
const DEFAULT_CONFIG: StoreConfig = {
  persistenceKey: 'symfarmia_medical_state',
  persistenceVersion: 2,
  maxConsultations: 10,
  maxErrors: 50,
  performanceThresholds: {
    memoryWarning: 150 * 1024 * 1024, // 150MB
    memoryLimit: 200 * 1024 * 1024,   // 200MB
    responseTimeWarning: 3000,         // 3 seconds
    batteryWarning: 0.2               // 20% battery
  },
  cacheConfig: {
    maxSize: 50 * 1024 * 1024,        // 50MB
    ttl: 30 * 60 * 1000,              // 30 minutes
    cleanupInterval: 5 * 60 * 1000     // 5 minutes
  },
  analyticsConfig: {
    maxEvents: 1000,
    batchSize: 50,
    flushInterval: 60 * 1000          // 1 minute
  }
};

// Initial application state
const createInitialState = (): AppState => ({
  consultations: {
    active: {},
    archived: {},
    current: undefined,
    history: []
  },
  user: {
    preferences: {
      theme: 'auto',
      language: 'es',
      notifications: true,
      autoSave: true,
      transcriptionService: 'browser',
      aiModel: 'advanced',
      dataRetention: 30
    },
    permissions: {
      microphone: false,
      notifications: false
    },
    statistics: {
      totalConsultations: 0,
      totalDuration: 0,
      averageSessionLength: 0,
      lastActivity: new Date()
    }
  },
  system: {
    online: navigator.onLine,
    loading: false,
    initializing: true,
    errors: [],
    notifications: [],
    performance: {
      globalMetrics: {
        transcriptionLatency: 0,
        aiResponseTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkUsage: 0,
        storageUsage: 0
      },
      memoryThreshold: DEFAULT_CONFIG.performanceThresholds.memoryLimit,
      performanceMode: 'balanced'
    },
    cache: {
      size: 0,
      maxSize: DEFAULT_CONFIG.cacheConfig.maxSize,
      hitRate: 0,
      lastCleaned: new Date()
    },
    storage: {
      used: 0,
      available: 0,
      quota: 0,
      persistent: false
    }
  },
  analytics: {
    events: [],
    session: {
      id: crypto.randomUUID(),
      startTime: new Date(),
      pageViews: 1,
      interactions: 0
    },
    performance: {
      loadTime: 0,
      renderMetrics: {},
      errorRate: 0
    }
  }
});

// Combined reducer with error boundaries
function rootReducer(state: AppState, action: MedicalStateAction): AppState {
  try {
    // Route actions to appropriate reducers
    let newState = state;
    
    // System actions
    if (action.type.startsWith('SET_') || action.type.includes('SYSTEM') || action.type.includes('ERROR') || action.type.includes('PERFORMANCE')) {
      newState = { ...newState, system: systemReducer(newState.system, action) };
    }
    
    // User actions
    if (action.type.includes('USER') || action.type.includes('PREFERENCES') || action.type.includes('PERMISSIONS')) {
      newState = { ...newState, user: userReducer(newState.user, action) };
    }
    
    // Consultation actions
    if (action.type.includes('CONSULTATION') || action.type.includes('TRANSCRIPTION') || action.type.includes('AI') || action.type.includes('SOAP')) {
      const consultationResult = consultationReducer(newState.consultations, action);
      newState = { ...newState, consultations: consultationResult };
    }
    
    // Update global statistics
    newState = updateGlobalStatistics(newState, action);
    
    return newState;
  } catch (error) {
    console.error('Reducer error:', error);
    
    // Create error action
    const errorAction: MedicalStateAction = {
      type: 'ADD_ERROR',
      timestamp: new Date(),
      payload: {
        error: {
          id: crypto.randomUUID(),
          code: 'SYSTEM_ERROR',
          category: 'system',
          severity: 'high',
          message: error instanceof Error ? error.message : 'Unknown reducer error',
          context: { action: action.type, timestamp: action.timestamp },
          timestamp: new Date(),
          recoverable: true,
          recoveryStrategy: 'retry'
        }
      }
    };
    
    // Return state with error added
    return {
      ...state,
      system: {
        ...state.system,
        errors: [...state.system.errors.slice(-DEFAULT_CONFIG.maxErrors + 1), errorAction.payload.error]
      }
    };
  }
}

// Update global statistics based on actions
function updateGlobalStatistics(state: AppState, action: MedicalStateAction): AppState {
  const now = new Date();
  
  // Update user statistics
  const newUserStats = { ...state.user.statistics };
  
  if (action.type === 'END_CONSULTATION') {
    newUserStats.totalConsultations += 1;
    newUserStats.lastActivity = now;
  }
  
  // Update analytics
  const newAnalytics = { ...state.analytics };
  
  if (action.meta?.source === 'user') {
    newAnalytics.session.interactions += 1;
  }
  
  return {
    ...state,
    user: {
      ...state.user,
      statistics: newUserStats
    },
    analytics: newAnalytics
  };
}

// Enhanced store hook with performance optimizations
export function useMedicalStore(config: Partial<StoreConfig> = {}) {
  const storeConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // Managers
  const storageManager = useRef(new StorageManager(storeConfig.persistenceKey));
  const performanceManager = useRef(new PerformanceManager(storeConfig.performanceThresholds));
  const errorRecoveryManager = useRef(new ErrorRecoveryManager());
  
  // Load persisted state
  const loadPersistedState = useCallback(async (): Promise<Partial<AppState>> => {
    try {
      return await storageManager.current!.loadState();
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
      return {};
    }
  }, []);
  
  // Initialize state with persistence
  const [state, dispatch] = useReducer(rootReducer, createInitialState());
  const [initialized, setInitialized] = useState(false);
  
  // Load persisted state on mount
  useEffect(() => {
    let mounted = true;
    const perfManager = performanceManager.current;
    
    const initializeStore = async () => {
      try {
        const persistedState = await loadPersistedState();
        
        if (mounted && Object.keys(persistedState).length > 0) {
          dispatch({
            type: 'HYDRATE_STATE',
            timestamp: new Date(),
            payload: persistedState
          });
        }
        
        // Initialize performance monitoring
        perfManager!.startMonitoring();
        
        if (mounted) {
          setInitialized(true);
          dispatch({
            type: 'SET_LOADING',
            timestamp: new Date(),
            payload: { loading: false }
          });
        }
      } catch (error) {
        console.error('Store initialization error:', error);
        if (mounted) {
          setInitialized(true);
          dispatch({
            type: 'ADD_ERROR',
            timestamp: new Date(),
            payload: {
              error: {
                id: crypto.randomUUID(),
                code: 'SYSTEM_ERROR',
                category: 'system',
                severity: 'medium',
                message: 'Failed to initialize store',
                timestamp: new Date(),
                recoverable: true,
                recoveryStrategy: 'retry'
              }
            }
          });
        }
      }
    };
    
    initializeStore();
    
    return () => {
        mounted = false;
        perfManager!.stopMonitoring();
    };
  }, [loadPersistedState]);
  
  // Create middleware-enhanced dispatch
  const middlewares = useMemo(() => [
    createAuditMiddleware(storeConfig),
    createErrorMiddleware(errorRecoveryManager.current!),
    createPerformanceMiddleware(performanceManager.current!),
    createPersistenceMiddleware(storageManager.current!)
  ], [storeConfig]);
  
  const enhancedDispatch = useCallback((action: MedicalStateAction) => {
    let result = action;
    
    // Apply middleware chain
    const middlewareAPI = {
      getState: () => state,
      dispatch: enhancedDispatch
    };
    
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    const composed = chain.reduceRight((a, b) => (...args) => a(b(...args)));
    
    try {
      result = composed(dispatch)(action) as unknown as MedicalStateAction;
    } catch (error) {
      console.error('Middleware error:', error);
      // Fallback to direct dispatch
      result = dispatch(action) as unknown as MedicalStateAction;
    }
    
    return result;
  }, [state, middlewares]);
  
  // Memory management
  useEffect(() => {
    const memoryCleanup = setInterval(() => {
      const memoryUsage = performanceManager.current!.getMemoryUsage();
      
      if (memoryUsage > storeConfig.performanceThresholds.memoryWarning) {
        dispatch({
          type: 'CLEAN_CACHE',
          timestamp: new Date(),
          payload: { force: memoryUsage > storeConfig.performanceThresholds.memoryLimit }
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(memoryCleanup);
  }, [storeConfig.performanceThresholds]);
  
  // Online/offline handling
  useEffect(() => {
    const handleOnline = () => dispatch({
      type: 'SET_ONLINE_STATUS',
      timestamp: new Date(),
      payload: { online: true }
    });
    
    const handleOffline = () => dispatch({
      type: 'SET_ONLINE_STATUS',
      timestamp: new Date(),
      payload: { online: false }
    });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Error recovery
  const recoverFromError = useCallback(async (errorId: string) => {
    const error = state.system.errors.find(e => e.id === errorId);
    if (!error) return;
    
    try {
      await errorRecoveryManager.current!.recoverFromError(error, enhancedDispatch);
      
      dispatch({
        type: 'CLEAR_ERROR',
        timestamp: new Date(),
        payload: { errorId }
      });
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError);
    }
  }, [state.system.errors, enhancedDispatch]);
  
  // Performance optimization utilities
  const optimizeForMobile = useCallback(() => {
    dispatch({
      type: 'SET_PERFORMANCE_MODE',
      timestamp: new Date(),
      payload: { mode: 'battery_saver' }
    });
  }, []);
  
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    return performanceManager.current!.getMetrics();
  }, []);
  
  return {
    state,
    dispatch: enhancedDispatch,
    initialized,
    
    // Utility functions
    recoverFromError,
    optimizeForMobile,
    getPerformanceMetrics,
    
    // Storage management
    clearStorage: () => storageManager.current!.clearStorage(),
    exportState: () => storageManager.current!.exportState(state),
    importState: (importedState: Partial<AppState>) => dispatch({
      type: 'HYDRATE_STATE',
      timestamp: new Date(),
      payload: importedState
    }),
    
    // Cache management
    clearCache: () => dispatch({
      type: 'CLEAN_CACHE',
      timestamp: new Date(),
      payload: { force: true }
    }),
    
    // Debug utilities
    getStorageInfo: () => storageManager.current!.getStorageInfo(),
    getMemoryUsage: () => performanceManager.current!.getMemoryUsage(),
    getCacheStats: () => ({
      size: state.system.cache.size,
      hitRate: state.system.cache.hitRate,
      lastCleaned: state.system.cache.lastCleaned
    })
  };
}

// Selector hooks for optimized component updates
export function useConsultationSelector<T>(
  selector: (consultations: AppState['consultations']) => T,
  _equalityFn?: (a: T, b: T) => boolean
): T {
  const { state } = useMedicalStore();
  
  return useMemo(() => selector(state.consultations), [
    state.consultations,
    selector
  ]);
}

export function useSystemSelector<T>(
  selector: (system: AppState['system']) => T,
  _equalityFn?: (a: T, b: T) => boolean
): T {
  const { state } = useMedicalStore();
  
  return useMemo(() => selector(state.system), [
    state.system,
    selector
  ]);
}

export function useUserSelector<T>(
  selector: (user: AppState['user']) => T,
  _equalityFn?: (a: T, b: T) => boolean
): T {
  const { state } = useMedicalStore();
  
  return useMemo(() => selector(state.user), [
    state.user,
    selector
  ]);
}