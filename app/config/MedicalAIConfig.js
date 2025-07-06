/**
 * Medical AI Configuration
 * 
 * Centralized configuration for Medical AI service.
 * Designed for easy extraction into microservice configuration.
 */

export class MedicalAIConfig {
  static BASE_URL = 'https://api-inference.huggingface.co/models';
  static TIMEOUT = 30000; // 30 seconds
  static USER_AGENT = 'SYMFARMIA-Medical-Assistant/1.0';
  
  static MODEL_MAP = {
    diagnosis: 'jiviai/medX_v2',
    prescription: 'raidium/MQG',
    soap: 'emilyalsentzer/Bio_ClinicalBERT',
    analytics: 'raidium/MQG'
  };

  static MODEL_PARAMS = {
    'raidium/MQG': { 
      max_length: 500, 
      temperature: 0.7, 
      do_sample: true 
    },
    'jiviai/medX_v2': { 
      max_length: 300, 
      temperature: 0.5 
    },
    'emilyalsentzer/Bio_ClinicalBERT': { 
      return_all_scores: true 
    },
    'openai/whisper-medium': { 
      language: 'es', 
      task: 'transcribe' 
    }
  };

  static DISCLAIMER = 'AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado. No reemplaza el criterio médico profesional.';

  /**
   * Get Hugging Face API token from environment
   */
  static getToken() {
    return process.env.HUGGINGFACE_TOKEN;
  }

  /**
   * Get base URL for API requests
   */
  static getBaseUrl() {
    return this.BASE_URL;
  }

  /**
   * Get request timeout in milliseconds
   */
  static getTimeout() {
    return this.TIMEOUT;
  }

  /**
   * Get user agent string
   */
  static getUserAgent() {
    return this.USER_AGENT;
  }

  /**
   * Get model name for a given query type
   */
  static getModel(type) {
    return this.MODEL_MAP[type] || this.MODEL_MAP.diagnosis;
  }

  /**
   * Get parameters for a specific model
   */
  static getModelParameters(model) {
    return this.MODEL_PARAMS[model] || {};
  }

  /**
   * Get medical disclaimer text
   */
  static getDisclaimer() {
    return this.DISCLAIMER;
  }

  /**
   * Get available query types
   */
  static getAvailableTypes() {
    return Object.keys(this.MODEL_MAP);
  }

  /**
   * Validate configuration
   */
  static validateConfig() {
    const errors = [];

    if (!this.getToken()) {
      errors.push('HUGGINGFACE_TOKEN environment variable is required');
    }

    if (!this.BASE_URL) {
      errors.push('BASE_URL is required');
    }

    if (this.TIMEOUT < 1000 || this.TIMEOUT > 60000) {
      errors.push('TIMEOUT must be between 1000ms and 60000ms');
    }

    return errors;
  }

  /**
   * Get microservice configuration object
   * Useful for deploying as a standalone service
   */
  static getMicroserviceConfig() {
    return {
      service: {
        name: 'medical-ai-service',
        version: '1.0.0',
        description: 'Medical AI consultation service using Hugging Face models'
      },
      api: {
        baseUrl: this.BASE_URL,
        timeout: this.TIMEOUT,
        userAgent: this.USER_AGENT
      },
      models: {
        map: this.MODEL_MAP,
        parameters: this.MODEL_PARAMS
      },
      security: {
        tokenRequired: true,
        rateLimiting: true
      },
      health: {
        endpoint: '/health',
        timeout: 5000
      }
    };
  }
}

export default MedicalAIConfig;