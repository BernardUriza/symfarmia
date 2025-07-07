/**
 * Demo Transcription Panel - MAGIA PURA
 * Animación perfecta sin audio real, todo simulado
 */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  StopIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BeakerIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "../../../app/providers/I18nProvider";
import { useDemoTranscription } from "../../../hooks/useDemoTranscription";
import { useRouter } from 'next/navigation';

const DemoTranscriptionPanel = ({ strategy = "general_medicine" }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    isRecording,
    demoText,
    currentAnalysis,
    recommendations,
    recordingTime,
    confidence,
    isAnalyzing,
    selectedSpecialty,
    showSpecialtyConfirmation,
    consultationGenerated,
    startDemoRecording,
    stopDemoRecording,
    resetDemo,
    selectSpecialty,
    confirmSpecialtyAndGenerate,
    strategyName,
    availableSpecialties,
    availableStrategies,
  } = useDemoTranscription(strategy);

  const [currentStrategy] = useState(strategy);
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const strategyRef = useRef(null);

  // Evitar hydration errors - solo renderizar después de mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    // Store cleanup function reference
    const cleanup = () => {
      // Clear any pending state updates
      setIsDropdownOpen(false);
      setIsStrategyOpen(false);
    };
    
    return () => {
      // Force cleanup on unmount
      cleanup();
      resetDemo();
    };
  }, [resetDemo]);

  // Reset on strategy change to prevent cross-contamination
  useEffect(() => {
    // Only reset if strategy actually changed
    if (currentStrategy !== strategy) {
      resetDemo();
    }
  }, [currentStrategy, strategy, resetDemo]);

  // Consolidated click outside handler to prevent memory leaks
  useEffect(() => {
    // Create stable references to avoid stale closures
    const handleClickOutside = (event) => {
      // Handle specialty confirmation
      if (
        showSpecialtyConfirmation &&
        !event.target.closest(".specialty-confirmation-container")
      ) {
        // Don't close automatically - require explicit action
      }
      
      // Handle dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      // Handle strategy dropdown
      if (strategyRef.current && !strategyRef.current.contains(event.target)) {
        setIsStrategyOpen(false);
      }
    };

    // Only add listener if any dropdown is open
    const shouldAddListener = showSpecialtyConfirmation || isDropdownOpen || isStrategyOpen;
    
    if (shouldAddListener) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function always removes the listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpecialtyConfirmation, isDropdownOpen, isStrategyOpen]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.8) return "text-blue-600";
    return "text-yellow-600";
  };

  const getAudioLevelBars = () => {
    if (!isRecording) return null;

    const bars = [];
    for (let i = 0; i < 5; i++) {
      // Animación simulada de niveles de audio - SOLO CLIENT SIDE
      const height =
        typeof window !== "undefined" && Math.random() > 0.5 ? "h-6" : "h-2";
      bars.push(
        <motion.div
          key={i}
          className={`w-1 bg-red-500 transition-all duration-300 ${height}`}
          animate={{
            height: isRecording ? [8, 24, 16, 20, 12] : 8,
          }}
          transition={{
            duration: 0.5,
            repeat: isRecording ? Infinity : 0,
            delay: i * 0.1,
          }}
        />,
      );
    }
    return bars;
  };

  const extractSubjective = (text) => text;
  const extractObjective = (analysis) => analysis.join(' ');
  const extractAssessment = (recs) => recs.join(' ');
  const extractPlan = (recs) => recs.join(' ');

  const handleGenerateReport = () => {
    const reportData = {
      title: `Consulta ${strategyName} - ${new Date().toLocaleDateString()}`,
      reportType: 'consultation',
      clinicalFindings: demoText,
      soapNotes: {
        subjective: extractSubjective(demoText),
        objective: extractObjective(currentAnalysis),
        assessment: extractAssessment(recommendations),
        plan: extractPlan(recommendations),
      },
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('prefillReportData', JSON.stringify(reportData));
    }
    router.push('/reportes-medicos/nuevo');
  };

  if (!isClient) {
    // Render simple durante SSR para evitar hydration errors
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="text-center text-gray-500">
            {t("transcription.title") || "Transcripción en Tiempo Real"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              🎤
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {t("transcription.title")}
              </div>
              <div className="text-sm text-gray-500">Demo: {strategyName}</div>
            </div>
          </div>

          {/* Audio Level Animation */}
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-1">
                {getAudioLevelBars()}
              </div>
            )}
            <motion.div
              className={`w-3 h-3 rounded-full ${
                isRecording ? "bg-red-500" : "bg-gray-300"
              }`}
              animate={{
                scale: isRecording ? [1, 1.2, 1] : 1,
                opacity: isRecording ? [1, 0.7, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isRecording ? Infinity : 0,
              }}
            />
            {isRecording && (
              <span className="text-sm font-medium text-red-600">
                {formatTime(recordingTime)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ultra Compact Specialty Selector */}
      {!selectedSpecialty && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Especialidad:
              </span>
            </div>

            {/* Ultra Compact Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center justify-between w-64 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-gray-600 truncate">
                  Seleccionar especialidad...
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ml-2 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Compact Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto"
                  >
                    {Object.entries(availableSpecialties).map(
                      ([key, specialty]) => (
                        <motion.button
                          key={key}
                          onClick={() => {
                            selectSpecialty(key);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors border-b border-gray-100 last:border-b-0"
                          whileHover={{ backgroundColor: "#f9fafb" }}
                        >
                          <div className="text-lg">{specialty.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {specialty.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {specialty.description}
                            </div>
                          </div>
                        </motion.button>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Confirmation */}
      {showSpecialtyConfirmation && selectedSpecialty && (
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 specialty-confirmation-container">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-900 mb-2">
              ❓ ¿Qué tipo de consulta vamos a inventar?
            </div>

            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-sm mb-4">
              <div className="text-3xl">
                {availableSpecialties[selectedSpecialty]?.icon}
              </div>
              <div className="text-left">
                <div className="font-bold text-green-900">
                  {availableSpecialties[selectedSpecialty]?.name}
                </div>
                <div className="text-sm text-green-700">
                  {availableSpecialties[selectedSpecialty]?.description}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <motion.button
                onClick={confirmSpecialtyAndGenerate}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Sí, Inventar Esta Consulta</span>
              </motion.button>

              <motion.button
                onClick={resetDemo}
                className="inline-flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Cambiar</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Selected Specialty Display with Strategy Selector */}
      {selectedSpecialty && !showSpecialtyConfirmation && (
        <div className="px-6 py-2 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <BeakerIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {availableSpecialties[selectedSpecialty]?.icon}{" "}
                  {availableSpecialties[selectedSpecialty]?.name}
                </span>
              </div>

              {/* Strategy Selector */}
              <div className="relative" ref={strategyRef}>
                <motion.button
                  onClick={() => setIsStrategyOpen(!isStrategyOpen)}
                  className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{availableSpecialties[currentStrategy]?.icon}</span>
                  <span className="max-w-[120px] truncate">
                    {availableSpecialties[currentStrategy]?.name}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {isStrategyOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50 max-h-[300px] overflow-y-auto md:w-72 w-[280px]"
                    >
                      <div className="py-2">
                        {availableStrategies.map((key) => {
                          const item = availableSpecialties[key];
                          const selected = key === currentStrategy;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                window.location.href =
                                  window.location.pathname + `?strategy=${key}`;
                                setIsStrategyOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2 hover:bg-gray-50"
                            >
                              <span className="text-lg mr-3">{item.icon}</span>
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              {selected && (
                                <CheckIcon className="w-4 h-4 ml-auto text-blue-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isStrategyOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStrategyOpen(false)}
                  />
                )}
              </div>
            </div>

            <button
              onClick={resetDemo}
              className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="p-6">
        <div className="text-center mb-6">
          {!isRecording ? (
            <div className="flex items-center justify-center gap-3">
              {/* Start Recording Button - Only show after consultation generated or no specialty selected */}
              {(consultationGenerated || !selectedSpecialty) && (
                <motion.button
                  onClick={startDemoRecording}
                  disabled={!selectedSpecialty}
                  className={`inline-flex items-center space-x-2 font-semibold py-3 px-6 rounded-lg transition-colors shadow-md ${
                    selectedSpecialty
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={{ scale: selectedSpecialty ? 1.05 : 1 }}
                  whileTap={{ scale: selectedSpecialty ? 0.95 : 1 }}
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>
                    {consultationGenerated
                      ? "Continuar Grabando"
                      : selectedSpecialty
                        ? t("transcription.start_recording")
                        : "Selecciona Especialidad Primero"}
                  </span>
                </motion.button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <motion.button
                onClick={stopDemoRecording}
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <StopIcon className="w-5 h-5" />
                <span>{t("transcription.stop_recording")}</span>
              </motion.button>

              <div className="text-sm text-gray-600">
                <motion.span
                  className="inline-flex items-center"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔴 Simulando consulta de{" "}
                  {availableSpecialties[selectedSpecialty]?.name}...
                </motion.span>
              </div>
            </div>
          )}
        </div>

        {/* Demo Reset */}
        {(demoText || currentAnalysis.length > 0) && !isRecording && (
          <div className="text-center mb-4">
            <button
              onClick={resetDemo}
              className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>{t("transcription.reset_demo")}</span>
            </button>
          </div>
        )}

        {/* Transcribed Text */}
        <AnimatePresence>
          {demoText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {t("transcription.final_transcript")}
                  </h3>
                  {confidence > 0 && (
                    <div className="flex items-center space-x-1">
                      <SparklesIcon
                        className={`w-4 h-4 ${getConfidenceColor()}`}
                      />
                      <span className={`text-xs ${getConfidenceColor()}`}>
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <motion.p
                  className="text-gray-900 leading-relaxed whitespace-pre-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {demoText}
                  {isRecording && <span className="typing-cursor" />}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis */}
        <AnimatePresence>
          {(isAnalyzing || currentAnalysis.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center mb-2">
                  {isAnalyzing && (
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full mr-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  <h3 className="text-sm font-medium text-purple-700">
                    🧠 Análisis IA Médica
                  </h3>
                </div>

                <div className="space-y-2">
                  {currentAnalysis.map((analysis, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="text-sm text-purple-800 flex items-start"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {analysis}
                    </motion.div>
                  ))}

                  {isAnalyzing && (
                    <motion.div
                      className="text-sm text-purple-600 italic"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Analizando datos clínicos...
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-green-700">
                    📋 Recomendaciones Clínicas
                  </h3>
                </div>

                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="text-sm text-green-800 flex items-start"
                    >
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Empty State */}
        {!demoText && !isRecording && !selectedSpecialty && (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎩</div>
            <div className="font-medium text-gray-900 mb-1">
              Inventar Consulta Médica
            </div>
            <div className="text-gray-500 text-sm">
              Selecciona una especialidad arriba para comenzar
            </div>
          </div>
        )}

        {/* Compact Waiting for Generation State */}
        {selectedSpecialty &&
          !consultationGenerated &&
          !isRecording &&
          !demoText && (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✨</div>
              <div className="font-medium text-gray-900 mb-1">
                {availableSpecialties[selectedSpecialty]?.name} Seleccionada
              </div>
              <div className="text-gray-500 text-sm">
                Confirma arriba para generar la consulta automáticamente
              </div>
            </div>
          )}

        {demoText && (
          <div className="text-center mb-6">
            <button
              onClick={handleGenerateReport}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              📄 {t('generate_medical_report')}
            </button>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{t("transcription.service_label")}: Demo Simulado</span>
            <span className="flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
              {t("transcription.medical_ai_active")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {selectedSpecialty && (
              <span className="flex items-center text-xs">
                <span className="mr-1">
                  {availableSpecialties[selectedSpecialty]?.icon}
                </span>
                {availableSpecialties[selectedSpecialty]?.name}
              </span>
            )}
            {demoText && (
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                {demoText.split(" ").length} {t("transcription.words_count")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTranscriptionPanel;
