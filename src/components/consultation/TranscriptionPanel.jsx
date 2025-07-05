import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StopIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useConsultation } from '../../contexts/ConsultationContext';

const TranscriptionPanel = () => {
  const {
    isRecording,
    isPaused,
    liveTranscript,
    finalTranscript,
    confidence,
    startRecording,
    stopRecording,
    updateLiveTranscript,
    finalizeTranscript,
    logEvent,
    addAiMessage,
    isAdvancedMode
  } = useConsultation();
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermission, setMicPermission] = useState('prompt'); // 'granted' | 'denied' | 'prompt' | 'checking'
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptionService] = useState('browser'); // 'browser' | 'whisper'
  const [micDiagnostics, setMicDiagnostics] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);
  
  // Update recording time
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, isPaused]);
  
  const runMicrophoneDiagnostics = async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      isHTTPS: location.protocol === 'https:',
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasPermissionsAPI: !!navigator.permissions,
      devices: [],
      permissionState: 'unknown',
      errors: [],
      recommendations: []
    };

    try {
      // Check for basic API availability
      if (!navigator.mediaDevices) {
        diagnostics.errors.push('MediaDevices API no disponible en este navegador');
        diagnostics.recommendations.push('Actualiza tu navegador a una versión más reciente');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        diagnostics.errors.push('getUserMedia API no disponible');
        diagnostics.recommendations.push('Tu navegador no soporta acceso al micrófono');
      }

      // Check HTTPS requirement
      if (!diagnostics.isHTTPS && location.hostname !== 'localhost') {
        diagnostics.errors.push('Se requiere HTTPS para acceso al micrófono');
        diagnostics.recommendations.push('Accede al sitio usando HTTPS://');
      }

      // Enumerate audio devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        diagnostics.devices = audioInputs.map(device => ({
          deviceId: device.deviceId,
          label: device.label || 'Micrófono sin nombre',
          groupId: device.groupId
        }));
        
        if (audioInputs.length === 0) {
          diagnostics.errors.push('No se encontraron dispositivos de audio de entrada');
          diagnostics.recommendations.push('Conecta un micrófono o verifica que esté habilitado');
        }
        
        // Store devices in diagnostics (setAvailableDevices removed to fix unused variable warning)
      } catch (deviceError) {
        diagnostics.errors.push(`Error enumerando dispositivos: ${deviceError.message}`);
      }

      // Check permissions
      if (navigator.permissions) {
        try {
          const permissionResult = await navigator.permissions.query({ name: 'microphone' });
          diagnostics.permissionState = permissionResult.state;
          
          switch (permissionResult.state) {
            case 'denied':
              diagnostics.errors.push('Permisos de micrófono denegados explícitamente');
              diagnostics.recommendations.push('Haz clic en el ícono de candado en la barra de direcciones y permite el micrófono');
              break;
            case 'prompt':
              diagnostics.recommendations.push('Los permisos se solicitarán al intentar grabar');
              break;
            case 'granted':
              diagnostics.recommendations.push('Permisos concedidos, el micrófono debería funcionar');
              break;
          }
        } catch (permError) {
          diagnostics.errors.push(`Error verificando permisos: ${permError.message}`);
        }
      }

      // Test actual microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        diagnostics.accessTest = 'success';
        diagnostics.permissionState = 'granted';
        setMicPermission('granted');
        
        // Test audio context
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          diagnostics.audioContextSupport = audioContext.state;
          audioContext.close();
        } catch (audioError) {
          diagnostics.errors.push(`Audio Context no disponible: ${audioError.message}`);
        }
        
        // Stop test stream
        stream.getTracks().forEach(track => track.stop());
        
      } catch (accessError) {
        diagnostics.accessTest = 'failed';
        diagnostics.accessError = {
          name: accessError.name,
          message: accessError.message
        };

        switch (accessError.name) {
          case 'NotAllowedError':
            setMicPermission('denied');
            diagnostics.errors.push('Acceso al micrófono denegado por el usuario');
            diagnostics.recommendations.push('Permite el acceso al micrófono en el navegador');
            diagnostics.recommendations.push('Revisa la configuración de permisos del sitio');
            break;
          case 'NotFoundError':
            setMicPermission('denied');
            diagnostics.errors.push('No se encontró ningún dispositivo de micrófono');
            diagnostics.recommendations.push('Verifica que el micrófono esté conectado y funcionando');
            diagnostics.recommendations.push('Revisa la configuración de audio del sistema');
            break;
          case 'NotReadableError':
            diagnostics.errors.push('Micrófono en uso por otra aplicación');
            diagnostics.recommendations.push('Cierra otras aplicaciones que puedan estar usando el micrófono');
            diagnostics.recommendations.push('Reinicia el navegador e intenta nuevamente');
            break;
          case 'OverconstrainedError':
            diagnostics.errors.push('Configuración de audio no soportada');
            diagnostics.recommendations.push('El micrófono no soporta la configuración requerida');
            break;
          case 'SecurityError':
            diagnostics.errors.push('Error de seguridad al acceder al micrófono');
            diagnostics.recommendations.push('Verifica que el sitio tenga permisos de micrófono');
            break;
          default:
            diagnostics.errors.push(`Error desconocido: ${accessError.message}`);
            diagnostics.recommendations.push('Intenta recargar la página o reiniciar el navegador');
        }
      }

    } catch (error) {
      diagnostics.errors.push(`Error general en diagnóstico: ${error.message}`);
    }

    setMicDiagnostics(diagnostics);
    return diagnostics;
  };

  const checkMicrophonePermission = async () => {
    try {
      // Only check permission status without requesting access
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setMicPermission(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setMicPermission(result.state);
        });
      } else {
        // If permissions API not available, assume we need to prompt
        setMicPermission('prompt');
      }
    } catch (error) {
      console.log('Permission API not available, will check on first recording attempt');
      // Don't assume denied, just keep as prompt
      setMicPermission('prompt');
    }
  };
  
  const setupAudioAnalysis = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const microphone = audioContextRef.current.createMediaStreamSource(stream);
    
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyserRef.current);
    
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        
        if (isRecording) {
          requestAnimationFrame(updateAudioLevel);
        }
      }
    };
    
    updateAudioLevel();
  };
  
  const setupBrowserTranscription = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscriptUpdate = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0.8;
        
        if (event.results[i].isFinal) {
          finalTranscriptUpdate += transcript;
        } else {
          interimTranscript += transcript;
        }
        
        // Use confidence for quality indication
        if (confidence < 0.5) {
          console.warn('Low confidence transcription:', transcript, confidence);
        }
      }
      
      if (interimTranscript) {
        updateLiveTranscript(interimTranscript, confidence);
      }
      
      if (finalTranscriptUpdate) {
        finalizeTranscript(finalTranscriptUpdate);
        
        // Send to AI if in advanced mode
        if (isAdvancedMode && finalTranscriptUpdate.trim().length > 10) {
          sendToAI(finalTranscriptUpdate);
        }
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      logEvent('transcription_error', { error: event.error });
    };
    
    recognitionRef.current.start();
  };
  
  const sendToAI = async (transcript) => {
    if (!isAdvancedMode) return;
    
    // Add context message for AI
    addAiMessage({
      type: 'system',
      content: 'Transcripción recibida: ' + transcript,
      isInternal: true
    });
    
    // Trigger AI analysis (this would connect to your AI service)
    // For now, we'll add a mock response
    setTimeout(() => {
      addAiMessage({
        type: 'ai',
        content: `Análisis de la transcripción: Se detectan síntomas relacionados con ${getRandomMedicalSuggestion()}. ¿Deseas que profundice en algún aspecto específico?`,
        suggestions: [
          'Analizar síntomas principales',
          'Sugerir diagnósticos diferenciales',
          'Revisar antecedentes relevantes'
        ]
      });
    }, 2000);
  };
  
  const getRandomMedicalSuggestion = () => {
    const suggestions = [
      'síntomas respiratorios',
      'manifestaciones cardiovasculares',
      'signos neurológicos',
      'síntomas gastrointestinales',
      'manifestaciones dermatológicas'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };
  
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      setMicPermission('granted');
      
      // Setup audio analysis
      setupAudioAnalysis(stream);
      
      // Setup transcription
      if (transcriptionService === 'browser') {
        setupBrowserTranscription();
      }
      
      // Setup recording
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Create audio blob for potential server-side transcription
        new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      startRecording();
      setRecordingTime(0);
      
      logEvent('recording_started', { 
        service: transcriptionService,
        time: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // Handle different error types
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied');
        logEvent('microphone_error', { error: 'Permission denied by user' });
      } else if (error.name === 'NotFoundError') {
        setMicPermission('denied');
        logEvent('microphone_error', { error: 'No microphone device found' });
      } else {
        // For other errors, allow retry
        setMicPermission('prompt');
        logEvent('microphone_error', { error: error.message });
      }
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      stopRecording(recordingTime);
      setAudioLevel(0);
      
      logEvent('recording_stopped', { 
        duration: recordingTime,
        transcript_length: finalTranscript.length
      });
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getAudioLevelBars = () => {
    const bars = [];
    const normalizedLevel = Math.min(100, (audioLevel / 128) * 100);
    
    for (let i = 0; i < 5; i++) {
      const isActive = normalizedLevel > (i * 20);
      bars.push(
        <div
          key={i}
          className={`w-1 bg-current transition-all duration-150 ${
            isActive ? 'h-6' : 'h-2'
          } ${isActive && isRecording ? 'text-red-500' : 'text-gray-300'}`}
        />
      );
    }
    
    return bars;
  };
  
  return (
    <div className="transcription-area">
      {/* Header */}
      <div className="transcription-header">
        <div className="header-content">
          <div className="mic-icon" />
          <div>
            <div className="transcription-title">Transcripción en Tiempo Real</div>
            <div className="transcription-status">
              {isRecording ? `Grabando: ${formatTime(recordingTime)}` : 'Listo para grabar'}
            </div>
          </div>
        </div>
          
          {/* Audio Level Indicator */}
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-1">
                {getAudioLevelBars()}
              </div>
            )}
            <div className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`} />
          </div>
        </div>
      
      {/* Recording Controls */}
      <div className="transcription-content">
        {!isRecording ? (
          <motion.button
            onClick={handleStartRecording}
            disabled={micPermission === 'denied'}
            className="start-button disabled:bg-gray-300 disabled:cursor-not-allowed"
            whileHover={{ scale: micPermission === 'denied' ? 1 : 1.05 }}
            whileTap={{ scale: micPermission === 'denied' ? 1 : 0.95 }}
          >
            Iniciar Grabación
          </motion.button>
        ) : (
          <motion.button
            onClick={handleStopRecording}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <StopIcon className="w-5 h-5" />
            <span>Detener</span>
          </motion.button>
        )}
        {/* Permission Status */}
        {micPermission === 'denied' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-700">
                  Problema con el micrófono
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runMicrophoneDiagnostics}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Diagnosticar
                </button>
                <button
                  onClick={checkMicrophonePermission}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
            
            {micDiagnostics && (
              <div className="space-y-3 border-t border-red-200 pt-3">
                {micDiagnostics.errors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-red-800 mb-2">Problemas detectados:</h4>
                    <ul className="space-y-1">
                      {micDiagnostics.errors.map((error, index) => (
                        <li key={index} className="text-xs text-red-700 flex items-start">
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {micDiagnostics.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-blue-800 mb-2">Soluciones recomendadas:</h4>
                    <ul className="space-y-1">
                      {micDiagnostics.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs text-blue-700 flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {micDiagnostics.devices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Dispositivos detectados:</h4>
                    <ul className="space-y-1">
                      {micDiagnostics.devices.map((device, index) => (
                        <li key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {device.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    Ver detalles técnicos
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                    <pre>{JSON.stringify(micDiagnostics, null, 2)}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
        
        {micPermission === 'prompt' && !isRecording && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-blue-700">
                  Necesitamos acceso al micrófono para grabar tu consulta.
                </span>
              </div>
              <button
                onClick={async () => {
                  const diagnostics = await runMicrophoneDiagnostics();
                  if (diagnostics.accessTest !== 'success') {
                    setMicPermission('denied');
                  }
                }}
                className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Probar acceso
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4 w-full">
          {/* Final Transcript */}
          {finalTranscript && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Transcripción Final</h3>
                {confidence > 0 && (
                  <div className="flex items-center space-x-1">
                    <SignalIcon className={`w-4 h-4 ${getConfidenceColor()}`} />
                    <span className={`text-xs ${getConfidenceColor()}`}>
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {finalTranscript}
              </p>
            </div>
          )}
          
          {/* Live Transcript */}
          {liveTranscript && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                <h3 className="text-sm font-medium text-blue-700">Transcribiendo...</h3>
              </div>
              <p className="text-blue-900 leading-relaxed">
                {liveTranscript}
              </p>
            </div>
          )}
          
          {/* Empty State */}
          {!finalTranscript && !liveTranscript && !isRecording && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No hay transcripción disponible</div>
              <div className="empty-description">
                Presiona "Iniciar Grabación" para comenzar a transcribir tu consulta médica
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Servicio: {transcriptionService === 'browser' ? 'Navegador' : 'Whisper'}</span>
            {isAdvancedMode && (
              <span className="flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
                IA Activa
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {finalTranscript.length > 0 && (
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                {finalTranscript.split(' ').length} palabras
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;