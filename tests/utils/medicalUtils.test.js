import { mockMedicalAI } from '../../src/utils/medicalUtils.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('mockMedicalAI.generateResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache and request log
    mockMedicalAI._cache = new Map();
    mockMedicalAI._requestLog = new Map();
  });

  it('should call /api/medical with correct parameters', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        response: 'Medical analysis result',
        confidence: 0.8,
        sources: ['jiviai/medX_v2']
      })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse(
      'Patient has fever and cough',
      { patient: { id: 'test-123', age: 35 } },
      'diagnosis'
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/medical', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Patient has fever and cough',
        context: { patient: { id: 'test-123', age: 35 } },
        type: 'diagnosis'
      })
    });

    expect(result.response).toBe('Medical analysis result');
    expect(result.confidence).toBe(0.8);
  });

  it('should handle authentication error (401) correctly', async () => {
    const mockError = {
      error: 'Invalid Hugging Face token',
      type: 'authentication_error'
    };
    const mockResponse = {
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockError))
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.response).toContain('(Token de Hugging Face inválido. Contacta al administrador)');
    expect(result.confidence).toBe(0.4);
    expect(result.error).toBe('authentication_error');
  });

  it('should handle configuration error correctly', async () => {
    const mockError = {
      error: 'Hugging Face token not configured',
      type: 'configuration_error'
    };
    const mockResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockError))
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.response).toContain('(Token de Hugging Face no configurado. Contacta al administrador)');
    expect(result.confidence).toBe(0.4);
    expect(result.error).toBe('configuration_error');
  });

  it('should handle rate limit error (429) correctly', async () => {
    const mockError = {
      error: 'Rate limit exceeded',
      type: 'rate_limit_error'
    };
    const mockResponse = {
      ok: false,
      status: 429,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockError))
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.response).toContain('(Límite de uso de Hugging Face excedido. Intenta más tarde)');
    expect(result.confidence).toBe(0.4);
    expect(result.error).toBe('rate_limit_error');
  });

  it('should handle generic API errors correctly', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Internal server error')
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.response).toContain('(Esta respuesta es simulada. Para análisis real con IA médica, verifica la conexión a Hugging Face o contacta al administrador)');
    expect(result.confidence).toBe(0.4);
  });

  it('should handle network errors correctly', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.response).toContain('(Esta respuesta es simulada. Para análisis real con IA médica, verifica la conexión a Hugging Face o contacta al administrador)');
    expect(result.confidence).toBe(0.4);
  });

  it('should respect rate limiting', async () => {
    // Fill rate limit for a patient
    const patientId = 'test-patient';
    const context = { patient: { id: patientId } };
    
    // Simulate 60 recent requests
    const recent = Array.from({ length: 60 }, () => Date.now());
    mockMedicalAI._requestLog.set(patientId, recent);

    const result = await mockMedicalAI.generateResponse('test query', context);

    expect(result.response).toBe('Lo siento, se alcanzó el límite de consultas por hora.');
    expect(result.confidence).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should use cache for repeated requests', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        response: 'Cached response',
        confidence: 0.9
      })
    };
    global.fetch.mockResolvedValue(mockResponse);

    // First call
    const result1 = await mockMedicalAI.generateResponse('test query');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call with same parameters should use cache
    const result2 = await mockMedicalAI.generateResponse('test query');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
    
    expect(result1.response).toBe('Cached response');
    expect(result2.response).toBe('Cached response');
  });

  it('should include disclaimer in all responses', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        response: 'Test response',
        disclaimer: 'AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado. No reemplaza el criterio médico profesional.'
      })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await mockMedicalAI.generateResponse('test query');

    expect(result.disclaimer).toContain('AVISO MÉDICO');
    expect(result.disclaimer).toContain('validada por un médico certificado');
  });
});