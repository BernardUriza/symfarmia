/**
 * Network Status Detector
 * 
 * Monitors network connectivity and quality for medical transcription resilience
 */

export class NetworkStatusDetector {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionType = 'unknown';
    this.effectiveType = 'unknown';
    this.downlink = 0;
    this.rtt = 0;
    this.quality = 'unknown';
    this.listeners = new Set();
    this.qualityCheckInterval = null;
    this.lastQualityCheck = Date.now();
    this.qualityHistory = [];
    this.maxHistorySize = 10;
    
    this.initialize();
  }

  /**
   * Initialize network monitoring
   */
  initialize() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Monitor network connection if available
    if (navigator.connection) {
      this.updateConnectionInfo();
      navigator.connection.addEventListener('change', this.handleConnectionChange.bind(this));
    }
    
    // Start quality monitoring
    this.startQualityMonitoring();
    
    // Initial status check
    this.checkNetworkStatus();
  }

  /**
   * Register callback for network status changes
   */
  onStatusChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current network status
   */
  getCurrentStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      effectiveType: this.effectiveType,
      downlink: this.downlink,
      rtt: this.rtt,
      quality: this.quality,
      timestamp: new Date(),
      medicalGrade: this.isMedicalGradeConnection()
    };
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    this.updateConnectionInfo();
    this.notifyListeners();
    console.log('Network connection restored');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    this.quality = 'offline';
    this.notifyListeners();
    console.log('Network connection lost');
  }

  /**
   * Handle connection change event
   */
  handleConnectionChange() {
    this.updateConnectionInfo();
    this.notifyListeners();
  }

  /**
   * Update connection information
   */
  updateConnectionInfo() {
    if (navigator.connection) {
      const conn = navigator.connection;
      this.connectionType = conn.type || 'unknown';
      this.effectiveType = conn.effectiveType || 'unknown';
      this.downlink = conn.downlink || 0;
      this.rtt = conn.rtt || 0;
      this.quality = this.calculateQuality();
    }
  }

  /**
   * Calculate network quality based on connection metrics
   */
  calculateQuality() {
    if (!this.isOnline) return 'offline';
    
    const conn = navigator.connection;
    if (!conn) return 'unknown';
    
    // Quality based on effective connection type
    const qualityMap = {
      'slow-2g': 'poor',
      '2g': 'poor',
      '3g': 'fair',
      '4g': 'good',
      '5g': 'excellent'
    };
    
    let quality = qualityMap[this.effectiveType] || 'unknown';
    
    // Adjust based on RTT (Round Trip Time)
    if (this.rtt > 1000) {
      quality = 'poor';
    } else if (this.rtt > 500) {
      quality = quality === 'excellent' ? 'good' : 'fair';
    }
    
    // Adjust based on downlink speed
    if (this.downlink < 0.5) {
      quality = 'poor';
    } else if (this.downlink < 1.5) {
      quality = quality === 'excellent' ? 'good' : 'fair';
    }
    
    return quality;
  }

  /**
   * Start quality monitoring with periodic checks
   */
  startQualityMonitoring() {
    // Clear existing interval
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }
    
    // Check quality every 30 seconds
    this.qualityCheckInterval = setInterval(() => {
      this.performQualityCheck();
    }, 30000);
  }

  /**
   * Perform network quality check
   */
  async performQualityCheck() {
    if (!this.isOnline) return;
    
    try {
      const startTime = Date.now();
      
      // Ping a lightweight endpoint to measure latency
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Update quality history
      this.qualityHistory.push({
        timestamp: new Date(),
        latency: latency,
        success: response.ok,
        status: response.status
      });
      
      // Keep only recent history
      if (this.qualityHistory.length > this.maxHistorySize) {
        this.qualityHistory.shift();
      }
      
      // Update quality based on performance
      this.updateQualityFromHistory();
      
    } catch (error) {
      console.error('Network quality check failed:', error);
      
      // Record failed check
      this.qualityHistory.push({
        timestamp: new Date(),
        latency: Infinity,
        success: false,
        error: error.message
      });
      
      this.updateQualityFromHistory();
    }
  }

  /**
   * Update quality assessment based on historical data
   */
  updateQualityFromHistory() {
    if (this.qualityHistory.length === 0) return;
    
    const recentChecks = this.qualityHistory.slice(-5);
    const successRate = recentChecks.filter(check => check.success).length / recentChecks.length;
    const avgLatency = recentChecks
      .filter(check => check.success && check.latency !== Infinity)
      .reduce((sum, check) => sum + check.latency, 0) / recentChecks.length;
    
    let newQuality = this.quality;
    
    // Determine quality based on success rate and latency
    if (successRate < 0.5) {
      newQuality = 'poor';
    } else if (successRate < 0.8) {
      newQuality = 'fair';
    } else if (avgLatency < 200) {
      newQuality = 'excellent';
    } else if (avgLatency < 500) {
      newQuality = 'good';
    } else {
      newQuality = 'fair';
    }
    
    // Update quality if changed
    if (newQuality !== this.quality) {
      this.quality = newQuality;
      this.notifyListeners();
    }
  }

  /**
   * Check if connection meets medical-grade requirements
   */
  isMedicalGradeConnection() {
    if (!this.isOnline) return false;
    
    // Medical-grade requirements:
    // - Minimum 1 Mbps downlink
    // - Maximum 300ms RTT
    // - At least 'fair' quality
    // - Recent success rate > 90%
    
    const hasMinimumSpeed = this.downlink >= 1.0;
    const hasAcceptableLatency = this.rtt <= 300;
    const hasGoodQuality = ['fair', 'good', 'excellent'].includes(this.quality);
    
    let hasHighReliability = true;
    if (this.qualityHistory.length >= 3) {
      const recentChecks = this.qualityHistory.slice(-3);
      const successRate = recentChecks.filter(check => check.success).length / recentChecks.length;
      hasHighReliability = successRate >= 0.9;
    }
    
    return hasMinimumSpeed && hasAcceptableLatency && hasGoodQuality && hasHighReliability;
  }

  /**
   * Force a network status check
   */
  async checkNetworkStatus() {
    this.isOnline = navigator.onLine;
    this.updateConnectionInfo();
    
    // Perform immediate quality check
    await this.performQualityCheck();
    
    this.notifyListeners();
  }

  /**
   * Get network recommendations for transcription
   */
  getTranscriptionRecommendations() {
    const status = this.getCurrentStatus();
    
    const recommendations = {
      preferredService: 'browser', // default
      chunkSize: 'medium',
      retryStrategy: 'standard',
      offlineMode: false,
      qualityThreshold: 0.8
    };
    
    switch (status.quality) {
      case 'excellent':
        recommendations.preferredService = 'cloud';
        recommendations.chunkSize = 'large';
        recommendations.retryStrategy = 'aggressive';
        recommendations.qualityThreshold = 0.95;
        break;
        
      case 'good':
        recommendations.preferredService = 'cloud';
        recommendations.chunkSize = 'medium';
        recommendations.retryStrategy = 'standard';
        recommendations.qualityThreshold = 0.9;
        break;
        
      case 'fair':
        recommendations.preferredService = 'browser';
        recommendations.chunkSize = 'small';
        recommendations.retryStrategy = 'conservative';
        recommendations.qualityThreshold = 0.8;
        break;
        
      case 'poor':
      case 'offline':
        recommendations.preferredService = 'browser';
        recommendations.chunkSize = 'small';
        recommendations.retryStrategy = 'minimal';
        recommendations.offlineMode = true;
        recommendations.qualityThreshold = 0.7;
        break;
    }
    
    return recommendations;
  }

  /**
   * Notify all listeners of status changes
   */
  notifyListeners() {
    const status = this.getCurrentStatus();
    
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get detailed network diagnostics
   */
  getDiagnostics() {
    return {
      status: this.getCurrentStatus(),
      history: this.qualityHistory.slice(-10),
      recommendations: this.getTranscriptionRecommendations(),
      capabilities: {
        hasConnectionAPI: !!navigator.connection,
        hasOnlineEvents: 'onLine' in navigator,
        supportedTypes: navigator.connection ? {
          type: navigator.connection.type,
          effectiveType: navigator.connection.effectiveType
        } : null
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', this.handleConnectionChange.bind(this));
    }
    
    // Clear intervals
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }
    
    // Clear listeners
    this.listeners.clear();
  }
}

// Export singleton instance
export const networkStatusDetector = new NetworkStatusDetector();