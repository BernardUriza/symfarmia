import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { ConsultationProvider, useConsultation } from '../contexts/ConsultationContext';
import { useTranslation } from '../../app/providers/I18nProvider';
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

  const { t } = useTranslation();
  
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
            <div className="title">{t('consultation_title')}</div>
            <div className="session-time">
              {isActive ? `${t('session_active')}: ${formatDuration(sessionDuration)}` : t('session_inactive')}
            </div>
          </div>
          <div className="mode-toggle">
            <button
              onClick={() => setAiMode(aiMode === 'basic' ? 'advanced' : 'basic')}
              className="toggle-button"
            >
              {aiMode === 'basic' ? t('activate_advanced_ai') : t('basic_mode')}
            </button>
          </div>
          <button
            onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('change_layout')}
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
      <main className="flex-1 p-6">
        {layout === 'vertical' ? (
          // Vertical Layout - Stacked
          <div className="flex flex-col gap-6 h-full">
            <motion.div 
              className="flex-1"
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <TranscriptionPanel />
            </motion.div>
            <AnimatePresence>
              {aiMode === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="overflow-hidden"
                >
                  <AIAssistantPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Horizontal Layout - Dynamic Grid
          <motion.div 
            className={`consultation-workspace-grid h-full ${aiMode === 'advanced' ? 'with-assistant' : ''}`}
            layout
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Main Transcription Area */}
            <motion.div 
              className="transcription-section"
              layout
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <TranscriptionPanel />
            </motion.div>
            
            {/* AI Assistant Panel */}
            <AnimatePresence>
              {aiMode === 'advanced' && (
                <motion.div
                  initial={{ opacity: 0, width: 0, scale: 0.9 }}
                  animate={{ opacity: 1, width: 'auto', scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.9 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 20, 
                    stiffness: 150,
                    width: { duration: 0.4 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                  className="ai-assistant-section"
                >
                  <AIAssistantPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
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
