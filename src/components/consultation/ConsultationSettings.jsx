import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/accessibility.css';
import { useTranslation } from '../../../app/providers/I18nProvider';
import { 
  XMarkIcon,
  MicrophoneIcon,
  SparklesIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const ConsultationSettings = ({ onClose }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    // Audio settings
    audioQuality: 'high', // 'low' | 'medium' | 'high'
    noiseSuppression: true,
    echoCancellation: true,
    
    // Transcription settings
    language: 'es-ES',
    transcriptionService: 'browser', // 'browser' | 'whisper'
    realTimeTranscription: true,
    confidenceThreshold: 0.7,
    
    // AI settings
    aiAssistance: 'advanced', // 'basic' | 'advanced' | 'disabled'
    autoSuggestions: true,
    clinicalAlerts: true,
    proactiveAnalysis: true,
    
    // SOAP generation
    autoGenerateSOAP: true,
    soapStyle: 'detailed', // 'concise' | 'detailed' | 'comprehensive'
    includeTimestamps: true,
    
    // Export settings
    defaultExportFormat: 'pdf', // 'pdf' | 'docx' | 'txt'
    includeTranscript: true,
    includeMetadata: true
  });
  
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSave = () => {
    // Save settings to localStorage or user preferences
    localStorage.setItem('consultationSettings', JSON.stringify(settings));
    onClose();
  };
  
  const handleReset = () => {
    // Reset to default settings
    setSettings({
      audioQuality: 'high',
      noiseSuppression: true,
      echoCancellation: true,
      language: 'es-ES',
      transcriptionService: 'browser',
      realTimeTranscription: true,
      confidenceThreshold: 0.7,
      aiAssistance: 'advanced',
      autoSuggestions: true,
      clinicalAlerts: true,
      proactiveAnalysis: true,
      autoGenerateSOAP: true,
      soapStyle: 'detailed',
      includeTimestamps: true,
      defaultExportFormat: 'pdf',
      includeTranscript: true,
      includeMetadata: true
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('consultation_settings')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('customize_experience')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label={t('close_settings')}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
          {/* Audio Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MicrophoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('audio_recording')}</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('audio_quality')}
                </label>
                <select
                  value={settings.audioQuality}
                  onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="low">{t('low_faster')}</option>
                  <option value="medium">{t('medium_balanced')}</option>
                  <option value="high">{t('high_quality')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('noise_suppression')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.noiseSuppression}
                  onChange={(e) => handleSettingChange('noiseSuppression', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('echo_cancellation')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.echoCancellation}
                  onChange={(e) => handleSettingChange('echoCancellation', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
            </div>
          </div>
          
          {/* Transcription Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SpeakerWaveIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('transcription')}</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('language')}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="es-ES">{t('spanish_spain')}</option>
                  <option value="es-MX">{t('spanish_mexico')}</option>
                  <option value="es-AR">{t('spanish_argentina')}</option>
                  <option value="en-US">{t('english_us')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('transcription_service')}
                </label>
                <select
                  value={settings.transcriptionService}
                  onChange={(e) => handleSettingChange('transcriptionService', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="browser">{t('browser_free')}</option>
                  <option value="whisper">{t('whisper_premium')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('realtime_transcription')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.realTimeTranscription}
                  onChange={(e) => handleSettingChange('realTimeTranscription', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('confidence_threshold')}: {(settings.confidenceThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={settings.confidenceThreshold}
                  onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
          
          {/* AI Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('ai_assistant')}</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('ai_assistance_level')}
                </label>
                <select
                  value={settings.aiAssistance}
                  onChange={(e) => handleSettingChange('aiAssistance', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="disabled">{t('disabled')}</option>
                  <option value="basic">{t('basic')}</option>
                  <option value="advanced">{t('advanced')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('auto_suggestions')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoSuggestions}
                  onChange={(e) => handleSettingChange('autoSuggestions', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('clinical_alerts')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.clinicalAlerts}
                  onChange={(e) => handleSettingChange('clinicalAlerts', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('proactive_analysis')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.proactiveAnalysis}
                  onChange={(e) => handleSettingChange('proactiveAnalysis', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
            </div>
          </div>
          
          {/* SOAP Generation Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('soap_generation')}</h3>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('auto_generate_soap')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoGenerateSOAP}
                  onChange={(e) => handleSettingChange('autoGenerateSOAP', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('notes_style')}
                </label>
                <select
                  value={settings.soapStyle}
                  onChange={(e) => handleSettingChange('soapStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="concise">{t('concise')}</option>
                  <option value="detailed">{t('detailed')}</option>
                  <option value="comprehensive">{t('comprehensive')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('include_timestamps')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.includeTimestamps}
                  onChange={(e) => handleSettingChange('includeTimestamps', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
            </div>
          </div>
          
          {/* Export Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('export')}</h3>
            
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('default_format')}
                </label>
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => handleSettingChange('defaultExportFormat', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">{t('word_docx')}</option>
                  <option value="txt">{t('plain_text')}</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('include_transcript')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.includeTranscript}
                  onChange={(e) => handleSettingChange('includeTranscript', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('include_metadata')}
                </label>
                <input
                  type="checkbox"
                  checked={settings.includeMetadata}
                  onChange={(e) => handleSettingChange('includeMetadata', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg"
          >
            {t('reset')}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {t('save_settings')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationSettings;