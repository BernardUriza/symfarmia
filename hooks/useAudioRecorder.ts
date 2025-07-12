import { useState, useCallback, useRef } from 'react';
import { convertToWav } from '@/utils/audioConverter';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs tipados correctamente
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Límite máximo de grabación (45 segundos)
  const MAX_RECORDING_TIME = 45000; // milisegundos

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      console.log('🎤 Iniciando grabación de audio...');
      
      // Solicitar permisos de audio con configuración específica
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,  // Whisper prefiere 16kHz
          channelCount: 1,    // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('✅ Stream de audio obtenido');
      console.log('📊 Audio tracks:', stream.getAudioTracks().length);
      
      if (stream.getAudioTracks().length > 0) {
        const track = stream.getAudioTracks()[0];
        console.log('🔊 Configuración del track:', {
          enabled: track.enabled,
          kind: track.kind,
          label: track.label,
          settings: track.getSettings()
        });
      }

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Configurar MediaRecorder con formato específico
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/wav',
        'audio/mp4',
        'audio/ogg'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ Usando MIME type:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No hay formatos de audio soportados');
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 16000 // Bitrate bajo para reducir tamaño
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('📦 Chunk de audio recibido:', {
          size: event.data.size,
          type: event.data.type
        });
        
        if (event.data.size > 0 && audioChunksRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 Grabación detenida, procesando audio...');
        setIsTranscribing(true);
        
        try {
          const chunks = audioChunksRef.current || [];
          console.log('📊 Total chunks recolectados:', chunks.length);
          console.log('📏 Tamaños de chunks:', chunks.map(c => c.size));
          
          if (chunks.length === 0) {
            throw new Error('No se grabó audio');
          }

          // Crear blob de audio
          const audioBlob = new Blob(chunks, { 
            type: selectedMimeType 
          });
          
          console.log('🔊 Audio blob creado:', {
            size: audioBlob.size,
            type: audioBlob.type
          });

          if (audioBlob.size === 0) {
            throw new Error('Audio grabado está vacío');
          }

          if (audioBlob.size < 1000) {
            console.warn('⚠️ Audio muy pequeño, puede no transcribirse bien');
          }

          // Convertir a WAV para mejor compatibilidad con Whisper
          let finalAudioBlob = audioBlob;
          let fileName = 'recording.webm';
          
          try {
            console.log('🔄 Convirtiendo audio a WAV...');
            finalAudioBlob = await convertToWav(audioBlob);
            fileName = 'recording.wav';
            console.log('✅ Audio convertido a WAV exitosamente');
          } catch (conversionError) {
            console.warn('⚠️ No se pudo convertir a WAV, enviando formato original:', conversionError);
            // Continuar con el formato original si la conversión falla
          }

          // Crear FormData para enviar
          const formData = new FormData();
          const audioFile = new File([finalAudioBlob], fileName, { 
            type: finalAudioBlob.type 
          });
          
          formData.append('audio', audioFile);
          formData.append('language', 'es');
          
          console.log('📤 Enviando a /api/transcribe...', {
            fileName: audioFile.name,
            fileSize: audioFile.size,
            fileType: audioFile.type
          });

          // Enviar al endpoint
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          console.log('📥 Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('📋 Resultado de transcripción:', result);

          if (result.success) {
            const transcribedText = result.data?.text || '';
            console.log('✅ Texto transcrito:', transcribedText);
            setTranscript(transcribedText);
            
            if (!transcribedText) {
              console.warn('⚠️ Transcripción exitosa pero texto vacío');
              setError('Transcripción exitosa pero no se detectó texto. Intente hablar más alto o más claro.');
            }
          } else {
            throw new Error(result.error || 'Transcripción falló');
          }
          
        } catch (err) {
          console.error('❌ Error en transcripción:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido en transcripción');
        } finally {
          setIsTranscribing(false);
          // Limpiar stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log('🔇 Track de audio detenido');
            });
            streamRef.current = null;
          }
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ Error en MediaRecorder:', event);
        setError('Error en la grabación de audio');
        setIsRecording(false);
        setIsTranscribing(false);
      };

      // Comenzar grabación con chunks de 1 segundo
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      
      console.log('✅ Grabación iniciada exitosamente');
      
      // Configurar timer para detener automáticamente después del límite
      recordingTimerRef.current = setTimeout(() => {
        console.log('⏰ Límite de tiempo alcanzado, deteniendo grabación...');
        setError('Grabación detenida: límite de 45 segundos alcanzado');
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, MAX_RECORDING_TIME);
      
    } catch (err) {
      console.error('❌ Error iniciando grabación:', err);
      setError(err instanceof Error ? err.message : 'Error accediendo al micrófono');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    console.log('🛑 Solicitando detener grabación...');
    
    // Limpiar el timer si existe
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
      console.log('⏱️ Timer de grabación cancelado');
    }
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('✅ Grabación detenida');
      } catch (err) {
        console.error('❌ Error deteniendo grabación:', err);
        setError('Error deteniendo la grabación');
      }
    } else {
      console.warn('⚠️ No hay grabación activa para detener');
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    console.log('🧹 Limpiando transcript');
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}