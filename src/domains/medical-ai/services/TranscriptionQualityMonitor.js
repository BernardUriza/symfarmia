/**
 * Transcription Quality Monitor
 * 
 * Monitors transcription quality and network performance for proactive switching
 */

import { networkStatusDetector } from './NetworkStatusDetector.js';

export class TranscriptionQualityMonitor {
  constructor() {
    this.qualityMetrics = {
      transcriptionAccuracy: 0,
      networkLatency: 0,
      audioQuality: 0,
      overallQuality: 0,
      confidenceScore: 0,
      errorRate: 0,
      throughput: 0,
      availability: 0
    };
    
    this.performanceHistory = [];
    this.maxHistorySize = 100;
    this.qualityThresholds = {
      excellent: 0.9,
      good: 0.7,
      fair: 0.5,
      poor: 0.3
    };
    
    this.networkPerformance = {
      latency: [],
      bandwidth: [],
      stability: [],
      packetLoss: []
    };
    
    this.transcriptionMetrics = {
      totalTranscriptions: 0,
      successfulTranscriptions: 0,
      failedTranscriptions: 0,
      averageConfidence: 0,
      medicalTermAccuracy: 0,
      processingTime: []
    };
    
    this.alerts = new Set();
    this.callbacks = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.degradationDetected = false;
    this.lastQualityCheck = Date.now();
    this.qualityTrends = [];
    this.predictiveMode = true;
    this.autoSwitchEnabled = true;
    this.currentMode = 'online'; // online, offline, hybrid
    
    this.initialize();
  }

  /**
   * Initialize quality monitoring
   */
  initialize() {
    try {
      // Monitor network changes
      networkStatusDetector.onStatusChange(this.handleNetworkChange.bind(this));
      
      // Start monitoring
      this.startMonitoring();
      
      console.log('TranscriptionQualityMonitor initialized');
      
    } catch (error) {
      console.error('Failed to initialize TranscriptionQualityMonitor:', error);
    }
  }

  /**
   * Start quality monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Start periodic quality checks
    this.monitoringInterval = setInterval(() => {
      this.performQualityCheck();
    }, 5000); // Check every 5 seconds
    
    console.log('Quality monitoring started');
  }

  /**
   * Stop quality monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Quality monitoring stopped');
  }

  /**
   * Perform comprehensive quality check
   */
  async performQualityCheck() {
    try {
      const startTime = Date.now();
      
      // Check network performance
      const networkQuality = await this.checkNetworkQuality();
      
      // Check transcription performance
      const transcriptionQuality = this.checkTranscriptionQuality();
      
      // Check audio quality
      const audioQuality = this.checkAudioQuality();
      
      // Calculate overall quality
      const overallQuality = this.calculateOverallQuality(
        networkQuality,
        transcriptionQuality,
        audioQuality
      );
      
      // Update metrics
      this.updateQualityMetrics({
        networkQuality,
        transcriptionQuality,
        audioQuality,
        overallQuality,
        timestamp: new Date(),
        checkDuration: Date.now() - startTime
      });
      
      // Check for degradation
      this.checkForDegradation(overallQuality);
      
      // Predict future quality
      if (this.predictiveMode) {
        this.predictQualityTrends();
      }
      
      // Auto-switch if needed
      if (this.autoSwitchEnabled) {
        this.evaluateAutoSwitch(overallQuality);
      }
      
      this.lastQualityCheck = Date.now();
      
    } catch (error) {
      console.error('Error performing quality check:', error);
    }
  }

  /**
   * Check network quality
   */
  async checkNetworkQuality() {
    try {
      const networkStatus = networkStatusDetector.getCurrentStatus();
      
      // Perform latency test
      const latency = await this.measureLatency();
      
      // Perform bandwidth test
      const bandwidth = await this.measureBandwidth();
      
      // Calculate stability
      const stability = this.calculateNetworkStability();
      
      // Update network performance history
      this.updateNetworkPerformance({
        latency,
        bandwidth,
        stability,
        timestamp: Date.now()
      });
      
      // Calculate network quality score
      const qualityScore = this.calculateNetworkQualityScore({
        latency,
        bandwidth,
        stability,
        connectionType: networkStatus.connectionType,
        effectiveType: networkStatus.effectiveType
      });
      
      return {
        score: qualityScore,
        latency,
        bandwidth,
        stability,
        status: networkStatus
      };
      
    } catch (error) {
      console.error('Error checking network quality:', error);
      return {
        score: 0,
        latency: Infinity,
        bandwidth: 0,
        stability: 0,
        status: { quality: 'unknown' }
      };
    }
  }

