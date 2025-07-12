"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { createTranscriptionSegment } from '../utils';
import { AUDIO_LEVEL_UPDATE_INTERVAL } from '../constants';

export function useConversationState() {
  const [segments, setSegments] = useState([]);
  const [engineError, setEngineError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const startTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);

  // Añadir nuevo segmento
  const addSegment = useCallback((text, speaker = 'patient') => {
    if (!text?.trim()) return;
    
    const newSegment = createTranscriptionSegment(text, speaker);
    setSegments(prev => [...prev, newSegment]);
  }, []);

  // Limpiar todos los segmentos
  const clearSegments = useCallback(() => {
    setSegments([]);
    setEngineError(null);
  }, []);

  // Actualizar segmento existente
  const updateSegment = useCallback((id, updates) => {
    setSegments(prev => 
      prev.map(segment => 
        segment.id === id ? { ...segment, ...updates } : segment
      )
    );
  }, []);

  // Eliminar segmento
  const removeSegment = useCallback((id) => {
    setSegments(prev => prev.filter(segment => segment.id !== id));
  }, []);

  // Iniciar medición de duración
  const startDurationTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    setDuration(0);
    
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(elapsed);
    }, 1000);
  }, []);

  // Detener medición de duración
  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Iniciar análisis de nivel de audio
  const startAudioLevelAnalysis = useCallback(async (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioLevelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
        }
      }, AUDIO_LEVEL_UPDATE_INTERVAL);
    } catch (error) {
      console.error('Error iniciando análisis de audio:', error);
    }
  }, []);

  // Detener análisis de nivel de audio
  const stopAudioLevelAnalysis = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopDurationTracking();
      stopAudioLevelAnalysis();
    };
  }, [stopDurationTracking, stopAudioLevelAnalysis]);

  return {
    segments,
    engineError,
    audioLevel,
    duration,
    setEngineError,
    addSegment,
    clearSegments,
    updateSegment,
    removeSegment,
    startDurationTracking,
    stopDurationTracking,
    startAudioLevelAnalysis,
    stopAudioLevelAnalysis
  };
}