/**
 * CostOptimizedWhisper
 * 
 * Optimizes Whisper API usage for cost-effectiveness while maintaining medical-grade quality
 * Balances between local processing costs and API costs
 */

export class CostOptimizedWhisper {
  constructor(config = {}) {
    this.config = {
      maxDurationPerRequest: config.maxDurationPerRequest || 600, // 10 minutes
      batchRequests: config.batchRequests !== false,
      pricePerMinute: config.pricePerMinute || 0.006, // OpenAI pricing
      budgetLimit: config.budgetLimit || 50, // $50 per session
      costThreshold: config.costThreshold || 0.10, // Switch to local at $0.10
      qualityThreshold: config.qualityThreshold || 0.85,
      ...config
    };

    this.costTracker = {
      totalCost: 0,
      apiCalls: 0,
      localProcessing: 0,
      avgCostPerMinute: 0,
      lastOptimization: Date.now()
    };

    this.performanceMetrics = {
      apiLatency: [],
      localLatency: [],
      apiQuality: [],
      localQuality: []
    };

    this.isInitialized = false;
  }

  /**
   * Initialize cost optimizer
   */
  async initialize() {
    try {
      // Load cost optimization models
      await this.loadCostModels();
      
      // Initialize performance tracking
      this.initializePerformanceTracking();
      
      this.isInitialized = true;
      console.log('CostOptimizedWhisper initialized');
      
    } catch (error) {
      console.error('Failed to initialize CostOptimizedWhisper:', error);
      throw error;
    }
  }

  /**
   * Load cost optimization models
   */
  async loadCostModels() {
    // Load historical cost data and optimization patterns
    this.costModels = {
      priceModel: {
        apiCost: this.config.pricePerMinute,
        localCost: this.estimateLocalProcessingCost(),
        networkCost: this.estimateNetworkCost()
      },
      qualityModel: {
        apiQuality: 0.95,
        localQuality: 0.88,
        hybridQuality: 0.92
      },
      performanceModel: {
        apiLatency: 2000, // 2 seconds
        localLatency: 5000, // 5 seconds
        networkLatency: 500 // 0.5 seconds
      }
    };
  }

  /**
   * Initialize performance tracking
   */
  initializePerformanceTracking() {
    this.performanceTracking = {
      startTime: Date.now(),
      totalProcessingTime: 0,
      apiProcessingTime: 0,
      localProcessingTime: 0,
      qualityScores: [],
      costEfficiencyScore: 0
    };
  }

  /**
   * Estimate local processing cost
   */
  estimateLocalProcessingCost() {
    // Estimate based on CPU/GPU usage, power consumption
    const costPerHour = 0.02; // $0.02 per hour of processing
    
    return costPerHour / 60; // Cost per minute
  }

  /**
   * Estimate network cost
   */
  estimateNetworkCost() {
    // Estimate based on data transfer
    const avgAudioSize = 1024 * 1024; // 1MB per minute
    const dataCostPerMB = 0.001; // $0.001 per MB
    
    return dataCostPerMB * (avgAudioSize / 1024 / 1024);
  }

  /**
   * Determine if buffer should be processed based on cost optimization
   */
  async shouldProcessBuffer(audioBuffer) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const bufferDuration = this.estimateBufferDuration(audioBuffer);
    const estimatedCost = this.estimateProcessingCost(bufferDuration);
    
    // Check budget limits
    if (this.costTracker.totalCost + estimatedCost > this.config.budgetLimit) {
      console.warn('Budget limit reached, switching to local processing');
      return false;
    }
    
    // Check cost-effectiveness
    const costEfficiency = this.calculateCostEfficiency(bufferDuration, estimatedCost);
    
