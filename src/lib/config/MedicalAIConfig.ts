/**
 * Medical AI Configuration
 * 
 * Centralized configuration for Medical AI service.
 * Designed for easy extraction into microservice configuration.
 */

export type ModelType = 'fill-mask' | 'text-generation';
export type QueryType = 'diagnosis' | 'prescription' | 'soap' | 'analytics';

interface ModelParameters {
  max_length?: number;
  temperature?: number;
  do_sample?: boolean;
  num_return_sequences?: number;
  pad_token_id?: number;
}

interface MicroserviceConfig {
  service: {
    name: string;
    version: string;
    description: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    userAgent: string;
  };
  models: {
    map: Record<QueryType, string>;
    parameters: Record<string, ModelParameters>;
  };
  security: {
    tokenRequired: boolean;
    rateLimiting: boolean;
  };
  health: {
    endpoint: string;
    timeout: number;
  };
}

export class MedicalAIConfig {
  static readonly BASE_URL = 'https://api-inference.huggingface.co/models';
  static readonly TIMEOUT = 30000; // 30 seconds
  static readonly USER_AGENT = 'SYMFARMIA-Medical-Assistant/1.0';
  
  // MEDICAL MODELS - TEXT GENERATION FOR REAL RESPONSES
  static readonly SUPPORTED_MODELS: readonly string[] = [
    'gpt2',
    'distilgpt2',
    'microsoft/DialoGPT-small',
    'emilyalsentzer/Bio_ClinicalBERT'
  ];

  static readonly MODEL_MAP: Readonly<Record<QueryType, string>> = {
    diagnosis: 'gpt2',
    prescription: 'gpt2', 
    soap: 'gpt2',
    analytics: 'gpt2'
  };

  // MODEL TYPE MAPPING - CRITICAL FOR PARAMETER VALIDATION
  static readonly MODEL_TYPE_MAP: Readonly<Record<string, ModelType>> = {
    'emilyalsentzer/Bio_ClinicalBERT': 'fill-mask',
    'gpt2': 'text-generation',
    'distilgpt2': 'text-generation',
    'microsoft/DialoGPT-small': 'text-generation'
  };

  // PARAMETERS FOR TEXT GENERATION MODELS
  static readonly MODEL_PARAMS: Readonly<Record<string, ModelParameters>> = {
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

  static readonly DISCLAIMER = 'AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado. No reemplaza el criterio médico profesional.';

  /**
   * Get Hugging Face API token from environment
   */
  static getToken(): string | undefined {
    return process.env.HUGGINGFACE_TOKEN;
  }

  /**
   * Get base URL for API requests
   */
  static getBaseUrl(): string {
    return this.BASE_URL;
  }

  /**
   * Get request timeout in milliseconds
   */
  static getTimeout(): number {
    return this.TIMEOUT;
  }

  /**
   * Get user agent string
   */
  static getUserAgent(): string {
    return this.USER_AGENT;
  }

  /**
   * Get model name for a given query type
   * STRICT VALIDATION - NO FALLBACKS
   */
  static getModel(type: QueryType): string {
    const model = this.MODEL_MAP[type];
    if (!model) {
      const error = new Error(`Unsupported query type: ${type}`) as Error & { status?: number; type?: string };
      error.status = 400;
      error.type = 'validation_error';
      throw error;
    }
    return model;
  }

  /**
   * Validate if a model is supported
   */
  static isModelSupported(modelName: string): boolean {
    return this.SUPPORTED_MODELS.includes(modelName);
  }

  /**
   * Validate model with strict enforcement
   */
  static validateModel(modelName: string): true {
    if (!this.isModelSupported(modelName)) {
      const error = new Error(`Modelo no soportado: ${modelName}. Modelos válidos: ${this.SUPPORTED_MODELS.join(', ')}`) as Error & { status?: number; type?: string };
      error.status = 400;
      error.type = 'validation_error';
      throw error;
    }
    return true;
  }

  /**
   * Get model type for parameter validation
   */
  static getModelType(model: string): ModelType {
    this.validateModel(model);
    return this.MODEL_TYPE_MAP[model];
  }

  /**
   * Check if model accepts generation parameters
   */
  static acceptsParameters(model: string): boolean {
    const modelType = this.getModelType(model);
    // FillMask models accept NO parameters except inputs
    return modelType !== 'fill-mask';
  }

  /**
   * Get parameters for a specific model
   * STRICT VALIDATION - NO FALLBACKS
   */
  static getModelParameters(model: string): ModelParameters {
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
  static getDisclaimer(): string {
    return this.DISCLAIMER;
  }

  /**
   * Get available query types
   */
  static getAvailableTypes(): QueryType[] {
    return Object.keys(this.MODEL_MAP) as QueryType[];
  }

  /**
   * Get supported models list
   */
  static getSupportedModels(): readonly string[] {
    return [...this.SUPPORTED_MODELS];
  }

  /**
   * Validate configuration
   */
  static validateConfig(): string[] {
    const errors: string[] = [];

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
  static getMicroserviceConfig(): MicroserviceConfig {
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