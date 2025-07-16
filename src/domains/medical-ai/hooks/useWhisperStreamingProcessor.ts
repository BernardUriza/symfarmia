import { useRef, useCallback } from 'react';
import { loadWhisperModel, transcribeAudio } from '../services/audioProcessingService';
import { resampleTo16kHz, normalizeFloat32 } from '../utils/audioHelpers';

interface PartialResult {
  text: string;
}

export function useWhisperStreamingProcessor() {
  const resultsRef = useRef<PartialResult[]>([]);
  const promisesRef = useRef<Promise<void>[]>([]);

  const processChunk = useCallback(async (chunk: Blob) => {
    const arrayBuffer = await chunk.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioData = await audioCtx.decodeAudioData(arrayBuffer);
    const float32 = audioData.getChannelData(0);
    if (!float32) return;

    await loadWhisperModel();
    const resampled = resampleTo16kHz(float32, audioData.sampleRate);
    const normalized = normalizeFloat32(resampled);

    const p = transcribeAudio(normalized, { return_timestamps: false }).then(res => {
      resultsRef.current.push({ text: res.text || '' });
    });
    promisesRef.current.push(p);
  }, []);

  const getTranscript = useCallback(async () => {
    await Promise.all(promisesRef.current);
    return resultsRef.current.map(r => r.text).join(' ');
  }, []);

  const reset = useCallback(() => {
    resultsRef.current = [];
    promisesRef.current = [];
  }, []);

  return { processChunk, getTranscript, reset };
}
