import { POST, GET } from '../../app/api/medical-ai/demo/route.js';
import { MedicalAIConfig } from '../../app/config/MedicalAIConfig.js';

function createRequest(body, method = 'POST') {
  return {
    json: async () => body,
    method,
    headers: { get: () => 'application/json' }
  };
}

global.fetch = jest.fn();

const originalEnv = process.env;

describe('/api/medical-ai/demo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST', () => {
    it('should return 400 when input is missing', async () => {
      const response = await POST(createRequest({}));
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Input is required');
    });

    it('should return greeting for non medical input', async () => {
      const response = await POST(createRequest({ input: 'Hola' }));
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.response).toContain('Hola');
    });

    it('should call medical query for medical input', async () => {
      process.env.HUGGINGFACE_TOKEN = 'token';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ generated_text: 'Test' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await POST(createRequest({ input: 'Me duele la cabeza' }));
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        `https://api-inference.huggingface.co/models/${MedicalAIConfig.getModel('diagnosis')}`,
        expect.any(Object)
      );
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('GET', () => {
    it('should return endpoint info', async () => {
      const response = await GET(createRequest(null, 'GET'));
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe('Medical AI Demo endpoint');
    });
  });
});
