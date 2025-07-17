'use client';
import './conversation-capture/styles.css';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useWebSpeechCapture } from '@/src/domains/medical-ai/hooks/useWebSpeechCapture';
import { extractMedicalTermsFromText } from '@/src/domains/medical-ai/utils/medicalTerms';
import { Button } from '@/src/components/ui/button';
import { useI18n } from '@/src/domains/core/hooks/useI18n';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { medicalAIService } from '@/src/domains/medical-ai/services/medicalAIService';
import { PenTool, Keyboard, Settings } from 'lucide-react';
import {
  PermissionDialog,
  RecordingCard,
  TranscriptionResult,
  ErrorDisplay,
  ProcessingStatus
} from '@/src/components/medical/conversation-capture/components';
import type { SOAPNotes } from '@/src/domains/medical-ai/types';
import { diarizationService, DiarizationUtils, DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';
import AudioDenoisingDashboard from '@/src/components/medical/AudioDenoisingDashboard';

interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  onSoapGenerated?: (notes: SOAPNotes) => void;
  className?: string;
}

export const ConversationCapture = ({ 
  onNext, 
  onTranscriptionComplete,
  onSoapGenerated,
  className = ''
}: ConversationCaptureProps) => {  
  const { t } = useI18n();
  
  // UI States
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showDenoisingDashboard, setShowDenoisingDashboard] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Transcription States
  const [liveTranscript, setLiveTranscript] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [webSpeechText, setWebSpeechText] = useState('');
  const [minuteTranscriptions, setMinuteTranscriptions] = useState<Array<{
    id: string;
    text: string;
    timestamp: number;
    confidence: number;
    medicalTerms: string[];
    processingTime: number;
    minuteNumber: number;
  }>>([]);
  const [currentChunkTexts, setCurrentChunkTexts] = useState<string[]>([]);
  
  // SOAP Notes States
  const [soapNotes, setSoapNotes] = useState<SOAPNotes | null>(null);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  
  // Diarization States
  const [diarizationResult, setDiarizationResult] = useState<DiarizationResult | null>(null);
  const [isDiarizationProcessing, setIsDiarizationProcessing] = useState(false);
  const [diarizationError, setDiarizationError] = useState<string | null>(null);
  
  // Refs
  const chunkCountRef = useRef(0);
  const audioDataRef = useRef<Float32Array | null>(null);
  
  // Log model status before using the hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ConversationCapture] Global cache status:', {
        whisperWorker: !!(window as any).__WHISPER_WORKER_INSTANCE__,
        whisperModelLoaded: !!(window as any).__WHISPER_MODEL_LOADED__,
        whisperPreloadState: !!(window as any).__WHISPER_PRELOAD_STATE__,
        whisperModelCache: !!(window as any).__WHISPER_MODEL_CACHE__
      });
    }
  }, []);
  
  // BRUTAL BAZAR: Real transcription via useSimpleWhisper (already denoised)
  const {
    transcription,
    status,
    error,
    engineStatus: whisperEngineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = useSimpleWhisper({
    autoPreload: true,
    processingMode: 'direct',
    chunkSize: 32000, // 2 segundos
    onChunkProcessed: (text, chunkNumber) => {
      console.log(`[ConversationCapture] Real transcription chunk #${chunkNumber}: ${text}`);
    }
  });
  
  // Unified engine status
  const engineStatus = { 
    whisper: whisperEngineStatus, 
    webSpeech: isWebSpeechAvailable ? 'ready' : 'unavailable' 
  };
  
  // Solo mantener WebSpeech para transcripción en tiempo real (no accede al micrófono directamente)
  const {
    transcript: liveTranscriptData,
    isAvailable: isWebSpeechAvailable,
    error: webSpeechError,
    startRecording: startLiveTranscription,
    stopRecording: stopLiveTranscription
  } = useWebSpeechCapture();
  
  // Variables derivadas
  const isRecording = status === 'recording';

  

  useEffect(() => {
    if (liveTranscriptData) {
      setLiveTranscript(liveTranscriptData);
      // Almacenar el texto de Web Speech completo
      setWebSpeechText(liveTranscriptData);
    }
  }, [liveTranscriptData]);


  const toggleRecording = async () => {
    try {
      if (isRecording) {
        stopLiveTranscription();
        
        // Si hay chunks pendientes, agregarlos como último minuto parcial
        if (currentChunkTexts.length > 0) {
          const minuteNumber = minuteTranscriptions.length + 1;
          const minuteText = currentChunkTexts.join(' ').trim();
          const medicalTerms = extractMedicalTermsFromText(minuteText).map(t => t.term);
          
          const partialMinute = {
            id: `minute_${minuteNumber}_partial`,
            text: minuteText,
            timestamp: Date.now(),
            confidence: 0.95,
            medicalTerms,
            processingTime: 0,
            minuteNumber
          };
          
          setMinuteTranscriptions(prev => [...prev, partialMinute]);
          setCurrentChunkTexts([]); // Limpiar chunks actuales
        }
        
        const success = await stopTranscription();
        if (success && transcription?.text && onTranscriptionComplete) {
          onTranscriptionComplete(transcription.text);
        }
        
        
        // BAZAR: Procesar diarización después de detener grabación
        await processDiarization();
      } else {
        // START - Real transcription with useSimpleWhisper (already denoised)
        console.log('[ConversationCapture] Starting real transcription with denoised audio');
        const started = await startTranscription();
        
        if (!started && error?.includes('permiso')) {
          setShowPermissionDialog(true);
        } else if (started) {
          // Only start live transcription if WebSpeech is available
          if (isWebSpeechAvailable) {
            const liveStarted = await startLiveTranscription();
            if (!liveStarted && webSpeechError) {
              console.warn('Live transcription not available:', webSpeechError);
            }
          } else {
            console.info('WebSpeech not available, using Whisper only');
          }
        }
      }
    } catch (error) {
      console.error(t('conversation.capture.error_toggling_recording'), error);
    }
  };
  
  // BAZAR: Función de diarización completamente auditable
  const processDiarization = async () => {
    console.log('[ConversationCapture] Iniciando diarización BAZAR...');
    
    // Usar audio del useSimpleWhisper (ya denoisado)
    const completeAudio = null; // useSimpleWhisper handles audio internally
    const allMinutesText = minuteTranscriptions.map(m => m.text).join(' ').trim();
    
    if (!completeAudio && !allMinutesText && !webSpeechText) {
      console.warn('[ConversationCapture] No hay audio ni texto para diarizar');
      return;
    }
    
    setIsDiarizationProcessing(true);
    setDiarizationError(null);
    
    try {
      // 1. FUSIÓN DE TRANSCRIPCIONES - Algoritmo público
      const denoisedTranscriptionText = allMinutesText || '';
      const mergedText = DiarizationUtils.mergeTranscriptions(denoisedTranscriptionText, webSpeechText);
      
      // Usar audio denoisado si está disponible
      if (completeAudio) {
        audioDataRef.current = completeAudio;
        console.log(`[ConversationCapture] Usando audio denoisado para diarización: ${completeAudio.length} samples`);
      }
      
      console.log('[ConversationCapture] Texto fusionado:', {
        denoisedLength: denoisedTranscriptionText.length,
        webSpeechLength: webSpeechText.length,
        mergedLength: mergedText.length
      });
      
      // 2. OBTENER AUDIO DATA - Transparente
      if (!audioDataRef.current) {
        throw new Error('No hay datos de audio disponibles para diarización');
      }
      
      // 3. PROCESAR DIARIZACIÓN - Servicio modular
      const result = await diarizationService.diarizeAudio(audioDataRef.current);
      
      console.log('[ConversationCapture] Diarización completada:', result);
      setDiarizationResult(result);
      
    } catch (error) {
      console.error('[ConversationCapture] Error en diarización:', error);
      setDiarizationError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsDiarizationProcessing(false);
    }
  };
  
  const generateSOAPNotes = async () => {
    const textToProcess = isManualMode ? manualTranscript : transcription?.text;
    
    if (!textToProcess) return;
    
    setIsGeneratingSOAP(true);
    try {
      const notes = await medicalAIService.generateSOAPNotes(textToProcess);
      setSoapNotes(notes);
      if (onSoapGenerated) {
        onSoapGenerated(notes);
      }
      return notes;
    } catch (error) {
      console.error('Error generating SOAP notes:', error);
    } finally {
      setIsGeneratingSOAP(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = isManualMode ? manualTranscript : transcription?.text;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleReset = () => {
    resetTranscription();
    setLiveTranscript('');
    setMinuteTranscriptions([]);
    setCurrentChunkTexts([]);
    setWebSpeechText(''); // Limpiar texto de Web Speech
    setDiarizationResult(null); // Limpiar resultado de diarización
    setDiarizationError(null); // Limpiar errores de diarización
    audioDataRef.current = null; // Limpiar referencia de audio
    chunkCountRef.current = 0;
    setManualTranscript('');
    setSoapNotes(null);
    // Clear any WebSpeech error
    if (webSpeechError) {
      console.clear();
    }
  };

  const toggleMode = () => {
    setIsManualMode(!isManualMode);
    if (isRecording) {
      toggleRecording();
    }
  };
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog 
        isOpen={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)} 
      />


      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-medium mb-2">
              {t('conversation.capture.title')}
            </h1>
            <p className="text-gray">
              {t('conversation.capture.subtitle')}
            </p>
          </div>
          <Button
            onClick={toggleMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isManualMode ? (
              <>
                <Mic className="w-4 h-4" />
                Cambiar a voz
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                Modo manual
              </>
            )}
          </Button>
        </div>
        
        {/* Mode Indicator & Denoising Controls - BAZAR MODE */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant={isManualMode ? 'secondary' : 'default'}>
            {isManualMode ? 'Modo Manual' : 'Modo Voz'}
          </Badge>
          
          {/* DENOISING DASHBOARD TOGGLE */}
          {!isManualMode && (
            <button
              onClick={() => setShowDenoisingDashboard(!showDenoisingDashboard)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                showDenoisingDashboard 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </button>
          )}
        </div>
        
        {/* DENOISING DASHBOARD - EN CONTEXTO */}
        {showDenoisingDashboard && !isManualMode && (
          <AudioDenoisingDashboard />
        )}
      </div>

      {/* Info message when WebSpeech is not available */}
      {!isWebSpeechAvailable && !isManualMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600  mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 ">
              <p className="font-medium mb-1">Transcripción en tiempo real no disponible</p>
              <p className="text-blue-700 ">
                La transcripción final con Whisper estará disponible al detener la grabación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Interface */}
      {isManualMode ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escribe la conversación manualmente:
              </label>
              <textarea
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={8}
                placeholder="Escribe o pega la transcripción de la conversación médica aquí..."
                autoFocus
              />
            </div>
            <p className="text-sm">
              Puedes escribir directamente o pegar texto desde otra fuente.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                Limpiar
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                disabled={!manualTranscript}
              >
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <RecordingCard
          isRecording={isRecording}
          audioLevel={audioLevel}
          recordingTime={recordingTime}
          liveTranscript={liveTranscript}
          status={status}
          engineStatus={engineStatus}
          transcription={transcription}
          copySuccess={copySuccess}
          onToggleRecording={toggleRecording}
          onReset={handleReset}
          onCopy={handleCopy}
        />
      )}

      {/* Live transcription progress during recording */}
      {isRecording && status === 'recording' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Transcripción en progreso
          </h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              🎙️ Grabando audio con denoising activo...
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              La transcripción completa estará disponible al finalizar.
            </div>
          </div>
        </div>
      )}
      
      {/* Mostrar transcripción final cuando termine */}
      {(transcription || (isManualMode && manualTranscript)) && !isRecording && (
        <>
          {console.log('[ConversationCapture] MOSTRANDO TRANSCRIPCIÓN FINAL:', transcription)}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Transcripción completa
            </h3>
            {isManualMode ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {manualTranscript}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TranscriptionResult 
                transcription={transcription} 
                audioUrl={audioUrl}
                webSpeechText={webSpeechText}
                diarizationResult={diarizationResult}
                isDiarizationProcessing={isDiarizationProcessing}
                diarizationError={diarizationError}
              />
            )}
          </div>
        </>
      )}

      {/* SOAP Notes Display */}
      {soapNotes && (
        <Card className="mt-4">
          <CardContent className="space-y-3 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Notas SOAP</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Subjetivo:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{soapNotes.subjective}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Objetivo:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{soapNotes.objective}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Evaluación:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{soapNotes.assessment}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Plan:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{soapNotes.plan}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ErrorDisplay error={error} />

      <ProcessingStatus isProcessing={status === 'processing'} />

      {/* Action buttons */}
      {((transcription || (isManualMode && manualTranscript)) && !isRecording) && (
        <div className="mt-6 flex justify-center gap-3">
          {!soapNotes && (
            <Button 
              onClick={generateSOAPNotes} 
              variant="outline"
              disabled={isGeneratingSOAP}
            >
              {isGeneratingSOAP ? 'Generando...' : 'Generar Notas SOAP'}
            </Button>
          )}
          {onNext && (
            <Button 
              onClick={() => {
                const finalTranscript = isManualMode ? manualTranscript : transcription?.text;
                if (finalTranscript && onTranscriptionComplete) {
                  onTranscriptionComplete(finalTranscript);
                }
                onNext();
              }} 
              size="lg" 
              variant="default"
            >
              {t('conversation.capture.next')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};