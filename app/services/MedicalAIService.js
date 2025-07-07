/**
 * Medical AI Service
 * 
 * This service handles all interactions with Hugging Face AI models for medical queries.
 * Designed to be easily extracted into a microservice.
 */

import { MedicalAIConfig } from '../config/MedicalAIConfig.js';

export class MedicalAIService {
  constructor(config = MedicalAIConfig) {
    this.config = config;
  }

  /**
   * Process a medical query using AI
   * @param {Object} params - Query parameters
   * @param {string} params.query - The medical query
   * @param {string} params.type - Query type (diagnosis, prescription, etc.)
   * @returns {Promise<Object>} AI response
   */
  async processQuery({ query, type = 'diagnosis' }) {
    const model = this.config.getModel(type);
    const parameters = this.config.getModelParameters(model);
    
    const requestBody = {
      inputs: query,
      parameters
    };

    const response = await this.makeRequest(model, requestBody);
    return this.formatResponse(response, model);
  }

  /**
   * Make HTTP request to Hugging Face API
   * @private
   */
  async makeRequest(model, body) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.getToken()}`,
      'User-Agent': this.config.getUserAgent()
    };

    const response = await fetch(`${this.config.getBaseUrl()}/${model}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.getTimeout())
    });

    if (!response.ok) {
      throw new MedicalAIError(
        await response.text(),
        response.status,
        this.getErrorType(response.status)
      );
    }

    return response.json();
  }

  /**
   * Format API response into standardized format
   * @private
   */
  formatResponse(data, model) {
    const text = data.generated_text || data[0]?.generated_text || '';
    const confidence = typeof data[0]?.score === 'number' ? data[0].score : 0.7;

    return {
      response: text,
      confidence,
      reasoning: [],
      suggestions: [],
      disclaimer: this.config.getDisclaimer(),
      sources: [model],
      success: true
    };
  }

  /**
   * Get error type based on HTTP status
   * @private
   */
  getErrorType(status) {
    const errorMap = {
      401: 'authentication_error',
      404: 'model_not_found',
      429: 'rate_limit_error',
      503: 'service_unavailable'
    };
    return errorMap[status] || 'api_error';
  }

  /**
   * Get available query types
   */
  getAvailableTypes() {
    return this.config.getAvailableTypes();
  }
}

/**
 * Custom error class for Medical AI operations
 */
export class MedicalAIError extends Error {
  constructor(message, status, type) {
    super(message);
    this.name = 'MedicalAIError';
    this.status = status;
    this.type = type;
  }
}

// Default instance for direct usage
export const medicalAIService = new MedicalAIService();