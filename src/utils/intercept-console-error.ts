/**
 * Intercept Console Error
 * 
 * Handles proper error logging for transcription errors with medical context
 * Prevents console spam while maintaining medical compliance
 */

interface ErrorLogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  medicalContext?: MedicalErrorContext;
  hash: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  suppressed: boolean;
}

interface MedicalErrorContext {
  patientId?: string;
  consultationId?: string;
  sessionId?: string;
  component?: string;
  operation?: string;
  urgencyLevel?: 'routine' | 'urgent' | 'emergency' | 'critical';
  specialty?: string;
  errorType?: 'transcription' | 'network' | 'audio' | 'storage' | 'security';
  hipaaRelevant?: boolean;
  medicalDataInvolved?: boolean;
}

interface RateLimitConfig {
  maxOccurrences: number;
  timeWindow: number; // milliseconds
  suppressAfter: number;
  escalateAfter: number;
}

interface FilterRule {
  pattern: RegExp;
  action: 'suppress' | 'rate_limit' | 'escalate' | 'allow';
  config?: RateLimitConfig;
  medicalRelevant?: boolean;
}

class ConsoleErrorInterceptor {
  private originalConsole: {
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
    debug: typeof console.debug;
  };
  
  private errorLog: Map<string, ErrorLogEntry> = new Map();
  private maxLogSize = 1000;
  private isInitialized = false;
  
  // Rate limiting configuration
  private rateLimitConfig: RateLimitConfig = {
    maxOccurrences: 5,
    timeWindow: 60000, // 1 minute
    suppressAfter: 10,
    escalateAfter: 20
  };
  
  // Filter rules for different error types
  private filterRules: FilterRule[] = [
    // Medical transcription errors - never suppress
    {
      pattern: /transcription|speech|audio|microphone|medical/i,
      action: 'escalate',
      medicalRelevant: true
    },
    
    // Network errors - rate limit
    {
      pattern: /network|connection|fetch|timeout/i,
      action: 'rate_limit',
      config: {
        maxOccurrences: 3,
        timeWindow: 30000,
        suppressAfter: 5,
        escalateAfter: 10
      },
      medicalRelevant: true
    },
    
    // React development warnings - suppress in production
    {
      pattern: /react|jsx|component|hook/i,
      action: process.env.NODE_ENV === 'production' ? 'suppress' : 'allow',
      medicalRelevant: false
    },
    
    // Extension errors - suppress
    {
      pattern: /extension|chrome-extension|moz-extension/i,
      action: 'suppress',
      medicalRelevant: false
    },
    
    // Console method errors - suppress
    {
      pattern: /non-passive event listener|favicon/i,
      action: 'suppress',
      medicalRelevant: false
    },
    
    // Security errors - escalate immediately
    {
      pattern: /security|permission|cors|csp|xss/i,
      action: 'escalate',
      medicalRelevant: true
    },
    
    // Default rule - allow with rate limiting
    {
      pattern: /.*/,
      action: 'rate_limit',
      config: this.rateLimitConfig,
      medicalRelevant: false
    }
  ];
  
  private callbacks: Map<string, Set<(data: any) => void>> = new Map();
  private medicalErrorHandler: any = null;
  
