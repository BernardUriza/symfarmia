import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cog6ToothIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { ConsultationProvider, useConsultation } from '../contexts/ConsultationContext';
import TranscriptionPanel from './consultation/TranscriptionPanel';
import AIAssistantPanel from './consultation/AIAssistantPanel';
import DocumentationOutput from './consultation/DocumentationOutput';
import ConsultationSettings from './consultation/ConsultationSettings';

// Main workspace layout
function ConsultationWorkspaceInner({ onExit }) {
  const {
    isActive,
    aiMode,
    setAiMode,
    sessionDuration,
    startSession,
    endSession
  } = useConsultation();
  
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState('horizontal'); // 'horizontal' | 'vertical' | 'focused'
  
  useEffect(() => {
    // Auto-start session when workspace mounts
    if (!isActive) {
      startSession();
    }
    
    // Cleanup on unmount
    return () => {
      if (isActive) {
        endSession();
      }
    };
  }, [isActive, startSession, endSession]);
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex-col';
      case 'focused':
        return 'flex-col lg:flex-row';
      default:
        return 'flex-col xl:flex-row';
    }
  };
  
  return (
    <div className="medical-assistant-container">
      {/* Header */}
      <header className="header bg-white/80 backdrop-blur-sm border-b border-white/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Consulta Médica</h1>
                <p className="text-sm text-gray-600">
                  {isActive ? `Sesión activa: ${formatDuration(sessionDuration)}` : 'Sesión inactiva'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* AI Mode Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setAiMode('basic')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  aiMode === 'basic'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Básico
              </button>
              <button
                onClick={() => setAiMode('advanced')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${
                  aiMode === 'advanced'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SparklesIcon className="w-4 h-4" />
                <span>IA Avanzada</span>
              </button>
            </div>
            
            {/* Layout Toggle */}
            <button
              onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cambiar disposición"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={`flex-1 p-6 flex gap-6 ${getLayoutClasses()}`}>
        {/* Left Panel - Transcription */}
        <div className={`${layout === 'vertical' ? 'w-full' : 'flex-1 min-w-0'}`}>
          <TranscriptionPanel />
        </div>
        
        {/* Right Panel - AI Assistant (only in advanced mode) */}
        <AnimatePresence>
          {aiMode === 'advanced' && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`${layout === 'vertical' ? 'w-full mt-6' : 'w-96 flex-shrink-0'}`}
            >
              <AIAssistantPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Bottom Panel - Documentation Output */}
      <div className="border-t border-white/50 bg-white/60 backdrop-blur-sm">
        <DocumentationOutput />
      </div>
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <ConsultationSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper component with context
function ConsultationWorkspace({ onExit }) {
  return (
    <ConsultationProvider>
      <ConsultationWorkspaceInner onExit={onExit} />
    </ConsultationProvider>
  );
}

export default ConsultationWorkspace;
