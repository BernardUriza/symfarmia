import { POST, GET } from '../../app/api/medical/route.js';
import { MedicalAIConfig } from '../../app/config/MedicalAIConfig.js';

function createRequest(body, method = 'POST') {
  return {
    json: async () => (body && typeof body === 'object' ? body : JSON.parse(body || '{}')),
    method,
    headers: { get: () => 'application/json' }
  };
}

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
const originalEnv = process.env;

describe('/api/medical', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST', () => {
    it('should return 400 when query is missing', async () => {
      const request = createRequest({}, 'POST');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Query is required');
    });

    it('should return 500 when HUGGINGFACE_TOKEN is not configured', async () => {
      delete process.env.HUGGINGFACE_TOKEN;

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Hugging Face token not configured');
      expect(data.type).toBe('configuration_error');
    });

    it('should include Authorization header with Bearer token', async () => {
      process.env.HUGGINGFACE_TOKEN = 'test-token-123';
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          generated_text: 'Test medical response'
        })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({
        query: 'Patient has chest pain',
        type: 'diagnosis'
      });

      const response = await POST(request);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api-inference.huggingface.co/models/${MedicalAIConfig.getModel('diagnosis')}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
            'Content-Type': 'application/json',
            'User-Agent': 'SYMFARMIA-Medical-Assistant/1.0'
          }),
          body: expect.stringContaining('Patient has chest pain')
        })
      );

      expect(response.status).toBe(200);
    });

    it('should return 401 when Hugging Face returns unauthorized', async () => {
      process.env.HUGGINGFACE_TOKEN = 'invalid-token';

      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized')
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid Hugging Face token');
      expect(data.type).toBe('authentication_error');
    });

    it('should return 429 when rate limit is exceeded', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const mockResponse = {
        ok: false,
        status: 429,
        text: jest.fn().mockResolvedValue('Rate limit exceeded')
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.type).toBe('rate_limit_error');
    });

    it('should return 404 when model is not found', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Model not found')
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Model not found');
      expect(data.type).toBe('model_not_found');
    });

    it('should return 503 when service is unavailable', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const mockResponse = {
        ok: false,
        status: 503,
        text: jest.fn().mockResolvedValue('Service Unavailable')
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Service unavailable - model loading');
      expect(data.type).toBe('service_unavailable');
    });

    it('should return 408 when request times out', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const abortError = new Error('Request timeout');
      abortError.name = 'AbortError';
      global.fetch.mockRejectedValue(abortError);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(408);
      expect(data.error).toBe('Request timeout');
      expect(data.type).toBe('timeout_error');
    });

    it('should return 503 when network error occurs', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const networkError = new TypeError('fetch failed');
      global.fetch.mockRejectedValue(networkError);

      const request = createRequest({ query: 'test query' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Network error');
      expect(data.type).toBe('network_error');
    });

    it('should return successful response with proper format', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const mockHfResponse = {
        token_str: 'cardiac evaluation',
        score: 0.85,
        sequence: 'Patient has chest pain and shortness of breath [MASK]'
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([mockHfResponse])
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({
        query: 'Patient has chest pain and shortness of breath',
        context: { patient: { age: 45 } },
        type: 'diagnosis'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBe('Predicción médica: cardiac evaluation');
      expect(data.confidence).toBe(0.85);
      expect(data.disclaimer).toContain('AVISO MÉDICO');
      expect(data.sources).toContain(MedicalAIConfig.getModel('diagnosis'));
    });

    it('should use correct model for different types', async () => {
      process.env.HUGGINGFACE_TOKEN = 'valid-token';

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ generated_text: 'Response' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const request = createRequest({
        query: 'test query',
        type: 'prescription'
      });

      await POST(request);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://api-inference.huggingface.co/models/${MedicalAIConfig.getModel('prescription')}`,
        expect.any(Object)
      );
    });
  });

  describe('GET', () => {
    it('should return API information', async () => {
      const request = createRequest(null, 'GET');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Medical AI API endpoint');
      expect(data.availableTypes).toContain('diagnosis');
      expect(data.availableTypes).toContain('prescription');
      expect(data.usage).toContain('POST');
    });
  });
});