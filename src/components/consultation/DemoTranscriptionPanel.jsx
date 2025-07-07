/**
 * Demo Transcription Panel - MAGIA PURA
 * Animación perfecta sin audio real, todo simulado
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  StopIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BeakerIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "../../../app/providers/I18nProvider";
import { useDemoTranscription } from "../../../hooks/useDemoTranscription";

const DemoTranscriptionPanel = ({ strategy = "general_medicine" }) => {
  const { t } = useTranslation();
  const {
    isRecording,
    demoText,
    currentAnalysis,
    recommendations,
    recordingTime,
    confidence,
    isAnalyzing,
    startDemoRecording,
    stopDemoRecording,
    resetDemo,
    strategyName,
    availableStrategies,
  } = useDemoTranscription(strategy);

  const [currentStrategy, setCurrentStrategy] = useState(strategy);
  const [isClient, setIsClient] = useState(false);
  const [showStrategyMenu, setShowStrategyMenu] = useState(false);

  // Strategy menu data with icons and descriptions
  const strategyMenuData = {
    general_medicine: {
      icon: '🩺',
      name: 'Medicina General',
      description: 'Consulta médica estándar con síntomas comunes',
      color: 'bg-blue-500'
    },
    hiv_pregnancy_adolescent: {
      icon: '🤰',
      name: 'VIH + Embarazo Adolescente',
      description: 'Caso especial de población vulnerable crítica',
      color: 'bg-red-500'
    },
    quality_of_life: {
      icon: '💙',
      name: 'Calidad de Vida',
      description: 'Enfoque holístico en bienestar del paciente',
      color: 'bg-cyan-500'
    },
    cardiology: {
      icon: '❤️',
      name: 'Cardiología',
      description: 'Especialidad cardiovascular con énfasis en diagnóstico',
      color: 'bg-rose-500'
    },
    pediatrics: {
      icon: '👶',
      name: 'Pediatría',
      description: 'Atención médica especializada en menores',
      color: 'bg-pink-500'
    }
  };

  // Evitar hydration errors - solo renderizar después de mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Limpiar intervalos y timeouts al desmontar para evitar fugas de memoria
  useEffect(() => {
    return () => {
      resetDemo();
    };
  }, [resetDemo]);

  // Close strategy menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStrategyMenu && !event.target.closest('.strategy-menu-container')) {
        setShowStrategyMenu(false);
      }
    };

    if (showStrategyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStrategyMenu]);

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


      {/* Human-Readable Strategy Display */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <BeakerIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">
                {currentStrategy === 'general_medicine' && '🩺 Medicina General'}
                {currentStrategy === 'hiv_pregnancy_adolescent' && '🤰 VIH + Embarazo Adolescente'}
                {currentStrategy === 'quality_of_life' && '💙 Calidad de Vida'}
                {currentStrategy === 'cardiology' && '❤️ Cardiología'}
                {currentStrategy === 'pediatrics' && '👶 Pediatría'}
              </span>
            </div>
            <div className="text-xs text-purple-600 mt-2">
              {currentStrategy === 'general_medicine' && 'Consulta médica estándar con síntomas comunes'}
              {currentStrategy === 'hiv_pregnancy_adolescent' && 'Caso especial de población vulnerable crítica'}
              {currentStrategy === 'quality_of_life' && 'Enfoque holístico en bienestar del paciente'}
              {currentStrategy === 'cardiology' && 'Especialidad cardiovascular con énfasis en diagnóstico'}
              {currentStrategy === 'pediatrics' && 'Atención médica especializada en menores'}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-6">
        <div className="text-center mb-6">
          {!isRecording ? (
            <div className="flex items-center justify-center gap-3">
              <motion.button
                onClick={startDemoRecording}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayIcon className="w-5 h-5" />
                <span>
                  {t("transcription.start_recording")}
                </span>
              </motion.button>
              
              {/* InventarConsulta Button - Same height and padding as StartRecording */}
              <div className="relative strategy-menu-container">
                <motion.button
                  onClick={() => setShowStrategyMenu(!showStrategyMenu)}
                  className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Inventar consulta médica simulada"
                >
                  <BeakerIcon className="w-5 h-5" />
                  <span>{t("inventar_consulta") || "Inventar Consulta"}</span>
                </motion.button>

                {/* Strategy Selection Menu */}
                <AnimatePresence>
                  {showStrategyMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          🎭 Estrategias de Simulación
                        </h3>
                        <p className="text-sm text-gray-600">
                          Selecciona el tipo de consulta a simular
                        </p>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {availableStrategies.map((strat) => {
                          const stratData = strategyMenuData[strat];
                          const isSelected = currentStrategy === strat;
                          
                          return (
                            <motion.button
                              key={strat}
                              onClick={() => {
                                setCurrentStrategy(strat);
                                resetDemo();
                                setShowStrategyMenu(false);
                              }}
                              className={`w-full p-4 text-left hover:bg-purple-50 transition-colors border-l-4 ${
                                isSelected 
                                  ? 'bg-purple-50 border-purple-500' 
                                  : 'border-transparent hover:border-purple-300'
                              }`}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 rounded-lg ${stratData?.color || 'bg-gray-500'} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                                  {stratData?.icon || '🔬'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                                    {stratData?.name || strat.replace(/_/g, ' ')}
                                  </div>
                                  <div className={`text-sm mt-1 ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                                    {stratData?.description || 'Simulación médica personalizada'}
                                  </div>
                                  {isSelected && (
                                    <div className="mt-2 text-xs text-purple-600 font-medium">
                                      ✓ Actualmente seleccionada
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={() => setShowStrategyMenu(false)}
                          className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cerrar menú
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  🔴 Grabando consulta demo...
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

        {/* Empty State */}
        {!demoText && !isRecording && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎭</div>
            <div className="font-medium text-gray-900 mb-2">
              {t("transcription.demo_heading")}
            </div>
            <div className="text-gray-500 text-sm">
              {t("transcription.demo_instructions")}
            </div>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {t("transcription.service_label")}: Demo Simulado
            </span>
            <span className="flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1 text-purple-500" />
              {t("transcription.medical_ai_active")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {demoText && (
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                {demoText.split(" ").length}{" "}
                {t("transcription.words_count")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTranscriptionPanel;
