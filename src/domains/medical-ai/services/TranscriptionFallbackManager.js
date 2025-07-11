/**
 * Transcription Fallback Manager
 * 
 * Manages automatic switching between transcription services for medical-grade reliability
 */

import { networkStatusDetector } from './NetworkStatusDetector.js';

export class TranscriptionFallbackManager {
  constructor(primaryService) {
    this.primaryService = primaryService;
    this.currentService = 'browser'; // browser, whisper, deepgram
    this.fallbackServices = ['browser', 'whisper', 'deepgram'];
    this.serviceHealth = new Map();
    this.circuitBreakers = new Map();
    this.switchHistory = [];
    this.maxSwitchHistory = 20;
    this.isInitialized = false;
    
    this.initializeServices();
  }

  /**
   * Initialize all available transcription services
   */
  async initializeServices() {
    try {
      // Initialize service health tracking
      this.fallbackServices.forEach(service => {
        this.serviceHealth.set(service, {
          isHealthy: true,
          lastCheck: new Date(),
          errorCount: 0,
          successCount: 0,
          averageLatency: 0,
          reliability: 1.0
        });
        
        // Initialize circuit breaker for each service
        this.circuitBreakers.set(service, {
          state: 'closed', // closed, open, half-open
          failures: 0,
          lastFailure: null,
          threshold: 5,
          timeout: 30000 // 30 seconds
        });
      });
      
      // Set initial service based on network status
      const networkStatus = networkStatusDetector.getCurrentStatus();
      this.currentService = this.selectBestService(networkStatus);
      
      // Monitor network changes
      networkStatusDetector.onStatusChange(this.handleNetworkChange.bind(this));
      
      this.isInitialized = true;
      console.log('TranscriptionFallbackManager initialized with service:', this.currentService);
      
    } catch (error) {
      console.error('Failed to initialize TranscriptionFallbackManager:', error);
    }
  }

  /**
   * Switch to the best available fallback service
   */
  async switchToFallback() {
    try {
      const currentServiceIndex = this.fallbackServices.indexOf(this.currentService);
      const networkStatus = networkStatusDetector.getCurrentStatus();
      
      // Mark current service as unhealthy
      this.markServiceUnhealthy(this.currentService);
      
      // Find next best service
      const nextService = this.selectBestService(networkStatus, this.currentService);
      
      if (nextService !== this.currentService) {
        await this.switchToService(nextService);
        return true;
      }
      
      console.warn('No healthy fallback service available');
      return false;
      
    } catch (error) {
      console.error('Failed to switch to fallback service:', error);
      return false;
    }
  }

