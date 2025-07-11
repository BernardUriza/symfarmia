"use client";

import React from "react";
import { useTranslation } from "../../providers/I18nProvider";
import { useAudioRecorder } from "../../../hooks/useAudioRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Mic, MicOff, Volume2, ChevronRight, Activity } from "lucide-react";

export function ConversationCapture({ onNext, isRecording, setIsRecording }) {
  const { t } = useTranslation();
  const [engineError, setEngineError] = React.useState(null);
  const [transcriptionSegments, setTranscriptionSegments] = React.useState([]);
  
  const {
    isTranscribing,
    transcript,
    error: transcriptionError,
    audioLevel,
    duration,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    clearTranscript,
  } = useAudioRecorder();

  const toggleRecording = async () => {
    try {
      setEngineError(null);
      if (isRecording) {
        await stopAudioRecording();
        setIsRecording(false);
        
        // Agregar segmento completado
        if (transcript) {
          const newSegment = {
            id: Date.now(),
            speaker: "patient", // Por defecto, se puede cambiar después
            text: transcript,
            startTime: new Date(),
            confidence: 0.9
          };
          setTranscriptionSegments(prev => [...prev, newSegment]);
          clearTranscript();
        }
      } else {
        await startAudioRecording();
        setIsRecording(true);
      }
    } catch (error) {
      setEngineError(error.message || "An error occurred");
      setIsRecording(false);
    }
  };

  const clearAllTranscriptions = () => {
    setTranscriptionSegments([]);
    clearTranscript();
    setEngineError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {renderEngineError(engineError || transcriptionError, setEngineError, t)}
      {renderHeader(t)}
      {renderRecordingCard(isRecording, isTranscribing, t, audioLevel, duration, toggleRecording)}
      {renderLiveTranscription(transcriptionSegments, transcript, isRecording, isTranscribing, t, clearAllTranscriptions)}
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

function renderRecordingCard(isRecording, isTranscribing, t, audioLevel, duration, toggleRecording) {
  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {renderMicIcon(isRecording)}
          {renderRecordingStatus(isRecording, isTranscribing, t, audioLevel, duration)}
          {renderToggleButton(isRecording, isTranscribing, t, toggleRecording)}
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
        <Mic className="h-10 w-10 text-white" />
      ) : (
        <Mic className="h-10 w-10 text-slate-500 dark:text-gray-300" />
      )}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
      )}
    </div>
  );
}

function renderRecordingStatus(isRecording, isTranscribing, t, audioLevel, duration) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <Badge
        variant={isRecording ? "destructive" : "secondary"}
        className="text-sm px-3 py-1"
      >
        {isRecording
          ? t("conversation.capture.recording_active")
          : isTranscribing
          ? t("transcription.processing")
          : t("conversation.capture.ready_to_record")}
      </Badge>
      {isRecording && duration > 0 && (
        <div className="text-lg font-mono text-gray-700 dark:text-gray-300">
          {formatDuration(duration)}
        </div>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
          <Activity className="h-4 w-4" />
          <span>{t("conversation.capture.audio_level")}:</span>
          <div className="w-32 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
            />
          </div>
        </div>
      )}
      {isTranscribing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span>{t("transcription.processing")}</span>
        </div>
      )}
    </div>
  );
}

function renderToggleButton(isRecording, isTranscribing, t, toggleRecording) {
  return (
    <Button
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      onClick={toggleRecording}
      disabled={isTranscribing}
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
          {isTranscribing ? t("transcription.processing") : t("transcription.start_recording")}
        </>
      )}
    </Button>
  );
}

function renderLiveTranscription(transcriptionSegments, currentTranscript, isRecording, isTranscribing, t, clearAllTranscriptions) {
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
          {transcriptionSegments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTranscriptions}
              className="ml-2 text-xs"
            >
              {t("common.clear")}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-4 max-h-96 overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Medical conversation transcript"
        >
          {renderTranscriptionSegments(transcriptionSegments)}
          {renderCurrentTranscript(currentTranscript, isRecording)}
          {renderProcessingStatus(isTranscribing, t)}
          {renderNoTranscription(transcriptionSegments, currentTranscript, isRecording, t)}
        </div>
      </CardContent>
    </Card>
  );
}

function renderTranscriptionSegments(transcriptionSegments) {
  if (!transcriptionSegments?.length) return null;
  
  return transcriptionSegments.map((segment, index) => (
    <div
      key={segment.id}
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

function renderCurrentTranscript(currentTranscript, isRecording) {
  if (!currentTranscript || !isRecording) return null;
  
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
      <div className="flex flex-col items-center">
        <Badge variant="outline" className="text-xs mb-1 animate-pulse">
          LIVE
        </Badge>
      </div>
      <p className="flex-1 text-slate-700 dark:text-gray-300 font-medium">
        {currentTranscript}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}

function renderProcessingStatus(isTranscribing, t) {
  if (!isTranscribing) return null;
  
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
      <div className="flex flex-col items-center">
        <Badge variant="secondary" className="text-xs mb-1">
          AI
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

function renderNoTranscription(transcriptionSegments, currentTranscript, isRecording, t) {
  if ((transcriptionSegments && transcriptionSegments.length > 0) || currentTranscript || isRecording)
    return null;
    
  return (
    <div className="text-center py-8 text-gray-500">
      <Mic className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>{t("transcription.no_content_yet")}</p>
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