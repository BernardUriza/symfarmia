// Performance tracking middleware for monitoring state operations
import { StateCreator } from 'zustand';
import { PerformanceMetric } from '../types';

interface PerformanceState {
  performanceMetrics: PerformanceMetric[];
}

interface PerformanceActions {
  recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => void;
  getMetrics: (action?: string) => PerformanceMetric[];
  getAveragePerformance: (action: string) => number;
  clearMetrics: () => void;
}

type PerformanceMiddleware = <T extends object>(
  config: StateCreator<T & PerformanceState & PerformanceActions, [], [], T>
) => StateCreator<T & PerformanceState & PerformanceActions>;

export const performanceMiddleware: PerformanceMiddleware = (config) => (set, get, api) => {
  const performanceConfig = config(
    (partial, replace, actionName) => {
      const start = performance.now();
      
      // Apply the state change
      set(partial, replace);
      
      const duration = performance.now() - start;
      
      // Record performance metric
      if (actionName) {
        const metric: PerformanceMetric = {
          action: actionName,
          duration,
          timestamp: Date.now(),
          metadata: {
            type: replace ? 'replace' : 'partial',
            stateSize: JSON.stringify(get()).length
          }
        };
        
        // Add to performance metrics
        const currentState = get() as any;
        if (currentState.performanceMetrics) {
          set(
            {
              performanceMetrics: [...currentState.performanceMetrics, metric]
            } as any,
            false
          );
        }
        
        // Warn about slow operations
        if (duration > 100) {
          console.warn(`⚠️ Slow operation detected: ${actionName} took ${duration.toFixed(2)}ms`);
        }
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development' && duration > 50) {
          console.log(`📊 Performance: ${actionName} - ${duration.toFixed(2)}ms`);
        }
      }
    },
    get,
    api
  );
  
  // Add performance-specific methods
  return {
    ...performanceConfig,
    performanceMetrics: [],
    
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => {
      const fullMetric: PerformanceMetric = {
        ...metric,
        timestamp: Date.now()
      };
      
      set((state: any) => ({
        performanceMetrics: [...(state.performanceMetrics || []), fullMetric]
      }));
    },
    
    getMetrics: (action?: string) => {
      const state = get() as any;
      const metrics = state.performanceMetrics || [];
      
      if (action) {
        return metrics.filter((metric: PerformanceMetric) => metric.action === action);
      }
      
      return metrics;
    },
    
    getAveragePerformance: (action: string) => {
      const state = get() as any;
      const metrics = (state.performanceMetrics || []).filter(
        (metric: PerformanceMetric) => metric.action === action
      );
      
      if (metrics.length === 0) return 0;
      
      const totalDuration = metrics.reduce(
        (sum: number, metric: PerformanceMetric) => sum + metric.duration,
        0
      );
      
      return totalDuration / metrics.length;
    },
    
    clearMetrics: () => {
      set((state: any) => ({
        performanceMetrics: []
      }));
    }
  };
};

export type { PerformanceMiddleware, PerformanceState, PerformanceActions };