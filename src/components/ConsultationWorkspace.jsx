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
      <header className="medical-header">
        <div className="header-content">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="medical-icon" />
          <div className="session-info">
            <div className="title">Consulta Médica</div>
            <div className="session-time">
              {isActive ? `Sesión activa: ${formatDuration(sessionDuration)}` : 'Sesión inactiva'}
            </div>
          </div>
          <div className="mode-toggle">
            <button
              onClick={() => setAiMode(aiMode === 'basic' ? 'advanced' : 'basic')}
              className="toggle-button"
            >
              {aiMode === 'basic' ? 'Activar IA Avanzada' : 'Modo Básico'}
            </button>
          </div>
          <button
            onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cambiar disposición"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          </button>
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
