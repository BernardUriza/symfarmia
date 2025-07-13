/**
 * Connection Recovery Service
 * 
 * Handles intelligent reconnection with medical-environment appropriate timing
 */

import { networkStatusDetector } from './NetworkStatusDetector.js';
import { transcriptionQualityMonitor } from './TranscriptionQualityMonitor.js';

export class ConnectionRecoveryService {
  constructor() {
    this.recoveryState = 'idle'; // idle, attempting, backing_off, failed
    this.connectionAttempts = 0;
    this.maxRetryAttempts = 10;
    this.baseRetryDelay = 1000; // 1 second
    this.maxRetryDelay = 60000; // 1 minute
    this.backoffMultiplier = 2;
    this.jitterFactor = 0.1;
    this.circuitBreaker = {
      state: 'closed', // closed, open, half-open
      failures: 0,
      threshold: 5,
      timeout: 30000, // 30 seconds
      lastFailure: null
    };
    
    this.recoveryTimer = null;
    this.healthCheckTimer = null;
    this.connectionHistory = [];
    this.maxHistorySize = 100;
    this.callbacks = new Map();
    this.medicalPriority = true;
    this.emergencyMode = false;
    this.lastConnectionTime = null;
    this.connectionQuality = 'unknown';
    this.recoveryMetrics = {
      totalAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      longestDisconnection: 0,
      shortestRecovery: Infinity
    };
    
    this.adaptiveRetry = true;
    this.intelligentScheduling = true;
    this.medicalContextAware = true;
    this.priorityQueue = [];
    this.currentStrategy = 'exponential_backoff';
    this.strategies = {
      exponential_backoff: this.exponentialBackoffStrategy.bind(this),
      linear_backoff: this.linearBackoffStrategy.bind(this),
      fibonacci_backoff: this.fibonacciBackoffStrategy.bind(this),
      medical_priority: this.medicalPriorityStrategy.bind(this)
    };
    
    this.initialize();
  }

  /**
   * Initialize connection recovery service
   */
  initialize() {
    try {
      // Monitor network status changes
      networkStatusDetector.onStatusChange(this.handleNetworkStatusChange.bind(this));
      
      // Monitor quality changes
      transcriptionQualityMonitor.onEvent('qualityDegraded', this.handleQualityDegradation.bind(this));
      
      // Start health check monitoring
      this.startHealthCheckMonitoring();
      
      console.log('ConnectionRecoveryService initialized');
      
    } catch (error) {
      console.error('Failed to initialize ConnectionRecoveryService:', error);
    }
  }

  /**
   * Handle network status changes
   */
  handleNetworkStatusChange(networkStatus) {
    try {
      console.log('Network status changed:', networkStatus);
      
      if (networkStatus.isOnline) {
        this.handleConnectionRestored(networkStatus);
      } else {
        this.handleConnectionLost(networkStatus);
      }
      
      // Update connection quality
      this.connectionQuality = networkStatus.quality;
      
      // Record connection event
      this.recordConnectionEvent('status_change', networkStatus);
      
    } catch (error) {
      console.error('Error handling network status change:', error);
    }
  }

  /**
   * Handle connection restored
   */
  handleConnectionRestored(networkStatus) {
    try {
      if (this.recoveryState === 'attempting' || this.recoveryState === 'backing_off') {
        this.handleSuccessfulRecovery(networkStatus);
      }
      
      // Reset circuit breaker on successful connection
      this.resetCircuitBreaker();
      
      // Update last connection time
      this.lastConnectionTime = Date.now();
      
      // Trigger callback
      this.triggerCallback('connectionRestored', networkStatus);
      
    } catch (error) {
      console.error('Error handling connection restored:', error);
    }
  }

  /**
   * Handle connection lost
   */
  handleConnectionLost(networkStatus) {
    try {
      console.log('Connection lost, initiating recovery');
      
      // Start recovery process
      this.initiateRecovery();
      
      // Record disconnection start
      this.recordConnectionEvent('disconnection_start', networkStatus);
      
      // Trigger callback
      this.triggerCallback('connectionLost', networkStatus);
      
    } catch (error) {
      console.error('Error handling connection lost:', error);
    }
  }

