// Lightweight monitoring utility for AI model performance
import Logger from './logger';

export interface ModelMetrics {
  totalCalls: number;
  failures: number;
  latencies: number[];
  confidences: number[];
  usageByType: Record<string, number>;
}

class ModelMonitor {
  private metrics: Record<string, ModelMetrics> = {};

  private getOrCreate(model: string): ModelMetrics {
    if (!this.metrics[model]) {
      this.metrics[model] = {
        totalCalls: 0,
        failures: 0,
        latencies: [],
        confidences: [],
        usageByType: {}
      };
    }
    return this.metrics[model];
  }

  recordCall(model: string, latency: number, confidence: number, type: string) {
    const m = this.getOrCreate(model);
    m.totalCalls += 1;
    m.latencies.push(latency);
    if (confidence >= 0) {
      m.confidences.push(confidence);
    }
    if (!m.usageByType[type]) {
      m.usageByType[type] = 0;
    }
    m.usageByType[type] += 1;

    Logger.performance(`${model} latency`, latency);
    if (latency > 500) {
      Logger.warn('Model latency above 500ms', { model, latency });
    }
  }

  recordFailure(model: string, error: unknown) {
    const m = this.getOrCreate(model);
    m.failures += 1;
    Logger.error(`Model ${model} failure`, error as Error);
  }

  getMetrics(model: string): ModelMetrics | undefined {
    return this.metrics[model];
  }
}

const modelMonitor = new ModelMonitor();
export default modelMonitor;
export type { ModelMonitor };