  /**
   * Measure network latency
   */
  async measureLatency() {
    try {
      const startTime = Date.now();
      
      // Ping a lightweight endpoint
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      return response.ok ? latency : Infinity;
      
    } catch (error) {
      console.error('Error measuring latency:', error);
      return Infinity;
    }
  }

  /**
   * Measure bandwidth
   */
  async measureBandwidth() {
    try {
      // Simple bandwidth test using a small file
      const testSize = 1024; // 1KB
      const startTime = Date.now();
      
      const response = await fetch('/api/bandwidth-test', {
        method: 'POST',
        body: new ArrayBuffer(testSize),
        cache: 'no-store'
      });
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      
      if (response.ok && duration > 0) {
        return (testSize * 8) / duration; // bits per second
      }
      
      return 0;
      
    } catch (error) {
      console.error('Error measuring bandwidth:', error);
      return 0;
    }
  }

  /**
   * Calculate network stability
   */
  calculateNetworkStability() {
    try {
      if (this.networkPerformance.latency.length < 5) {
        return 0.5; // Insufficient data
      }
      
      const recentLatencies = this.networkPerformance.latency.slice(-10);
      const average = recentLatencies.reduce((sum, l) => sum + l, 0) / recentLatencies.length;
      
      // Calculate variance
      const variance = recentLatencies.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) / recentLatencies.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Stability score (lower variance = higher stability)
      const stability = Math.max(0, 1 - (standardDeviation / average));
      
      return Math.min(1, stability);
      
    } catch (error) {
      console.error('Error calculating network stability:', error);
      return 0;
    }
  }

  /**
   * Calculate network quality score
   */
  calculateNetworkQualityScore(networkData) {
    try {
      let score = 0;
      
      // Latency score (lower is better)
      if (networkData.latency < 100) {
        score += 0.4;
      } else if (networkData.latency < 300) {
        score += 0.3;
      } else if (networkData.latency < 1000) {
        score += 0.2;
      } else {
        score += 0.1;
      }
      
      // Bandwidth score
      if (networkData.bandwidth > 1000000) { // 1 Mbps
        score += 0.3;
      } else if (networkData.bandwidth > 500000) { // 500 kbps
        score += 0.2;
      } else if (networkData.bandwidth > 100000) { // 100 kbps
        score += 0.1;
      }
      
      // Stability score
      score += networkData.stability * 0.3;
      
      return Math.min(1, score);
      
    } catch (error) {
      console.error('Error calculating network quality score:', error);
      return 0;
    }
  }

  /**
   * Check transcription quality
   */
  checkTranscriptionQuality() {
    try {
      const metrics = this.transcriptionMetrics;
      
      // Calculate success rate
      const successRate = metrics.totalTranscriptions > 0 ? 
        metrics.successfulTranscriptions / metrics.totalTranscriptions : 0;
      
      // Calculate average processing time
      const avgProcessingTime = metrics.processingTime.length > 0 ?
        metrics.processingTime.reduce((sum, time) => sum + time, 0) / metrics.processingTime.length : 0;
      
      // Calculate quality score
      let qualityScore = 0;
      
      // Success rate component (40%)
      qualityScore += successRate * 0.4;
      
      // Confidence component (30%)
      qualityScore += metrics.averageConfidence * 0.3;
      
      // Medical term accuracy component (20%)
      qualityScore += metrics.medicalTermAccuracy * 0.2;
      
      // Processing time component (10%)
      const processingTimeScore = avgProcessingTime > 0 ? 
        Math.max(0, 1 - (avgProcessingTime / 5000)) : 0.5; // 5 seconds baseline
      qualityScore += processingTimeScore * 0.1;
      
      return {
        score: Math.min(1, qualityScore),
        successRate,
        averageConfidence: metrics.averageConfidence,
        medicalTermAccuracy: metrics.medicalTermAccuracy,
        averageProcessingTime: avgProcessingTime,
        totalTranscriptions: metrics.totalTranscriptions
      };
      
    } catch (error) {
      console.error('Error checking transcription quality:', error);
      return {
        score: 0,
        successRate: 0,
        averageConfidence: 0,
        medicalTermAccuracy: 0,
        averageProcessingTime: 0,
        totalTranscriptions: 0
      };
    }
  }

  /**
   * Check audio quality
   */
  checkAudioQuality() {
    try {
      // This would analyze audio input quality
      // For now, we'll simulate based on available data
      
      const audioQuality = {
        signalStrength: 0.8,
        noiseLevel: 0.1,
        clarity: 0.9,
        stability: 0.85
      };
      
      // Calculate overall audio quality score
      const score = (
        audioQuality.signalStrength * 0.4 +
        (1 - audioQuality.noiseLevel) * 0.3 +
        audioQuality.clarity * 0.2 +
        audioQuality.stability * 0.1
      );
      
      return {
        score: Math.min(1, score),
        ...audioQuality
      };
      
    } catch (error) {
      console.error('Error checking audio quality:', error);
      return {
        score: 0,
        signalStrength: 0,
        noiseLevel: 1,
        clarity: 0,
        stability: 0
      };
    }
  }

  /**
   * Calculate overall quality
   */
  calculateOverallQuality(networkQuality, transcriptionQuality, audioQuality) {
    try {
      // Weighted average of all quality components
      const weights = {
        network: 0.4,
        transcription: 0.4,
        audio: 0.2
      };
      
      const overallScore = (
        networkQuality.score * weights.network +
        transcriptionQuality.score * weights.transcription +
        audioQuality.score * weights.audio
      );
      
      return {
        score: Math.min(1, overallScore),
        level: this.getQualityLevel(overallScore),
        components: {
          network: networkQuality,
          transcription: transcriptionQuality,
          audio: audioQuality
        }
      };
      
    } catch (error) {
      console.error('Error calculating overall quality:', error);
      return {
        score: 0,
        level: 'poor',
        components: {
          network: { score: 0 },
          transcription: { score: 0 },
          audio: { score: 0 }
        }
      };
    }
  }

  /**
   * Get quality level from score
   */
  getQualityLevel(score) {
    if (score >= this.qualityThresholds.excellent) return 'excellent';
    if (score >= this.qualityThresholds.good) return 'good';
    if (score >= this.qualityThresholds.fair) return 'fair';
    return 'poor';
  }

  /**
   * Update quality metrics
   */
  updateQualityMetrics(qualityData) {
    try {
      // Update current metrics
      this.qualityMetrics = {
        transcriptionAccuracy: qualityData.transcriptionQuality.score,
        networkLatency: qualityData.networkQuality.latency,
        audioQuality: qualityData.audioQuality.score,
        overallQuality: qualityData.overallQuality.score,
        confidenceScore: qualityData.transcriptionQuality.averageConfidence,
        errorRate: 1 - qualityData.transcriptionQuality.successRate,
        throughput: qualityData.networkQuality.bandwidth,
        availability: qualityData.networkQuality.status.isOnline ? 1 : 0
      };
      
      // Add to history
      this.performanceHistory.push({
        timestamp: qualityData.timestamp,
        metrics: { ...this.qualityMetrics },
        qualityLevel: qualityData.overallQuality.level
      });
      
      // Maintain history size
      if (this.performanceHistory.length > this.maxHistorySize) {
        this.performanceHistory.shift();
      }
      
      // Trigger callbacks
      this.triggerCallback('qualityUpdated', {
        metrics: this.qualityMetrics,
        qualityData: qualityData
      });
      
    } catch (error) {
      console.error('Error updating quality metrics:', error);
    }
  }

  /**
   * Update network performance history
   */
  updateNetworkPerformance(perfData) {
    try {
      this.networkPerformance.latency.push(perfData.latency);
      this.networkPerformance.bandwidth.push(perfData.bandwidth);
      this.networkPerformance.stability.push(perfData.stability);
      
      // Maintain history size
      const maxSize = 50;
      Object.keys(this.networkPerformance).forEach(key => {
        if (this.networkPerformance[key].length > maxSize) {
          this.networkPerformance[key].shift();
        }
      });
      
    } catch (error) {
      console.error('Error updating network performance:', error);
    }
  }

  /**
   * Check for quality degradation
   */
  checkForDegradation(overallQuality) {
    try {
      const currentScore = overallQuality.score;
      const threshold = this.qualityThresholds.fair;
      
      // Check if quality has degraded
      if (currentScore < threshold && !this.degradationDetected) {
        this.degradationDetected = true;
        this.addAlert('quality_degradation', {
          score: currentScore,
          level: overallQuality.level,
          timestamp: new Date()
        });
        
        console.warn('Quality degradation detected:', overallQuality);
        
        // Trigger callback
        this.triggerCallback('qualityDegraded', overallQuality);
      }
      
      // Check if quality has improved
      if (currentScore >= threshold && this.degradationDetected) {
        this.degradationDetected = false;
        this.removeAlert('quality_degradation');
        
        console.log('Quality improved:', overallQuality);
        
        // Trigger callback
        this.triggerCallback('qualityImproved', overallQuality);
      }
      
    } catch (error) {
      console.error('Error checking for degradation:', error);
    }
  }

  /**
   * Predict quality trends
   */
  predictQualityTrends() {
    try {
      if (this.performanceHistory.length < 10) return;
      
      // Analyze recent trend
      const recentHistory = this.performanceHistory.slice(-10);
      const scores = recentHistory.map(h => h.metrics.overallQuality);
      
      // Calculate trend direction
      const trend = this.calculateTrend(scores);
      
      // Add to trends
      this.qualityTrends.push({
        timestamp: new Date(),
        trend: trend,
        prediction: this.predictNextQuality(scores)
      });
      
      // Maintain trends size
      if (this.qualityTrends.length > 20) {
        this.qualityTrends.shift();
      }
      
      // Alert if predicting degradation
      if (trend < -0.1) { // Significant downward trend
        this.addAlert('quality_trend_down', {
          trend: trend,
          timestamp: new Date()
        });
        
        // Trigger callback
        this.triggerCallback('qualityTrendDown', { trend, scores });
      }
      
    } catch (error) {
      console.error('Error predicting quality trends:', error);
    }
  }

  /**
   * Calculate trend from scores
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < scores.length; i++) {
      trend += scores[i] - scores[i - 1];
    }
    
    return trend / (scores.length - 1);
  }

  /**
   * Predict next quality score
   */
  predictNextQuality(scores) {
    if (scores.length < 3) return scores[scores.length - 1];
    
    // Simple linear prediction
    const trend = this.calculateTrend(scores);
    const lastScore = scores[scores.length - 1];
    
    return Math.max(0, Math.min(1, lastScore + trend));
  }

  /**
   * Evaluate auto-switch decision
   */
  evaluateAutoSwitch(overallQuality) {
    try {
      const currentScore = overallQuality.score;
      const networkScore = overallQuality.components.network.score;
      
      // Switch to offline mode if quality is poor
      if (currentScore < this.qualityThresholds.poor && this.currentMode !== 'offline') {
        this.recommendModeSwitch('offline', {
          reason: 'poor_quality',
          score: currentScore,
          timestamp: new Date()
        });
      }
      
      // Switch to online mode if quality is good
      if (currentScore > this.qualityThresholds.good && this.currentMode !== 'online') {
        this.recommendModeSwitch('online', {
          reason: 'good_quality',
          score: currentScore,
          timestamp: new Date()
        });
      }
      
      // Switch to hybrid mode if quality is fair
      if (currentScore >= this.qualityThresholds.fair && 
          currentScore < this.qualityThresholds.good && 
          this.currentMode !== 'hybrid') {
        this.recommendModeSwitch('hybrid', {
          reason: 'fair_quality',
          score: currentScore,
          timestamp: new Date()
        });
      }
      
    } catch (error) {
      console.error('Error evaluating auto-switch:', error);
    }
  }

  /**
   * Recommend mode switch
   */
  recommendModeSwitch(mode, context) {
    try {
      console.log(`Recommending switch to ${mode} mode:`, context);
      
      // Trigger callback
      this.triggerCallback('modeSwitchRecommended', {
        recommendedMode: mode,
        currentMode: this.currentMode,
        context: context
      });
      
      // Add alert
      this.addAlert('mode_switch_recommended', {
        mode: mode,
        context: context
      });
      
    } catch (error) {
      console.error('Error recommending mode switch:', error);
    }
  }

  /**
   * Handle network changes
   */
  handleNetworkChange(networkStatus) {
    try {
      console.log('Network status changed, updating quality assessment');
      
      // Trigger immediate quality check
      this.performQualityCheck();
      
      // Trigger callback
      this.triggerCallback('networkChanged', networkStatus);
      
    } catch (error) {
      console.error('Error handling network change:', error);
    }
  }

  /**
   * Record transcription result
   */
  recordTranscriptionResult(result) {
    try {
      this.transcriptionMetrics.totalTranscriptions++;
      
      if (result.success) {
        this.transcriptionMetrics.successfulTranscriptions++;
        
        // Update confidence
        if (result.confidence !== undefined) {
          const currentTotal = this.transcriptionMetrics.averageConfidence * 
            (this.transcriptionMetrics.successfulTranscriptions - 1);
          this.transcriptionMetrics.averageConfidence = 
            (currentTotal + result.confidence) / this.transcriptionMetrics.successfulTranscriptions;
        }
        
        // Update medical term accuracy
        if (result.medicalTermAccuracy !== undefined) {
          const currentTotal = this.transcriptionMetrics.medicalTermAccuracy * 
            (this.transcriptionMetrics.successfulTranscriptions - 1);
          this.transcriptionMetrics.medicalTermAccuracy = 
            (currentTotal + result.medicalTermAccuracy) / this.transcriptionMetrics.successfulTranscriptions;
        }
      } else {
        this.transcriptionMetrics.failedTranscriptions++;
      }
      
      // Update processing time
      if (result.processingTime !== undefined) {
        this.transcriptionMetrics.processingTime.push(result.processingTime);
        if (this.transcriptionMetrics.processingTime.length > 100) {
          this.transcriptionMetrics.processingTime.shift();
        }
      }
      
    } catch (error) {
      console.error('Error recording transcription result:', error);
    }
  }

  /**
   * Add alert
   */
  addAlert(type, data) {
    const alert = {
      type: type,
      timestamp: new Date(),
      data: data
    };
    
    this.alerts.add(alert);
    
    // Trigger callback
    this.triggerCallback('alertAdded', alert);
  }

  /**
   * Remove alert
   */
  removeAlert(type) {
    const alertsToRemove = Array.from(this.alerts).filter(alert => alert.type === type);
    
    alertsToRemove.forEach(alert => {
      this.alerts.delete(alert);
      
      // Trigger callback
      this.triggerCallback('alertRemoved', alert);
    });
  }

  /**
   * Get current quality metrics
   */
  getCurrentMetrics() {
    return {
      ...this.qualityMetrics,
      qualityLevel: this.getQualityLevel(this.qualityMetrics.overallQuality),
      degradationDetected: this.degradationDetected,
      currentMode: this.currentMode,
      lastCheck: new Date(this.lastQualityCheck)
    };
  }

  /**
   * Get quality history
   */
  getQualityHistory() {
    return this.performanceHistory;
  }

  /**
   * Get quality trends
   */
  getQualityTrends() {
    return this.qualityTrends;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return Array.from(this.alerts);
  }

  /**
   * Get transcription metrics
   */
  getTranscriptionMetrics() {
    return this.transcriptionMetrics;
  }

  /**
   * Get network performance
   */
  getNetworkPerformance() {
    return this.networkPerformance;
  }

  /**
   * Set current mode
   */
  setCurrentMode(mode) {
    this.currentMode = mode;
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
          console.error('Error in quality monitor callback:', error);
        }
      });
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.transcriptionMetrics = {
      totalTranscriptions: 0,
      successfulTranscriptions: 0,
      failedTranscriptions: 0,
      averageConfidence: 0,
      medicalTermAccuracy: 0,
      processingTime: []
    };
    
    this.performanceHistory = [];
    this.qualityTrends = [];
    this.alerts.clear();
    
    console.log('Quality metrics reset');
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    try {
      // Stop monitoring
      this.stopMonitoring();
      
      // Clear callbacks
      this.callbacks.clear();
      
      // Clear alerts
      this.alerts.clear();
      
      // Clear history
      this.performanceHistory = [];
      this.qualityTrends = [];
      
      console.log('TranscriptionQualityMonitor destroyed');
      
    } catch (error) {
      console.error('Error destroying quality monitor:', error);
    }
  }
}

// Export singleton instance
export const transcriptionQualityMonitor = new TranscriptionQualityMonitor();