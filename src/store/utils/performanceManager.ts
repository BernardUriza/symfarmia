// Performance monitoring and optimization for mobile devices
import type { PerformanceMetrics } from '../types';

export interface PerformanceThresholds {
  memoryWarning: number;
  memoryLimit: number;
  responseTimeWarning: number;
  batteryWarning: number;
}

export class PerformanceManager {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private monitoringInterval?: number;
  private memoryObserver?: PerformanceObserver;
  private renderObserver?: PerformanceObserver;
  private networkObserver?: PerformanceObserver;
  private lastMemoryCheck: number = 0;
  private isMobile: boolean;
  
  constructor(thresholds: PerformanceThresholds) {
    this.thresholds = thresholds;
    this.isMobile = this.detectMobileDevice();
    
    this.metrics = {
      transcriptionLatency: 0,
      aiResponseTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkUsage: 0,
      storageUsage: 0,
      batteryImpact: 'low'
    };
    
    this.initializePerformanceObservers();
  }
  
  private detectMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) ||
           window.screen.width <= 768;
  }
  
  private initializePerformanceObservers(): void {
    // Memory observer (Chrome only)
    if ('memory' in performance && 'PerformanceObserver' in window) {
      try {
        this.memoryObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              this.updateMetric('renderTime', entry.duration);
            }
          });
        });
        
        this.memoryObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
    
    // Network observer
    if ('PerformanceObserver' in window) {
      try {
        this.networkObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let networkUsage = 0;
          
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              networkUsage += resourceEntry.transferSize || 0;
            }
          });
          
          this.updateMetric('networkUsage', networkUsage);
        });
        
        this.networkObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Network performance observer not supported:', error);
      }
    }
  }
  
  startMonitoring(): void {
    // Regular performance checks
    this.monitoringInterval = window.setInterval(() => {
      this.updateMemoryUsage();
      this.updateBatteryImpact();
      this.checkPerformanceThresholds();
    }, 5000); // Check every 5 seconds
    
    // Initial check
    this.updateMemoryUsage();
    this.updateStorageUsage();
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.memoryObserver?.disconnect();
    this.renderObserver?.disconnect();
    this.networkObserver?.disconnect();
  }
  
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number } }).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    } else {
      // Fallback estimation for browsers without memory API
      this.estimateMemoryUsage();
    }
  }
  
  private estimateMemoryUsage(): void {
    // Simple estimation based on time and complexity
    const now = Date.now();
    const timeDiff = now - this.lastMemoryCheck;
    this.lastMemoryCheck = now;
    
    // Rough estimation: 1MB per minute of usage + base usage
    const estimatedIncrease = (timeDiff / 60000) * 1024 * 1024;
    this.metrics.memoryUsage = Math.min(
      this.metrics.memoryUsage + estimatedIncrease,
      this.thresholds.memoryLimit
    );
  }
  
  private async updateStorageUsage(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        this.metrics.storageUsage = estimate.usage || 0;
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }
  }
  
  private updateBatteryImpact(): void {
    // Mobile-specific battery impact assessment
    if (this.isMobile) {
      const memoryRatio = this.metrics.memoryUsage / this.thresholds.memoryLimit;
      const responseTimeRatio = this.metrics.aiResponseTime / this.thresholds.responseTimeWarning;
      
      if (memoryRatio > 0.8 || responseTimeRatio > 2) {
        this.metrics.batteryImpact = 'high';
      } else if (memoryRatio > 0.5 || responseTimeRatio > 1.5) {
        this.metrics.batteryImpact = 'medium';
      } else {
        this.metrics.batteryImpact = 'low';
      }
    }
  }
  
  private checkPerformanceThresholds(): void {
    const issues: string[] = [];
    
    if (this.metrics.memoryUsage > this.thresholds.memoryWarning) {
      issues.push('high_memory_usage');
    }
    
    if (this.metrics.aiResponseTime > this.thresholds.responseTimeWarning) {
      issues.push('slow_ai_response');
    }
    
    if (this.metrics.transcriptionLatency > 2000) {
      issues.push('transcription_lag');
    }
    
    if (issues.length > 0) {
      this.emitPerformanceWarning(issues);
    }
  }
  
  private emitPerformanceWarning(issues: string[]): void {
    // Emit custom event for performance warnings
    const event = new CustomEvent('performanceWarning', {
      detail: {
        issues,
        metrics: this.metrics,
        timestamp: new Date()
      }
    });
    
    window.dispatchEvent(event);
  }
  
  // Public methods for updating metrics
  updateMetric(metric: keyof PerformanceMetrics, value: number): void {
    this.metrics[metric] = value;
  }
  
  recordTranscriptionLatency(startTime: number): void {
    const latency = Date.now() - startTime;
    this.metrics.transcriptionLatency = latency;
  }
  
  recordAIResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.aiResponseTime = responseTime;
  }
  
  recordRenderTime(componentName: string, renderTime: number): void {
    this.metrics.renderTime = Math.max(this.metrics.renderTime, renderTime);
    
    // Mark long renders for investigation
    if (renderTime > 16.67) { // 60 FPS threshold
      performance.mark(`slow-render-${componentName}-${Date.now()}`);
    }
  }
  
  // Mobile-specific optimizations
  optimizeForMobile(): {
    memoryLimit: number;
    reducedFeatures: string[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const reducedFeatures: string[] = [];
    
    if (this.isMobile) {
      // Reduce memory limit for mobile
      const mobileMemoryLimit = Math.min(this.thresholds.memoryLimit, 100 * 1024 * 1024); // 100MB max
      
      // Suggest feature reductions
      if (this.metrics.memoryUsage > mobileMemoryLimit * 0.7) {
        reducedFeatures.push('ai_advanced_mode');
        recommendations.push('Switch to basic AI mode');
      }
      
      if (this.metrics.batteryImpact === 'high') {
        reducedFeatures.push('real_time_transcription');
        recommendations.push('Use batch transcription');
      }
      
      if (this.metrics.aiResponseTime > 5000) {
        reducedFeatures.push('ai_suggestions');
        recommendations.push('Disable automatic AI suggestions');
      }
      
      return {
        memoryLimit: mobileMemoryLimit,
        reducedFeatures,
        recommendations
      };
    }
    
    return {
      memoryLimit: this.thresholds.memoryLimit,
      reducedFeatures: [],
      recommendations: []
    };
  }
  
  // Performance optimization strategies
  getOptimizationStrategy(): {
    priority: 'low' | 'medium' | 'high';
    actions: Array<{
      type: 'reduce_memory' | 'optimize_rendering' | 'batch_operations' | 'disable_features';
      description: string;
      impact: 'low' | 'medium' | 'high';
    }>;
  } {
    const actions: Array<{
      type: 'reduce_memory' | 'optimize_rendering' | 'batch_operations' | 'disable_features';
      description: string;
      impact: 'low' | 'medium' | 'high';
    }> = [];
    
    let priority: 'low' | 'medium' | 'high' = 'low';
    
    // Memory optimization
    if (this.metrics.memoryUsage > this.thresholds.memoryLimit * 0.8) {
      priority = 'high';
      actions.push({
        type: 'reduce_memory',
        description: 'Clear cached AI responses and old transcriptions',
        impact: 'high'
      });
      
      actions.push({
        type: 'disable_features',
        description: 'Disable real-time AI analysis',
        impact: 'medium'
      });
    }
    
    // Rendering optimization
    if (this.metrics.renderTime > 50) { // ~3 frames at 60 FPS
      priority = priority === 'high' ? 'high' : 'medium';
      actions.push({
        type: 'optimize_rendering',
        description: 'Virtualize long lists and reduce component updates',
        impact: 'medium'
      });
    }
    
    // Network optimization
    if (this.metrics.networkUsage > 10 * 1024 * 1024) { // 10MB
      actions.push({
        type: 'batch_operations',
        description: 'Batch API requests and reduce polling frequency',
        impact: 'medium'
      });
    }
    
    // AI response optimization
    if (this.metrics.aiResponseTime > this.thresholds.responseTimeWarning) {
      actions.push({
        type: 'batch_operations',
        description: 'Process AI requests in batches',
        impact: 'low'
      });
    }
    
    return { priority, actions };
  }
  
  // Getter methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  getMemoryUsage(): number {
    return this.metrics.memoryUsage;
  }
  
  getBatteryImpact(): 'low' | 'medium' | 'high' {
    return this.metrics.batteryImpact || 'low';
  }
  
  isMobileDevice(): boolean {
    return this.isMobile;
  }
  
  // Performance profiling
  profile<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    console.log(`Performance: ${name} took ${endTime - startTime}ms`);
    
    return result;
  }
  
  async profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    console.log(`Performance: ${name} took ${endTime - startTime}ms`);
    
    return result;
  }
  
  // Resource cleanup
  cleanup(): void {
    this.stopMonitoring();
    
    // Clear performance marks
    performance.clearMarks();
    performance.clearMeasures();
  }
}