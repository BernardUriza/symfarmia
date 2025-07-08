/**
 * Medical AI Logic service for processing medical queries
 */

/**
 * Process medical query with AI
 */
async function processMedicalQuery(query: string, type: string = 'general'): Promise<string> {
  try {
    // Simulate medical AI processing
    const medicalResponse = `Basándome en la consulta médica "${query}", recomiendo una evaluación clínica completa con anamnesis detallada, exploración física dirigida y estudios complementarios según indicación médica.`;
    return medicalResponse;
  } catch (error) {
    console.error('Error processing medical query:', error);
    throw error;
  }
}

/**
 * Get error message based on status
 */
function getErrorMessage(status: number): string {
  const errorMessages: { [key: number]: string } = {
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
 */
function getAvailableTypes(config: any): any[] {
  return config?.getAvailableTypes() || [];
}

// ES6 exports for TypeScript
export {
  processMedicalQuery,
  getErrorMessage,
  getAvailableTypes
};