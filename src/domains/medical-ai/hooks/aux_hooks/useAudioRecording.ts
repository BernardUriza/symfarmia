// useAudioRecording.ts (brutal, autocontenible)
import { useCallback, useRef, useState } from "react";

interface AudioRecordingOptions {
  sampleRate: number;
  chunkSize: number;
  onAudioChunk: (audio: Float32Array, meta: { chunkId: number }) => void;
}

export function useAudioRecording({ sampleRate, chunkSize, onAudioChunk }: AudioRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const chunkIdRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // --- Start recording ---
  const start = useCallback(async () => {
    if (isRecording) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(chunkSize, 1, 1);
      processorRef.current = processor;
      chunksRef.current = [];
      chunkIdRef.current = 0;
      // Audio level monitoring
      processor.onaudioprocess = e => {
        const input = e.inputBuffer.getChannelData(0);
        const inputCopy = new Float32Array(input.length);
        inputCopy.set(input);
        // Push chunk
        chunksRef.current.push(inputCopy);
        // Notificar chunk listo (por tamaño acumulado)
        if (chunksRef.current.length * chunkSize >= chunkSize) {
          onAudioChunk(inputCopy, { chunkId: chunkIdRef.current++ });
        }
        // Level
        const level = Math.sqrt(input.reduce((sum, s) => sum + s * s, 0) / input.length);
        setAudioLevel(Math.round(level * 100));
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      return stream;
    } catch (e) {
      setIsRecording(false);
      throw e;
    }
  }, [sampleRate, chunkSize, onAudioChunk, isRecording]);

  // --- Stop recording ---
  const stop = useCallback(() => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // --- Reset ---
  const reset = useCallback(() => {
    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
    chunksRef.current = [];
    chunkIdRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // --- Getters para audio grabado ---
  const getAudioData = useCallback(() => {
    if (!chunksRef.current.length) return null;
    // Concatenar todos los chunks
    const totalLength = chunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
    const fullAudio = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      fullAudio.set(chunk, offset);
      offset += chunk.length;
    }
    return fullAudio;
  }, []);

  // --- Crear WAV Blob ---
  const createWavBlob = useCallback(() => {
    const audioData = getAudioData();
    if (!audioData) return null;
    const length = audioData.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }
    return new Blob([buffer], { type: "audio/wav" });
  }, [getAudioData, sampleRate]);

  return {
    isRecording,
    audioLevel,
    recordingTime,
    start,
    stop,
    reset,
    getAudioData,
    createWavBlob,
  };
}
