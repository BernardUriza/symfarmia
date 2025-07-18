"use client";
import './conversation-capture/styles.css';

// **React core**
import React, { useState, useEffect, useRef, useCallback } from "react";

// **Hooks**
import { useSimpleWhisperHybrid } from "@/src/domains/medical-ai/hooks/useSimpleWhisperHybrid";
import { useWebSpeechCapture } from "@/src/domains/medical-ai/hooks/useWebSpeechCapture";
import { useI18n } from "@/src/domains/core/hooks/useI18n";
import { useLlmAudit } from "@/app/hooks/useLlmAudit";
import { useUIState } from "./conversation-capture/hooks/useUIState";
import { useTranscriptionState } from "./conversation-capture/hooks/useTranscriptionState";
import { useDiarizationState } from "./conversation-capture/hooks/useDiarizationState";

// **UI Components**
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  PenTool, Settings, Mic
} from "lucide-react";

// **Custom Components**
import {
  PermissionDialog, RecordingCard, TranscriptionResult, ErrorDisplay, ProcessingStatus, FloatingTranscriptPopup
} from "@/src/components/medical/conversation-capture/components";
import { WhisperDiagnosticTool } from "@/src/domains/medical-ai/components/WhisperDiagnosticTool";
import { AudioDenoisingDashboard } from "@/src/components/medical/AudioDenoisingDashboard";
import { SOAPNotesManager } from "@/src/components/medical/SOAPNotesManager";

// **Types**
import type { SOAPNotes } from "@/src/types/medical";

// **Services**
import { diarizationService, DiarizationUtils } from "@/src/domains/medical-ai/services/DiarizationService";

// **CONFIG**
const TRANSCRIPTION_CONFIG = {
  autoPreload: true,
  preferWorker: true,
  retryCount: 3,
  retryDelay: 1000
};
const SOAP_CONFIG = {
  autoGenerate: false,
  style: "detailed",
  includeTimestamps: true,
  includeConfidence: true,
  medicalTerminology: "mixed",
};

// **Props**
interface ConversationCaptureProps {
  onNext?: () => void;
  onTranscriptionComplete?: (transcript: string) => void;
  onSoapGenerated?: (notes: SOAPNotes) => void;
  className?: string;
}

