/**
 * Pure business logic functions for Medical AI operations
 * These functions are framework-agnostic and can be easily tested
 */

/**
 * Process a medical query with AI logic
 * @param {Object} params - Query parameters
 * @param {string} params.query - The medical query
 * @param {Object} params.context - Additional context
 * @param {string} params.type - Query type (diagnosis, prescription, etc.)
 * @param {Object} dependencies - Injected dependencies
 * @returns {Promise<Object>} AI response
 */
export async function processMedicalQuery({ query, type = 'diagnosis' }, dependencies) {
  const { config, httpClient } = dependencies;
  
  if (!query) {
    const error = new Error('Query is required');
    error.status = 400;
    error.type = 'validation_error';
    throw error;
  }

  // Validate configuration
  const configErrors = config.validateConfig();
  if (configErrors.length > 0) {
    const error = new Error('Configuration error');
    error.type = 'configuration_error';
    error.details = configErrors;
    throw error;
  }

  // STRICT MODEL VALIDATION - NO FALLBACKS
  const model = config.getModel(type);
  config.validateModel(model);
  const parameters = config.getModelParameters(model);
  
  // PROCESS INPUT BASED ON MODEL TYPE
  let processedInput = query;
  const modelType = config.getModelType(model);
  
  if (modelType === 'fill-mask') {
    // Bio_ClinicalBERT requires [MASK] token for fill-mask tasks
    if (!query.includes('[MASK]')) {
      processedInput = `${query} [MASK]`;
    }
  }
  
  // CRITICAL: Only add parameters for models that accept them
  const requestBody = { inputs: processedInput };
  
  if (config.acceptsParameters(model) && Object.keys(parameters).length > 0) {
    requestBody.parameters = parameters;
  }

  try {
    const response = await makeAIRequest(model, requestBody, { config, httpClient });
    return formatAIResponse(response, model, config);
  } catch (error) {
    // Re-throw with proper error handling
    throw error;
  }
}

/**
 * Make HTTP request to AI service
 * @param {string} model - Model name
 * @param {Object} body - Request body
 * @param {Object} dependencies - Injected dependencies
 * @returns {Promise<Object>} Response data
 */
async function makeAIRequest(model, body, { config, httpClient }) {
  // FINAL MODEL VALIDATION BEFORE API CALL
  config.validateModel(model);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.getToken()}`,
    'User-Agent': config.getUserAgent()
  };

  const response = await httpClient.fetch(`${config.getBaseUrl()}/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.getTimeout())
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API ERROR]', {
      endpoint: `${config.getBaseUrl()}/${model}`,
      status: response.status,
      method: 'POST',
      requestBody: body,
      responseBody: errorText,
      time: new Date().toISOString(),
      stack: new Error().stack,
    });

    const error = new Error(`[API ERROR ${response.status}] ${(response.statusText || 'Error')}: ${errorText}`);
    error.status = response.status;
    error.type = getErrorType(response.status);
    error.response = errorText;
    throw error;
  }

  return response.json();
}

/**
 * Format AI response into standardized format
 * @param {Object} data - Raw AI response
 * @param {string} model - Model name
 * @param {Object} config - Configuration object
 * @returns {Object} Formatted response
 */
function formatAIResponse(data, model, config) {
  const modelType = config.getModelType(model);
  
  let response, confidence;
  
  if (modelType === 'fill-mask') {
    // Bio_ClinicalBERT returns array of predictions
    if (Array.isArray(data) && data.length > 0) {
      const topPrediction = data[0];
      response = `Predicción médica: ${topPrediction.token_str}`;
      confidence = topPrediction.score || 0.85;
      
      // Add additional predictions as suggestions
      const suggestions = data.slice(1, 4).map(pred => 
        `${pred.token_str} (${(pred.score * 100).toFixed(1)}%)`
      );
      
      return {
        response,
        confidence,
        reasoning: [`Modelo FillMask procesó: ${topPrediction.sequence}`],
        suggestions,
        disclaimer: config.getDisclaimer(),
        sources: [model],
        success: true
      };
    }
  }
  
  // Default for text-generation and other models
  const text = data.generated_text || data[0]?.generated_text || '';
  confidence = typeof data[0]?.score === 'number' ? data[0].score : 0.85;

  return {
    response: text,
    confidence,
    reasoning: [],
    suggestions: [],
    disclaimer: config.getDisclaimer(),
    sources: [model],
    success: true
  };
}

/**
 * Get error type based on HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} Error type
 */
function getErrorType(status) {
  const errorMap = {
    400: 'validation_error',
    401: 'authentication_error',
    404: 'model_not_found',
    429: 'rate_limit_error',
    503: 'service_unavailable'
  };
  return errorMap[status] || 'api_error';
}

/**
 * Get error message based on status
 * @param {number} status - HTTP status code
 * @returns {string} Error message
 */
export function getErrorMessage(status) {
  const errorMessages = {
    400: 'Modelo no soportado',
    401: 'Invalid Hugging Face token',
    404: 'Model not found',
    429: 'Rate limit exceeded',
    503: 'Service unavailable - model loading'
  };
  return errorMessages[status] || `Hugging Face API error: ${status}`;
}

/**
 * Get available query types
 * @param {Object} config - Configuration object
 * @returns {Array} Available types
 */
export function getAvailableTypes(config) {
  return config.getAvailableTypes();
}

// Default export for ES modules compatibility
const MedicalAILogic = {
  processMedicalQuery,
  getErrorMessage,
  getAvailableTypes
};

export default MedicalAILogic;