  /**
   * Switch to a specific service
   */
  async switchToService(serviceName) {
    try {
      const previousService = this.currentService;
      
      // Check if service is available
      if (!this.isServiceAvailable(serviceName)) {
        throw new Error(`Service ${serviceName} is not available`);
      }
      
      // Perform the switch
      this.currentService = serviceName;
      
      // Record the switch
      this.recordServiceSwitch(previousService, serviceName);
      
      // Initialize new service if needed
      await this.initializeService(serviceName);
      
      console.log(`Switched transcription service from ${previousService} to ${serviceName}`);
      
      return true;
      
    } catch (error) {
      console.error(`Failed to switch to service ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Select the best service based on network conditions and service health
   */
  selectBestService(networkStatus, excludeService = null) {
    const availableServices = this.fallbackServices.filter(service => {
      return service !== excludeService && this.isServiceAvailable(service);
    });
    
    if (availableServices.length === 0) {
      return 'browser'; // Default fallback
    }
    
    // Score each service based on network conditions and health
    const serviceScores = availableServices.map(service => {
      const health = this.serviceHealth.get(service);
      const circuitBreaker = this.circuitBreakers.get(service);
      
      let score = 0;
      
      // Base score from service type
      const baseScores = {
        'browser': 70,  // Always available, moderate quality
        'whisper': 85,  // High quality, needs network
        'deepgram': 90  // Highest quality, needs network
      };
      score += baseScores[service] || 50;
      
      // Network-dependent adjustments
      if (service !== 'browser') {
        if (!networkStatus.isOnline) {
          score -= 50; // Heavy penalty for offline
        } else {
          const qualityBonuses = {
            'excellent': 20,
            'good': 10,
            'fair': 0,
            'poor': -20,
            'offline': -50
          };
          score += qualityBonuses[networkStatus.quality] || 0;
        }
      }
      
      // Health-based adjustments
      score += (health.reliability * 20); // 0-20 points
      score -= (health.errorCount * 2); // Penalty for errors
      
      // Circuit breaker penalties
      if (circuitBreaker.state === 'open') {
        score -= 30;
      } else if (circuitBreaker.state === 'half-open') {
        score -= 10;
      }
      
      // Latency penalty
      if (health.averageLatency > 1000) {
        score -= 15;
      } else if (health.averageLatency > 500) {
        score -= 5;
      }
      
      return { service, score };
    });
    
    // Sort by score and return the best
    serviceScores.sort((a, b) => b.score - a.score);
    
    console.log('Service selection scores:', serviceScores);
    
    return serviceScores[0].service;
  }

  /**
   * Check if a service is available
   */
  isServiceAvailable(serviceName) {
    const health = this.serviceHealth.get(serviceName);
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    
    if (!health || !circuitBreaker) {
      return false;
    }
    
    // Check circuit breaker state
    if (circuitBreaker.state === 'open') {
      // Check if timeout has passed
      const now = Date.now();
      const lastFailure = circuitBreaker.lastFailure;
      
      if (lastFailure && (now - lastFailure) > circuitBreaker.timeout) {
        // Move to half-open state
        circuitBreaker.state = 'half-open';
        circuitBreaker.failures = 0;
        return true;
      }
      
      return false;
    }
    
    // Service is available if healthy or in half-open state
    return health.isHealthy || circuitBreaker.state === 'half-open';
  }

  /**
   * Initialize a specific service
   */
  async initializeService(serviceName) {
    try {
      switch (serviceName) {
        case 'browser':
          // Browser speech recognition is handled by the main service
          break;
          
        case 'whisper':
          // Initialize Whisper service
          await this.initializeWhisperService();
          break;
          
        case 'deepgram':
          // Initialize Deepgram service
          await this.initializeDeepgramService();
          break;
          
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
      
      console.log(`Service ${serviceName} initialized successfully`);
      
    } catch (error) {
      console.error(`Failed to initialize service ${serviceName}:`, error);
      this.markServiceUnhealthy(serviceName);
      throw error;
    }
  }

  /**
   * Initialize Whisper service
   */
  async initializeWhisperService() {
    try {
      // Check if Whisper is available (would be implemented with actual API)
      const isAvailable = await this.checkServiceAvailability('whisper');
      
      if (!isAvailable) {
        throw new Error('Whisper service is not available');
      }
      
      console.log('Whisper service ready');
      
    } catch (error) {
      console.error('Failed to initialize Whisper service:', error);
      throw error;
    }
  }

  /**
   * Initialize Deepgram service
   */
  async initializeDeepgramService() {
    try {
      // Check if Deepgram is available (would be implemented with actual API)
      const isAvailable = await this.checkServiceAvailability('deepgram');
      
      if (!isAvailable) {
        throw new Error('Deepgram service is not available');
      }
      
      console.log('Deepgram service ready');
      
    } catch (error) {
      console.error('Failed to initialize Deepgram service:', error);
      throw error;
    }
  }

  /**
   * Check if a service is available
   */
  async checkServiceAvailability(serviceName) {
    try {
      // This would make actual API calls to check service health
      // For now, we'll simulate the check
      
      const networkStatus = networkStatusDetector.getCurrentStatus();
      
      // Browser service is always available
      if (serviceName === 'browser') {
        return true;
      }
      
      // Cloud services need network connectivity
      if (!networkStatus.isOnline) {
        return false;
      }
      
      // Simulate service health check
      const healthCheckPromise = new Promise((resolve) => {
        setTimeout(() => {
          // Simulate 95% uptime
          resolve(Math.random() > 0.05);
        }, 100);
      });
      
      return await healthCheckPromise;
      
    } catch (error) {
      console.error(`Service availability check failed for ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Mark a service as unhealthy
   */
  markServiceUnhealthy(serviceName) {
    const health = this.serviceHealth.get(serviceName);
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    
    if (health && circuitBreaker) {
      health.isHealthy = false;
      health.errorCount++;
      health.lastCheck = new Date();
      
      // Update circuit breaker
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = Date.now();
      
      // Open circuit breaker if threshold reached
      if (circuitBreaker.failures >= circuitBreaker.threshold) {
        circuitBreaker.state = 'open';
        console.log(`Circuit breaker opened for service ${serviceName}`);
      }
      
      // Recalculate reliability
      const total = health.successCount + health.errorCount;
      health.reliability = total > 0 ? health.successCount / total : 0;
    }
  }

  /**
   * Mark a service as healthy
   */
  markServiceHealthy(serviceName) {
    const health = this.serviceHealth.get(serviceName);
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    
    if (health && circuitBreaker) {
      health.isHealthy = true;
      health.successCount++;
      health.lastCheck = new Date();
      
      // Reset circuit breaker on success
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.failures = 0;
        console.log(`Circuit breaker closed for service ${serviceName}`);
      }
      
      // Recalculate reliability
      const total = health.successCount + health.errorCount;
      health.reliability = total > 0 ? health.successCount / total : 1.0;
    }
  }

  /**
   * Record a service switch for analytics
   */
  recordServiceSwitch(fromService, toService) {
    const switchRecord = {
      timestamp: new Date(),
      from: fromService,
      to: toService,
      networkStatus: networkStatusDetector.getCurrentStatus(),
      reason: 'fallback'
    };
    
    this.switchHistory.push(switchRecord);
    
    // Keep history size manageable
    if (this.switchHistory.length > this.maxSwitchHistory) {
      this.switchHistory.shift();
    }
  }

  /**
   * Handle network status changes
   */
  handleNetworkChange(networkStatus) {
    console.log('Network status changed:', networkStatus);
    
    // If network quality improved significantly, consider switching to better service
    if (networkStatus.quality === 'excellent' && this.currentService === 'browser') {
      const bestService = this.selectBestService(networkStatus);
      if (bestService !== this.currentService) {
        this.switchToService(bestService);
      }
    }
    
    // If network degraded, consider switching to more reliable service
    if (networkStatus.quality === 'poor' && this.currentService !== 'browser') {
      this.switchToService('browser');
    }
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      currentService: this.currentService,
      isInitialized: this.isInitialized,
      serviceHealth: Object.fromEntries(this.serviceHealth),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([key, value]) => [key, {
          state: value.state,
          failures: value.failures,
          lastFailure: value.lastFailure
        }])
      ),
      switchHistory: this.switchHistory.slice(-5), // Last 5 switches
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get service recommendations
   */
  getRecommendations() {
    const networkStatus = networkStatusDetector.getCurrentStatus();
    const bestService = this.selectBestService(networkStatus);
    
    return {
      recommendedService: bestService,
      currentOptimal: bestService === this.currentService,
      networkQuality: networkStatus.quality,
      medicalGrade: networkStatus.medicalGrade,
      shouldSwitch: bestService !== this.currentService
    };
  }

  /**
   * Force a service health check
   */
  async performHealthCheck() {
    const checks = this.fallbackServices.map(async (service) => {
      try {
        const isAvailable = await this.checkServiceAvailability(service);
        
        if (isAvailable) {
          this.markServiceHealthy(service);
        } else {
          this.markServiceUnhealthy(service);
        }
        
        return { service, healthy: isAvailable };
      } catch (error) {
        this.markServiceUnhealthy(service);
        return { service, healthy: false, error: error.message };
      }
    });
    
    const results = await Promise.allSettled(checks);
    
    console.log('Health check results:', results);
    
    return results;
  }

  /**
   * Get service analytics
   */
  getAnalytics() {
    return {
      totalSwitches: this.switchHistory.length,
      switchHistory: this.switchHistory,
      serviceReliability: Object.fromEntries(
        Array.from(this.serviceHealth.entries()).map(([service, health]) => [
          service,
          {
            reliability: health.reliability,
            errorCount: health.errorCount,
            successCount: health.successCount,
            averageLatency: health.averageLatency
          }
        ])
      ),
      currentService: this.currentService,
      uptime: Date.now() - (this.switchHistory[0]?.timestamp || Date.now())
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clear any timers or intervals
    console.log('TranscriptionFallbackManager destroyed');
  }
}

// Export the class for use in other modules
export default TranscriptionFallbackManager;