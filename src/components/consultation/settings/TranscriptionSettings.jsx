import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BoltIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const TranscriptionSettings = ({ settings, onSettingChange }) => {
  const languages = [
    { 
      id: 'es-MX', 
      label: '🇲🇽 Español (México) - Médico', 
      description: 'Optimizado para terminología médica mexicana',
      medical: true,
      recommended: true
    },
    { 
      id: 'es-ES', 
      label: '🇪🇸 Español (España)', 
      description: 'Español peninsular estándar',
      medical: false,
      recommended: false
    },
    { 
      id: 'en-US', 
      label: '🇺🇸 English (US)', 
      description: 'Para consultas internacionales',
      medical: false,
      recommended: false
    }
  ];

  const transcriptionServices = [
    {
      id: 'browser',
      label: 'Navegador Web',
      description: 'Rápido y gratuito',
      icon: '🌐',
      pros: ['Gratuito', 'Rápido', 'Sin límites'],
      cons: ['Menos preciso']
    },
    {
      id: 'whisper',
      label: 'Whisper AI',
      description: 'Máxima precisión médica',
      icon: '🎯',
      pros: ['Muy preciso', 'Terminología médica', 'Offline'],
      cons: ['Más lento']
    },
    {
      id: 'medical-ai',
      label: 'IA Médica Especializada',
      description: 'Específico para consultas',
      icon: '🩺',
      pros: ['Terminología especializada', 'Contexto médico', 'Tiempo real'],
      cons: ['Requiere suscripción']
    }
  ];

  const getConfidenceColor = (threshold) => {
    if (threshold >= 90) return 'text-red-600';
    if (threshold >= 80) return 'text-yellow-600';
    if (threshold >= 70) return 'text-green-600';
    return 'text-blue-600';
  };

  const getConfidenceLabel = (threshold) => {
    if (threshold >= 90) return 'Muy Estricto (puede fallar)';
    if (threshold >= 80) return 'Estricto (recomendado)';
    if (threshold >= 70) return 'Balanceado (óptimo)';
    return 'Permisivo (más texto)';
  };

  const getConfidenceDescription = (threshold) => {
    if (threshold >= 90) return 'Solo acepta transcripciones casi perfectas';
    if (threshold >= 80) return 'Balance entre calidad y fluidez';
    if (threshold >= 70) return 'Acepta transcripciones buenas con pequeños errores';
    return 'Acepta la mayoría de transcripciones';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📝 Configuración de Transcripción
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Idioma, precisión y configuraciones avanzadas de texto
        </p>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <GlobeAltIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Idioma y Región</h4>
        </div>
        
        <div className="space-y-3">
          {languages.map((language) => (
            <motion.button
              key={language.id}
              onClick={() => onSettingChange('language', language.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                settings.language === language.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {language.label}
                    </span>
                    {language.recommended && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Recomendado
                      </span>
                    )}
                    {language.medical && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Médico
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language.description}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  settings.language === language.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {settings.language === language.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <ChartBarIcon className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Umbral de Confianza</h4>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${getConfidenceColor(settings.confidenceThreshold)}`}>
              {getConfidenceLabel(settings.confidenceThreshold)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.confidenceThreshold}%
            </span>
          </div>
          
          <input
            type="range"
            min="50"
            max="95"
            value={settings.confidenceThreshold}
            onChange={(e) => onSettingChange('confidenceThreshold', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>50% (Permisivo)</span>
            <span>75% (Óptimo)</span>
            <span>95% (Estricto)</span>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              📊 {getConfidenceDescription(settings.confidenceThreshold)}
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Service */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <BoltIcon className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Servicio de Transcripción</h4>
        </div>

        <div className="grid gap-4">
          {transcriptionServices.map((service) => (
            <motion.button
              key={service.id}
              onClick={() => onSettingChange('transcriptionService', service.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                settings.transcriptionService === service.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {service.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {service.description}
                    </div>
                    <div className="flex space-x-4 text-xs">
                      <div>
                        <div className="text-green-700 dark:text-green-400 font-medium mb-1">Ventajas:</div>
                        {service.pros.map((pro, i) => (
                          <div key={i} className="text-green-600 dark:text-green-400">✓ {pro}</div>
                        ))}
                      </div>
                      <div>
                        <div className="text-orange-700 dark:text-orange-400 font-medium mb-1">Limitaciones:</div>
                        {service.cons.map((con, i) => (
                          <div key={i} className="text-orange-600 dark:text-orange-400">• {con}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  settings.transcriptionService === service.id
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {settings.transcriptionService === service.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Real-time Mode */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <BoltIcon className="w-5 h-5 text-orange-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Modo de Transcripción</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => onSettingChange('realtimeMode', true)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              settings.realtimeMode
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-gray-900 dark:text-white">
                Tiempo Real
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Transcripción instantánea mientras hablas
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onSettingChange('realtimeMode', false)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              !settings.realtimeMode
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium text-gray-900 dark:text-white">
                Por Lotes
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Procesa después de cada pausa
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Medical Terminology */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpenIcon className="w-5 h-5 text-indigo-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Terminología Médica</h4>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'medicalTerminology',
              label: 'Diccionario Médico Expandido',
              description: 'Reconoce términos médicos especializados',
              icon: '📚'
            },
            {
              key: 'clinicalAbbreviations',
              label: 'Abreviaciones Clínicas',
              description: 'Entiende abreviaciones como "HTA", "DM", "ECG"',
              icon: '🔤'
            },
            {
              key: 'drugNames',
              label: 'Nombres de Medicamentos',
              description: 'Base de datos de fármacos y principios activos',
              icon: '💊'
            }
          ].map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {feature.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSettingChange(feature.key, !settings[feature.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[feature.key]
                    ? 'bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[feature.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionSettings;