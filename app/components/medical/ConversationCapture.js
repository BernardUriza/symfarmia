"use client";

import React from "react";
import { useTranslation } from "../../providers/I18nProvider";
import { useMicrophoneLevel } from "../../../hooks/useMicrophoneLevel";
import { useSingletonTranscription } from "../../../src/domains/medical-ai/hooks/useSingletonTranscription";
import { TranscriptionStatus } from "../../../src/domains/medical-ai/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Mic, MicOff, Volume2, ChevronRight, Activity } from "lucide-react";

export function ConversationCapture({ onNext, isRecording, setIsRecording }) {
  const { t } = useTranslation();
  const [engineError, setEngineError] = React.useState(null)
  const {
    transcription,
    status,
    startTranscription,
    stopTranscription,
    error: transcriptionError,
    engineStatus,
  } = useSingletonTranscription({ realTimeUpdates: true });
  const audioLevel = useMicrophoneLevel(isRecording);

  const toggleRecording = async () => {
    try {
      setEngineError(null);
      if (isRecording) {
        await stopTranscription();
        setIsRecording(false);
      } else {
        const started = await startTranscription();
        if (started) {
          setIsRecording(true);
        } else {
          setEngineError(transcriptionError || 'Failed to start transcription');
        }
      }
    } catch (error) {
      setEngineError(error.message || "An error occurred");
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {renderEngineError(engineError, setEngineError, t)}
      {renderEngineStatus(engineStatus, t)}
      {renderHeader(t)}
      {renderRecordingCard(isRecording, t, audioLevel, toggleRecording)}
      {renderLiveTranscription(transcription, status, isRecording, t)}
      {renderNavigation(onNext, t)}
    </div>
  );
}

function renderEngineError(engineError, setEngineError, t) {
  if (!engineError) return null;
  return (
    <div
      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">{t("common.error")}: </strong>
      <span className="block sm:inline">{engineError}</span>
      <button
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={() => setEngineError(null)}
      >
        <span className="text-2xl">&times;</span>
      </button>
    </div>
  );
}

function renderEngineStatus(engineStatus, t) {
  if (!engineStatus || engineStatus === "ready") return null;
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
      <span className="text-sm">
        {t("transcription.engine_status")}: {engineStatus}
        {engineStatus === "fallback" &&
          ` - ${t("transcription.using_fallback")}`}
      </span>
    </div>
  );
}

function renderHeader(t) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
        {t("conversation.capture.title")}
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        {t("conversation.capture.subtitle")}
      </p>
    </div>
  );
}

function renderRecordingCard(isRecording, t, audioLevel, toggleRecording) {
  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {renderMicIcon(isRecording)}
          {renderRecordingStatus(isRecording, t, audioLevel)}
          {renderToggleButton(isRecording, t, toggleRecording)}
        </div>
      </CardContent>
    </Card>
  );
}

function renderMicIcon(isRecording) {
  return (
    <div
      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
        isRecording
          ? "bg-red-500 shadow-lg shadow-red-200 animate-pulse"
          : "bg-slate-200 dark:bg-gray-700"
      }`}
    >
      {isRecording ? (
        <MicOff className="h-10 w-10 text-white" />
      ) : (
        <Mic className="h-10 w-10 text-slate-500 dark:text-gray-300" />
      )}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
      )}
    </div>
  );
}

function renderRecordingStatus(isRecording, t, audioLevel) {
  return (
    <div className="space-y-2">
      <Badge
        variant={isRecording ? "destructive" : "secondary"}
        className="text-sm px-3 py-1"
      >
        {isRecording
          ? t("conversation.capture.recording_active")
          : t("conversation.capture.ready_to_record")}
      </Badge>
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
          <Activity className="h-4 w-4" />
          <span>{t("conversation.capture.audio_level")}:</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function renderToggleButton(isRecording, t, toggleRecording) {
  return (
    <Button
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      onClick={toggleRecording}
      className="px-8"
      aria-label={
        isRecording
          ? t("transcription.stop_recording")
          : t("transcription.start_recording")
      }
    >
      {isRecording ? (
        <>
          <MicOff className="h-5 w-5 mr-2" />
          {t("transcription.stop_recording")}
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          {t("transcription.start_recording")}
        </>
      )}
    </Button>
  );
}

function renderLiveTranscription(transcription, status, isRecording, t) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {t("conversation.capture.live_transcription")}
          {isRecording && (
            <Badge
              variant="destructive"
              className="animate-pulse text-blue-600"
            >
              LIVE
            </Badge>
          )}
          <Badge variant="outline" className="ml-auto">
            {t("conversation.capture.powered_by_ai")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-4 max-h-96 overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Medical conversation transcript"
        >
          {renderTranscriptionSegments(transcription)}
          {renderTranscriptionStatus(status, t)}
          {renderNoTranscription(transcription, isRecording, t)}
          {renderInitializingStatus(status, t)}
        </div>
      </CardContent>
    </Card>
  );
}

function renderTranscriptionSegments(transcription) {
  if (!transcription?.segments?.length) return null;
  return transcription.segments.map((segment, index) => (
    <div
      key={index}
      className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-gray-700 shadow-sm border-2 border-gray-200 dark:border-gray-600 leading-relaxed"
      role="article"
      aria-labelledby={`speaker-${index}`}
    >
      <div className="flex flex-col items-center">
        <Badge
          variant={segment.speaker === "doctor" ? "default" : "secondary"}
          className="text-xs mb-1 font-semibold"
          id={`speaker-${index}`}
        >
          {segment.speaker}
        </Badge>
        <span
          className="text-xs text-slate-500 dark:text-gray-400"
          aria-label={`Time: ${new Date(segment.startTime).toLocaleTimeString("es-ES")}`}
        >
          {new Date(segment.startTime).toLocaleTimeString("es-ES")}
        </span>
      </div>
      <p
        className="flex-1 text-slate-700 dark:text-gray-300 font-medium"
        aria-label={`${segment.speaker} says: ${segment.text}`}
      >
        {segment.text}
      </p>
    </div>
  ));
}

function renderTranscriptionStatus(status, t) {
  if (status !== TranscriptionStatus.PROCESSING) return null;
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
      <div className="flex flex-col items-center">
        <Badge variant="secondary" className="text-xs mb-1">
          {t("conversation.speakers.ai_medical")}
        </Badge>
        <span className="text-xs text-slate-500 dark:text-gray-400">
          {t("conversation.processing.processing_status")}
        </span>
      </div>
      <p className="flex-1 text-slate-700 dark:text-gray-300">
        {t("conversation.processing.ai_processing")}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}

function renderNoTranscription(transcription, isRecording, t) {
  if ((transcription && transcription.segments.length > 0) || isRecording)
    return null;
  return (
    <div className="text-center py-8 text-gray-500">
      <Mic className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>{t("transcription.no_content_yet")}</p>
    </div>
  );
}

function renderInitializingStatus(status, t) {
  if (status !== TranscriptionStatus.INITIALIZING) return null;
  return (
    <div className="text-center py-4 text-blue-600">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-sm">{t("transcription.initializing")}</p>
    </div>
  );
}

function renderNavigation(onNext, t) {
  return (
    <div className="flex justify-between items-center pt-4">
      <div />
      <Button
        onClick={onNext}
        className="flex items-center gap-2"
        aria-label={t("conversation.capture.review_dialog_flow")}
      >
        {t("conversation.capture.review_dialog_flow")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
