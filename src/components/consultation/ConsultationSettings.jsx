"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/accessibility.css';
import { useTranslation } from '../../providers/I18nProvider';
import { XMarkIcon, MicrophoneIcon, SparklesIcon, DocumentTextIcon, Cog6ToothIcon, BoltIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'; // Tab Components
import AudioSettings from './settings/AudioSettings';
import TranscriptionSettings from './settings/TranscriptionSettings';
import AISettings from './settings/AISettings';
import QuickPresets from './settings/QuickPresets';

const ConsultationSettings = ({ onClose }) => {
  

const { t } = useTranslation();

const [activeTab, setActiveTab] = useState('audio');

const [settings, setSettings] = useState({
  // Audio settings
  audioSource: 'primary', // 'primary' | 'bluetooth' | 'system'
  audioQuality: 'high', // 'low' | 'medium' | 'high' | 'ultra'
  noiseSuppression: true,
  echoCancellation: true,
  medicalVoiceFilter: true,
  sensitivity: 75, // 0-100
  
  // Transcription settings
  language: 'es-MX', // Changed to Mexican Spanish for medical context
  transcriptionService: 'browser',
  confidenceThreshold: 75, // Changed from 100% to 75% (more realistic)
  realtimeMode: true,
  medicalTerminology: true,
  clinicalAbbreviations: true,
  drugNames: true,
  
  // AI Assistant settings
  medicalSpecialty: 'general', // 'general' | 'cardiology' | 'pediatrics' | 'emergency'
  aiAssistanceLevel: 'intermediate', // 'basic' | 'intermediate' | 'advanced'
  clinicalAlerts: true,
  emergencyAlerts: true,
  drugInteractionChecks: true,
  redFlags: true,
  notesFormat: 'soap', // 'soap' | 'narrative' | 'hybrid'
  
  // Presets
  activePreset: 'general' // 'general' | 'emergency' | 'night' | 'custom'
});

const tabs = [
  {
  id: 'audio',
  label: '🎤 Audio',
  icon: MicrophoneIcon,
  component: AudioSettings,
  description: 'Micrófono y calidad de grabación'
}, 
  {
  id: 'transcription',
  label: '📝 Transcripción',
  icon: DocumentTextIcon,
  component: TranscriptionSettings,
  description: 'Idioma y precisión de texto'
}, 
  {
  id: 'ai',
  label: '🤖 Asistente IA',
  icon: SparklesIcon,
  component: AISettings,
  description: 'Especialidad y nivel de asistencia'
}, 
  {
  id: 'presets',
  label: '⚡ Presets',
  icon: BoltIcon,
  component: QuickPresets,
  description: 'Configuraciones rápidas'
}
];

const handleSettingChange = (key, value) => {
   setSettings(prev => ({ ...prev, [key]: value }));
};

const handleSave = () => {
  // Save settings to localStorage
  localStorage.setItem('consultationSettings', JSON.stringify(settings));
  // Show success feedback
  console.log('⚙️ Configuración guardada:', settings);
  onClose();
};

const handleReset = () => {
   setSettings({
  audioSource: 'primary',
  audioQuality: 'high',
  noiseSuppression: true,
  echoCancellation: true,
  medicalVoiceFilter: true,
  sensitivity: 75,
  language: 'es-MX',
  transcriptionService: 'browser',
  confidenceThreshold: 75,
  realtimeMode: true,
  medicalTerminology: true,
  clinicalAbbreviations: true,
  drugNames: true,
  medicalSpecialty: 'general',
  aiAssistanceLevel: 'intermediate',
  clinicalAlerts: true,
  emergencyAlerts: true,
  drugInteractionChecks: true,
  redFlags: true,
  notesFormat: 'soap',
  activePreset: 'general'
});
};
const handlePresetSelect = (presetName) => {
  

const presets = {
  general: {
    audioQuality: 'high',
    aiAssistanceLevel: 'intermediate',
    confidenceThreshold: 75,
    language: 'es-MX',
    medicalTerminology: true,
    clinicalAlerts: true,
    notesFormat: 'soap'
  },
  emergency: {
    audioQuality: 'ultra',
    aiAssistanceLevel: 'advanced',
    confidenceThreshold: 70,
    realtimeMode: true,
    emergencyAlerts: true,
    redFlags: true,
    clinicalAlerts: true
  },
  night: {
    noiseSuppression: true,
    medicalVoiceFilter: true,
    sensitivity: 85,
    clinicalAlerts: false,
    emergencyAlerts: true
  }
};
if (presets[presetName]) {
  setSettings(prev => ({ ...prev, ...presets[presetName], activePreset: presetName }));
}
};
const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;
return ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" > {/* Header */} <div className="flex items-center justify-between p-6 border-b border-gray-200 "> <div className="flex items-center space-x-3"> <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"> <Cog6ToothIcon className="w-6 h-6 text-white" /> </div> <div> <h2 className="text-xl font-semibold text-gray-900 "> {t('consultation_settings') || 'Configuración de Consulta'} </h2> <p className="text-sm text-gray-600 "> {t('customize_experience') || 'Personaliza tu experiencia médica'} </p> </div> </div> <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" > <XMarkIcon className="w-5 h-5 text-gray-500" /> </button> </div> {/* Tab Navigation */} <div className="border-b border-gray-200 "> <nav className="flex space-x-1 p-2"> {tabs.map((tab) => {
  

const IconComponent = tab.icon;
return ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${ activeTab === tab.id ? 'bg-blue-100 text-blue-700 ' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 ' }`} > <IconComponent className="w-5 h-5" /> <span className="hidden sm:inline">{tab.label}</span> {activeTab === tab.id && ( <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" /> )} </button> );
})} </nav> </div> {/* Tab Content */} <div className="flex-1 overflow-y-auto max-h-[60vh]"> <AnimatePresence mode="wait"> <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6" > {ActiveTabComponent && ( <ActiveTabComponent settings={settings} onSettingChange={handleSettingChange} onPresetSelect={handlePresetSelect} /> )} </motion.div> </AnimatePresence> </div> {/* Footer Actions */} <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 "> <div className="flex items-center space-x-2 text-sm text-gray-600 "> <ChatBubbleLeftRightIcon className="w-4 h-4" /> <span>Preset activo: {settings.activePreset || 'Personalizado'}</span> </div> <div className="flex items-center space-x-3"> <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" > {t('reset') || 'Resetear'} </button> <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md" > {t('save_settings') || 'Guardar Configuración'} </button> </div> </div> </motion.div> </div> );

};

export default ConsultationSettings;
