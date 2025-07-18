import { ChunkData } from './types';

/**
 * Formats seconds into MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generates a timestamped filename for audio downloads
 */
export const generateAudioFilename = (prefix: string = 'medical-recording'): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${prefix}-${timestamp}.wav`;
};

/**
 * Calculates total words across all chunks
 */
export const calculateTotalWords = (chunks: ChunkData[]): number => {
  return chunks.reduce((acc, chunk) => 
    acc + chunk.text.split(' ').filter(w => w.trim()).length, 0
  );
};

/**
 * Validates audio level value
 */
export const normalizeAudioLevel = (level: number): number => {
  return Math.min(Math.max(level, 0), 100);
};

/**
 * Formats confidence percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round((confidence || 0) * 100)}%`;
};

/**
 * Safely handles async operations with error logging
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
};