import React from 'react';
import { motion } from 'framer-motion';
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  SignalIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const AudioSettings = ({ settings, onSettingChange }) => {
  const audioSources = [
    { id: 'primary', label: 'Micrófono Principal', icon: '🎤', description: 'Micrófono integrado del dispositivo' },
    { id: 'bluetooth', label: 'Micrófono Bluetooth', icon: '📻', description: 'Dispositivo Bluetooth conectado' },
    { id: 'system', label: 'Audio del Sistema', icon: '🔊', description: 'Capturar audio del sistema' }
  ];

  const audioQualities = [
    { id: 'low', label: 'Baja', description: 'Menor calidad, menor uso de datos', bars: 2 },
    { id: 'medium', label: 'Media', description: 'Balance entre calidad y rendimiento', bars: 4 },
    { id: 'high', label: 'Alta', description: 'Alta calidad para consultas importantes', bars: 6 },
    { id: 'ultra', label: 'Ultra', description: 'Máxima calidad para casos críticos', bars: 8 }
  ];

  const renderQualityBars = (level) => {
    const maxBars = 8;
    const filledBars = audioQualities.find(q => q.id === level)?.bars || 0;
    
    return (
      <div className="flex space-x-1">
        {Array.from({ length: maxBars }, (_, i) => (
          <div
            key={i}
            className={`w-1 h-4 rounded-full ${
              i < filledBars 
                ? 'bg-blue-500' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSensitivityLabel = (value) => {
    if (value < 30) return 'Muy Baja';
    if (value < 50) return 'Baja';
    if (value < 70) return 'Media';
    if (value < 85) return 'Alta';
    return 'Muy Alta';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🎤 Configuración de Audio
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Optimiza la captura de audio para consultas médicas
        </p>
      </div>

      {/* Audio Source Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <MicrophoneIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Fuente de Audio</h4>
        </div>
        
        <div className="grid gap-3">
          {audioSources.map((source) => (
            <motion.button
              key={source.id}
              onClick={() => onSettingChange('audioSource', source.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                settings.audioSource === source.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{source.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {source.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {source.description}
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  settings.audioSource === source.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {settings.audioSource === source.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Audio Quality */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <SignalIcon className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Calidad de Audio</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {audioQualities.map((quality) => (
            <motion.button
              key={quality.id}
              onClick={() => onSettingChange('audioQuality', quality.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                settings.audioQuality === quality.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {quality.label}
                </div>
                {renderQualityBars(quality.id)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {quality.description}
              </div>
            </motion.button>
          ))}
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Actual: {renderQualityBars(settings.audioQuality)}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Filtros de Audio</h4>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'noiseSuppression',
              label: 'Cancelación de Ruido',
              description: 'Elimina ruidos de fondo para audio más limpio',
              icon: '🔇'
            },
            {
              key: 'echoCancellation',
              label: 'Cancelación de Eco',
              description: 'Previene retroalimentación y ecos',
              icon: '📢'
            },
            {
              key: 'medicalVoiceFilter',
              label: 'Filtro de Voz Médica',
              description: 'Optimizado para terminología médica',
              icon: '🩺'
            }
          ].map((filter) => (
            <div
              key={filter.key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{filter.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {filter.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filter.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSettingChange(filter.key, !settings[filter.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[filter.key]
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[filter.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity Slider */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-orange-600" />
          <h4 className="font-medium text-gray-900 dark:text-white">Sensibilidad del Micrófono</h4>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sensibilidad: {getSensitivityLabel(settings.sensitivity)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings.sensitivity}%
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sensitivity}
            onChange={(e) => onSettingChange('sensitivity', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Menos sensible</span>
            <span>Más sensible</span>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Recomendación:</strong> 70-80% para consultorios normales, 80-90% para ambientes ruidosos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;