  /**
   * Handle quality degradation
   */
  handleQualityDegradation(qualityData) {
    try {
      console.log('Quality degradation detected, checking connection');
      
      // If quality is critically low, initiate recovery
      if (qualityData.score < 0.3) {
        this.initiateRecovery();
      }
      
    } catch (error) {
      console.error('Error handling quality degradation:', error);
    }
  }

  /**
   * Initiate recovery process
   */
  initiateRecovery() {
    try {
      if (this.recoveryState === 'attempting') {
        return; // Already attempting recovery
      }
      
      // Check circuit breaker
      if (this.circuitBreaker.state === 'open') {
        const now = Date.now();
        const timeSinceLastFailure = now - this.circuitBreaker.lastFailure;
        
        if (timeSinceLastFailure < this.circuitBreaker.timeout) {
          console.log('Circuit breaker open, waiting before retry');
          return;
        } else {
          // Move to half-open state
          this.circuitBreaker.state = 'half-open';
          console.log('Circuit breaker moved to half-open state');
        }
      }
      
      this.recoveryState = 'attempting';
      this.connectionAttempts = 0;
      
      // Select appropriate strategy based on medical context
      this.selectRecoveryStrategy();
      
      // Start recovery attempts
      this.attemptRecovery();
      
      // Trigger callback
      this.triggerCallback('recoveryStarted', {
        strategy: this.currentStrategy,
        emergencyMode: this.emergencyMode
      });
      
    } catch (error) {
      console.error('Error initiating recovery:', error);
    }
  }

  /**
   * Select recovery strategy
   */
  selectRecoveryStrategy() {
    try {
      if (this.emergencyMode) {
        this.currentStrategy = 'medical_priority';
        this.maxRetryAttempts = 20; // More attempts in emergency
        this.baseRetryDelay = 500; // Faster retry in emergency
      } else if (this.medicalContextAware) {
        // Use medical priority for patient-present scenarios
        this.currentStrategy = 'medical_priority';
      } else {
        // Default to exponential backoff
        this.currentStrategy = 'exponential_backoff';
      }
      
      console.log(`Selected recovery strategy: ${this.currentStrategy}`);
      
    } catch (error) {
      console.error('Error selecting recovery strategy:', error);
    }
  }