// **Main Component**
export const ConversationCapture = ({
  onNext,
  onTranscriptionComplete,
  onSoapGenerated,
  className = ""
}: ConversationCaptureProps) => {
  // **Translation + Language**
  const { t, locale: currentLanguage } = useI18n();

  // **State hooks**
  const uiState = useUIState();
  const transcriptionState = useTranscriptionState();
  const diarizationState = useDiarizationState();

  // **Audit hook**
  const { auditTranscript, isLoading: isAuditLoading, error: auditError, result: auditResult } = useLlmAudit();

  // **Other state**
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  const chunkCountRef = useRef(0);
  const audioDataRef = useRef<Float32Array>(new Float32Array());

  // **Model Debug**
  useEffect(() => {
    if (typeof window !== "undefined") {
      const g = window as any;
      console.log("[ConversationCapture] Model cache:", {
        whisperWorker: !!g.__WHISPER_WORKER_INSTANCE__,
        whisperModelLoaded: !!g.__WHISPER_MODEL_LOADED__,
        whisperPreloadState: !!g.__WHISPER_PRELOAD_STATE__,
        whisperModelCache: !!g.__WHISPER_MODEL_CACHE__,
      });
    }
  }, []);

  // **Whisper + WebSpeech**
  const whisperService = useSimpleWhisperHybrid(TRANSCRIPTION_CONFIG);
  const {
    transcription,
    status,
    error,
    engineStatus: whisperEngineStatus,
    audioLevel: _audioLevelRaw,
    recordingTime: _recordingTimeRaw,
    audioUrl,
    audioBlob,
    getCompleteAudio,
    startTranscription,
    stopTranscription,
    resetTranscription
  } = whisperService;
  // Evitar valores NaN o undefined
  const audioLevel = _audioLevelRaw ?? 0;
  const recordingTime = _recordingTimeRaw || 0;

  const webSpeechService = useWebSpeechCapture();
  const {
    transcript: liveTranscriptData, isAvailable: isWebSpeechAvailable, error: webSpeechError,
    startRecording: startLiveTranscription, stopRecording: stopLiveTranscription,
    restartCount: webSpeechRestartCount, lastRestartTime: webSpeechLastRestart,
    isListening, confidence, language, setLanguage, partialTranscripts
  } = webSpeechService;

  // **Unified Status**
  const engineStatus = {
    whisper: whisperEngineStatus,
    webSpeech: isWebSpeechAvailable ? "ready" : "unavailable"
  };

  // **Derivatives**
  const isRecording = status === "recording";
  const hasTranscription = !!(transcription || (uiState.isManualMode && transcriptionState.manualTranscript));
  const currentTranscript = uiState.isManualMode ? transcriptionState.manualTranscript : transcription?.text;

  // **Sync hooks**
  useEffect(() => {
    if (liveTranscriptData) transcriptionState.updateLiveTranscript(liveTranscriptData);
  }, [liveTranscriptData, transcriptionState]);

  useEffect(() => {
    if (currentLanguage && setLanguage) {
      const webSpeechLang = currentLanguage === "es" ? "es-MX" : "en-US";
      if (language !== webSpeechLang) {
        setLanguage(webSpeechLang);
        console.log(`[ConversationCapture] Web Speech set: ${webSpeechLang}`);
      }
    }
  }, [currentLanguage, language, setLanguage]);

  // **Diarization logic**
  const processDiarization = useCallback(async () => {
    const completeAudio = getCompleteAudio();
    const allMinutesText = transcriptionState.minuteTranscriptions.map(m => m.text).join(" ").trim();
    if (!completeAudio && !audioBlob && !allMinutesText && !transcriptionState.webSpeechText) {
      console.warn("[ConversationCapture] No audio/text for diarization");
      return;
    }
    diarizationState.setDiarizationProcessing(true);
    diarizationState.setDiarizationError(null);
    console.log("[ConversationCapture] About to process diarization...");
    try {
      const denoisedTranscriptionText = allMinutesText || "";
      const mergedText = DiarizationUtils.mergeTranscriptions(denoisedTranscriptionText, transcriptionState.webSpeechText);
      if (completeAudio) {
        audioDataRef.current = completeAudio;
      }
      const audioData = audioDataRef.current;
      if (!audioData || audioData.length === 0) {
        throw new Error("No audio for diarization");
      }
      const result = await diarizationService.diarizeAudio(audioData);
      diarizationState.setDiarizationResult(result);
    } catch (err) {
      diarizationState.setDiarizationError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      diarizationState.setDiarizationProcessing(false);
    }
  }, [
    transcriptionState.minuteTranscriptions, transcriptionState.webSpeechText,
    diarizationState, audioBlob, getCompleteAudio
  ]);

  // **Handlers**
  const handleStartRecording = useCallback(async () => {
    const started = await startTranscription();
    if (!started && error?.includes("permiso")) {
      uiState.setShowPermissionDialog(true);
    } else if (started && isWebSpeechAvailable) {
      await startLiveTranscription();
    }
    return started;
  }, [startTranscription, error, isWebSpeechAvailable, startLiveTranscription, uiState]);

  const handleStopRecording = useCallback(async () => {
    stopLiveTranscription();
    transcriptionState.savePartialMinuteTranscription();
    const success = await stopTranscription();
    if (success && transcription?.text) {
      await processDiarization();
      setShowTranscriptPopup(true);
      try {
        const llmResult = await auditTranscript({
          transcript: transcription.text,
          webSpeech: transcriptionState.webSpeechText,
          diarization: diarizationState.diarizationResult?.segments.map(seg => ({
            start: seg.startTime, end: seg.endTime, speaker: seg.speaker
          })) || [],
          partialTranscripts, confidence, language, task: "audit-transcript"
        });
        const finalText = llmResult.mergedTranscript || transcription.text;
        if (onTranscriptionComplete) onTranscriptionComplete(finalText);
      } catch (err) {
        if (onTranscriptionComplete) onTranscriptionComplete(transcription.text);
      }
    }
    return success;
  }, [
    stopLiveTranscription, transcriptionState, stopTranscription, transcription, onTranscriptionComplete,
    processDiarization, auditTranscript, diarizationState.diarizationResult, partialTranscripts, confidence, language
  ]);

  const toggleRecording = useCallback(async () => {
    try {
      isRecording ? await handleStopRecording() : await handleStartRecording();
    } catch (err) {
      console.error(t("conversation.capture.error_toggling_recording"), err);
    }
  }, [isRecording, handleStopRecording, handleStartRecording, t]);

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
    audioDataRef.current = new Float32Array();
    chunkCountRef.current = 0;
  }, [resetTranscription, transcriptionState, diarizationState]);

  const toggleMode = useCallback(async () => {
    if (isRecording) await toggleRecording();
    uiState.toggleMode();
  }, [uiState, isRecording, toggleRecording]);

  // **Render blocks**
  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-medium mb-2">{t("conversation.capture.title")}</h1>
          <p className="text-foreground/60">{t("conversation.capture.subtitle")}</p>
        </div>
        <Button onClick={toggleMode} variant="outline" size="sm" className="flex items-center gap-2">
          {uiState.isManualMode ? (
            <>
              <Mic className="w-4 h-4" />
              {t("conversation.capture.actions.change_to_voice")}
            </>
          ) : (
            <>
              <PenTool className="w-4 h-4" />
              {t("conversation.capture.actions.manual_mode")}
            </>
          )}
        </Button>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <Badge className="" variant={uiState.isManualMode ? "secondary" : "default"}>
          {uiState.isManualMode
            ? t("conversation.capture.mode.manual")
            : t("conversation.capture.mode.voice")}
        </Badge>
        {!uiState.isManualMode && (
          <div className="flex items-center gap-2">
            {isWebSpeechAvailable && (
              <button
                onClick={() => setLanguage(language === "es-MX" ? "en-US" : "es-MX")}
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-secondary/10 text-secondary hover:bg-secondary/20"
                title={t("conversation.capture.toggle_language_title")}
              >
                <span className="text-xs">{language === "es-MX" ? "🇪🇸" : "🇺🇸"}</span>
                <span>{language === "es-MX" ? "ES" : "EN"}</span>
              </button>
            )}
            <button
              onClick={uiState.toggleDenoisingDashboard}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
                uiState.showDenoisingDashboard ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <Settings className="w-4 h-4" /> {t("conversation.capture.actions.dashboard")}
            </button>
          </div>
        )}
      </div>
      {uiState.showDenoisingDashboard && !uiState.isManualMode && <AudioDenoisingDashboard />}
    </div>
  );

  const renderManualInput = () => (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            {t("conversation.capture.form.manual_input_label")}
          </label>
          <textarea
            value={transcriptionState.manualTranscript}
            onChange={e => transcriptionState.updateManualTranscript(e.target.value)}
            className="w-full px-4 py-3 border border-border/50 rounded-lg resize-none bg-background/50 text-foreground"
            rows={8}
            placeholder={t("conversation.capture.form.placeholder")}
            autoFocus
          />
        </div>
        <p className="text-sm">{t("conversation.capture.form.hint")}</p>
        <div className="flex justify-end space-x-2">
          <Button className="" onClick={handleReset} variant="outline" size="sm">
            {t("conversation.capture.form.buttons.clear")}
          </Button>
          <Button className="" onClick={handleCopy} variant="outline" size="sm" disabled={!transcriptionState.manualTranscript}>
            {uiState.copySuccess
              ? t("conversation.capture.form.buttons.copied")
              : t("conversation.capture.form.buttons.copy")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionButtons = () => !onNext ? null : (
    <div className="mt-6 flex justify-center">
      <Button className="" onClick={() => {
        if (currentTranscript && onTranscriptionComplete) onTranscriptionComplete(currentTranscript);
        onNext();
      }} size="lg" variant="default">
        {t("conversation.capture.next")}
      </Button>
    </div>
  );

  // **MAIN RENDER**
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className} fade-in`}>
      <PermissionDialog isOpen={uiState.showPermissionDialog} onClose={() => uiState.setShowPermissionDialog(false)} />
      {renderHeader()}
      <WhisperDiagnosticTool />
      {!isWebSpeechAvailable && !uiState.isManualMode && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-primary mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-primary/80">
              <p className="font-medium mb-1">
                {t("conversation.capture.realtime_unavailable.title")}
              </p>
              <p className="text-primary/60">
                {t("conversation.capture.realtime_unavailable.description")}
              </p>
            </div>
          </div>
        </div>
      )}
      {uiState.isManualMode
        ? renderManualInput()
        : (
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
        )
      }
      {/* Add additional blocks (TranscriptionResult, SOAPNotesManager, etc) as per original */}
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
      <ProcessingStatus status={status === "processing" || status === "collecting-residues" ? status : null} />
      {hasTranscription && !isRecording && renderActionButtons()}
      <FloatingTranscriptPopup
        isOpen={showTranscriptPopup}
        onClose={() => setShowTranscriptPopup(false)}
        transcript={transcription?.text || ""}
        llmResult={auditResult}
        isAuditLoading={isAuditLoading}
        auditError={auditError}
        onReaudit={async () => {
          if (transcription?.text) {
            await auditTranscript({
              transcript: transcription.text,
              webSpeech: transcriptionState.webSpeechText,
              diarization: diarizationState.diarizationResult?.segments.map(seg => ({
                start: seg.startTime, end: seg.endTime, speaker: seg.speaker
              })) || [],
              partialTranscripts,
              confidence,
              language,
              task: "audit-transcript"
            });
          }
        }}
      />
    </div>
  );
};
