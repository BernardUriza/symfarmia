import React from "react";
import { motion } from "framer-motion";
import {
  StopIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useNativeSpeechTranscription as useTranscription } from "@/domains/medical-ai";
import { useTranslation } from "../../../app/providers/I18nProvider";
import { useAppMode } from "../../../app/providers/AppModeProvider";
import DemoTranscriptionPanel from "./DemoTranscriptionPanel";

const TranscriptionPanel = () => {
  const { isDemoMode } = useAppMode();
  const { t } = useTranslation();
  
  // Always call hooks before any conditional returns
  const {
    isRecording,
    liveTranscript,
    finalTranscript,
    confidence,
    recordingTime,
    audioLevel,
    transcriptionService,
    micPermission,
    micDiagnostics,
    handleStartRecording,
    handleStopRecording,
    checkMicrophonePermission,
    runMicrophoneDiagnostics,
    isAdvancedMode,
  } = useTranscription();
  
  // DEMO MODE: Render magical animated demo panel
  if (isDemoMode) {
    return <DemoTranscriptionPanel strategy="general_medicine" />;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getAudioLevelBars = () => {
    const bars = [];
    const normalizedLevel = Math.min(100, (audioLevel / 128) * 100);

    for (let i = 0; i < 5; i++) {
      const isActive = normalizedLevel > i * 20;
      bars.push(
        <div
          key={i}
          className={`w-1 bg-current transition-all duration-150 ${
            isActive ? "h-6" : "h-2"
          } ${isActive && isRecording ? "text-red-500" : "text-gray-300"}`}
        />,
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
            <div className="transcription-title">
              {t("transcription.title")}
            </div>
            <div className="transcription-status">
              {isRecording
                ? `${t("transcription.recording")}: ${formatTime(recordingTime)}`
                : t("transcription.ready_to_record")}
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
          <div
            className={`w-3 h-3 rounded-full ${
              isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"
            }`}
          />
        </div>
      </div>

      {/* Recording Controls */}
      <div className="transcription-content">
        {!isRecording ? (
          <motion.button
            onClick={handleStartRecording}
            disabled={micPermission === "denied"}
            className="start-button disabled:bg-gray-300 disabled:cursor-not-allowed"
            whileHover={{ scale: micPermission === "denied" ? 1 : 1.05 }}
            whileTap={{ scale: micPermission === "denied" ? 1 : 0.95 }}
          >
            {t("transcription.start_recording")}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleStopRecording}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <StopIcon className="w-5 h-5" />
            <span>{t("transcription.stop_recording")}</span>
          </motion.button>
        )}
        {/* Permission Status */}
        {micPermission === "denied" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-700">
                  {t("microphone.status.problem_with_microphone")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runMicrophoneDiagnostics}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  {t("microphone.actions.diagnose")}
                </button>
                <button
                  onClick={checkMicrophonePermission}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                >
                  {t("microphone.actions.retry")}
                </button>
              </div>
            </div>

            {micDiagnostics && (
              <div className="space-y-3 border-t border-red-200 pt-3">
                {micDiagnostics.errors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-red-800 mb-2">
                      {t("microphone.status.problems_detected")}
                    </h4>
                    <ul className="space-y-1">
                      {micDiagnostics.errors.map((error, index) => (
                        <li
                          key={index}
                          className="text-xs text-red-700 flex items-start"
                        >
                          <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {micDiagnostics.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-blue-800 mb-2">
                      {t("microphone.status.recommended_solutions")}
                    </h4>
                    <ul className="space-y-1">
                      {micDiagnostics.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-xs text-blue-700 flex items-start"
                        >
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {micDiagnostics.devices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      {t("microphone.status.detected_devices")}
                    </h4>
                    <ul className="space-y-1">
                      {micDiagnostics.devices.map((device, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          {device.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    {t("microphone.status.technical_details")}
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                    <pre>{JSON.stringify(micDiagnostics, null, 2)}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {micPermission === "prompt" && !isRecording && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-blue-700">
                  {t("microphone.status.need_access")}
                </span>
              </div>
              <button
                onClick={() => {
                  runMicrophoneDiagnostics();
                }}
                className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                {t("microphone.actions.test_access")}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4 w-full">
          {/* Final Transcript */}
          {finalTranscript && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {t("transcription.final_transcript")}
                </h3>
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
                <h3 className="text-sm font-medium text-blue-700">
                  {t("transcription.transcribing")}
                </h3>
              </div>
              <p className="text-blue-900 leading-relaxed">{liveTranscript}</p>
            </div>
          )}

          {/* Empty State */}
          {!finalTranscript && !liveTranscript && !isRecording && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">
                {isDemoMode
                  ? t("transcription.demo_empty_state")
                  : t("transcription.no_transcript_available")}
              </div>
              <div className="empty-description">
                {t("transcription.no_transcript_description")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {t("transcription.service_label")}:{" "}
              {transcriptionService === "browser"
                ? t("transcription.service_browser")
                : t("transcription.service_whisper")}
            </span>
            {isAdvancedMode && (
              <span className="flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
                {t("transcription.ai_active")}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {finalTranscript.length > 0 && (
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                {finalTranscript.split(" ").length}{" "}
                {t("transcription.words_count")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;
