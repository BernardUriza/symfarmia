/**
 * Medical Grade Error Handling
 * 
 * Handles errors with medical-specific context and compliance requirements
 * Ensures errors never interrupt medical workflow while maintaining audit trails
 */

export class MedicalGradeErrorHandling {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000;
    this.criticalErrors = new Set();
    this.errorCallbacks = new Map();
    this.medicalContext = null;
    this.complianceMode = true;
    this.auditTrail = [];
    this.errorMetrics = {
      totalErrors: 0,
      criticalErrors: 0,
      recoveredErrors: 0,
      silentErrors: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize error handling system
   */
  initialize() {
    // Set up global error handlers for medical context
    this.setupGlobalErrorHandlers();
    
    // Initialize medical error categories
    this.initializeMedicalErrorCategories();
    
    console.log('Medical Grade Error Handling initialized');
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Override console.error to filter medical errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a medical-related error
      const errorText = args.join(' ').toLowerCase();
      
      if (this.isMedicalRelatedError(errorText)) {
        this.handleMedicalConsoleError(args);
      } else {
        // Use original console.error for non-medical errors
        originalConsoleError.apply(console, args);
      }
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });
    
    // Handle general errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });
  }

  /**
   * Initialize medical error categories
   */
  initializeMedicalErrorCategories() {
    this.medicalErrorCategories = {
      TRANSCRIPTION: {
        severity: 'high',
        requiresAudit: true,
        allowSilentRecovery: true,
        maxRetries: 3
      },
      PATIENT_DATA: {
        severity: 'critical',
        requiresAudit: true,
        allowSilentRecovery: false,
        maxRetries: 1
      },
      NETWORK: {
        severity: 'medium',
        requiresAudit: true,
        allowSilentRecovery: true,
        maxRetries: 5
      },
      AUDIO: {
        severity: 'high',
        requiresAudit: true,
        allowSilentRecovery: true,
        maxRetries: 3
      },
      STORAGE: {
        severity: 'critical',
        requiresAudit: true,
        allowSilentRecovery: false,
        maxRetries: 2
      },
      SECURITY: {
        severity: 'critical',
        requiresAudit: true,
        allowSilentRecovery: false,
        maxRetries: 0
      }
    };
  }

  /**
   * Main error handling entry point
   */
  async handleError(error, context = {}) {
    try {
      // Enhance context with medical information
      const enhancedContext = this.enhanceErrorContext(error, context);
      
      // Classify the error
      const errorClassification = this.classifyMedicalError(error, enhancedContext);
      
      // Create error record
      const errorRecord = this.createErrorRecord(error, enhancedContext, errorClassification);
      
      // Log the error
      this.logError(errorRecord);
      
      // Determine handling strategy
      const handlingStrategy = this.determineHandlingStrategy(errorClassification);
      
      // Execute handling strategy
      await this.executeHandlingStrategy(errorRecord, handlingStrategy);
      
      // Update metrics
      this.updateErrorMetrics(errorClassification);
      
      // Create audit trail if required
      if (errorClassification.requiresAudit) {
        this.createAuditTrailEntry(errorRecord);
      }
      
      return {
        success: true,
        handled: true,
        strategy: handlingStrategy,
        errorId: errorRecord.id
      };
      
    } catch (handlingError) {
      // Handle error in error handling (meta-error)
      console.error('Error in medical error handling:', handlingError);
      return {
        success: false,
        handled: false,
        error: handlingError.message
      };
    }
  }

  /**
   * Enhance error context with medical information
   */
  enhanceErrorContext(error, context) {
    return {
      ...context,
      timestamp: new Date(),
      errorType: error.name || 'Unknown',
      errorMessage: error.message || 'Unknown error',
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      medicalContext: this.medicalContext,
      sessionId: this.getSessionId(),
      patientId: context.patientId || 'unknown',
      consultationId: context.consultationId || 'unknown',
      medicalSpecialty: context.specialty || 'general',
      urgencyLevel: context.urgencyLevel || 'routine'
    };
  }

  /**
   * Classify medical error based on type and context
   */
  classifyMedicalError(error, context) {
    const errorMessage = error.message?.toLowerCase() || '';
    
    // Determine category
    let category = 'UNKNOWN';
    
    if (errorMessage.includes('transcription') || errorMessage.includes('speech')) {
      category = 'TRANSCRIPTION';
    } else if (errorMessage.includes('patient') || errorMessage.includes('medical record')) {
      category = 'PATIENT_DATA';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      category = 'NETWORK';
    } else if (errorMessage.includes('audio') || errorMessage.includes('microphone')) {
      category = 'AUDIO';
    } else if (errorMessage.includes('storage') || errorMessage.includes('database')) {
      category = 'STORAGE';
    } else if (errorMessage.includes('security') || errorMessage.includes('permission')) {
      category = 'SECURITY';
    }
    
    // Get category configuration
    const categoryConfig = this.medicalErrorCategories[category] || {
      severity: 'medium',
      requiresAudit: true,
      allowSilentRecovery: true,
      maxRetries: 2
    };
    
    // Determine impact on medical workflow
    const workflowImpact = this.assessWorkflowImpact(error, context);
    
    return {
      category,
      severity: this.adjustSeverityForMedicalContext(categoryConfig.severity, context),
      requiresAudit: categoryConfig.requiresAudit,
      allowSilentRecovery: categoryConfig.allowSilentRecovery,
      maxRetries: categoryConfig.maxRetries,
      workflowImpact,
      isRecoverable: this.isErrorRecoverable(error, context),
      requiresUserNotification: this.requiresUserNotification(categoryConfig.severity, workflowImpact)
    };
  }

  /**
   * Assess impact on medical workflow
   */
  assessWorkflowImpact(error, context) {
    const impactFactors = {
      urgency: context.urgencyLevel,
      specialty: context.medicalSpecialty,
      errorType: error.name,
      patientPresent: context.patientId !== 'unknown'
    };
    
    // Critical impact scenarios
    if (impactFactors.urgency === 'critical' || impactFactors.urgency === 'emergency') {
      return 'critical';
    }
    
    // High impact scenarios
    if (impactFactors.patientPresent && error.name === 'TranscriptionError') {
      return 'high';
    }
    
    // Medium impact scenarios
    if (impactFactors.urgency === 'urgent') {
      return 'medium';
    }
    
    // Low impact scenarios
    return 'low';
  }

  /**
   * Adjust severity based on medical context
   */
  adjustSeverityForMedicalContext(baseSeverity, context) {
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    let severityIndex = severityLevels.indexOf(baseSeverity);
    
    // Upgrade severity for critical medical situations
    if (context.urgencyLevel === 'critical' || context.urgencyLevel === 'emergency') {
      severityIndex = Math.max(severityIndex, severityLevels.indexOf('high'));
    }
    
    // Upgrade severity for patient-present scenarios
    if (context.patientId !== 'unknown') {
      severityIndex = Math.max(severityIndex, severityLevels.indexOf('medium'));
    }
    
    return severityLevels[Math.min(severityIndex, severityLevels.length - 1)];
  }

  /**
   * Create error record for logging and tracking
   */
  createErrorRecord(error, context, classification) {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: context,
      classification: classification,
      handled: false,
      strategy: null,
      resolution: null,
      attempts: 0
    };
  }

  /**
   * Determine handling strategy based on error classification
   */
  determineHandlingStrategy(classification) {
    const strategy = {
      type: 'recover', // recover, notify, escalate, ignore
      silent: false,
      retry: false,
      fallback: false,
      userNotification: false,
      auditLog: false
    };
    
    // Strategy based on severity
    switch (classification.severity) {
      case 'critical':
        strategy.type = 'escalate';
        strategy.userNotification = true;
        strategy.auditLog = true;
        strategy.fallback = true;
        break;
        
      case 'high':
        strategy.type = 'recover';
        strategy.retry = true;
        strategy.fallback = true;
        strategy.silent = classification.allowSilentRecovery;
        strategy.auditLog = true;
        break;
        
      case 'medium':
        strategy.type = 'recover';
        strategy.retry = true;
        strategy.silent = true;
        strategy.auditLog = classification.requiresAudit;
        break;
        
      case 'low':
        strategy.type = 'ignore';
        strategy.silent = true;
        strategy.auditLog = false;
        break;
    }
    
    // Adjust strategy based on workflow impact
    if (classification.workflowImpact === 'critical') {
      strategy.userNotification = true;
      strategy.auditLog = true;
    }
    
    // Force notification for non-recoverable errors
    if (!classification.isRecoverable) {
      strategy.userNotification = true;
      strategy.type = 'escalate';
    }
    
    return strategy;
  }

  /**
   * Execute the determined handling strategy
   */
  async executeHandlingStrategy(errorRecord, strategy) {
    try {
      errorRecord.strategy = strategy;
      
      switch (strategy.type) {
        case 'recover':
          await this.executeRecoveryStrategy(errorRecord, strategy);
          break;
          
        case 'notify':
          await this.executeNotificationStrategy(errorRecord, strategy);
          break;
          
        case 'escalate':
          await this.executeEscalationStrategy(errorRecord, strategy);
          break;
          
        case 'ignore':
          await this.executeIgnoreStrategy(errorRecord, strategy);
          break;
      }
      
      errorRecord.handled = true;
      
    } catch (error) {
      console.error('Failed to execute handling strategy:', error);
      errorRecord.resolution = 'strategy_failed';
    }
  }

  /**
   * Execute recovery strategy
   */
  async executeRecoveryStrategy(errorRecord, strategy) {
    if (strategy.retry) {
      errorRecord.attempts++;
      
      if (errorRecord.attempts <= errorRecord.classification.maxRetries) {
        // Attempt recovery
        console.log(`Attempting recovery for error ${errorRecord.id} (attempt ${errorRecord.attempts})`);
        errorRecord.resolution = 'recovery_attempted';
      } else {
        // Max retries reached, escalate
        console.log(`Max retries reached for error ${errorRecord.id}, escalating`);
        await this.executeEscalationStrategy(errorRecord, { ...strategy, type: 'escalate' });
      }
    }
    
    if (strategy.fallback) {
      // Trigger fallback mechanisms
      this.triggerFallbackMechanisms(errorRecord);
    }
    
    if (!strategy.silent) {
      this.logErrorToConsole(errorRecord);
    }
  }

  /**
   * Execute notification strategy
   */
  async executeNotificationStrategy(errorRecord, strategy) {
    if (strategy.userNotification) {
      await this.notifyUser(errorRecord);
    }
    
    if (strategy.auditLog) {
      this.createAuditTrailEntry(errorRecord);
    }
    
    errorRecord.resolution = 'notified';
  }

  /**
   * Execute escalation strategy
   */
  async executeEscalationStrategy(errorRecord, _strategy) {
    // Log critical error
    console.error('CRITICAL MEDICAL ERROR:', errorRecord);
    
    // Notify user
    await this.notifyUser(errorRecord);
    
    // Create audit trail
    this.createAuditTrailEntry(errorRecord);
    
    // Trigger emergency protocols if needed
    if (errorRecord.classification.severity === 'critical') {
      this.triggerEmergencyProtocols(errorRecord);
    }
    
    errorRecord.resolution = 'escalated';
  }

  /**
   * Execute ignore strategy
   */
  async executeIgnoreStrategy(errorRecord, _strategy) {
    // Silent handling - just log internally
    this.errorMetrics.silentErrors++;
    errorRecord.resolution = 'ignored';
  }

  /**
   * Log error to internal log
   */
  logError(errorRecord) {
    this.errorLog.push(errorRecord);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    
    // Track critical errors separately
    if (errorRecord.classification.severity === 'critical') {
      this.criticalErrors.add(errorRecord.id);
    }
  }

  /**
   * Handle medical console errors with filtering
   */
  handleMedicalConsoleError(args) {
    const errorText = args.join(' ');
    
    // Check if this error should be suppressed
    if (this.shouldSuppressError(errorText)) {
      return; // Silent suppression
    }
    
    // Rate limit repeated errors
    if (this.isRepeatedError(errorText)) {
      return; // Suppress repeated errors
    }
    
    // Log with medical context
    const errorRecord = {
      timestamp: new Date(),
      message: errorText,
      type: 'console_error',
      context: this.medicalContext
    };
    
    this.logError(errorRecord);
    
    // Use original console.error for non-suppressed errors
    console.error(...args);
  }

  /**
   * Check if error should be suppressed
   */
  shouldSuppressError(errorText) {
    const suppressPatterns = [
      /non-passive event listener/i,
      /favicon.ico/i,
      /chrome-extension/i,
      /script error/i
    ];
    
    return suppressPatterns.some(pattern => pattern.test(errorText));
  }

  /**
   * Check if error is repeated
   */
  isRepeatedError(errorText) {
    const recentErrors = this.errorLog.slice(-10).map(record => record.message);
    const occurrences = recentErrors.filter(msg => msg === errorText).length;
    
    return occurrences > 3; // Suppress if occurred more than 3 times recently
  }

  /**
   * Check if error is medical-related
   */
  isMedicalRelatedError(errorText) {
    const medicalKeywords = [
      'transcription', 'speech', 'audio', 'microphone',
      'patient', 'medical', 'diagnosis', 'consultation',
      'record', 'symptom', 'treatment'
    ];
    
    return medicalKeywords.some(keyword => errorText.includes(keyword));
  }

  /**
   * Determine if error requires user notification
   */
  requiresUserNotification(severity, workflowImpact) {
    return severity === 'critical' || workflowImpact === 'critical';
  }

  /**
   * Determine if error is recoverable
   */
  isErrorRecoverable(error, _context) {
    const nonRecoverableErrors = [
      'SecurityError',
      'PermissionError',
      'QuotaExceededError'
    ];
    
    return !nonRecoverableErrors.includes(error.name);
  }

  /**
   * Notify user of error
   */
  async notifyUser(errorRecord) {
    // This would integrate with the UI notification system
    console.warn('Medical error notification:', {
      message: 'A medical transcription issue has occurred',
      severity: errorRecord.classification.severity,
      canContinue: errorRecord.classification.isRecoverable
    });
  }

  /**
   * Create audit trail entry
   */
  createAuditTrailEntry(errorRecord) {
    const auditEntry = {
      timestamp: new Date(),
      eventType: 'error_occurred',
      errorId: errorRecord.id,
      severity: errorRecord.classification.severity,
      category: errorRecord.classification.category,
      patientId: errorRecord.context.patientId,
      consultationId: errorRecord.context.consultationId,
      resolution: errorRecord.resolution,
      complianceFlags: this.getComplianceFlags(errorRecord)
    };
    
    this.auditTrail.push(auditEntry);
    
    // Maintain audit trail size
    if (this.auditTrail.length > 500) {
      this.auditTrail.shift();
    }
  }

  /**
   * Get compliance flags for audit
   */
  getComplianceFlags(errorRecord) {
    const flags = [];
    
    if (errorRecord.context.patientId !== 'unknown') {
      flags.push('patient_data_involved');
    }
    
    if (errorRecord.classification.severity === 'critical') {
      flags.push('critical_error');
    }
    
    if (errorRecord.classification.category === 'SECURITY') {
      flags.push('security_incident');
    }
    
    return flags;
  }

  /**
   * Update error metrics
   */
  updateErrorMetrics(classification) {
    this.errorMetrics.totalErrors++;
    
    if (classification.severity === 'critical') {
      this.errorMetrics.criticalErrors++;
    }
    
    if (classification.isRecoverable) {
      this.errorMetrics.recoveredErrors++;
    }
  }

  /**
   * Get session ID for tracking
   */
  getSessionId() {
    return sessionStorage.getItem('medicalSessionId') || 'unknown';
  }

  /**
   * Set medical context
   */
  setMedicalContext(context) {
    this.medicalContext = context;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    return {
      ...this.errorMetrics,
      recentErrors: this.errorLog.slice(-10),
      criticalErrorsCount: this.criticalErrors.size,
      auditTrailSize: this.auditTrail.length
    };
  }

  /**
   * Export audit trail for compliance
   */
  exportAuditTrail() {
    return {
      exportDate: new Date(),
      entries: this.auditTrail,
      metadata: {
        totalEntries: this.auditTrail.length,
        dateRange: {
          start: this.auditTrail[0]?.timestamp,
          end: this.auditTrail[this.auditTrail.length - 1]?.timestamp
        }
      }
    };
  }

  /**
   * Trigger fallback mechanisms
   */
  triggerFallbackMechanisms(errorRecord) {
    console.log('Triggering fallback mechanisms for error:', errorRecord.id);
    // This would trigger specific fallback systems
  }

  /**
   * Trigger emergency protocols
   */
  triggerEmergencyProtocols(errorRecord) {
    console.error('EMERGENCY PROTOCOL TRIGGERED:', errorRecord.id);
    // This would trigger emergency response systems
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    const error = event.reason;
    this.handleError(error, { source: 'unhandled_promise' });
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event) {
    const error = event.error;
    this.handleError(error, { source: 'global_error' });
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clear logs
    this.errorLog = [];
    this.auditTrail = [];
    this.criticalErrors.clear();
    
    console.log('Medical Grade Error Handling destroyed');
  }
}

// Export singleton instance
export const medicalGradeErrorHandler = new MedicalGradeErrorHandling();