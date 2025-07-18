import { useRef, useCallback, useState, useEffect } from 'react';

import { audioPipelineIntegration } from '../services/AudioPipelineIntegration';

interface UseAudioProcessorOptions {
  onAudioData?: (audioData: Float32Array) => void;
  bufferSize?: number;
  sampleRate?: number;
}

export function useAudioProcessor({
  onAudioData,
  bufferSize = 4096,
  sampleRate = 16000
}: UseAudioProcessorOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);


  const start = useCallback(async (): Promise<MediaStream | null> => {
    if (isProcessing) return null;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      const audioContext = new AudioContext({ sampleRate });
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create script processor (deprecated but still works)
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Process audio data
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        // Create a copy of the data
        const audioData = new Float32Array(inputData);
        onAudioData?.(audioData);
      };

      // Connect nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store references
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;
      streamRef.current = stream;

      setIsProcessing(true);
      return stream;
    } catch (error) {
      console.error('Error starting audio processing:', error);
      throw error;
    }
  }, [isProcessing, bufferSize, sampleRate, onAudioData]);

  const stop = useCallback(() => {
    if (!isProcessing) return;

    // Disconnect nodes
    if (sourceRef.current && processorRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Clear references
    audioContextRef.current = null;
    sourceRef.current = null;
    processorRef.current = null;
    streamRef.current = null;

    setIsProcessing(false);
  }, [isProcessing]);

  return { start, stop, isProcessing };
}
