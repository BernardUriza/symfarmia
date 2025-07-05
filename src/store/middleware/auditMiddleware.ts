// @ts-nocheck
// Audit logging middleware for medical compliance and security
import type { AppState, MedicalStateAction } from '../types';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  category: 'medical' | 'security' | 'privacy' | 'system' | 'user';
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  sessionId: string;
  consultationId?: string;
  patientId?: string;
  details: Record<string, unknown>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    version: string;
  };
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    dataRetention: number; // Days to retain
    anonymized: boolean;
  };
}

export interface AuditConfig {
  enableLogging: boolean;
  logLevel: 'info' | 'warning' | 'critical';
  bufferSize: number;
  flushInterval: number; // ms
  retentionDays: number;
  anonymizeData: boolean;
  encryptLogs: boolean;
  remoteEndpoint?: string;
  localStorageKey: string;
}

export class AuditMiddleware {
  private config: AuditConfig;
  private auditBuffer: AuditEvent[] = [];
  private flushTimer?: number;
  private sessionId: string;
  private deviceInfo: Record<string, unknown>;
  
  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      enableLogging: true,
      logLevel: 'info',
      bufferSize: 100,
      flushInterval: 30000, // 30 seconds
      retentionDays: 365, // 1 year for medical records
      anonymizeData: false,
      encryptLogs: true,
      localStorageKey: 'symfarmia_audit_logs',
      ...config
    };
    
    this.sessionId = crypto.randomUUID();
    this.deviceInfo = this.detectDeviceInfo();
    
    if (this.config.enableLogging) {
      this.startPeriodicFlush();
      this.setupUnloadHandler();
    }
  }
  
  // Middleware function
  middleware = (store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) => 
    (next: (action: MedicalStateAction) => void) => 
    (action: MedicalStateAction) => {
      
      if (!this.config.enableLogging) {
        return next(action);
      }
      
      // Log action before processing
      this.logAction(action, store.getState());
      
      // Process action
      const result = next(action);
      
      // Log any state changes that require special audit attention
      this.logPostActionState(action, store.getState());
      
      return result;
    };
  
  private logAction(action: MedicalStateAction, state: AppState): void {
    const auditEvent = this.createAuditEvent(action, state);
    
    if (this.shouldLogAction(action, auditEvent)) {
      this.addToBuffer(auditEvent);
    }
  }
  
  private createAuditEvent(action: MedicalStateAction, state: AppState): AuditEvent {
    const category = this.categorizeAction(action.type);
    const severity = this.determineSeverity(action.type, action.payload);
    
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: action.type,
      category,
      severity,
      userId: state.user.id,
      sessionId: this.sessionId,
      consultationId: this.extractConsultationId(action),
      patientId: this.extractPatientId(action, state),
      details: this.sanitizeActionPayload(action.payload, category),
      metadata: {
        userAgent: navigator.userAgent,
        deviceType: this.deviceInfo.type,
        version: '1.0.0', // App version
        ...this.deviceInfo
      },
      compliance: {
        gdpr: true,
        hipaa: true,
        dataRetention: this.getRetentionPeriod(category, severity),
        anonymized: this.config.anonymizeData
      }
    };
    
    return event;
  }
  
  private categorizeAction(actionType: string): AuditEvent['category'] {
    // Medical actions
    if (actionType.includes('CONSULTATION') || 
        actionType.includes('SOAP') || 
        actionType.includes('DIAGNOSIS') || 
        actionType.includes('TREATMENT') || 
        actionType.includes('SYMPTOM') || 
        actionType.includes('VITAL') ||
        actionType.includes('TRANSCRIPTION')) {
      return 'medical';
    }
    
    // Security actions
    if (actionType.includes('AUTH') || 
        actionType.includes('PERMISSION') || 
        actionType.includes('LOGIN') || 
        actionType.includes('LOGOUT')) {
      return 'security';
    }
    
    // Privacy actions
    if (actionType.includes('DELETE_USER_DATA') || 
        actionType.includes('EXPORT_USER_DATA') || 
        actionType.includes('GDPR') ||
        actionType.includes('ANONYMIZE')) {
      return 'privacy';
    }
    
    // User actions
    if (actionType.includes('USER') || 
        actionType.includes('PREFERENCES') || 
        actionType.includes('PROFILE')) {
      return 'user';
    }
    
    // System actions (default)
    return 'system';
  }
  
  private determineSeverity(actionType: string, _payload: unknown): AuditEvent['severity'] {
    // Critical actions
    const criticalActions = [
      'DELETE_USER_DATA',
      'DELETE_CONSULTATION',
      'DELETE_PATIENT_DATA',
      'ADMIN_OVERRIDE',
      'SECURITY_BREACH',
      'DATA_EXPORT'
    ];
    
    if (criticalActions.some(action => actionType.includes(action))) {
      return 'critical';
    }
    
    // Warning actions
    const warningActions = [
      'ERROR',
      'FAILED_LOGIN',
      'PERMISSION_DENIED',
      'VALIDATION_ERROR',
      'COMPLIANCE_WARNING'
    ];
    
    if (warningActions.some(action => actionType.includes(action))) {
      return 'warning';
    }
    
    // High-value medical actions
    if (actionType.includes('DIAGNOSIS') || 
        actionType.includes('TREATMENT') || 
        actionType.includes('PRESCRIPTION')) {
      return 'warning';
    }
    
    return 'info';
  }
  
  private extractConsultationId(action: MedicalStateAction): string | undefined {
    if (action.payload && typeof action.payload === 'object') {
      const payload = action.payload as Record<string, unknown>;
      return (payload.consultationId as string) || ((payload.consultation as Record<string, unknown>)?.id as string);
    }
    return undefined;
  }
  
  private extractPatientId(action: MedicalStateAction, state: AppState): string | undefined {
    const consultationId = this.extractConsultationId(action);
    if (consultationId && state.consultations.active[consultationId]) {
      return state.consultations.active[consultationId].patient.id;
    }
    
    if (action.payload && typeof action.payload === 'object') {
      const payload = action.payload as Record<string, unknown>;
      return (payload.patientId as string) || ((payload.patient as Record<string, unknown>)?.id as string);
    }
    
    return undefined;
  }
  
  private sanitizeActionPayload(payload: unknown, category: AuditEvent['category']): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || payload === null) {
      return { payload };
    }
    
    const sanitized = { ...(payload as Record<string, unknown>) };
    
    // Remove sensitive data based on category
    if (category === 'medical') {
      // Keep medical relevance but remove PII if anonymization is enabled
      if (this.config.anonymizeData) {
        delete sanitized.patientName;
        delete sanitized.patientEmail;
        delete sanitized.personalInfo;
        
        // Hash patient ID for tracking while maintaining anonymity
        if (sanitized.patientId) {
          sanitized.patientId = this.hashValue(sanitized.patientId);
        }
      }
    }
    
    if (category === 'security') {
      // Remove sensitive security information
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.apiKey;
      delete sanitized.credentials;
    }
    
    // Always remove large objects to prevent log bloat
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (typeof value === 'object' && value !== null) {
        const jsonString = JSON.stringify(value);
        if (jsonString.length > 1000) {
          sanitized[key] = `[Large object: ${jsonString.length} chars]`;
        }
      }
    });
    
    return sanitized;
  }
  
  private getRetentionPeriod(category: AuditEvent['category'], severity: AuditEvent['severity']): number {
    // Medical records typically require longer retention
    if (category === 'medical') {
      return 2555; // 7 years for medical records
    }
    
    // Security incidents require extended retention
    if (category === 'security' && severity === 'critical') {
      return 1095; // 3 years for security incidents
    }
    
    // Privacy actions require shorter retention
    if (category === 'privacy') {
      return 90; // 3 months
    }
    
    return this.config.retentionDays;
  }
  
  private shouldLogAction(action: MedicalStateAction, auditEvent: AuditEvent): boolean {
    // Check log level
    const severityLevels = { info: 0, warning: 1, critical: 2 };
    const configLevel = severityLevels[this.config.logLevel];
    const eventLevel = severityLevels[auditEvent.severity];
    
    if (eventLevel < configLevel) {
      return false;
    }
    
    // Skip frequent, low-value actions to prevent log spam
    const skipActions = [
      'UPDATE_LIVE_TRANSCRIPT',
      'UPDATE_AUDIO_LEVEL',
      'UPDATE_PERFORMANCE',
      'SET_LOADING'
    ];
    
    if (skipActions.includes(action.type)) {
      return false;
    }
    
    return true;
  }
  
  private logPostActionState(action: MedicalStateAction, state: AppState): void {
    // Log special state changes that require audit attention
    
    // Compliance violations
    if (this.detectComplianceViolation(state)) {
      this.addToBuffer({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'COMPLIANCE_VIOLATION_DETECTED',
        category: 'privacy',
        severity: 'critical',
        userId: state.user.id,
        sessionId: this.sessionId,
        details: { 
          violation: 'Data retention or privacy policy violation detected',
          relatedAction: action.type
        },
        metadata: this.createMetadata(),
        compliance: {
          gdpr: false,
          hipaa: false,
          dataRetention: 2555,
          anonymized: false
        }
      });
    }
    
    // Security anomalies
    if (this.detectSecurityAnomaly(action, state)) {
      this.addToBuffer({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'SECURITY_ANOMALY_DETECTED',
        category: 'security',
        severity: 'warning',
        userId: state.user.id,
        sessionId: this.sessionId,
        details: { 
          anomaly: 'Unusual user behavior or system access pattern detected',
          relatedAction: action.type
        },
        metadata: this.createMetadata(),
        compliance: {
          gdpr: true,
          hipaa: true,
          dataRetention: 1095,
          anonymized: this.config.anonymizeData
        }
      });
    }
  }
  
  private detectComplianceViolation(state: AppState): boolean {
    // Check data retention policies
    const now = new Date();
    
    // Check if user data exceeds retention period
    if (state.user.statistics.lastActivity) {
      const daysSinceActivity = (now.getTime() - state.user.statistics.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity > this.config.retentionDays) {
        return true;
      }
    }
    
    // Check archived consultations for retention violations
    const archivedConsultations = Object.values(state.consultations.archived);
    for (const consultation of archivedConsultations) {
      const daysSinceArchive = (now.getTime() - consultation.metadata.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceArchive > 2555) { // 7 years medical retention
        return true;
      }
    }
    
    return false;
  }
  
  private detectSecurityAnomaly(action: MedicalStateAction, state: AppState): boolean {
    // Simple anomaly detection
    
    // Multiple failed attempts in short time
    if (action.type.includes('ERROR') || action.type.includes('FAILED')) {
      const recentErrors = state.system.errors.filter(error => {
        const timeDiff = new Date().getTime() - error.timestamp.getTime();
        return timeDiff < 5 * 60 * 1000; // Last 5 minutes
      });
      
      if (recentErrors.length > 5) {
        return true;
      }
    }
    
    // Unusual access patterns (accessing multiple consultations quickly)
    if (action.type === 'START_CONSULTATION') {
      const recentActivity = state.consultations.history.slice(0, 5);
      if (recentActivity.length >= 5) {
        return true; // Started 5 consultations recently
      }
    }
    
    return false;
  }
  
  private createMetadata(): AuditEvent['metadata'] {
    return {
      userAgent: navigator.userAgent,
      deviceType: this.deviceInfo.type,
      version: '1.0.0',
      ...this.deviceInfo
    };
  }
  
  private detectDeviceInfo(): Record<string, unknown> {
    const userAgent = navigator.userAgent;
    
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    
    return {
      type: deviceType,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth
    };
  }
  
  private addToBuffer(event: AuditEvent): void {
    this.auditBuffer.push(event);
    
    // Flush if buffer is full
    if (this.auditBuffer.length >= this.config.bufferSize) {
      this.flushBuffer();
    }
  }
  
  private startPeriodicFlush(): void {
    this.flushTimer = window.setInterval(() => {
      if (this.auditBuffer.length > 0) {
        this.flushBuffer();
      }
    }, this.config.flushInterval);
  }
  
  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.flushBuffer();
    });
    
    // Also handle visibility change for mobile
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.auditBuffer.length > 0) {
        this.flushBuffer();
      }
    });
  }
  
  private async flushBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;
    
    const eventsToFlush = [...this.auditBuffer];
    this.auditBuffer = [];
    
    try {
      // Encrypt logs if required
      const logsToStore = this.config.encryptLogs 
        ? await this.encryptLogs(eventsToFlush)
        : eventsToFlush;
      
      // Store locally
      await this.storeLogsLocally(logsToStore);
      
      // Send to remote endpoint if configured
      if (this.config.remoteEndpoint) {
        await this.sendLogsRemotely(eventsToFlush);
      }
      
      console.log(`Flushed ${eventsToFlush.length} audit events`);
      
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      
      // Return events to buffer for retry
      this.auditBuffer.unshift(...eventsToFlush);
    }
  }
  
  private async storeLogsLocally(events: AuditEvent[]): Promise<void> {
    try {
      const existingLogs = JSON.parse(localStorage.getItem(this.config.localStorageKey) || '[]');
      const allLogs = [...existingLogs, ...events];
      
      // Clean old logs based on retention policy
      const now = new Date();
      const validLogs = allLogs.filter(log => {
        const daysDiff = (now.getTime() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= log.compliance.dataRetention;
      });
      
      // Limit total stored logs to prevent storage overflow
      const recentLogs = validLogs.slice(-1000); // Keep last 1000 logs
      
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(recentLogs));
      
    } catch (error) {
      console.error('Failed to store audit logs locally:', error);
      throw error;
    }
  }
  
  private async sendLogsRemotely(events: AuditEvent[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;
    
    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          events,
          metadata: {
            timestamp: new Date(),
            version: '1.0.0',
            source: 'symfarmia-web-client'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Audit log upload failed: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Failed to send audit logs remotely:', error);
      throw error;
    }
  }
  
  private async encryptLogs(events: AuditEvent[]): Promise<unknown> {
    // Simple encryption for demonstration
    // In production, use proper encryption libraries
    if ('crypto' in window && 'subtle' in crypto) {
      try {
        const data = JSON.stringify(events);
        const key = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          new TextEncoder().encode(data)
        );
        
        return {
          encrypted: true,
          data: Array.from(new Uint8Array(encryptedData)),
          iv: Array.from(iv),
          algorithm: 'AES-GCM'
        };
        
      } catch (error) {
        console.warn('Encryption failed, storing unencrypted:', error);
        return events;
      }
    }
    
    return events;
  }
  
  private hashValue(value: string): string {
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
  }
  
  // Public methods for compliance
  async exportAuditLogs(startDate?: Date, endDate?: Date): Promise<AuditEvent[]> {
    const logs = JSON.parse(localStorage.getItem(this.config.localStorageKey) || '[]');
    
    if (!startDate && !endDate) {
      return logs;
    }
    
    return logs.filter((log: AuditEvent) => {
      const logDate = new Date(log.timestamp);
      const afterStart = !startDate || logDate >= startDate;
      const beforeEnd = !endDate || logDate <= endDate;
      return afterStart && beforeEnd;
    });
  }
  
  async deleteAuditLogs(beforeDate: Date): Promise<number> {
    const logs = JSON.parse(localStorage.getItem(this.config.localStorageKey) || '[]');
    const remainingLogs = logs.filter((log: AuditEvent) => new Date(log.timestamp) >= beforeDate);
    const deletedCount = logs.length - remainingLogs.length;
    
    localStorage.setItem(this.config.localStorageKey, JSON.stringify(remainingLogs));
    
    return deletedCount;
  }
  
  getAuditStatistics(): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    oldestEvent?: Date;
    newestEvent?: Date;
  } {
    const logs: AuditEvent[] = JSON.parse(localStorage.getItem(this.config.localStorageKey) || '[]');
    
    const stats = {
      totalEvents: logs.length,
      eventsByCategory: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      oldestEvent: undefined as Date | undefined,
      newestEvent: undefined as Date | undefined
    };
    
    if (logs.length === 0) return stats;
    
    logs.forEach(log => {
      // Count by category
      stats.eventsByCategory[log.category] = (stats.eventsByCategory[log.category] || 0) + 1;
      
      // Count by severity
      stats.eventsBySeverity[log.severity] = (stats.eventsBySeverity[log.severity] || 0) + 1;
    });
    
    // Find date range
    const dates = logs.map(log => new Date(log.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    stats.oldestEvent = dates[0];
    stats.newestEvent = dates[dates.length - 1];
    
    return stats;
  }
  
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Final flush
    this.flushBuffer();
  }
}