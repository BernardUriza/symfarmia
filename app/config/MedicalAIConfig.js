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
  
  // MEDICAL MODELS - TEXT GENERATION FOR REAL RESPONSES
  static SUPPORTED_MODELS = [
    'gpt2',
    'distilgpt2',
    'microsoft/DialoGPT-small',
    'emilyalsentzer/Bio_ClinicalBERT'
  ];

  static MODEL_MAP = {
    diagnosis: 'gpt2',
    prescription: 'gpt2', 
    soap: 'gpt2',
    analytics: 'gpt2'
  };

  // MODEL TYPE MAPPING - CRITICAL FOR PARAMETER VALIDATION
  static MODEL_TYPE_MAP = {
    'emilyalsentzer/Bio_ClinicalBERT': 'fill-mask',
    'gpt2': 'text-generation',
    'distilgpt2': 'text-generation',
    'microsoft/DialoGPT-small': 'text-generation'
  };

  // PARAMETERS FOR TEXT GENERATION MODELS
  static MODEL_PARAMS = {
    'emilyalsentzer/Bio_ClinicalBERT': {
      // FillMask models accept NO generation parameters
    },
    'gpt2': {
      max_length: 150,
      temperature: 0.7,
      do_sample: true,
      num_return_sequences: 1,
      pad_token_id: 50256
    },
    'distilgpt2': {
      max_length: 120,
      temperature: 0.8,
      do_sample: true,
      num_return_sequences: 1,
      pad_token_id: 50256
    },
    'microsoft/DialoGPT-small': {
      max_length: 100,
      temperature: 0.6,
      do_sample: true,
      num_return_sequences: 1,
      pad_token_id: 50256
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
   * STRICT VALIDATION - NO FALLBACKS
   */
  static getModel(type) {
    const model = this.MODEL_MAP[type];
    if (!model) {
      const error = new Error(`Unsupported query type: ${type}`);
      error.status = 400;
      error.type = 'validation_error';
      throw error;
    }
    return model;
  }

  /**
   * Validate if a model is supported
   */
  static isModelSupported(modelName) {
    return this.SUPPORTED_MODELS.includes(modelName);
  }

  /**
   * Validate model with strict enforcement
   */
  static validateModel(modelName) {
    if (!this.isModelSupported(modelName)) {
      const error = new Error(`Modelo no soportado: ${modelName}. Modelos válidos: ${this.SUPPORTED_MODELS.join(', ')}`);
      error.status = 400;
      error.type = 'validation_error';
      throw error;
    }
    return true;
  }

  /**
   * Get model type for parameter validation
   */
  static getModelType(model) {
    this.validateModel(model);
    return this.MODEL_TYPE_MAP[model];
  }

  /**
   * Check if model accepts generation parameters
   */
  static acceptsParameters(model) {
    const modelType = this.getModelType(model);
    // FillMask models accept NO parameters except inputs
    return modelType !== 'fill-mask';
  }

  /**
   * Get parameters for a specific model
   * STRICT VALIDATION - NO FALLBACKS
   */
  static getModelParameters(model) {
    this.validateModel(model);
    
    // FillMask models get no parameters
    if (!this.acceptsParameters(model)) {
      return {};
    }
    
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
   * Get supported models list
   */
  static getSupportedModels() {
    return [...this.SUPPORTED_MODELS];
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

    // Validate supported models configuration
    if (!this.SUPPORTED_MODELS || this.SUPPORTED_MODELS.length === 0) {
      errors.push('SUPPORTED_MODELS must be defined and not empty');
    }

    // Validate model mappings point to supported models
    for (const [type, model] of Object.entries(this.MODEL_MAP)) {
      if (!this.SUPPORTED_MODELS.includes(model)) {
        errors.push(`Model mapping for type "${type}" points to unsupported model "${model}"`);
      }
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