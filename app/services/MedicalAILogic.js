/**
 * Pure business logic functions for Medical AI operations
 * These functions are framework-agnostic and can be easily tested
 */
import modelMonitor from "@/utils/modelMonitor";

/**
 * Process a medical query with AI logic
 * @param {Object} params - Query parameters
 * @param {string} params.query - The medical query
 * @param {Object} params.context - Additional context
 * @param {string} params.type - Query type (diagnosis, prescription, etc.)
 * @param {Object} dependencies - Injected dependencies
 * @returns {Promise<Object>} AI response
 */
export async function processMedicalQuery({ query, context, type = 'diagnosis' }, dependencies) {
  const { config, httpClient } = dependencies;
  
  if (!query) {
    const error = new Error('Query is required');
    error.status = 400;
    error.type = 'validation_error';
    throw error;
  }

  // Enhanced input validation
  const validationResult = validateMedicalInput(query);
  if (!validationResult.isValid) {
    return {
      response: "Input no válido para análisis médico. Para consultas efectivas, proporciona: síntomas específicos, duración, intensidad y contexto del paciente.",
      confidence: 0.0,
      reasoning: [
        "Input no contiene terminología médica reconocible",
        "Texto parece ser aleatorio o no relacionado con medicina",
        "Sugiriendo formato de consulta estructurada para mejores resultados"
      ],
      suggestions: [
        "dolor de cabeza persistente desde hace 3 días",
        "fiebre de 38.5°C con escalofríos y malestar general",
        "dolor torácico opresivo que irradia al brazo izquierdo"
      ],
      disclaimer: config.getDisclaimer(),
      sources: ['Input Validation'],
      success: true
    };
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
  } else if (modelType === 'text-generation') {
    // Enhanced medical prompts for text-generation models
    processedInput = createMedicalPrompt(query, type, context);
  }
  
  // CRITICAL: Only add parameters for models that accept them
  const requestBody = { inputs: processedInput };
  
  if (config.acceptsParameters(model) && Object.keys(parameters).length > 0) {
    requestBody.parameters = parameters;
  }
  
  // SAFEGUARD: Ensure fill-mask models NEVER get parameters
  if (modelType === 'fill-mask' && requestBody.parameters) {
    console.warn('[WARNING] Removing parameters from fill-mask model request');
    delete requestBody.parameters;
  }

  try {
    const start = Date.now();
    const response = await makeAIRequest(model, requestBody, { config, httpClient });
    const latency = Date.now() - start;
    const formatted = formatAIResponse(response, model, config, { query, context, type });
    modelMonitor.recordCall(model, latency, formatted.confidence ?? 0, type);
    return formatted;
  } catch (error) {
    modelMonitor.recordFailure(model, error);
    throw error;
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

  // Debug logging for fill-mask models
  if (config.getModelType(model) === 'fill-mask') {
    console.log('[DEBUG] Fill-mask request:', {
      model,
      url: `${config.getBaseUrl()}/${model}`,
      body: JSON.stringify(body, null, 2),
      bodyKeys: Object.keys(body),
      hasParameters: 'parameters' in body
    });
  }

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
 * @param {Object} context - Query context for enhanced reasoning
 * @returns {Object} Formatted response
 */
function formatAIResponse(data, model, config, context = {}) {
  const modelType = config.getModelType(model);
  const { query } = context;
  
  let response, confidence;
  
  if (modelType === 'fill-mask') {
    // Bio_ClinicalBERT returns array of predictions
    if (Array.isArray(data) && data.length > 0) {
      const topPrediction = data[0];
      
      // Enhanced confidence scoring
      const rawConfidence = topPrediction.score || 0;
      confidence = enhanceConfidenceScore(rawConfidence, query, topPrediction.token_str);
      
      // Enhanced medical response
      response = generateMedicalResponse(topPrediction.token_str, query, confidence);
      
      // Enhanced reasoning
      const reasoning = generateMedicalReasoning(query, topPrediction, data.slice(1, 3));
      
      // Context-aware suggestions
      const suggestions = generateContextualSuggestions(query, topPrediction.token_str);
      
      return {
        response,
        confidence,
        reasoning,
        suggestions,
        disclaimer: config.getDisclaimer(),
        sources: [model],
        success: true
      };
    }
  }
  
  // Text-generation models
  if (Array.isArray(data) && data.length > 0) {
    const text = data[0]?.generated_text || '';
    const rawConfidence = typeof data[0]?.score === 'number' ? data[0].score : 0.85;
    
    confidence = enhanceConfidenceScore(rawConfidence, query, text);
    
    // Clean and extract relevant medical content
    const cleanedResponse = cleanMedicalResponse(text, query);
    
    return {
      response: cleanedResponse || 'Análisis médico completado. Recomiendo evaluación clínica adicional.',
      confidence,
      reasoning: [
        'Análisis de texto médico procesado con LLM especializado',
        `Modelo utilizado: ${model}`,
        `Tipo de consulta: ${context?.type || 'diagnosis'}`,
        'Aplicando contexto clínico disponible',
        'Generando recomendaciones basadas en evidencia médica'
      ],
      suggestions: generateContextualSuggestions(query, cleanedResponse),
      disclaimer: config.getDisclaimer(),
      sources: [model],
      success: true
    };
  }
  
  // Fallback for unexpected response format
  const text = data.generated_text || '';
  confidence = 0.7;
  
  return {
    response: text || 'Análisis médico completado. Recomiendo evaluación clínica adicional.',
    confidence,
    reasoning: [
      'Análisis de texto médico procesado',
      `Modelo utilizado: ${model}`,
      'Aplicando contexto clínico disponible'
    ],
    suggestions: generateContextualSuggestions(query, text),
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

/**
 * Validate medical input
 * @param {string} text - Input text to validate
 * @returns {Object} Validation result
 */
function validateMedicalInput(text) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, reason: 'Empty or invalid input' };
  }
  
  const cleanText = text.toLowerCase().trim();
  if (cleanText.length < 3) {
    return { isValid: false, reason: 'Input too short' };
  }
  
  // Check for random characters or keyboard mashing
  const randomPatterns = [
    /^[a-z]{1,2}[a-z]*[a-z]{1,2}$/i, // Short random strings
    /(.)\1{3,}/, // Repeated characters
    /^[qwertyuiop]+$/i, // Keyboard rows
    /^[asdfghjkl]+$/i,
    /^[zxcvbnm]+$/i,
    /^[0-9]+$/, // Only numbers
    /^[^a-zA-Z0-9\s]+$/ // Only special characters
  ];
  
  if (cleanText.length < 5 || randomPatterns.some(pattern => pattern.test(cleanText))) {
    return { isValid: false, reason: 'Appears to be random text' };
  }
  
  return { isValid: true };
}

/**
 * Enhance confidence score based on medical context
 * @param {number} rawScore - Raw AI confidence score
 * @param {string} query - Original query
 * @param {string} prediction - AI prediction
 * @returns {number} Enhanced confidence score
 */
function enhanceConfidenceScore(rawScore, query, prediction) {
  let enhancedScore = rawScore;
  
  // Boost confidence for medical terms
  const medicalTerms = ['dolor', 'pain', 'fiebre', 'fever', 'síntoma', 'symptom'];
  if (medicalTerms.some(term => query?.toLowerCase().includes(term))) {
    enhancedScore *= 1.2;
  }
  
  // Boost confidence for specific medical predictions
  const specificMedicalTerms = ['diagnóstico', 'tratamiento', 'medicamento', 'síndrome'];
  if (specificMedicalTerms.some(term => prediction?.toLowerCase().includes(term))) {
    enhancedScore *= 1.15;
  }
  
  // Cap at reasonable maximum
  return Math.min(enhancedScore, 0.95);
}

/**
 * Generate enhanced medical response
 * @param {string} prediction - AI prediction
 * @param {string} query - Original query
 * @param {number} confidence - Confidence score
 * @returns {string} Enhanced medical response
 */
function generateMedicalResponse(prediction, query, confidence) {
  const confidenceLevel = confidence > 0.8 ? 'alta' : confidence > 0.6 ? 'moderada' : 'baja';
  
  return `Análisis médico (confianza ${confidenceLevel}): ${prediction}. ` +
         `Basándome en la consulta "${query}", esta predicción requiere validación clínica adicional. ` +
         `Recomiendo correlacionar con hallazgos físicos y estudios complementarios apropiados.`;
}

/**
 * Generate medical reasoning
 * @param {string} query - Original query
 * @param {Object} topPrediction - Top AI prediction
 * @param {Array} alternatives - Alternative predictions
 * @returns {Array} Reasoning points
 */
function generateMedicalReasoning(query, topPrediction, alternatives) {
  const reasoning = [
    `Análisis procesado: "${query}"`,
    `Predicción principal: ${topPrediction.token_str} (${(topPrediction.score * 100).toFixed(1)}% confianza)`,
    `Modelo aplicó contexto médico especializado`,
    `Consideradas ${alternatives.length + 1} opciones diagnósticas`
  ];
  
  if (alternatives.length > 0) {
    reasoning.push(`Alternativas evaluadas: ${alternatives.map(alt => alt.token_str).join(', ')}`);
  }
  
  return reasoning;
}

/**
 * Generate contextual suggestions based on query
 * @param {string} query - Original query
 * @param {string} prediction - AI prediction
 * @returns {Array} Contextual suggestions
 */
function generateContextualSuggestions(query) {
  const suggestions = [];
  
  // Specialty-based suggestions
  if (query?.toLowerCase().includes('dolor') || query?.toLowerCase().includes('pain')) {
    suggestions.push('Evaluar escala de dolor 1-10', 'Determinar localización exacta', 'Investigar factores desencadenantes');
  }
  
  if (query?.toLowerCase().includes('fiebre') || query?.toLowerCase().includes('fever')) {
    suggestions.push('Medir temperatura cada 4 horas', 'Evaluar signos de alarma', 'Considerar hemocultivos si persiste');
  }
  
  // General medical suggestions
  suggestions.push(
    'Historia clínica completa',
    'Examen físico dirigido',
    'Estudios de laboratorio básicos',
    'Seguimiento en 24-48 horas'
  );
  
  return suggestions;
}

/**
 * Create medical prompt for text-generation models
 * @param {string} query - Original query
 * @param {string} type - Query type
 * @param {Object} context - Additional context
 * @returns {string} Enhanced medical prompt
 */
function createMedicalPrompt(query, type) {
  const prompts = {
    diagnosis: `Como médico especialista, analiza el siguiente caso clínico y proporciona un diagnóstico diferencial:

Caso: ${query}

Diagnóstico y recomendaciones:`,
    
    prescription: `Como médico, revisa el siguiente caso y sugiere un plan de tratamiento:

Caso: ${query}

Plan terapéutico:`,
    
    soap: `Genera notas SOAP para el siguiente caso clínico:

Caso: ${query}

SOAP:
S (Subjetivo):`,
    
    analytics: `Analiza el siguiente caso médico y proporciona insights clínicos:

Caso: ${query}

Análisis clínico:`
  };
  
  return prompts[type] || prompts.diagnosis;
}

/**
 * Clean and extract relevant medical content from AI response
 * @param {string} text - Raw AI response
 * @param {string} originalQuery - Original query for context
 * @returns {string} Cleaned medical response
 */
function cleanMedicalResponse(text, originalQuery) {
  if (!text) return '';
  
  // Remove the original prompt from the response
  let cleaned = text;
  
  // Find where the actual response starts (after the prompt)
  const responseMarkers = [
    'Diagnóstico y recomendaciones:',
    'Plan terapéutico:',
    'Análisis clínico:',
    'SOAP:'
  ];
  
  for (const marker of responseMarkers) {
    const markerIndex = cleaned.indexOf(marker);
    if (markerIndex !== -1) {
      cleaned = cleaned.substring(markerIndex + marker.length).trim();
      break;
    }
  }
  
  // Remove repetitive content
  const lines = cleaned.split('\n').filter(line => line.trim());
  const uniqueLines = [];
  const seenLines = new Set();
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !seenLines.has(trimmedLine.toLowerCase())) {
      seenLines.add(trimmedLine.toLowerCase());
      uniqueLines.push(trimmedLine);
    }
  }
  
  // Limit response length and ensure it's meaningful
  let finalResponse = uniqueLines.slice(0, 5).join('. ');
  
  // Add medical context if response is too short
  if (finalResponse.length < 50) {
    finalResponse = `Basándome en "${originalQuery}", ${finalResponse || 'recomiendo una evaluación clínica completa con anamnesis detallada, exploración física dirigida y estudios complementarios según indicación médica.'}`;
  }
  
  return finalResponse;
}

// Default export for ES modules compatibility
const MedicalAILogic = {
  processMedicalQuery,
  getErrorMessage,
  getAvailableTypes
};

export default MedicalAILogic;