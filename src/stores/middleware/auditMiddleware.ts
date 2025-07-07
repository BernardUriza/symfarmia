// Audit middleware for HIPAA compliance
import { StateCreator } from 'zustand';
import { AuditLog } from '../types';

interface AuditState {
  auditLogs: AuditLog[];
}

interface AuditActions {
  logAction: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getAuditLogs: (resourceId?: string) => AuditLog[];
}

type AuditMiddleware = <T extends object>(
  config: StateCreator<T & AuditState & AuditActions, [], [], T>
) => StateCreator<T & AuditState & AuditActions>;

// Get current user ID (implement based on your auth system)
const getCurrentUserId = (): string | null => {
  // This should integrate with your Auth0 or authentication system
  return typeof window !== 'undefined' ? localStorage.getItem('currentUserId') : null;
};

// Get client IP (for audit purposes)
const getClientIP = (): string | undefined => {
  // In a real implementation, this would come from your API
  return undefined;
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Simple diff function for tracking changes
const diff = (prevState: any, nextState: any): Record<string, any> => {
  const changes: Record<string, any> = {};
  
  for (const key in nextState) {
    if (prevState[key] !== nextState[key]) {
      changes[key] = {
        from: prevState[key],
        to: nextState[key]
      };
    }
  }
  
  return changes;
};

export const auditMiddleware: AuditMiddleware = (config) => (set, get, api) => {
  const auditConfig = config(
    (partial, replace, actionName) => {
      const prevState = get();
      
      // Apply the state change
      set(partial, replace);
      
      const nextState = get();
      const userId = getCurrentUserId();
      
      // Create audit log entry
      const auditLog: AuditLog = {
        id: generateId(),
        action: actionName || 'unknown_action',
        timestamp: Date.now(),
        userId,
        ipAddress: getClientIP(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        changes: diff(prevState, nextState),
        resourceType: 'system', // Default, should be overridden
        resourceId: undefined
      };
      
      // Add audit log to state (if it has audit logs)
      const currentState = get() as any;
      if (currentState.auditLogs) {
        set(
          {
            auditLogs: [...currentState.auditLogs, auditLog]
          } as any,
          false
        );
      }
      
      // Log to external audit system if needed
      if (process.env.NODE_ENV === 'production') {
        console.log('AUDIT:', auditLog);
        // Here you would send to your audit logging service
        // auditLogger.send(auditLog);
      }
    },
    get,
    api
  );
  
  // Add audit-specific methods
  return {
    ...auditConfig,
    auditLogs: [],
    
    logAction: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const auditLog: AuditLog = {
        ...log,
        id: generateId(),
        timestamp: Date.now(),
        userId: log.userId || getCurrentUserId()
      };
      
      set((state: any) => ({
        auditLogs: [...(state.auditLogs || []), auditLog]
      }));
    },
    
    getAuditLogs: (resourceId?: string) => {
      const state = get() as any;
      const logs = state.auditLogs || [];
      
      if (resourceId) {
        return logs.filter((log: AuditLog) => log.resourceId === resourceId);
      }
      
      return logs;
    }
  };
};

export type { AuditMiddleware, AuditState, AuditActions };