import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  DocumentTextIcon,
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
  const [micPermission, setMicPermission] = useState('prompt'); // 'granted' | 'denied' | 'prompt'
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptionService] = useState('browser'); // 'browser' | 'whisper'
  
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
  
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(result.state);
      
      result.addEventListener('change', () => {
        setMicPermission(result.state);
      });
    } catch (error) {
      console.log('Permission API not supported');
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
      setMicPermission('denied');
      logEvent('microphone_error', { error: error.message });
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <MicrophoneIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transcripción en Tiempo Real</h2>
              <p className="text-sm text-gray-600">
                {isRecording ? `Grabando: ${formatTime(recordingTime)}` : 'Listo para grabar'}
              </p>
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
      </div>
      
      {/* Recording Controls */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <motion.button
              onClick={handleStartRecording}
              disabled={micPermission === 'denied'}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="w-5 h-5" />
              <span>Iniciar Grabación</span>
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
        </div>
        
        {/* Permission Status */}
        {micPermission === 'denied' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                Acceso al micrófono denegado. Por favor, habilita los permisos en tu navegador.
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Transcription Display */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
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
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No hay transcripción disponible
              </h3>
              <p className="text-gray-400">
                Presiona "Iniciar Grabación" para comenzar a transcribir tu consulta médica
              </p>
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