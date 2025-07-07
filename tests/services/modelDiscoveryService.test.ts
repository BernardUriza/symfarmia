import { connectToHuggingFaceModel, validateModelAvailability } from '../../app/services/modelDiscoveryService';

global.fetch = jest.fn();

describe('modelDiscoveryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateModelAvailability', () => {
    it('returns available true when fetch ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ model: 'test' }) });
      const result = await validateModelAvailability('test-model');
      expect(result.available).toBe(true);
      expect(result.status).toBe(200);
    });

    it('handles fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));
      const result = await validateModelAvailability('bad-model');
      expect(result.available).toBe(false);
      expect(result.error).toBe('network');
    });
  });

  describe('connectToHuggingFaceModel', () => {
    it('returns data on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ answer: 'ok' }) });
      const result = await connectToHuggingFaceModel('test-model', 'hi');
      expect(result.success).toBe(true);
      expect(result.modelUsed).toBe('test-model');
    });

    it('returns error on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
      const result = await connectToHuggingFaceModel('bad', 'hi');
      expect(result.success).toBe(false);
    });
  });
});
