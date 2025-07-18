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
import { PenTool, Keyboard, Settings, Mic } from 'lucide-react';
import {
  PermissionDialog,
  RecordingCard,
  TranscriptionResult,
  ErrorDisplay,
  ProcessingStatus,
  FloatingTranscriptPopup
} from '@/src/components/medical/conversation-capture/components';
import type { SOAPNotes } from '@/src/types/medical';
import { diarizationService, DiarizationUtils, DiarizationResult } from '@/src/domains/medical-ai/services/DiarizationService';
import AudioDenoisingDashboard from '@/src/components/medical/AudioDenoisingDashboard';
import { SOAPNotesManager } from '@/src/components/medical/SOAPNotesManager';
import { useLlmAudit } from '@/app/hooks/useLlmAudit';

// Custom hooks for better state management
import { useUIState } from './conversation-capture/hooks/useUIState';
import { useTranscriptionState } from './conversation-capture/hooks/useTranscriptionState';
import { useDiarizationState } from './conversation-capture/hooks/useDiarizationState';

interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  onSoapGenerated?: (notes: SOAPNotes) => void;
  className?: string;
}

// Constants for configuration (DRY)
const TRANSCRIPTION_CONFIG = {
  autoPreload: true,
  processingMode: 'direct' as const,
  chunkSize: 32000, // 2 segundos
  onChunkProcessed: (text: string, chunkNumber: number) => {
    console.log(`[ConversationCapture] Real transcription chunk #${chunkNumber}: ${text}`);
  }
};

const SOAP_CONFIG = {
  autoGenerate: false,
  style: 'detailed' as const,
  includeTimestamps: true,
  includeConfidence: true,
  medicalTerminology: 'mixed' as const
};

