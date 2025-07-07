// User-specific reducer for preferences and statistics
import type { AppState, MedicalStateAction } from '../types';

export function userReducer(
  state: AppState['user'],
  action: MedicalStateAction
): AppState['user'] {
  switch (action.type) {
    case 'UPDATE_PREFERENCES': {
      const { preferences } = action.payload as { preferences: any };
      
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...preferences
        }
      };
    }
    
    case 'UPDATE_PERMISSIONS': {
      const { permissions } = action.payload as { permissions: any };
      
      return {
        ...state,
        permissions: {
          ...state.permissions,
          ...permissions
        }
      };
    }
    
    case 'LOG_ANALYTICS_EVENT': {
      const { event } = action.payload as { event: any };
      
      // Update user statistics based on event type
      const newStatistics = { ...state.statistics };
      
      switch (event.type) {
        case 'consultation_started':
          // Statistics updated in consultation reducer
          break;
          
        case 'consultation_completed':
          newStatistics.totalConsultations += 1;
          newStatistics.lastActivity = new Date();
          
          if (event.duration) {
            const totalDuration = newStatistics.totalDuration + event.duration;
            newStatistics.totalDuration = totalDuration;
            newStatistics.averageSessionLength = totalDuration / newStatistics.totalConsultations;
          }
          break;
          
        case 'user_interaction':
          newStatistics.lastActivity = new Date();
          break;
      }
      
      return {
        ...state,
        statistics: newStatistics
      };
    }
    
    case 'RESET_USER_STATISTICS': {
      return {
        ...state,
        statistics: {
          totalConsultations: 0,
          totalDuration: 0,
          averageSessionLength: 0,
          lastActivity: new Date()
        }
      };
    }
    
    case 'UPDATE_USER_PROFILE': {
      const { profile } = action.payload as { profile: any };
      
      return {
        ...state,
        id: profile.id || state.id,
        // Add other profile fields as needed
      };
    }
    
    case 'HYDRATE_STATE': {
      // Handle state rehydration from persistence
      const payload = action.payload as any;
      
      if (payload.user) {
        return {
          ...state,
          ...payload.user,
          // Ensure valid dates
          statistics: {
            ...state.statistics,
            ...payload.user.statistics,
            lastActivity: new Date(payload.user.statistics?.lastActivity || new Date())
          }
        };
      }
      
      return state;
    }
    
    case 'EXPORT_USER_DATA': {
      // Prepare user data for export (GDPR compliance)
      return state; // No state change, just trigger export
    }
    
    case 'DELETE_USER_DATA': {
      // Reset all user data (GDPR compliance)
      return {
        id: undefined,
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
      };
    }
    
    default:
      return state;
  }
}