  /**
   * Attempt recovery
   */
  async attemptRecovery() {
    try {
      if (this.recoveryState !== 'attempting') {
        return; // Recovery was cancelled
      }
      
      this.connectionAttempts++;
      this.recoveryMetrics.totalAttempts++;
      
      console.log(`Recovery attempt ${this.connectionAttempts}/${this.maxRetryAttempts}`);
      
      // Test connection
      const connectionTest = await this.testConnection();
      
      if (connectionTest.success) {
        this.handleSuccessfulRecovery(connectionTest);
      } else {
        this.handleFailedRecovery(connectionTest);
      }
      
    } catch (error) {
      console.error('Error during recovery attempt:', error);
      this.handleFailedRecovery({ error: error.message });
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      
      // Multiple connection tests for reliability
      const tests = [
        this.testBasicConnectivity(),
        this.testServiceEndpoint(),
        this.testBandwidthQuality()
      ];
      
      const results = await Promise.allSettled(tests);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      
      const endTime = Date.now();
      const testDuration = endTime - startTime;
      
      const success = successCount >= 2; // At least 2 out of 3 tests must pass
      
      return {
        success: success,
        duration: testDuration,
        testResults: results,
        successCount: successCount,
        totalTests: tests.length,
        networkStatus: networkStatusDetector.getCurrentStatus()
      };
      
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        error: error.message,
        duration: 0,
        testResults: [],
        successCount: 0,
        totalTests: 0
      };
    }
  }

  /**
   * Test basic connectivity
   */
  async testBasicConnectivity() {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      return {
        success: response.ok,
        status: response.status,
        type: 'basic_connectivity'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: 'basic_connectivity'
      };
    }
  }

  /**
   * Test service endpoint
   */
  async testServiceEndpoint() {
    try {
      // Xenova endpoint doesn't have a health check, so we check if the endpoint is accessible
      const response = await fetch('/api/transcribe-upload', {
        method: 'OPTIONS',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      // For OPTIONS request, we just check if it returns 200
      const isHealthy = response.ok;
      
      return {
        success: isHealthy,
        data: { status: isHealthy ? 'healthy' : 'unhealthy' },
        type: 'service_endpoint'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: 'service_endpoint'
      };
    }
  }

  /**
   * Test bandwidth quality
   */
  async testBandwidthQuality() {
    try {
      const testData = new ArrayBuffer(1024); // 1KB test
      const startTime = Date.now();
      
      const response = await fetch('/api/bandwidth-test', {
        method: 'POST',
        body: testData,
        cache: 'no-store',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const speed = (testData.byteLength * 8) / (duration / 1000); // bits per second
      
      return {
        success: response.ok && speed > 10000, // At least 10 kbps
        speed: speed,
        duration: duration,
        type: 'bandwidth_quality'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: 'bandwidth_quality'
      };
    }
  }

  /**
   * Handle successful recovery
   */
  handleSuccessfulRecovery(connectionTest) {
    try {
      const recoveryDuration = Date.now() - (this.lastConnectionTime || Date.now());
      
      console.log('Connection recovery successful');
      
      // Update state
      this.recoveryState = 'idle';
      this.connectionAttempts = 0;
      this.lastConnectionTime = Date.now();
      
      // Clear recovery timer
      if (this.recoveryTimer) {
        clearTimeout(this.recoveryTimer);
        this.recoveryTimer = null;
      }
      
      // Reset circuit breaker
      this.resetCircuitBreaker();
      
      // Update metrics
      this.recoveryMetrics.successfulRecoveries++;
      this.updateRecoveryMetrics(recoveryDuration);
      
      // Record recovery event
      this.recordConnectionEvent('recovery_success', {
        attempts: this.connectionAttempts,
        duration: recoveryDuration,
        connectionTest: connectionTest
      });
      
      // Trigger callback
      this.triggerCallback('recoverySuccessful', {
        attempts: this.connectionAttempts,
        duration: recoveryDuration,
        connectionTest: connectionTest
      });
      
    } catch (error) {
      console.error('Error handling successful recovery:', error);
    }
  }

  /**
   * Handle failed recovery
   */
  handleFailedRecovery(connectionTest) {
    try {
      console.log(`Recovery attempt ${this.connectionAttempts} failed`);
      
      // Update circuit breaker
      this.recordCircuitBreakerFailure();
      
      // Check if we should continue trying
      if (this.connectionAttempts >= this.maxRetryAttempts) {
        this.handleMaxRetriesReached();
        return;
      }
      
      // Calculate next retry delay
      const delay = this.calculateRetryDelay();
      
      // Schedule next attempt
      this.scheduleNextAttempt(delay);
      
      // Record failed attempt
      this.recordConnectionEvent('recovery_attempt_failed', {
        attempt: this.connectionAttempts,
        nextRetryIn: delay,
        connectionTest: connectionTest
      });
      
      // Trigger callback
      this.triggerCallback('recoveryAttemptFailed', {
        attempt: this.connectionAttempts,
        maxAttempts: this.maxRetryAttempts,
        nextRetryIn: delay,
        connectionTest: connectionTest
      });
      
    } catch (error) {
      console.error('Error handling failed recovery:', error);
    }
  }

  /**
   * Handle max retries reached
   */
  handleMaxRetriesReached() {
    try {
      console.error('Max recovery attempts reached, entering failed state');
      
      this.recoveryState = 'failed';
      this.recoveryMetrics.failedRecoveries++;
      
      // Open circuit breaker
      this.circuitBreaker.state = 'open';
      this.circuitBreaker.lastFailure = Date.now();
      
      // Clear recovery timer
      if (this.recoveryTimer) {
        clearTimeout(this.recoveryTimer);
        this.recoveryTimer = null;
      }
      
      // Record failure
      this.recordConnectionEvent('recovery_failed', {
        totalAttempts: this.connectionAttempts,
        finalState: 'failed'
      });
      
      // Trigger callback
      this.triggerCallback('recoveryFailed', {
        totalAttempts: this.connectionAttempts,
        strategy: this.currentStrategy
      });
      
      // Schedule circuit breaker reset
      this.scheduleCircuitBreakerReset();
      
    } catch (error) {
      console.error('Error handling max retries reached:', error);
    }
  }

  /**
   * Calculate retry delay
   */
  calculateRetryDelay() {
    try {
      const strategy = this.strategies[this.currentStrategy];
      return strategy ? strategy() : this.exponentialBackoffStrategy();
    } catch (error) {
      console.error('Error calculating retry delay:', error);
      return this.baseRetryDelay;
    }
  }

  /**
   * Exponential backoff strategy
   */
  exponentialBackoffStrategy() {
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(this.backoffMultiplier, this.connectionAttempts - 1),
      this.maxRetryDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = delay * this.jitterFactor * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Linear backoff strategy
   */
  linearBackoffStrategy() {
    const delay = Math.min(
      this.baseRetryDelay + (this.connectionAttempts - 1) * 1000,
      this.maxRetryDelay
    );
    
    const jitter = delay * this.jitterFactor * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Fibonacci backoff strategy
   */
  fibonacciBackoffStrategy() {
    const fibonacci = (n) => {
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    };
    
    const delay = Math.min(
      this.baseRetryDelay * fibonacci(this.connectionAttempts),
      this.maxRetryDelay
    );
    
    const jitter = delay * this.jitterFactor * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Medical priority strategy
   */
  medicalPriorityStrategy() {
    // Faster recovery for medical environments
    const urgencyMultiplier = this.emergencyMode ? 0.5 : 0.7;
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(1.5, this.connectionAttempts - 1) * urgencyMultiplier,
      this.maxRetryDelay * urgencyMultiplier
    );
    
    // Minimal jitter for medical priority
    const jitter = delay * 0.05 * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Schedule next attempt
   */
  scheduleNextAttempt(delay) {
    try {
      this.recoveryState = 'backing_off';
      
      console.log(`Scheduling next recovery attempt in ${delay}ms`);
      
      this.recoveryTimer = setTimeout(() => {
        this.attemptRecovery();
      }, delay);
      
    } catch (error) {
      console.error('Error scheduling next attempt:', error);
    }
  }

  /**
   * Schedule circuit breaker reset
   */
  scheduleCircuitBreakerReset() {
    try {
      setTimeout(() => {
        if (this.circuitBreaker.state === 'open') {
          this.circuitBreaker.state = 'half-open';
          this.circuitBreaker.failures = 0;
          console.log('Circuit breaker reset to half-open state');
          
          // Try recovery again
          this.initiateRecovery();
        }
      }, this.circuitBreaker.timeout);
      
    } catch (error) {
      console.error('Error scheduling circuit breaker reset:', error);
    }
  }

  /**
   * Record circuit breaker failure
   */
  recordCircuitBreakerFailure() {
    try {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailure = Date.now();
      
      if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
        this.circuitBreaker.state = 'open';
        console.log('Circuit breaker opened due to consecutive failures');
      }
      
    } catch (error) {
      console.error('Error recording circuit breaker failure:', error);
    }
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    try {
      this.circuitBreaker.state = 'closed';
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.lastFailure = null;
      
    } catch (error) {
      console.error('Error resetting circuit breaker:', error);
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthCheckMonitoring() {
    try {
      // Periodic health checks
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck();
      }, 30000); // Every 30 seconds
      
    } catch (error) {
      console.error('Error starting health check monitoring:', error);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      if (this.recoveryState === 'attempting') {
        return; // Skip health check during recovery
      }
      
      const healthCheck = await this.testConnection();
      
      if (!healthCheck.success && this.recoveryState === 'idle') {
        console.log('Health check failed, initiating recovery');
        this.initiateRecovery();
      }
      
    } catch (error) {
      console.error('Error performing health check:', error);
    }
  }

  /**
   * Record connection event
   */
  recordConnectionEvent(eventType, data) {
    try {
      const event = {
        timestamp: new Date(),
        type: eventType,
        data: data,
        recoveryState: this.recoveryState,
        connectionAttempts: this.connectionAttempts,
        circuitBreakerState: this.circuitBreaker.state
      };
      
      this.connectionHistory.push(event);
      
      // Maintain history size
      if (this.connectionHistory.length > this.maxHistorySize) {
        this.connectionHistory.shift();
      }
      
    } catch (error) {
      console.error('Error recording connection event:', error);
    }
  }

  /**
   * Update recovery metrics
   */
  updateRecoveryMetrics(recoveryDuration) {
    try {
      // Update average recovery time
      const totalSuccessful = this.recoveryMetrics.successfulRecoveries;
      const currentAverage = this.recoveryMetrics.averageRecoveryTime;
      this.recoveryMetrics.averageRecoveryTime = 
        (currentAverage * (totalSuccessful - 1) + recoveryDuration) / totalSuccessful;
      
      // Update longest disconnection
      if (recoveryDuration > this.recoveryMetrics.longestDisconnection) {
        this.recoveryMetrics.longestDisconnection = recoveryDuration;
      }
      
      // Update shortest recovery
      if (recoveryDuration < this.recoveryMetrics.shortestRecovery) {
        this.recoveryMetrics.shortestRecovery = recoveryDuration;
      }
      
    } catch (error) {
      console.error('Error updating recovery metrics:', error);
    }
  }

  /**
   * Force recovery attempt
   */
  forceRecovery() {
    try {
      console.log('Forcing recovery attempt');
      
      // Reset circuit breaker
      this.resetCircuitBreaker();
      
      // Initiate recovery
      this.initiateRecovery();
      
    } catch (error) {
      console.error('Error forcing recovery:', error);
    }
  }

  /**
   * Cancel recovery
   */
  cancelRecovery() {
    try {
      console.log('Cancelling recovery');
      
      this.recoveryState = 'idle';
      
      if (this.recoveryTimer) {
        clearTimeout(this.recoveryTimer);
        this.recoveryTimer = null;
      }
      
      // Trigger callback
      this.triggerCallback('recoveryCancelled', {
        attempts: this.connectionAttempts
      });
      
    } catch (error) {
      console.error('Error cancelling recovery:', error);
    }
  }

  /**
   * Set emergency mode
   */
  setEmergencyMode(enabled) {
    try {
      this.emergencyMode = enabled;
      
      if (enabled) {
        // Adjust parameters for emergency mode
        this.maxRetryAttempts = 20;
        this.baseRetryDelay = 500;
        this.currentStrategy = 'medical_priority';
        
        console.log('Emergency mode enabled');
      } else {
        // Reset to normal parameters
        this.maxRetryAttempts = 10;
        this.baseRetryDelay = 1000;
        this.currentStrategy = 'exponential_backoff';
        
        console.log('Emergency mode disabled');
      }
      
    } catch (error) {
      console.error('Error setting emergency mode:', error);
    }
  }

  /**
   * Get recovery status
   */
  getRecoveryStatus() {
    return {
      state: this.recoveryState,
      attempts: this.connectionAttempts,
      maxAttempts: this.maxRetryAttempts,
      strategy: this.currentStrategy,
      circuitBreakerState: this.circuitBreaker.state,
      emergencyMode: this.emergencyMode,
      lastConnectionTime: this.lastConnectionTime,
      connectionQuality: this.connectionQuality,
      isRecovering: this.recoveryState === 'attempting' || this.recoveryState === 'backing_off'
    };
  }

  /**
   * Get recovery metrics
   */
  getRecoveryMetrics() {
    return {
      ...this.recoveryMetrics,
      successRate: this.recoveryMetrics.totalAttempts > 0 ? 
        this.recoveryMetrics.successfulRecoveries / this.recoveryMetrics.totalAttempts : 0,
      currentState: this.recoveryState,
      circuitBreakerState: this.circuitBreaker.state
    };
  }

  /**
   * Get connection history
   */
  getConnectionHistory() {
    return this.connectionHistory;
  }

  /**
   * Register callback
   */
  onEvent(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    
    this.callbacks.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.get(event).delete(callback);
    };
  }

  /**
   * Trigger callback
   */
  triggerCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in recovery callback:', error);
        }
      });
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    try {
      // Cancel any ongoing recovery
      this.cancelRecovery();
      
      // Clear timers
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }
      
      // Clear callbacks
      this.callbacks.clear();
      
      // Clear history
      this.connectionHistory = [];
      
      console.log('ConnectionRecoveryService destroyed');
      
    } catch (error) {
      console.error('Error destroying connection recovery service:', error);
    }
  }
}

// Export singleton instance
export const connectionRecoveryService = new ConnectionRecoveryService();