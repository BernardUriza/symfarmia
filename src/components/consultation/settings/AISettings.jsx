import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const AISettings = ({ settings, onSettingChange }) => {
  const medicalSpecialties = [
    {
      id: 'general',
      label: 'Medicina General',
      icon: '🏥',
      description: 'Consultas generales y medicina familiar',
      color: 'blue',
    },
    {
      id: 'cardiology',
      label: 'Cardiología',
      icon: '❤️',
      description: 'Especialista en enfermedades cardiovasculares',
      color: 'red',
    },
    {
      id: 'pediatrics',
      label: 'Pediatría',
      icon: '👶',
      description: 'Atención médica especializada en menores',
      color: 'pink',
    },
    {
      id: 'emergency',
      label: 'Medicina de Emergencia',
      icon: '🚨',
      description: 'Urgencias y casos críticos',
      color: 'orange',
    },
  ];

  const aiAssistanceLevels = [
    {
      id: 'basic',
      label: 'Básico',
      description: 'Solo transcripción y notas básicas',
      features: [
        'Transcripción en tiempo real',
        'Notas simples',
        'Detección de palabras clave',
      ],
      icon: '📝',
      color: 'gray',
    },
    {
      id: 'intermediate',
      label: 'Intermedio',
      description: 'Sugerencias y análisis médico básico',
      features: [
        'Todo lo básico',
        'Sugerencias de diagnóstico',
        'Alertas básicas',
        'SOAP automático',
      ],
      icon: '🤖',
      color: 'blue',
      recommended: true,
    },
    {
      id: 'advanced',
      label: 'Avanzado',
      description: 'Análisis clínico completo y alertas críticas',
      features: [
        'Todo lo intermedio',
        'Análisis profundo',
        'Alertas críticas',
        'Sugerencias de tratamiento',
      ],
      icon: '🧠',
      color: 'purple',
    },
  ];

  const notesFormats = [
    {
      id: 'soap',
      label: 'SOAP Estructurado',
      description: 'Subjetivo, Objetivo, Análisis, Plan',
      icon: '📋',
      example:
        'S: Paciente refiere dolor\nO: TA 120/80\nA: HTA leve\nP: Seguimiento',
    },
    {
      id: 'narrative',
      label: 'Narrativo Libre',
      description: 'Texto corrido y natural',
      icon: '📄',
      example:
        'El paciente acude por dolor de cabeza que inició hace 2 días...',
    },
    {
      id: 'hybrid',
      label: 'Híbrido SOAP + Narrativo',
      description: 'Combina estructura con flexibilidad',
      icon: '📊',
      example: 'Estructura SOAP con secciones narrativas expandidas',
    },
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected
        ? 'border-blue-500 bg-blue-50 '
        : 'border-gray-200 hover:border-blue-300',
      red: isSelected
        ? 'border-red-500 bg-red-50 '
        : 'border-gray-200 hover:border-red-300',
      pink: isSelected
        ? 'border-pink-500 bg-pink-50 '
        : 'border-gray-200 hover:border-pink-300',
      orange: isSelected
        ? 'border-orange-500 bg-orange-50 '
        : 'border-gray-200 hover:border-orange-300',
      gray: isSelected
        ? 'border-gray-500 bg-gray-50 '
        : 'border-gray-200 hover:border-gray-300',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50 '
        : 'border-gray-200 hover:border-purple-300',
    };
    return colors[color] || colors.blue;
  };
  return (
    <div className="space-y-8">
      {' '}
      {/* Header */}{' '}
      <div className="text-center">
        {' '}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {' '}
          🤖 Asistente IA Médico{' '}
        </h3>{' '}
        <p className="text-sm text-gray-600 ">
          {' '}
          Especialidad médica y nivel de asistencia inteligente{' '}
        </p>{' '}
      </div>{' '}
      {/* Medical Specialty */}{' '}
      <div className="space-y-4">
        {' '}
        <div className="flex items-center space-x-2 mb-3">
          {' '}
          <HeartIcon className="w-5 h-5 text-blue-600" />{' '}
          <h4 className="font-medium text-gray-900 ">
            Especialidad Médica
          </h4>{' '}
        </div>{' '}
        <div className="grid grid-cols-2 gap-3">
          {' '}
          {medicalSpecialties.map((specialty) => (
            <motion.button
              key={specialty.id}
              onClick={() => onSettingChange('medicalSpecialty', specialty.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${getColorClasses(specialty.color, settings.medicalSpecialty === specialty.id)}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {' '}
              <div className="text-center">
                {' '}
                <div className="text-3xl mb-2">{specialty.icon}</div>{' '}
                <div className="font-medium text-gray-900 ">
                  {' '}
                  {specialty.label}{' '}
                </div>{' '}
                <div className="text-sm text-gray-600 mt-1">
                  {' '}
                  {specialty.description}{' '}
                </div>{' '}
              </div>{' '}
            </motion.button>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      {/* AI Assistance Level */}{' '}
      <div className="space-y-4">
        {' '}
        <div className="flex items-center space-x-2 mb-3">
          {' '}
          <SparklesIcon className="w-5 h-5 text-purple-600" />{' '}
          <h4 className="font-medium text-gray-900 ">
            Nivel de Asistencia IA
          </h4>{' '}
        </div>{' '}
        <div className="space-y-3">
          {' '}
          {aiAssistanceLevels.map((level) => (
            <motion.button
              key={level.id}
              onClick={() => onSettingChange('aiAssistanceLevel', level.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${getColorClasses(level.color, settings.aiAssistanceLevel === level.id)}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex items-start space-x-3">
                  {' '}
                  <span className="text-2xl">{level.icon}</span>{' '}
                  <div className="flex-1">
                    {' '}
                    <div className="flex items-center space-x-2">
                      {' '}
                      <span className="font-medium text-gray-900 ">
                        {' '}
                        {level.label}{' '}
                      </span>{' '}
                      {level.recommended && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {' '}
                          Recomendado{' '}
                        </span>
                      )}{' '}
                    </div>{' '}
                    <div className="text-sm text-gray-600 mt-1">
                      {' '}
                      {level.description}{' '}
                    </div>{' '}
                    <div className="mt-2">
                      {' '}
                      <div className="text-xs text-gray-500 mb-1">
                        Incluye:
                      </div>{' '}
                      <div className="space-y-0.5">
                        {' '}
                        {level.features.map((feature, i) => (
                          <div key={i} className="text-xs text-gray-600 ">
                            {' '}
                            ✓ {feature}{' '}
                          </div>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${settings.aiAssistanceLevel === level.id ? `border-${level.color}-500 bg-${level.color}-500` : 'border-gray-300 '}`}
                >
                  {' '}
                  {settings.aiAssistanceLevel === level.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}{' '}
                </div>{' '}
              </div>{' '}
            </motion.button>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      {/* Clinical Alerts */}{' '}
      <div className="space-y-4">
        {' '}
        <div className="flex items-center space-x-2 mb-3">
          {' '}
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />{' '}
          <h4 className="font-medium text-gray-900 ">Alertas Clínicas</h4>{' '}
        </div>{' '}
        <div className="space-y-3">
          {' '}
          {[
            {
              key: 'emergencyAlerts',
              label: 'Síntomas de Emergencia',
              description:
                'Alerta ante signos de alarma (dolor torácico, disnea severa, etc.)',
              icon: '🚨',
              color: 'red',
            },
            {
              key: 'drugInteractionChecks',
              label: 'Interacciones Medicamentosas',
              description: 'Detecta posibles interacciones entre medicamentos',
              icon: '💊',
              color: 'orange',
            },
            {
              key: 'redFlags',
              label: 'Banderas Rojas',
              description:
                'Señales de advertencia para derivación especializada',
              icon: '🚩',
              color: 'red',
            },
            {
              key: 'clinicalAlerts',
              label: 'Alertas Clínicas Generales',
              description: 'Recordatorios de buenas prácticas médicas',
              icon: '⚠️',
              color: 'yellow',
            },
          ].map((alert) => (
            <div
              key={alert.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              {' '}
              <div className="flex items-center space-x-3">
                {' '}
                <span className="text-xl">{alert.icon}</span>{' '}
                <div>
                  {' '}
                  <div className="font-medium text-gray-900 ">
                    {' '}
                    {alert.label}{' '}
                  </div>{' '}
                  <div className="text-sm text-gray-600 ">
                    {' '}
                    {alert.description}{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <button
                onClick={() => onSettingChange(alert.key, !settings[alert.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[alert.key] ? 'bg-red-600' : 'bg-gray-200 '}`}
              >
                {' '}
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[alert.key] ? 'translate-x-6' : 'translate-x-1'}`}
                />{' '}
              </button>{' '}
            </div>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      {/* Notes Format */}{' '}
      <div className="space-y-4">
        {' '}
        <div className="flex items-center space-x-2 mb-3">
          {' '}
          <DocumentTextIcon className="w-5 h-5 text-green-600" />{' '}
          <h4 className="font-medium text-gray-900 ">Formato de Notas</h4>{' '}
        </div>{' '}
        <div className="space-y-3">
          {' '}
          {notesFormats.map((format) => (
            <motion.button
              key={format.id}
              onClick={() => onSettingChange('notesFormat', format.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${settings.notesFormat === format.id ? 'border-green-500 bg-green-50 ' : 'border-gray-200 hover:border-green-300'}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="flex items-start space-x-3">
                  {' '}
                  <span className="text-2xl">{format.icon}</span>{' '}
                  <div className="flex-1">
                    {' '}
                    <div className="font-medium text-gray-900 ">
                      {' '}
                      {format.label}{' '}
                    </div>{' '}
                    <div className="text-sm text-gray-600 mt-1">
                      {' '}
                      {format.description}{' '}
                    </div>{' '}
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 ">
                      {' '}
                      <div className="font-mono">{format.example}</div>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${settings.notesFormat === format.id ? 'border-green-500 bg-green-500' : 'border-gray-300 '}`}
                >
                  {' '}
                  {settings.notesFormat === format.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}{' '}
                </div>{' '}
              </div>{' '}
            </motion.button>
          ))}{' '}
        </div>{' '}
      </div>{' '}
      {/* Performance Notice */}{' '}
      <div className="p-4 bg-blue-50 rounded-lg">
        {' '}
        <div className="flex items-start space-x-3">
          {' '}
          <ShieldExclamationIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />{' '}
          <div>
            {' '}
            <div className="text-sm font-medium text-blue-800 ">
              {' '}
              💡 Optimización de Rendimiento{' '}
            </div>{' '}
            <div className="text-sm text-blue-700 mt-1">
              {' '}
              Niveles más altos de IA pueden requerir más tiempo de
              procesamiento. Para consultas rápidas, considera usar el nivel
              Intermedio.{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
};

export default AISettings;