export const ConversationCapture = ({ 
  onNext, 
  onTranscriptionComplete,
  onSoapGenerated,
  className = ''
}: ConversationCaptureProps) => {  
  const { t } = useI18n();
  
  // Use custom hooks for state management (SRP)
  const uiState = useUIState();
  const transcriptionState = useTranscriptionState();
  const diarizationState = useDiarizationState();
  
  // LLM Audit hook for ChatGPT integration
  const { auditTranscript, isLoading: isAuditLoading, error: auditError, result: auditResult } = useLlmAudit();
  
  // State for popup
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  
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
  const whisperService = useSimpleWhisper(TRANSCRIPTION_CONFIG);
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
  } = whisperService;
  
  // Solo mantener WebSpeech para transcripción en tiempo real (no accede al micrófono directamente)
  const webSpeechService = useWebSpeechCapture();
  const {
    transcript: liveTranscriptData,
    isAvailable: isWebSpeechAvailable,
    error: webSpeechError,
    startRecording: startLiveTranscription,
    stopRecording: stopLiveTranscription
  } = webSpeechService;
  
  // Unified engine status
  const engineStatus = { 
    whisper: whisperEngineStatus, 
    webSpeech: isWebSpeechAvailable ? 'ready' : 'unavailable' 
  };
  
  // Variables derivadas (DRY)
  const isRecording = status === 'recording';
  const hasTranscription = !!(transcription || (uiState.isManualMode && transcriptionState.manualTranscript));
  const currentTranscript = uiState.isManualMode ? transcriptionState.manualTranscript : transcription?.text;

  

  useEffect(() => {
    if (liveTranscriptData) {
      transcriptionState.updateLiveTranscript(liveTranscriptData);
    }
  }, [liveTranscriptData, transcriptionState.updateLiveTranscript]);


  // Extract partial minute transcription logic
  const savePartialMinuteTranscription = transcriptionState.savePartialMinuteTranscription;
  
  // BAZAR: Función de diarización completamente auditable
  const processDiarization = useCallback(async () => {
    console.log('[ConversationCapture] Iniciando diarización BAZAR...');
    
    // Usar audio del useSimpleWhisper (ya denoisado)
    const completeAudio = null; // useSimpleWhisper handles audio internally
    const allMinutesText = transcriptionState.minuteTranscriptions.map(m => m.text).join(' ').trim();
    
    if (!completeAudio && !allMinutesText && !transcriptionState.webSpeechText) {
      console.warn('[ConversationCapture] No hay audio ni texto para diarizar');
      return;
    }
    
    diarizationState.setDiarizationProcessing(true);
    diarizationState.setDiarizationError(null);
    
    try {
      // 1. FUSIÓN DE TRANSCRIPCIONES - Algoritmo público
      const denoisedTranscriptionText = allMinutesText || '';
      const mergedText = DiarizationUtils.mergeTranscriptions(denoisedTranscriptionText, transcriptionState.webSpeechText);
      
      // Usar audio denoisado si está disponible
      if (completeAudio) {
        audioDataRef.current = completeAudio;
        console.log(`[ConversationCapture] Usando audio denoisado para diarización: ${completeAudio.length} samples`);
      }
      
      console.log('[ConversationCapture] Texto fusionado:', {
        denoisedLength: denoisedTranscriptionText.length,
        webSpeechLength: transcriptionState.webSpeechText.length,
        mergedLength: mergedText.length
      });
      
      // 2. OBTENER AUDIO DATA - Transparente
      if (!audioDataRef.current) {
        throw new Error('No hay datos de audio disponibles para diarización');
      }
      
      // 3. PROCESAR DIARIZACIÓN - Servicio modular
      const result = await diarizationService.diarizeAudio(audioDataRef.current);
      
      console.log('[ConversationCapture] Diarización completada:', result);
      diarizationState.setDiarizationResult(result);
      
    } catch (error) {
      console.error('[ConversationCapture] Error en diarización:', error);
      diarizationState.setDiarizationError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      diarizationState.setDiarizationProcessing(false);
    }
  }, [transcriptionState.minuteTranscriptions, transcriptionState.webSpeechText, diarizationState]);

  // Handle recording start
  const handleStartRecording = useCallback(async () => {
    console.log('[ConversationCapture] Starting real transcription with denoised audio');
    const started = await startTranscription();
    
    if (!started && error?.includes('permiso')) {
      uiState.setShowPermissionDialog(true);
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
    return started;
  }, [startTranscription, error, isWebSpeechAvailable, startLiveTranscription, webSpeechError]);
  // Handle recording stop
  const handleStopRecording = useCallback(async () => {
    stopLiveTranscription();
    
    // Save any pending chunks
    savePartialMinuteTranscription();
    
    const success = await stopTranscription();
    if (success && transcription?.text && onTranscriptionComplete) {
      onTranscriptionComplete(transcription.text);
    }
    
    // Process diarization after stopping
    await processDiarization();
    
    // BRUTAL: Audit transcript with ChatGPT
    if (transcription?.text) {
      console.log('[ConversationCapture] Iniciando auditoría con ChatGPT...');
      // Show popup when transcription is complete
      setShowTranscriptPopup(true);
      
      try {
        const llmResult = await auditTranscript({
          transcript: transcription.text,
          webSpeech: transcriptionState.webSpeechText,
          diarization: diarizationState.diarizationResult?.segments || [],
          task: 'audit-transcript'
        });
        console.log('[ConversationCapture] Auditoría ChatGPT completada:', llmResult);
        
        // Update transcription with audited result
        if (llmResult.mergedTranscript && onTranscriptionComplete) {
          onTranscriptionComplete(llmResult.mergedTranscript);
        }
      } catch (err) {
        console.error('[ConversationCapture] Error en auditoría ChatGPT:', err);
      }
    }
    
    return success;
  }, [stopLiveTranscription, savePartialMinuteTranscription, stopTranscription, 
      transcription, onTranscriptionComplete, processDiarization, auditTranscript,
      transcriptionState.webSpeechText, diarizationState.diarizationResult,
      setShowTranscriptPopup]);

  // Main toggle recording function
  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await handleStopRecording();
      } else {
        await handleStartRecording();
      }
    } catch (error) {
      console.error(t('conversation.capture.error_toggling_recording'), error);
    }
  };
  
  const handleCopy = useCallback(async () => {
    const textToCopy = uiState.isManualMode ? transcriptionState.manualTranscript : transcription?.text;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      uiState.showCopySuccessFeedback();
    }
  }, [uiState, transcriptionState.manualTranscript, transcription]);

  const handleReset = useCallback(() => {
    resetTranscription();
    transcriptionState.resetTranscriptionState();
    diarizationState.resetDiarization();
    audioDataRef.current = null;
    chunkCountRef.current = 0;
    // Clear any WebSpeech error
    if (webSpeechError) {
      console.clear();
    }
  }, [resetTranscription, transcriptionState, diarizationState, webSpeechError]);

  const toggleMode = useCallback(() => {
    uiState.toggleMode();
    if (isRecording) {
      toggleRecording();
    }
  }, [uiState, isRecording, toggleRecording]);

  // UI Rendering Methods
  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-medium mb-2">
            {t('conversation.capture.title')}
          </h1>
          <p className="text-foreground/60">
            {t('conversation.capture.subtitle')}
          </p>
        </div>
        <Button
          onClick={toggleMode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {uiState.isManualMode ? (
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
        <Badge variant={uiState.isManualMode ? 'secondary' : 'default'}>
          {uiState.isManualMode ? 'Modo Manual' : 'Modo Voz'}
        </Badge>
        
        {/* DENOISING DASHBOARD TOGGLE */}
        {!uiState.isManualMode && (
          <button
            onClick={uiState.toggleDenoisingDashboard}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
              uiState.showDenoisingDashboard 
                ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            Dashboard
          </button>
        )}
      </div>
      
      {/* DENOISING DASHBOARD - EN CONTEXTO */}
      {uiState.showDenoisingDashboard && !uiState.isManualMode && (
        <AudioDenoisingDashboard />
      )}
    </div>
  );

  const renderManualInput = () => (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Escribe la conversación manualmente:
          </label>
          <textarea
            value={transcriptionState.manualTranscript}
            onChange={(e) => transcriptionState.updateManualTranscript(e.target.value)}
            className="w-full px-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none bg-background/50 text-foreground"
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
            disabled={!transcriptionState.manualTranscript}
          >
            {uiState.copySuccess ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );


  const renderActionButtons = () => {
    if (!onNext) return null;
    
    return (
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={() => {
            if (currentTranscript && onTranscriptionComplete) {
              onTranscriptionComplete(currentTranscript);
            }
            onNext();
          }} 
          size="lg" 
          variant="default"
        >
          {t('conversation.capture.next')}
        </Button>
      </div>
    );
  };
  
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog 
        isOpen={uiState.showPermissionDialog} 
        onClose={() => uiState.setShowPermissionDialog(false)} 
      />


      {renderHeader()}

      {/* Info message when WebSpeech is not available */}
      {!isWebSpeechAvailable && !uiState.isManualMode && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-primary mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-primary/80">
              <p className="font-medium mb-1">Transcripción en tiempo real no disponible</p>
              <p className="text-primary/60">
                La transcripción final con Whisper estará disponible al detener la grabación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Interface */}
      {uiState.isManualMode ? (
        renderManualInput()
      ) : (
        <RecordingCard
          isRecording={isRecording}
          audioLevel={audioLevel}
          recordingTime={recordingTime}
          liveTranscript={transcriptionState.liveTranscript}
          status={status}
          engineStatus={engineStatus}
          transcription={transcription}
          copySuccess={uiState.copySuccess}
          onToggleRecording={toggleRecording}
          onReset={handleReset}
          onCopy={handleCopy}
        />
      )}

      {/* Live transcription progress during recording */}
      {isRecording && status === 'recording' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            Transcripción en progreso
          </h3>
          <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
            <p className="text-sm text-primary dark:text-primary/80 mb-2">
              🎙️ Grabando audio con denoising activo...
            </p>
            <div className="text-sm text-foreground/70">
              La transcripción completa estará disponible al finalizar.
            </div>
          </div>
        </div>
      )}
      
      {/* BAZAR: Show transcription IMMEDIATELY when available (including during collecting-residues) */}
      {hasTranscription && (status === 'collecting-residues' || status === 'completed') && (
        <>
          {console.log('[ConversationCapture] MOSTRANDO TRANSCRIPCIÓN:', transcription, 'Status:', status)}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">
                {status === 'collecting-residues' ? 'Transcripción parcial' : 'Transcripción completa'}
              </h3>
              {/* BAZAR: Show warning badge if there's a residue error */}
              {status === 'completed' && error && error.includes('último fragmento') && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  ⚠️ Completado con advertencia
                </Badge>
              )}
            </div>
            {uiState.isManualMode ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-foreground/90 whitespace-pre-wrap">
                    {transcriptionState.manualTranscript}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TranscriptionResult 
                transcription={transcription} 
                audioUrl={audioUrl}
                webSpeechText={transcriptionState.webSpeechText}
                diarizationResult={diarizationState.diarizationResult}
                isDiarizationProcessing={diarizationState.isDiarizationProcessing}
                diarizationError={diarizationState.diarizationError}
              />
            )}
            {/* BAZAR: Show residue warning if applicable */}
            {status === 'completed' && error && error.includes('último fragmento') && (
              <div className="mt-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SOAP Notes Manager */}
      {hasTranscription && !isRecording && (
        <SOAPNotesManager
          transcription={currentTranscript}
          onNotesGenerated={onSoapGenerated}
          config={SOAP_CONFIG}
          showActions={true}
          editable={true}
          className="mt-6"
        />
      )}

      <ErrorDisplay error={error} />

      <ProcessingStatus status={status === 'processing' || status === 'collecting-residues' ? status : null} />

      {/* Action buttons */}
      {hasTranscription && !isRecording && renderActionButtons()}

      {/* Floating Transcript Popup with LLM Results */}
      <FloatingTranscriptPopup
        isOpen={showTranscriptPopup}
        onClose={() => setShowTranscriptPopup(false)}
        transcript={transcription?.text || ''}
        llmResult={auditResult}
        isAuditLoading={isAuditLoading}
        auditError={auditError}
        onReaudit={async () => {
          if (transcription?.text) {
            await auditTranscript({
              transcript: transcription.text,
              webSpeech: transcriptionState.webSpeechText,
              diarization: diarizationState.diarizationResult?.segments || [],
              task: 'audit-transcript'
            });
          }
        }}
      />
    </div>
  );
};