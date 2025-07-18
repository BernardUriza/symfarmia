import React from 'react';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  SunIcon,
  ExclamationTriangleIcon,
  MoonIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const QuickPresets = ({ settings, onPresetSelect }) => {
  const presets = [
    {
      id: 'general',
      name: 'Consulta General',
      icon: '🏥',
      iconComponent: SunIcon,
      description: 'Configuración balanceada para consultorios regulares',
      color: 'blue',
      settings: {
        audioQuality: 'high',
        aiAssistanceLevel: 'intermediate',
        confidenceThreshold: 75,
        language: 'es-MX',
        medicalTerminology: true,
        clinicalAlerts: true,
        emergencyAlerts: true,
        notesFormat: 'soap',
        noiseSuppression: true,
        echoCancellation: true
      },
      features: [
        'Audio HD + IA Intermedia',
        'Español MX + Términos Médicos',
        'SOAP + Alertas Básicas',
        'Umbral de confianza 75%'
      ],
      bestFor: 'Medicina general, consultas rutinarias, medicina familiar'
    },
    {
      id: 'emergency',
      name: 'Consulta de Emergencia',
      icon: '🚨',
      iconComponent: ExclamationTriangleIcon,
      description: 'Máxima precisión y alertas críticas para casos urgentes',
      color: 'red',
      settings: {
        audioQuality: 'ultra',
        aiAssistanceLevel: 'advanced',
        confidenceThreshold: 70,
        realtimeMode: true,
        emergencyAlerts: true,
        redFlags: true,
        clinicalAlerts: true,
        drugInteractionChecks: true,
        medicalVoiceFilter: true,
        sensitivity: 90
      },
      features: [
        'Audio Máxima Calidad',
        'IA Avanzada + Alertas Críticas',
        'Transcripción Instantánea',
        'Banderas Rojas Activas'
      ],
      bestFor: 'Urgencias, casos críticos, medicina de emergencia'
    },
    {
      id: 'night',
      name: 'Consulta Nocturna',
      icon: '🌙',
      iconComponent: MoonIcon,
      description: 'Optimizado para guardias nocturnas y ambientes silenciosos',
      color: 'indigo',
      settings: {
        noiseSuppression: true,
        medicalVoiceFilter: true,
        sensitivity: 85,
        clinicalAlerts: false,
        emergencyAlerts: true,
        audioQuality: 'high',
        aiAssistanceLevel: 'intermediate',
        confidenceThreshold: 80
      },
      features: [
        'Filtro de Ruido Agresivo',
        'Modo Oscuro Automático',
        'Solo Alertas Críticas',
        'Sensibilidad Optimizada'
      ],
      bestFor: 'Guardias nocturnas, consultas en silencio, telemedicia'
    },
    {
      id: 'custom',
      name: 'Configuración Personalizada',
      icon: '⚙️',
      iconComponent: CogIcon,
      description: 'Configuración manual ajustada por el usuario',
      color: 'gray',
      settings: {},
      features: [
        'Configurado manualmente',
        'Ajustes específicos del usuario',
        'Totalmente personalizable',
        'Sin restricciones predefinidas'
      ],
      bestFor: 'Usuarios avanzados, necesidades específicas, especialidades particulares'
    }
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300',
      red: isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-red-300',
      indigo: isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300',
      gray: isSelected ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
    };
    return colors[color] || colors.blue;
  };

  const getButtonColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700',
      gray: 'bg-gray-600 hover:bg-gray-700'
    };
    return colors[color] || colors.blue;
  };

  const handlePresetSelect = (presetId) => {
    onPresetSelect(presetId);
  };

  const isCurrentPreset = (presetId) => {
    return settings.activePreset === presetId;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          ⚡ Configuraciones Rápidas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona el tipo de consulta para aplicar configuraciones optimizadas
        </p>
      </div>

      {/* Current Preset Indicator */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Preset Activo: {presets.find(p => p.id === settings.activePreset)?.name || 'Personalizado'}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400">
              {presets.find(p => p.id === settings.activePreset)?.description || 'Configuración ajustada manualmente'}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="space-y-6">
        {presets.map((preset) => {
          const IconComponent = preset.iconComponent;
          const isSelected = isCurrentPreset(preset.id);
          
          return (
            <motion.div
              key={preset.id}
              className={`rounded-xl border-2 transition-all overflow-hidden ${
                getColorClasses(preset.color, isSelected)
              }`}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: presets.indexOf(preset) * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${preset.color === 'gray' ? 'bg-gray-100 dark:bg-gray-800' : `bg-${preset.color}-100 dark:bg-${preset.color}-900/30`}`}>
                      <span className="text-2xl">{preset.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {preset.name}
                        </h4>
                        {isSelected && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {preset.description}
                      </p>
                      
                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {preset.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${preset.color}-500`} />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Best For */}
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Ideal para:
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {preset.bestFor}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex flex-col items-end space-y-2">
                    {preset.id !== 'custom' ? (
                      <motion.button
                        onClick={() => handlePresetSelect(preset.id)}
                        disabled={isSelected}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                          isSelected 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : getButtonColorClasses(preset.color)
                        }`}
                        whileHover={!isSelected ? { scale: 1.05 } : {}}
                        whileTap={!isSelected ? { scale: 0.95 } : {}}
                      >
                        {isSelected ? 'Aplicado' : 'Aplicar'}
                      </motion.button>
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium text-sm">
                        Manual
                      </div>
                    )}
                    
                    <IconComponent className={`w-5 h-5 text-${preset.color}-600`} />
                  </div>
                </div>
              </div>
              
              {/* Preview of Settings (expanded when selected) */}
              {isSelected && preset.id !== 'custom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Configuraciones Aplicadas:
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(preset.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <BoltIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              💡 Consejos de Uso
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1">
              <div>• Consulta General: Para el 80% de consultas rutinarias</div>
              <div>• Emergencia: Cuando cada segundo cuenta</div>
              <div>• Nocturna: Para guardias y ambientes silenciosos</div>
              <div>• Personalizada: Ajusta configuraciones específicas en otras tabs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPresets;