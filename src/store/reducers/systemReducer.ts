// System-specific reducer for global application state
import type { AppState, MedicalError, MedicalStateAction } from '../types';

export function systemReducer(
  state: AppState['system'],
  action: MedicalStateAction
): AppState['system'] {
  const act = action as MedicalStateAction;
  
  switch (act.type) {
    case 'SET_ONLINE_STATUS': {
      const { online } = act.payload;
      return {
        ...state,
        online,
        notifications: online ? state.notifications : [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            type: 'warning',
            title: 'Conexión perdida',
            message: 'Trabajando en modo offline. Los datos se sincronizarán cuando se restablezca la conexión.',
            timestamp: new Date(),
            read: false,
            persistent: true
          }
        ]
      };
    }
    
    case 'SET_LOADING': {
      const { loading } = act.payload;
      return {
        ...state,
        loading,
        initializing: loading ? state.initializing : false
      };
    }
    
    case 'ADD_ERROR': {
      const { error } = act.payload;
      const updatedErrors = [...state.errors];
      
      // Avoid duplicate errors within 5 minutes
      const isDuplicate = updatedErrors.some(existingError => 
        existingError.code === error.code &&
        existingError.message === error.message &&
        (new Date().getTime() - existingError.timestamp.getTime()) < 5 * 60 * 1000
      );
      
      if (isDuplicate) return state;
      
      updatedErrors.push(error);
      
      // Keep only recent errors for memory management
      if (updatedErrors.length > 50) {
        updatedErrors.splice(0, updatedErrors.length - 50);
      }
      
      // Add notification for critical errors
      const newNotifications = [...state.notifications];
      if (error.severity === 'critical' || error.severity === 'high') {
        newNotifications.push({
          id: crypto.randomUUID(),
          type: 'error',
          title: 'Error del sistema',
          message: error.message,
          timestamp: new Date(),
          read: false,
          persistent: error.severity === 'critical'
        });
      }
      
      return {
        ...state,
        errors: updatedErrors,
        notifications: newNotifications
      };
    }
    
    case 'CLEAR_ERROR': {
      const { errorId } = act.payload;
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== errorId)
      };
    }
    
    case 'UPDATE_PERFORMANCE': {
      const { metrics } = act.payload;
      const updatedMetrics = {
        ...state.performance.globalMetrics,
        ...metrics
      };
      
      // Check for performance warnings
      const newNotifications = [...state.notifications];
      
      if (metrics.memoryUsage && metrics.memoryUsage > state.performance.memoryThreshold * 0.8) {
        const existingMemoryWarning = newNotifications.find(n => 
          n.title.includes('Memoria') && !n.read
        );
        
        if (!existingMemoryWarning) {
          newNotifications.push({
            id: crypto.randomUUID(),
            type: 'warning',
            title: 'Uso elevado de memoria',
            message: 'El uso de memoria está por encima del 80%. Considere cerrar consultas inactivas.',
            timestamp: new Date(),
            read: false,
            persistent: false
          });
        }
      }
      
      if (metrics.aiResponseTime && metrics.aiResponseTime > 5000) {
        const existingPerformanceWarning = newNotifications.find(n => 
          n.title.includes('rendimiento') && !n.read
        );
        
        if (!existingPerformanceWarning) {
          newNotifications.push({
            id: crypto.randomUUID(),
            type: 'warning',
            title: 'Rendimiento lento',
            message: 'Las respuestas de IA están tardando más de lo esperado.',
            timestamp: new Date(),
            read: false,
            persistent: false
          });
        }
      }
      
      return {
        ...state,
        performance: {
          ...state.performance,
          globalMetrics: updatedMetrics
        },
        notifications: newNotifications
      };
    }
    
    case 'CLEAN_CACHE': {
      const { force } = act.payload;
      const now = new Date();
      
      // Calculate cache cleanup effectiveness
      const sizeBefore = state.cache.size;
      const estimatedSizeAfter = force ? 0 : Math.floor(sizeBefore * 0.3);
      
      return {
        ...state,
        cache: {
          ...state.cache,
          size: estimatedSizeAfter,
          lastCleaned: now,
          hitRate: force ? 0 : state.cache.hitRate * 0.9 // Reset hit rate if forced
        },
        notifications: force ? [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            type: 'info',
            title: 'Cache limpiado',
            message: 'Se ha liberado memoria limpiando el cache del sistema.',
            timestamp: now,
            read: false,
            persistent: false
          }
        ] : state.notifications
      };
    }
    
    case 'UPDATE_STORAGE_INFO': {
      const { used, available } = act.payload;
      const quota = used + available;
      const usagePercent = (used / quota) * 100;
      
      const newNotifications = [...state.notifications];
      
      // Warn if storage is getting full
      if (usagePercent > 85) {
        const existingStorageWarning = newNotifications.find(n => 
          n.title.includes('almacenamiento') && !n.read
        );
        
        if (!existingStorageWarning) {
          newNotifications.push({
            id: crypto.randomUUID(),
            type: 'warning',
            title: 'Almacenamiento casi lleno',
            message: `El almacenamiento está al ${Math.round(usagePercent)}%. Considere limpiar datos antiguos.`,
            timestamp: new Date(),
            read: false,
            persistent: true
          });
        }
      }
      
      return {
        ...state,
        storage: {
          ...state.storage,
          used,
          available,
          quota
        },
        notifications: newNotifications
      };
    }
    
    case 'SET_PERFORMANCE_MODE': {
      const { mode } = act.payload;
      
      // Adjust thresholds based on performance mode
      let memoryThreshold = state.performance.memoryThreshold;
      
      switch (mode) {
        case 'high':
          memoryThreshold = 300 * 1024 * 1024; // 300MB
          break;
        case 'balanced':
          memoryThreshold = 200 * 1024 * 1024; // 200MB
          break;
        case 'battery_saver':
          memoryThreshold = 100 * 1024 * 1024; // 100MB
          break;
      }
      
      return {
        ...state,
        performance: {
          ...state.performance,
          performanceMode: mode,
          memoryThreshold
        },
        notifications: [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            type: 'info',
            title: 'Modo de rendimiento cambiado',
            message: `Modo establecido a: ${mode === 'high' ? 'Alto rendimiento' : 
                     mode === 'balanced' ? 'Balanceado' : 'Ahorro de batería'}`,
            timestamp: new Date(),
            read: false,
            persistent: false
          }
        ]
      };
    }
    
    case 'DISMISS_NOTIFICATION': {
      const { notificationId } = act.payload;
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      };
    }
    
    case 'CLEAR_OLD_NOTIFICATIONS': {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return {
        ...state,
        notifications: state.notifications.filter(notification =>
          notification.persistent || 
          !notification.read || 
          notification.timestamp > oneHourAgo
        )
      };
    }
    
    case 'HYDRATE_STATE': {
      // Handle state rehydration from persistence
      const { payload } = act;
      
      if (payload.system) {
        return {
          ...state,
          ...payload.system,
          // Reset some runtime-only values
          online: navigator.onLine,
          loading: false,
          initializing: false,
          // Clear old errors and notifications
          errors: (payload.system.errors as MedicalError[])?.filter((error: MedicalError) =>
            new Date().getTime() - error.timestamp.getTime() < 24 * 60 * 60 * 1000
          ) || [],
          notifications: (payload.system.notifications as AppState['system']['notifications'])?.filter(
            (notification) =>
              notification.persistent ||
              new Date().getTime() - new Date(notification.timestamp).getTime() <
                60 * 60 * 1000
          ) || []
        };
      }
      
      return state;
    }
    
    case 'RESET_SYSTEM_STATE': {
      return {
        ...state,
        errors: [],
        notifications: [],
        cache: {
          size: 0,
          maxSize: state.cache.maxSize,
          hitRate: 0,
          lastCleaned: new Date()
        },
        performance: {
          ...state.performance,
          globalMetrics: {
            transcriptionLatency: 0,
            aiResponseTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            networkUsage: 0,
            storageUsage: 0
          }
        }
      };
    }
    
    default:
      return state;
  }
}