    // Process if cost-effective or buffer is getting too large
    return costEfficiency > 0.7 || bufferDuration > this.config.maxDurationPerRequest;
  }

  /**
   * Estimate buffer duration
   */
  estimateBufferDuration(audioBuffer) {
    // Rough estimation based on buffer size
    const totalSamples = audioBuffer.reduce((sum, chunk) => {
      return sum + (chunk.data.length || chunk.data.byteLength / 4);
    }, 0);
    
    const sampleRate = 16000; // Assumed sample rate
    return totalSamples / sampleRate; // Duration in seconds
  }

  /**
   * Estimate processing cost
   */
  estimateProcessingCost(durationInSeconds) {
    const durationInMinutes = durationInSeconds / 60;
    return durationInMinutes * this.config.pricePerMinute;
  }

  /**
   * Calculate cost efficiency
   */
  calculateCostEfficiency(duration, cost) {
    const qualityScore = this.costModels.qualityModel.apiQuality;
    const speedScore = Math.max(0, 1 - (duration / this.config.maxDurationPerRequest));
    const costScore = Math.max(0, 1 - (cost / this.config.costThreshold));
    
    // Weighted average
    return (qualityScore * 0.5 + speedScore * 0.3 + costScore * 0.2);
  }

  /**
   * Recommend transcription strategy
   */
  async recommendStrategy(audioBuffer, networkQuality) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const duration = this.estimateBufferDuration(audioBuffer);
    const apiCost = this.estimateProcessingCost(duration);
    const localCost = duration * this.costModels.priceModel.localCost;
    
    // Factor in network quality
    const networkFactor = this.getNetworkFactor(networkQuality);
    
    // Calculate scores for each strategy
    const strategies = {
      api: {
        cost: apiCost,
        quality: this.costModels.qualityModel.apiQuality * networkFactor,
        latency: this.costModels.performanceModel.apiLatency / networkFactor,
        reliability: networkFactor
      },
      local: {
        cost: localCost,
        quality: this.costModels.qualityModel.localQuality,
        latency: this.costModels.performanceModel.localLatency,
        reliability: 1.0
      },
      hybrid: {
        cost: (apiCost + localCost) / 2,
        quality: this.costModels.qualityModel.hybridQuality,
        latency: (this.costModels.performanceModel.apiLatency + this.costModels.performanceModel.localLatency) / 2,
        reliability: (networkFactor + 1.0) / 2
      }
    };
    
    // Score each strategy
    const scores = {};
    for (const [name, strategy] of Object.entries(strategies)) {
      scores[name] = this.calculateStrategyScore(strategy, duration);
    }
    
    // Return best strategy
    const bestStrategy = Object.entries(scores).reduce((best, [name, score]) => 
      score > best.score ? { name, score } : best
    , { name: 'local', score: 0 });
    
    return {
      recommended: bestStrategy.name,
      scores,
      reasoning: this.generateRecommendationReasoning(bestStrategy.name, strategies, duration)
    };
  }

  /**
   * Get network quality factor
   */
  getNetworkFactor(networkQuality) {
    const factors = {
      'excellent': 1.0,
      'good': 0.8,
      'fair': 0.6,
      'poor': 0.3,
      'offline': 0.0
    };
    
    return factors[networkQuality] || 0.5;
  }

  /**
   * Calculate strategy score
   */
  calculateStrategyScore(strategy, _duration) {
    // Normalize factors
    const costScore = Math.max(0, 1 - (strategy.cost / this.config.costThreshold));
    const qualityScore = strategy.quality;
    const speedScore = Math.max(0, 1 - (strategy.latency / 10000)); // 10 seconds max
    const reliabilityScore = strategy.reliability;
    
    // Weighted score
    return (
      costScore * 0.3 +
      qualityScore * 0.4 +
      speedScore * 0.2 +
      reliabilityScore * 0.1
    );
  }

  /**
   * Generate recommendation reasoning
   */
  generateRecommendationReasoning(strategy, strategies, duration) {
    const reasons = [];
    
    if (strategy === 'api') {
      reasons.push('API provides highest quality transcription');
      if (strategies.api.cost < this.config.costThreshold) {
        reasons.push('API cost is within acceptable range');
      }
      if (strategies.api.reliability > 0.7) {
        reasons.push('Network quality is sufficient for API calls');
      }
    } else if (strategy === 'local') {
      reasons.push('Local processing avoids API costs');
      if (strategies.local.cost < strategies.api.cost) {
        reasons.push('Local processing is more cost-effective');
      }
      if (strategies.api.reliability < 0.5) {
        reasons.push('Network quality is poor for API calls');
      }
    } else if (strategy === 'hybrid') {
      reasons.push('Hybrid approach balances cost and quality');
      if (duration > this.config.maxDurationPerRequest / 2) {
        reasons.push('Audio duration benefits from hybrid processing');
      }
    }
    
    return reasons;
  }

  /**
   * Track processing cost
   */
  trackProcessingCost(strategy, duration, actualCost) {
    this.costTracker.totalCost += actualCost;
    
    if (strategy === 'api') {
      this.costTracker.apiCalls++;
    } else {
      this.costTracker.localProcessing++;
    }
    
    // Update average cost
    const totalMinutes = duration / 60;
    this.costTracker.avgCostPerMinute = 
      (this.costTracker.avgCostPerMinute + (actualCost / totalMinutes)) / 2;
    
    // Update cost model based on actual performance
    this.updateCostModel(strategy, duration, actualCost);
  }

  /**
   * Update cost model based on actual performance
   */
  updateCostModel(strategy, duration, actualCost) {
    const costPerMinute = actualCost / (duration / 60);
    
    if (strategy === 'api') {
      // Update API cost model
      this.costModels.priceModel.apiCost = 
        (this.costModels.priceModel.apiCost + costPerMinute) / 2;
    } else {
      // Update local cost model
      this.costModels.priceModel.localCost = 
        (this.costModels.priceModel.localCost + costPerMinute) / 2;
    }
  }

  /**
   * Get cost optimization report
   */
  getCostOptimizationReport() {
    const totalProcessingTime = this.performanceTracking.totalProcessingTime / 1000 / 60; // minutes
    const costEfficiency = totalProcessingTime > 0 ? 
      this.costTracker.avgCostPerMinute / this.config.pricePerMinute : 0;
    
    return {
      totalCost: this.costTracker.totalCost,
      avgCostPerMinute: this.costTracker.avgCostPerMinute,
      apiCalls: this.costTracker.apiCalls,
      localProcessing: this.costTracker.localProcessing,
      budgetUsage: (this.costTracker.totalCost / this.config.budgetLimit) * 100,
      costEfficiency,
      recommendations: this.generateCostRecommendations()
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  generateCostRecommendations() {
    const recommendations = [];
    
    if (this.costTracker.totalCost > this.config.budgetLimit * 0.8) {
      recommendations.push('Consider switching to local processing to avoid budget overrun');
    }
    
    if (this.costTracker.avgCostPerMinute > this.config.pricePerMinute * 1.5) {
      recommendations.push('Processing costs are above expected rates');
    }
    
    if (this.costTracker.apiCalls > this.costTracker.localProcessing * 3) {
      recommendations.push('High API usage - consider more local processing');
    }
    
    return recommendations;
  }

  /**
   * Cleanup cost optimizer
   */
  async cleanup() {
    try {
      // Save cost data for future optimizations
      this.saveCostData();
      
      // Reset trackers
      this.costTracker = {
        totalCost: 0,
        apiCalls: 0,
        localProcessing: 0,
        avgCostPerMinute: 0,
        lastOptimization: Date.now()
      };
      
      this.performanceMetrics = {
        apiLatency: [],
        localLatency: [],
        apiQuality: [],
        localQuality: []
      };
      
      this.isInitialized = false;
      
      console.log('CostOptimizedWhisper cleanup completed');
      
    } catch (error) {
      console.error('Error during CostOptimizedWhisper cleanup:', error);
    }
  }

  /**
   * Save cost data for future optimizations
   */
  saveCostData() {
    try {
      const costData = {
        costTracker: this.costTracker,
        performanceMetrics: this.performanceMetrics,
        costModels: this.costModels,
        timestamp: Date.now()
      };
      
      localStorage.setItem('whisper-cost-data', JSON.stringify(costData));
      console.log('Cost optimization data saved');
      
    } catch (error) {
      console.warn('Failed to save cost data:', error);
    }
  }
}

export default CostOptimizedWhisper;