import { useRef, useState, useCallback } from 'react';
import { useAudioChunkAccumulator } from './useAudioChunkAccumulator';

interface UseAudioChunkManagerOptions {
  onChunkReady?: (chunk: Blob) => void;
  chunkDurationMs?: number;
}

export function useAudioChunkManager({
  onChunkReady,
  chunkDurationMs = 10000, // 10 segundos para chunks GORDOS con contexto real
}: UseAudioChunkManagerOptions = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkQueueRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const { addChunk, flush, reset: resetAccumulator } = useAudioChunkAccumulator({
    onCompleteChunk: (chunk) => {
      console.log(`[AudioChunkManager] CHUNK GORDO LISTO: ${chunk.size} bytes (${(chunk.size / 32000).toFixed(1)}s a 16kHz)`);
      chunkQueueRef.current.push(chunk);
      onChunkReady?.(chunk);
    },
    minChunkSize: 160000, // 10 segundos a 16kHz - CHUNK GORDO
    maxAccumulationTime: 12000 // 12 segundos max para garantizar chunks completos
  });

  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isRecording) return null;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Determinar el mejor formato MIME soportado
      let mimeType = 'audio/webm';
      const possibleTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ];
      
      for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log(`Usando formato de audio: ${mimeType}`);
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          console.log(`Chunk de audio recibido: ${e.data.size} bytes`);
          // Acumular chunks en lugar de enviarlos directamente
          addChunk(e.data, mimeType);
        }
      };

      recorder.onerror = (event: Event) => {
        console.error('Error en MediaRecorder:', event);
      };

      // Start recording with timeslice to get continuous chunks
      recorder.start(chunkDurationMs);
      setIsRecording(true);
      return stream;
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      setIsRecording(false);
      return null;
    }
  }, [chunkDurationMs, isRecording, addChunk]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      // Procesar cualquier chunk restante
      flush();
      setIsRecording(false);
      resetAccumulator();
    }
  }, [isRecording, flush, resetAccumulator]);

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
