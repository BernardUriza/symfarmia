"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientContext } from '../../app/providers/PatientContextProvider';
import { mockMedicalAI } from '../utils/medicalUtils';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  HeartIcon,
  BeakerIcon,
  DocumentTextIcon,
  CalculatorIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MedicalAssistant = () => {
  const {
    assistantOpen,
    assistantMode,
    activePatient,
    chatHistory,
    toggleAssistant,
    setAssistantMode,
    addChatMessage,
    clinicalAlerts,
    suggestedActions
  } = usePatientContext();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  useEffect(() => {
    if (assistantOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [assistantOpen]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message
    addChatMessage({
      type: 'user',
      content: userMessage,
      sender: 'user'
    });
    
    setIsTyping(true);
    
    try {
      // Get AI response
      const aiResponse = await mockMedicalAI.generateResponse(userMessage, {
        patient: activePatient,
        mode: assistantMode
      });
      
      // Add AI response
      addChatMessage({
        type: 'assistant',
        content: aiResponse,
        sender: 'ai',
        mode: assistantMode
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      addChatMessage({
        type: 'error',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        sender: 'ai'
      });
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleCommandSelect = (command) => {
    setMessage(command);
    setShowCommands(false);
    inputRef.current?.focus();
  };
  
  const quickCommands = [
    { id: 'summarize', text: '/summarize visit', icon: DocumentTextIcon, desc: 'Summarize current patient visit' },
    { id: 'interactions', text: '/check interactions', icon: ExclamationTriangleIcon, desc: 'Check drug interactions' },
    { id: 'diagnosis', text: '/suggest diagnosis', icon: MagnifyingGlassIcon, desc: 'Generate differential diagnosis' },
    { id: 'calculate', text: '/calculate', icon: CalculatorIcon, desc: 'Clinical calculators' },
    { id: 'icd10', text: '/icd10 lookup', icon: InformationCircleIcon, desc: 'Search ICD-10 codes' },
    { id: 'vitals', text: '/analyze vitals', icon: HeartIcon, desc: 'Analyze vital signs' },
    { id: 'labs', text: '/review labs', icon: BeakerIcon, desc: 'Review lab results' }
  ];
  
  const modeButtons = [
    { id: 'general', label: 'General', icon: InformationCircleIcon, color: 'blue' },
    { id: 'patient-specific', label: 'Patient Care', icon: UserIcon, color: 'green' },
    { id: 'diagnosis', label: 'Diagnosis', icon: MagnifyingGlassIcon, color: 'purple' },
    { id: 'prescription', label: 'Prescription', icon: BeakerIcon, color: 'orange' }
  ];
  
  const getMessageIcon = (type) => {
    switch (type) {
      case 'user': return UserIcon;
      case 'assistant': return ComputerDesktopIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return InformationCircleIcon;
    }
  };
  
  const getMessageColor = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'assistant': return 'bg-green-50 border-green-200 text-green-900';
      case 'error': return 'bg-red-50 border-red-200 text-red-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };
  
  return (
    <AnimatePresence>
      {assistantOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
          className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 border-l border-gray-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <ComputerDesktopIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Medical AI Assistant</h2>
                <p className="text-sm text-blue-100">
                  {activePatient ? `Caring for ${activePatient.name}` : 'General medical support'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAssistant}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Mode Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {modeButtons.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAssistantMode(mode.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                    assistantMode === mode.id
                      ? `bg-${mode.color}-100 text-${mode.color}-800 border border-${mode.color}-200`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Clinical Alerts */}
          {clinicalAlerts.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-orange-500" />
                Clinical Alerts
              </h3>
              <div className="space-y-2">
                {clinicalAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded-lg text-xs ${
                      alert.priority === 'high' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-xs opacity-75">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                <LightBulbIcon className="w-4 h-4 mr-1 text-blue-500" />
                Suggested Actions
              </h3>
              <div className="space-y-1">
                {suggestedActions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleCommandSelect(action.command)}
                    className="w-full text-left p-2 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
                  >
                    {action.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 400px)' }}>
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <ComputerDesktopIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm mb-2">Welcome to your Medical AI Assistant</p>
                <p className="text-xs">
                  {activePatient 
                    ? `I'm ready to help with ${activePatient.name}'s care`
                    : 'Ask me about clinical guidelines, drug interactions, or medical calculations'
                  }
                </p>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const Icon = getMessageIcon(msg.type);
                return (
                  <div
                    key={msg.id}
                    className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg border ${getMessageColor(msg.type)} ${
                        msg.sender === 'user' ? 'bg-blue-600 text-white border-blue-600' : ''
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {isTyping && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Commands */}
          <AnimatePresence>
            {showCommands && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">Quick Commands</div>
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleCommandSelect(cmd.text)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <cmd.icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{cmd.text}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{cmd.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowCommands(message.startsWith('/'))}
                  onBlur={() => setTimeout(() => setShowCommands(false), 200)}
                  placeholder={
                    activePatient 
                      ? `Ask about ${activePatient.name}'s care...`
                      : 'Ask a medical question or type / for commands...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  rows={2}
                />
                {message.startsWith('/') && (
                  <button
                    onClick={() => setShowCommands(!showCommands)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Press Ctrl+Shift+A to toggle assistant</span>
              <span>Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicalAssistant;