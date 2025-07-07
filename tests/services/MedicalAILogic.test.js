import { processMedicalQuery, getErrorMessage, getAvailableTypes } from '../../app/services/MedicalAILogic.js';

// Mock dependencies
const mockConfig = {
  validateConfig: jest.fn(() => []),
  getModel: jest.fn(() => 'test-model'),
  getModelParameters: jest.fn(() => ({ max_length: 100 })),
  getToken: jest.fn(() => 'test-token'),
  getUserAgent: jest.fn(() => 'test-agent'),
  getBaseUrl: jest.fn(() => 'https://api.test.com'),
  getTimeout: jest.fn(() => 5000),
  getDisclaimer: jest.fn(() => 'Test disclaimer'),
  getAvailableTypes: jest.fn(() => ['diagnosis', 'prescription'])
};

const mockHttpClient = {
  fetch: jest.fn()
};

describe('MedicalAILogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processMedicalQuery', () => {
    it('should process a medical query successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          generated_text: 'Test medical response'
        })
      };
      mockHttpClient.fetch.mockResolvedValue(mockResponse);

      const result = await processMedicalQuery(
        { query: 'Test medical query', type: 'diagnosis' },
        { config: mockConfig, httpClient: mockHttpClient }
      );

      expect(result).toEqual({
        response: 'Test medical response',
        confidence: 0.85,
        reasoning: [],
        suggestions: [],
        disclaimer: 'Test disclaimer',
        sources: ['test-model'],
        success: true
      });
    });

    it('should throw error when query is missing', async () => {
      await expect(
        processMedicalQuery(
          { query: '', type: 'diagnosis' },
          { config: mockConfig, httpClient: mockHttpClient }
        )
      ).rejects.toThrow('Query is required');
    });

    it('should throw configuration error when config is invalid', async () => {
      const configWithErrors = {
        ...mockConfig,
        validateConfig: jest.fn(() => ['Missing API key'])
      };

      await expect(
        processMedicalQuery(
          { query: 'Test query', type: 'diagnosis' },
          { config: configWithErrors, httpClient: mockHttpClient }
        )
      ).rejects.toThrow('Configuration error');
    });

    it('should handle API errors correctly', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      };
      mockHttpClient.fetch.mockResolvedValue(mockResponse);

      await expect(
        processMedicalQuery(
          { query: 'Test query', type: 'diagnosis' },
          { config: mockConfig, httpClient: mockHttpClient }
        )
      ).rejects.toMatchObject({
        message: 'Unauthorized',
        status: 401,
        type: 'authentication_error'
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      mockHttpClient.fetch.mockRejectedValue(timeoutError);

      await expect(
        processMedicalQuery(
          { query: 'Test query', type: 'diagnosis' },
          { config: mockConfig, httpClient: mockHttpClient }
        )
      ).rejects.toMatchObject({
        name: 'AbortError'
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error message for known status codes', () => {
      expect(getErrorMessage(401)).toBe('Invalid Hugging Face token');
      expect(getErrorMessage(404)).toBe('Model not found');
      expect(getErrorMessage(429)).toBe('Rate limit exceeded');
      expect(getErrorMessage(503)).toBe('Service unavailable - model loading');
    });

    it('should return generic error message for unknown status codes', () => {
      expect(getErrorMessage(500)).toBe('Hugging Face API error: 500');
    });
  });

  describe('getAvailableTypes', () => {
    it('should return available types from config', () => {
      const result = getAvailableTypes(mockConfig);
      expect(result).toEqual(['diagnosis', 'prescription']);
      expect(mockConfig.getAvailableTypes).toHaveBeenCalled();
    });
  });
});