'use client';
import './conversation-capture/styles.css';

import React, { useState, useEffect, useRef } from 'react';
import { useSimpleWhisper } from '@/src/domains/medical-ai/hooks/useSimpleWhisper';
import { useRealAudioCapture } from '@/src/domains/medical-ai/hooks/legacy/useRealAudioCapture';
import { extractMedicalTermsFromText } from '@/src/domains/medical-ai/utils/medicalTerms';
import { Button } from '@/src/components/ui/button';
import { useI18n } from '@/src/domains/core/hooks/useI18n';
import {
  PermissionDialog,
  RecordingCard,
  TranscriptionResult,
  ErrorDisplay,
  ProcessingStatus
} from '@/src/components/medical/conversation-capture/components';

interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  className?: string;
}

export const ConversationCapture = ({ 
  onNext, 
  onTranscriptionComplete,
  className = ''
}: ConversationCaptureProps) => {  
  const { t } = useI18n();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [minuteTranscriptions, setMinuteTranscriptions] = useState<Array<{
    id: string;
    text: string;
    timestamp: number;
    confidence: number;
    medicalTerms: string[];
    processingTime: number;
    minuteNumber: number;
  }>>([]); // Lista de transcripciones por minuto
  const [currentChunkTexts, setCurrentChunkTexts] = useState<string[]>([]); // Chunks del minuto actual
  const chunkCountRef = useRef(0);
  
  // Log model status before using the hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ConversationCapture] Global cache status:', {
        whisperWorker: !!global.__WHISPER_WORKER_INSTANCE__,
        whisperModelLoaded: !!global.__WHISPER_MODEL_LOADED__,
        whisperPreloadState: !!global.__WHISPER_PRELOAD_STATE__,
        whisperModelCache: !!global.__WHISPER_MODEL_CACHE__
      });
    }
  }, []);
  
  const {
    transcription,
    status,
    isRecording,
    error,
    engineStatus,
    audioLevel,
    recordingTime,
    audioUrl,
    startTranscription,
    stopTranscription,
    resetTranscription,
    preloadStatus, // eslint-disable-line @typescript-eslint/no-unused-vars
    preloadProgress, // eslint-disable-line @typescript-eslint/no-unused-vars
    isPreloaded // eslint-disable-line @typescript-eslint/no-unused-vars
  } = useSimpleWhisper({ 
    autoPreload: false,
    processingMode: 'streaming', // CAMBIADO A STREAMING para usar el pipeline arreglado
    showPreloadStatus: true,
    onChunkProcessed: (text, chunkNumber) => {
      console.log(`[ConversationCapture] Chunk ${chunkNumber} recibido: "${text}"`);
      
      // Agregar el texto del chunk actual
      setCurrentChunkTexts(prev => {
        const updatedChunks = [...prev, text];
        
        // Cada 6 chunks (1 minuto), crear una nueva transcripción
        if (updatedChunks.length === 6) {
          const minuteNumber = Math.ceil(chunkNumber / 6);
          const minuteText = updatedChunks.join(' ').trim();
          const medicalTerms = extractMedicalTermsFromText(minuteText).map(t => t.term);
          
          const newMinuteTranscription = {
            id: `minute_${minuteNumber}`,
            text: minuteText,
            timestamp: Date.now(),
            confidence: 0.95,
            medicalTerms,
            processingTime: 0,
            minuteNumber
          };
          
          console.log(`[ConversationCapture] Minuto ${minuteNumber} completado con ${updatedChunks.length} chunks:`, newMinuteTranscription);
          setMinuteTranscriptions(prev => [...prev, newMinuteTranscription]);
          
          // Resetear para el siguiente minuto
          return [];
        }
        
        return updatedChunks;
      });
    }
  });
  
  console.log('[ConversationCapture] useSimpleWhisper called successfully');

  const {
    transcript: liveTranscriptData,
    isAvailable: isWebSpeechAvailable,
    error: webSpeechError,
    startRecording: startLiveTranscription,
    stopRecording: stopLiveTranscription
  } = useRealAudioCapture();

  useEffect(() => {
    if (liveTranscriptData) {
      setLiveTranscript(liveTranscriptData);
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
        
        await stopTranscription();
        
        // Combinar todas las transcripciones por minuto para el callback
        const allMinutesText = minuteTranscriptions
          .map(m => m.text)
          .join(' ')
          .trim();
          
        if (allMinutesText && onTranscriptionComplete) {
          onTranscriptionComplete(allMinutesText);
        }
      } else {
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
  
  const handleCopy = async () => {
    if (transcription?.text) {
      await navigator.clipboard.writeText(transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleReset = () => {
    resetTranscription();
    setLiveTranscript('');
    setMinuteTranscriptions([]);
    setCurrentChunkTexts([]);
    chunkCountRef.current = 0;
    // Clear any WebSpeech error
    if (webSpeechError) {
      console.clear();
    }
  };
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog 
        isOpen={showPermissionDialog} 
        onClose={() => setShowPermissionDialog(false)} 
      />


      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
          {t('conversation.capture.title')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          {t('conversation.capture.subtitle')}
        </p>
      </div>

      {/* Info message when WebSpeech is not available */}
      {!isWebSpeechAvailable && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Transcripción en tiempo real no disponible</p>
              <p className="text-blue-700 dark:text-blue-300">
                La transcripción final con Whisper estará disponible al detener la grabación.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Mostrar transcripciones por minuto mientras graba */}
      {(minuteTranscriptions.length > 0 || (currentChunkTexts.length > 0 && isRecording)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Transcripciones por minuto
          </h3>
          
          {/* Transcripciones completas por minuto */}
          {minuteTranscriptions.map((minuteTranscription) => (
            <div key={minuteTranscription.id} className="relative">
              <div className="absolute -left-12 top-4 text-sm text-gray-500 dark:text-gray-400">
                {minuteTranscription.minuteNumber}′
              </div>
              <TranscriptionResult 
                transcription={minuteTranscription} 
                audioUrl={null} // Por ahora sin audio individual por minuto
              />
            </div>
          ))}
          
          {/* Chunks actuales (minuto en progreso) */}
          {currentChunkTexts.length > 0 && isRecording && (
            <div className="relative opacity-75">
              <div className="absolute -left-12 top-4 text-sm text-gray-500 dark:text-gray-400">
                {minuteTranscriptions.length + 1}′
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Minuto en progreso ({currentChunkTexts.length}/6 chunks)
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {currentChunkTexts.join(' ')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar transcripción final cuando termine */}
      {transcription && !isRecording && (
        <>
          {console.log('[ConversationCapture] MOSTRANDO TRANSCRIPCIÓN FINAL:', transcription)}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Transcripción completa
            </h3>
            <TranscriptionResult 
              transcription={transcription} 
              audioUrl={audioUrl} 
            />
          </div>
        </>
      )}

      <ErrorDisplay error={error} />

      <ProcessingStatus isProcessing={status === 'processing'} />

      {onNext && (transcription || minuteTranscriptions.length > 0) && (
        <div className="mt-6 flex justify-center">
          <Button onClick={onNext} size="lg" variant="default" className="">
            {t('conversation.capture.next')}
          </Button>
        </div>
      )}
    </div>
  );
};