import { useRef, useState, useCallback } from 'react';

interface UseAudioChunkManagerOptions {
  onChunkReady?: (chunk: Blob) => void;
  chunkDurationMs?: number;
}

export function useAudioChunkManager({
  onChunkReady,
  chunkDurationMs = 4000,
}: UseAudioChunkManagerOptions = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkQueueRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunkQueueRef.current.push(e.data);
        onChunkReady?.(e.data);
      }
    };

    // Start recording with timeslice to get continuous chunks
    recorder.start(chunkDurationMs);
    setIsRecording(true);
    return stream;
  }, [chunkDurationMs, isRecording, onChunkReady]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  const pushAudio = useCallback(
    (blob: Blob) => {
      chunkQueueRef.current.push(blob);
      onChunkReady?.(blob);
    },
    [onChunkReady]
  );

  const getNextChunk = useCallback(() => {
    return chunkQueueRef.current.shift() || null;
  }, []);

  return { start, stop, pushAudio, getNextChunk, isRecording };
}
