'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from '../app/providers/I18nProvider';

// 📊 Types que ConversationCapture necesita
export interface TranscriptionResult {
  text: string;
  confidence: number;
  medicalTerms: string[];
  processingTime: number;
}

export type TranscriptionStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

export interface UseTranscriptionReturn {
  // Estados que ConversationCapture consume
  transcription: TranscriptionResult | null;
  status: TranscriptionStatus;
  isRecording: boolean;
  error: string | null;
  engineStatus: 'ready' | 'loading' | 'error' | 'fallback';
  audioLevel: number;
  recordingTime: number;
  
  // Métodos que ConversationCapture necesita
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
}

export function useTranscription(options = {}): UseTranscriptionReturn {
  const { t } = useTranslation();
  
  // Estados internos
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'loading' | 'error' | 'fallback'>('ready');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer de grabación
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  // Inicializar audio level monitoring
  const setupAudioMonitoring = useCallback(async (stream: MediaStream) => {
    console.log('🎧 [setupAudioMonitoring] Iniciando configuración de monitoreo de audio...');
    
    try {
      console.log('🔊 [setupAudioMonitoring] Creando AudioContext...');
      audioContextRef.current = new AudioContext();
      console.log(`✅ [setupAudioMonitoring] AudioContext creado - sampleRate: ${audioContextRef.current.sampleRate}Hz`);
      
      console.log('📊 [setupAudioMonitoring] Creando AnalyserNode...');
      const analyser = audioContextRef.current.createAnalyser();
      console.log(`✅ [setupAudioMonitoring] AnalyserNode creado - fftSize: ${analyser.fftSize}`);
      
      console.log('🎤 [setupAudioMonitoring] Creando MediaStreamSource...');
      const source = audioContextRef.current.createMediaStreamSource(stream);
      console.log('✅ [setupAudioMonitoring] MediaStreamSource creado');
      
      analyser.fftSize = 256;
      console.log(`📏 [setupAudioMonitoring] FFT Size configurado a: ${analyser.fftSize}`);
      console.log(`📊 [setupAudioMonitoring] Frequency bin count: ${analyser.frequencyBinCount}`);
      
      source.connect(analyser);
      console.log('🔗 [setupAudioMonitoring] Source conectado a analyser');
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      console.log(`📦 [setupAudioMonitoring] Array de datos creado con ${dataArray.length} elementos`);
      
      let frameCount = 0;
      const updateAudioLevel = () => {
        if (!isRecording) {
          console.log('⏹️ [updateAudioLevel] Deteniendo monitoreo - no está grabando');
          return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        // Log cada 30 frames (aproximadamente cada segundo a 30fps)
        if (frameCount % 30 === 0) {
          console.log(`📈 [updateAudioLevel] Nivel de audio: ${average.toFixed(1)}/255 (${((average/255)*100).toFixed(1)}%)`);
        }
        frameCount++;
        
        requestAnimationFrame(updateAudioLevel);
      };
      
      console.log('▶️ [setupAudioMonitoring] Iniciando loop de monitoreo...');
      updateAudioLevel();
      console.log('✅ [setupAudioMonitoring] Monitoreo de audio configurado exitosamente');
      
    } catch (error) {
      console.error('💥 [setupAudioMonitoring] Error al configurar monitoreo de audio:', error);
      console.error(`🔍 [setupAudioMonitoring] Tipo de error: ${error instanceof Error ? error.constructor.name : typeof error}`);
      console.error(`📝 [setupAudioMonitoring] Mensaje: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [isRecording]);
  
  // Start transcription
  const startTranscription = useCallback(async (): Promise<boolean> => {
    console.log('🚀 [startTranscription] Iniciando función de transcripción...');
    
    try {
      console.log('🧹 [startTranscription] Limpiando estados previos...');
      setError(null);
      setStatus('recording');
      setEngineStatus('ready');
      setRecordingTime(0);
      console.log('✅ [startTranscription] Estados inicializados correctamente');
      
      // Verificar permisos de micrófono
      console.log('🎤 [startTranscription] Solicitando permisos de micrófono...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ [startTranscription] Permisos de micrófono concedidos');
      console.log(`📊 [startTranscription] Stream activo con ${stream.getTracks().length} tracks`);
      
      // Setup audio monitoring
      console.log('📈 [startTranscription] Configurando monitoreo de audio...');
      await setupAudioMonitoring(stream);
      console.log('✅ [startTranscription] Monitoreo de audio configurado');
      
      // Setup MediaRecorder
      console.log('🎙️ [startTranscription] Creando MediaRecorder...');
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      console.log(`📹 [startTranscription] Usando mimeType: ${mimeType}`);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      console.log('✅ [startTranscription] MediaRecorder creado exitosamente');
      
      const audioChunks: Blob[] = [];
      console.log('🗂️ [startTranscription] Array de chunks de audio inicializado');
      
      mediaRecorder.ondataavailable = (event) => {
        console.log(`📦 [ondataavailable] Chunk recibido: ${event.data.size} bytes`);
        audioChunks.push(event.data);
        console.log(`📊 [ondataavailable] Total chunks: ${audioChunks.length}`);
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 [onstop] MediaRecorder detenido, procesando audio...');
        setStatus('processing');
        
        try {
          // Crear blob de audio
          console.log('🎵 [onstop] Creando blob de audio...');
          console.log(`📊 [onstop] Total chunks a combinar: ${audioChunks.length}`);
          const totalSize = audioChunks.reduce((acc, chunk) => acc + chunk.size, 0);
          console.log(`📏 [onstop] Tamaño total del audio: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
          
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          console.log(`✅ [onstop] Blob creado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);
          
          // Enviar al endpoint /api/transcription
          console.log('📤 [onstop] Preparando FormData para envío...');
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          console.log('✅ [onstop] FormData preparado con archivo de audio');
          
          console.log('🌐 [onstop] Enviando audio a /api/transcription...');
          const startTime = Date.now();
          const response = await fetch('/api/transcription', {
            method: 'POST',
            body: formData
          });
          const fetchTime = Date.now() - startTime;
          console.log(`⏱️ [onstop] Respuesta recibida en ${fetchTime}ms`);
          console.log(`📡 [onstop] Status HTTP: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            console.error(`❌ [onstop] Error HTTP: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.log('📄 [onstop] Parseando respuesta JSON...');
          const result = await response.json();
          console.log('✅ [onstop] Respuesta parseada:', result);
          
          if (result.success) {
            console.log('🎉 [onstop] Transcripción exitosa!');
            console.log(`📝 [onstop] Texto transcrito: "${result.transcript?.substring(0, 50)}..."`);
            console.log(`🔢 [onstop] Confianza: ${result.confidence}`);
            console.log(`⏱️ [onstop] Tiempo de procesamiento: ${result.processing_time_ms}ms`);
            
            const medicalTerms = extractMedicalTerms(result.transcript || '');
            console.log(`🏥 [onstop] Términos médicos encontrados: ${medicalTerms.length}`);
            
            setTranscription({
              text: result.transcript || '',
              confidence: result.confidence || 0,
              medicalTerms: medicalTerms,
              processingTime: result.processing_time_ms || 0
            });
            setStatus('completed');
            console.log('✅ [onstop] Estado de transcripción actualizado a "completed"');
          } else {
            console.error('❌ [onstop] Transcripción falló:', result.error);
            throw new Error(result.error || 'Transcription failed');
          }
          
        } catch (error) {
          console.error('💥 [onstop] Error en procesamiento de transcripción:', error);
          setError(error instanceof Error ? error.message : 'Transcription failed');
          setStatus('error');
          setEngineStatus('error');
          console.log('❌ [onstop] Estados actualizados a error');
        }
        
        // Cleanup
        console.log('🧹 [onstop] Iniciando limpieza...');
        stream.getTracks().forEach((track, index) => {
          console.log(`🔌 [onstop] Deteniendo track ${index}: ${track.kind}`);
          track.stop();
        });
        setAudioLevel(0);
        console.log('✅ [onstop] Limpieza completada');
      };
      
      // Start recording
      console.log('▶️ [startTranscription] Iniciando grabación...');
      mediaRecorder.start(1000); // Chunk every second
      console.log('✅ [startTranscription] MediaRecorder.start() llamado con chunks de 1 segundo');
      
      setIsRecording(true);
      console.log('✅ [startTranscription] Estado isRecording = true');
      console.log('🎉 [startTranscription] Transcripción iniciada exitosamente!');
      
      return true;
      
    } catch (error) {
      console.error('💥 [startTranscription] Error crítico al iniciar transcripción:', error);
      console.error(`🔍 [startTranscription] Tipo de error: ${error instanceof Error ? error.constructor.name : typeof error}`);
      console.error(`📝 [startTranscription] Mensaje: ${error instanceof Error ? error.message : String(error)}`);
      
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setStatus('error');
      setEngineStatus('error');
      setIsRecording(false);
      
      console.log('❌ [startTranscription] Estados actualizados a error, retornando false');
      return false;
    }
  }, [setupAudioMonitoring]);
  
  // Stop transcription
  const stopTranscription = useCallback(async (): Promise<boolean> => {
    console.log('🛑 [stopTranscription] Iniciando detención de transcripción...');
    
    try {
      console.log(`📊 [stopTranscription] Estado actual - isRecording: ${isRecording}`);
      console.log(`📊 [stopTranscription] MediaRecorder existe: ${!!mediaRecorderRef.current}`);
      
      if (mediaRecorderRef.current && isRecording) {
        console.log(`📊 [stopTranscription] MediaRecorder state: ${mediaRecorderRef.current.state}`);
        console.log('⏹️ [stopTranscription] Llamando mediaRecorder.stop()...');
        
        mediaRecorderRef.current.stop();
        console.log('✅ [stopTranscription] MediaRecorder.stop() llamado exitosamente');
        
        setIsRecording(false);
        console.log('✅ [stopTranscription] Estado isRecording = false');
        console.log('🎉 [stopTranscription] Detención completada exitosamente');
        
        return true;
      }
      
      console.log('⚠️ [stopTranscription] No se puede detener - condiciones no cumplidas');
      console.log(`   - mediaRecorderRef.current: ${!!mediaRecorderRef.current}`);
      console.log(`   - isRecording: ${isRecording}`);
      return false;
      
    } catch (error) {
      console.error('💥 [stopTranscription] Error al detener transcripción:', error);
      console.error(`🔍 [stopTranscription] Tipo de error: ${error instanceof Error ? error.constructor.name : typeof error}`);
      console.error(`📝 [stopTranscription] Mensaje: ${error instanceof Error ? error.message : String(error)}`);
      
      setError('Failed to stop recording');
      console.log('❌ [stopTranscription] Error guardado en estado');
      return false;
    }
  }, [isRecording]);
  
  // Reset transcription
  const resetTranscription = useCallback(() => {
    console.log('🔄 [resetTranscription] Reiniciando estados de transcripción...');
    
    setTranscription(null);
    console.log('✅ [resetTranscription] Transcripción = null');
    
    setStatus('idle');
    console.log('✅ [resetTranscription] Status = idle');
    
    setError(null);
    console.log('✅ [resetTranscription] Error = null');
    
    setRecordingTime(0);
    console.log('✅ [resetTranscription] Tiempo de grabación = 0');
    
    setAudioLevel(0);
    console.log('✅ [resetTranscription] Nivel de audio = 0');
    
    setEngineStatus('ready');
    console.log('✅ [resetTranscription] Estado del motor = ready');
    
    console.log('🎉 [resetTranscription] Reinicio completado - todos los estados limpiados');
  }, []);
  
  return {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    startTranscription,
    stopTranscription,
    resetTranscription
  };
}

// Utility function to extract medical terms
function extractMedicalTerms(text: string): string[] {
  const medicalTerms = [
    'dolor', 'fiebre', 'presión', 'sangre', 'corazón', 'pulmón', 
    'respiración', 'síntoma', 'diagnóstico', 'tratamiento', 
    'medicamento', 'alergia', 'diabetes', 'hipertensión', 'cefalea'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  return medicalTerms.filter(term => 
    words.some(word => word.includes(term))
  );
}

export default useTranscription;