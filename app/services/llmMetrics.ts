interface APIMetrics {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  cacheHits: number
  cacheMisses: number
  totalTokens: number
  averageLatency: number
  errors: { [key: string]: number }
  lastUpdated: Date
}

class LLMMetricsService {
  private metrics: APIMetrics
  private latencies: number[]
  private maxLatencyHistory = 100

  constructor() {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTokens: 0,
      averageLatency: 0,
      errors: {},
      lastUpdated: new Date()
    }
    this.latencies = []
  }

  recordCall(success: boolean, latency: number, tokens?: number, error?: string, fromCache = false): void {
    this.metrics.totalCalls++
    
    if (fromCache) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }

    if (success) {
      this.metrics.successfulCalls++
      if (tokens) {
        this.metrics.totalTokens += tokens
      }
    } else {
      this.metrics.failedCalls++
      if (error) {
        this.metrics.errors[error] = (this.metrics.errors[error] || 0) + 1
      }
    }

    // Update latency tracking
    this.latencies.push(latency)
    if (this.latencies.length > this.maxLatencyHistory) {
      this.latencies.shift()
    }
    
    this.metrics.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
    this.metrics.lastUpdated = new Date()
  }

  getMetrics(): APIMetrics {
    return { ...this.metrics }
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    successRate: number
    cacheHitRate: number
    averageLatency: number
  } {
    const successRate = this.metrics.totalCalls > 0 
      ? (this.metrics.successfulCalls / this.metrics.totalCalls) * 100 
      : 0
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (successRate < 50 || this.metrics.averageLatency > 10000) {
      status = 'unhealthy'
    } else if (successRate < 80 || this.metrics.averageLatency > 5000) {
      status = 'degraded'
    }

    return {
      status,
      successRate,
      cacheHitRate,
      averageLatency: this.metrics.averageLatency
    }
  }

  reset(): void {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTokens: 0,
      averageLatency: 0,
      errors: {},
      lastUpdated: new Date()
    }
    this.latencies = []
  }

  // Log metrics to console (could be extended to send to monitoring service)
  logMetrics(): void {
    const health = this.getHealthStatus()
    console.log('[LLM Metrics]', {
      ...this.metrics,
      health
    })
  }
}

// Export singleton instance
export const llmMetrics = new LLMMetricsService()

// Optional: Log metrics periodically
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    if (llmMetrics.getMetrics().totalCalls > 0) {
      llmMetrics.logMetrics()
    }
  }, 60000) // Log every minute
}