  constructor() {
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };
  }
  
  /**
   * Initialize error interception
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    try {
      this.setupConsoleInterception();
      this.setupGlobalErrorHandlers();
      this.setupCleanupTimer();
      this.isInitialized = true;
      
      console.log('Console error interception initialized');
    } catch (error) {
      console.error('Failed to initialize console error interception:', error);
    }
  }
  
  /**
   * Setup console method interception
   */
  private setupConsoleInterception(): void {
    // Intercept console.error
    console.error = (...args: any[]) => {
      this.interceptConsoleCall('error', args);
    };
    
    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.interceptConsoleCall('warn', args);
    };
    
    // Intercept console.info
    console.info = (...args: any[]) => {
      this.interceptConsoleCall('info', args);
    };
    
    // Intercept console.debug
    console.debug = (...args: any[]) => {
      this.interceptConsoleCall('debug', args);
    };
  }
  
  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'global_error'
      });
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError(event.reason, {
        source: 'unhandled_promise'
      });
    });
  }
  
  /**
   * Setup cleanup timer
   */
  private setupCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldEntries();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
  
  /**
   * Intercept console calls
   */
  private interceptConsoleCall(level: 'error' | 'warn' | 'info' | 'debug', args: any[]): void {
    try {
      const message = this.formatMessage(args);
      const hash = this.generateHash(message);
      
      // Check if this error should be processed
      const shouldProcess = this.shouldProcessError(message, level);
      
      if (shouldProcess) {
        this.processError(level, message, { args }, hash);
      }
      
      // Always call original console method (unless suppressed)
      if (!this.isErrorSuppressed(hash)) {
        this.originalConsole[level](...args);
      }
    } catch (error) {
      // Fallback to original console if interception fails
      this.originalConsole[level](...args);
    }
  }
  
  /**
   * Handle global errors
   */
  private handleGlobalError(error: any, context: Record<string, any>): void {
    try {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      const hash = this.generateHash(message);
      
      this.processError('error', message, { ...context, stack }, hash);
    } catch (processingError) {
      console.error('Error processing global error:', processingError);
    }
  }
  
  /**
   * Process error with filtering and rate limiting
   */
  private processError(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    context: Record<string, any>,
    hash: string
  ): void {
    try {
      // Get or create error entry
      let entry = this.errorLog.get(hash);
      const now = new Date();
      
      if (entry) {
        entry.count++;
        entry.lastOccurrence = now;
      } else {
        entry = {
          timestamp: now,
          level,
          message,
          stack: context.stack,
          context,
          hash,
          count: 1,
          firstOccurrence: now,
          lastOccurrence: now,
          suppressed: false,
          medicalContext: this.extractMedicalContext(message, context)
        };
        
        this.errorLog.set(hash, entry);
      }
      
      // Apply filtering rules
      const rule = this.findMatchingRule(message);
      this.applyFilterRule(entry, rule);
      
      // Handle medical errors specially
      if (entry.medicalContext && this.medicalErrorHandler) {
        this.sendToMedicalErrorHandler(entry);
      }
      
      // Trigger callbacks
      this.triggerCallbacks(level, entry);
      
      // Maintain log size
      this.maintainLogSize();
      
    } catch (error) {
      console.error('Error processing error:', error);
    }
  }
  
  /**
   * Extract medical context from error
   */
  private extractMedicalContext(message: string, context: Record<string, any>): MedicalErrorContext | undefined {
    const isMedicalError = this.isMedicalRelatedError(message);
    
    if (!isMedicalError) return undefined;
    
    return {
      patientId: this.extractFromContext(context, 'patientId'),
      consultationId: this.extractFromContext(context, 'consultationId'),
      sessionId: this.extractFromContext(context, 'sessionId'),
      component: this.extractComponent(message, context),
      operation: this.extractOperation(message, context),
      urgencyLevel: this.extractUrgencyLevel(context),
      specialty: this.extractFromContext(context, 'specialty'),
      errorType: this.classifyErrorType(message),
      hipaaRelevant: this.isHipaaRelevant(message, context),
      medicalDataInvolved: this.hasMedicalData(message, context)
    };
  }
  
  /**
   * Check if error is medical-related
   */
  private isMedicalRelatedError(message: string): boolean {
    const medicalKeywords = [
      'transcription', 'speech', 'audio', 'microphone', 'medical',
      'patient', 'consultation', 'diagnosis', 'treatment', 'prescription',
      'hipaa', 'phi', 'clinical', 'healthcare'
    ];
    
    const messageLower = message.toLowerCase();
    return medicalKeywords.some(keyword => messageLower.includes(keyword));
  }
  
  /**
   * Classify error type
   */
  private classifyErrorType(message: string): MedicalErrorContext['errorType'] {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('transcription') || messageLower.includes('speech')) {
      return 'transcription';
    }
    if (messageLower.includes('network') || messageLower.includes('connection')) {
      return 'network';
    }
    if (messageLower.includes('audio') || messageLower.includes('microphone')) {
      return 'audio';
    }
    if (messageLower.includes('storage') || messageLower.includes('database')) {
      return 'storage';
    }
    if (messageLower.includes('security') || messageLower.includes('permission')) {
      return 'security';
    }
    
    return undefined;
  }
  
  /**
   * Check if error is HIPAA relevant
   */
  private isHipaaRelevant(message: string, context: Record<string, any>): boolean {
    const hipaaKeywords = ['hipaa', 'phi', 'patient', 'medical record', 'health information'];
    const messageLower = message.toLowerCase();
    
    return hipaaKeywords.some(keyword => messageLower.includes(keyword)) ||
           context.patientId !== undefined ||
           context.medicalData !== undefined;
  }
  
  /**
   * Check if error involves medical data
   */
  private hasMedicalData(message: string, context: Record<string, any>): boolean {
    return context.patientId !== undefined ||
           context.consultationId !== undefined ||
           context.medicalData !== undefined ||
           message.toLowerCase().includes('patient data');
  }
  
  /**
   * Extract value from context
   */
  private extractFromContext(context: Record<string, any>, key: string): string | undefined {
    return context[key] || context.medicalContext?.[key];
  }
  
  /**
   * Extract component from error
   */
  private extractComponent(message: string, context: Record<string, any>): string | undefined {
    if (context.component) return context.component;
    
    // Try to extract from stack trace or message
    const componentPatterns = [
      /TranscriptionService/,
      /NetworkStatusDetector/,
      /AudioChunkManager/,
      /MedicalTranscriptionResilience/,
      /OfflineTranscriptionBuffer/
    ];
    
    for (const pattern of componentPatterns) {
      if (pattern.test(message) || pattern.test(context.stack || '')) {
        return pattern.source.replace(/[\/\\]/g, '');
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract operation from error
   */
  private extractOperation(message: string, context: Record<string, any>): string | undefined {
    if (context.operation) return context.operation;
    
    // Try to extract from message
    const operationPatterns = [
      /startTranscription/,
      /stopTranscription/,
      /processAudio/,
      /networkStatusChange/,
      /qualityCheck/
    ];
    
    for (const pattern of operationPatterns) {
      if (pattern.test(message)) {
        return pattern.source.replace(/[\/\\]/g, '');
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract urgency level
   */
  private extractUrgencyLevel(context: Record<string, any>): MedicalErrorContext['urgencyLevel'] {
    const urgencyLevel = context.urgencyLevel || context.medicalContext?.urgencyLevel;
    
    if (['routine', 'urgent', 'emergency', 'critical'].includes(urgencyLevel)) {
      return urgencyLevel as MedicalErrorContext['urgencyLevel'];
    }
    
    return 'routine';
  }
  
  /**
   * Find matching filter rule
   */
  private findMatchingRule(message: string): FilterRule {
    for (const rule of this.filterRules) {
      if (rule.pattern.test(message)) {
        return rule;
      }
    }
    
    // Return default rule
    return this.filterRules[this.filterRules.length - 1];
  }
  
  /**
   * Apply filter rule to error entry
   */
  private applyFilterRule(entry: ErrorLogEntry, rule: FilterRule): void {
    const config = rule.config || this.rateLimitConfig;
    
    switch (rule.action) {
      case 'suppress':
        entry.suppressed = true;
        break;
        
      case 'rate_limit':
        if (entry.count > config.suppressAfter) {
          entry.suppressed = true;
        }
        break;
        
      case 'escalate':
        // Never suppress escalated errors
        entry.suppressed = false;
        if (entry.count > config.escalateAfter) {
          this.escalateError(entry);
        }
        break;
        
      case 'allow':
        entry.suppressed = false;
        break;
    }
  }
  
  /**
   * Escalate error to medical error handler
   */
  private escalateError(entry: ErrorLogEntry): void {
    try {
      console.error('ESCALATED ERROR:', entry.message, entry.context);
      
      // Trigger escalation callback
      this.triggerCallbacks('escalation', entry);
      
      // Send to medical error handler
      if (this.medicalErrorHandler) {
        this.medicalErrorHandler.handleError(
          new Error(entry.message),
          entry.medicalContext || entry.context
        );
      }
    } catch (error) {
      console.error('Error escalating error:', error);
    }
  }
  
  /**
   * Send error to medical error handler
   */
  private sendToMedicalErrorHandler(entry: ErrorLogEntry): void {
    try {
      if (this.medicalErrorHandler && entry.medicalContext) {
        this.medicalErrorHandler.handleError(
          new Error(entry.message),
          entry.medicalContext
        );
      }
    } catch (error) {
      console.error('Error sending to medical error handler:', error);
    }
  }
  
  /**
   * Check if error should be processed
   */
  private shouldProcessError(message: string, level: string): boolean {
    // Always process errors and warnings
    if (level === 'error' || level === 'warn') return true;
    
    // Process medical-related info/debug messages
    if (this.isMedicalRelatedError(message)) return true;
    
    // Skip other info/debug messages in production
    return process.env.NODE_ENV !== 'production';
  }
  
  /**
   * Check if error is suppressed
   */
  private isErrorSuppressed(hash: string): boolean {
    const entry = this.errorLog.get(hash);
    return entry?.suppressed || false;
  }
  
  /**
   * Format message from arguments
   */
  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      return String(arg);
    }).join(' ');
  }
  
  /**
   * Generate hash for error message
   */
  private generateHash(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Clean up old entries
   */
  private cleanupOldEntries(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const [hash, entry] of this.errorLog.entries()) {
      if (now - entry.lastOccurrence.getTime() > maxAge) {
        this.errorLog.delete(hash);
      }
    }
  }
  
  /**
   * Maintain log size
   */
  private maintainLogSize(): void {
    if (this.errorLog.size <= this.maxLogSize) return;
    
    // Remove oldest entries
    const entries = Array.from(this.errorLog.entries())
      .sort(([, a], [, b]) => a.firstOccurrence.getTime() - b.firstOccurrence.getTime());
    
    const toRemove = entries.slice(0, entries.length - this.maxLogSize);
    toRemove.forEach(([hash]) => this.errorLog.delete(hash));
  }
  
  /**
   * Set medical error handler
   */
  setMedicalErrorHandler(handler: any): void {
    this.medicalErrorHandler = handler;
  }
  
  /**
   * Register callback
   */
  onEvent(event: string, callback: (data: any) => void): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    
    this.callbacks.get(event)!.add(callback);
    
    return () => {
      this.callbacks.get(event)?.delete(callback);
    };
  }
  
  /**
   * Trigger callbacks
   */
  private triggerCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in callback:', error);
        }
      });
    }
  }
  
  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    suppressedErrors: number;
    medicalErrors: number;
    escalatedErrors: number;
    errorsByType: Record<string, number>;
  } {
    let totalErrors = 0;
    let suppressedErrors = 0;
    let medicalErrors = 0;
    let escalatedErrors = 0;
    const errorsByType: Record<string, number> = {};
    
    for (const entry of this.errorLog.values()) {
      totalErrors += entry.count;
      
      if (entry.suppressed) {
        suppressedErrors += entry.count;
      }
      
      if (entry.medicalContext) {
        medicalErrors += entry.count;
      }
      
      if (entry.count > 20) { // Assuming escalation threshold
        escalatedErrors++;
      }
      
      const type = entry.medicalContext?.errorType || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + entry.count;
    }
    
    return {
      totalErrors,
      suppressedErrors,
      medicalErrors,
      escalatedErrors,
      errorsByType
    };
  }
  
  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorLogEntry[] {
    return Array.from(this.errorLog.values())
      .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime())
      .slice(0, limit);
  }
  
  /**
   * Get medical errors
   */
  getMedicalErrors(): ErrorLogEntry[] {
    return Array.from(this.errorLog.values())
      .filter(entry => entry.medicalContext)
      .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime());
  }
  
  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog.clear();
  }
  
  /**
   * Restore original console
   */
  destroy(): void {
    if (!this.isInitialized) return;
    
    // Restore original console methods
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
    
    // Clear callbacks
    this.callbacks.clear();
    
    // Clear error log
    this.errorLog.clear();
    
    this.isInitialized = false;
    
    console.log('Console error interception destroyed');
  }
}

// Create and export singleton instance
export const consoleErrorInterceptor = new ConsoleErrorInterceptor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  consoleErrorInterceptor.initialize();
}

export default consoleErrorInterceptor;