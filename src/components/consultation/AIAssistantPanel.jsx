import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  UserIcon,
  BeakerIcon,
  DocumentTextIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useConsultation } from '../../contexts/ConsultationContext';
import { mockMedicalAI } from '../../utils/medicalUtils';

const AIAssistantPanel = () => {
  const {
    aiMessages,
    isAiThinking,
    finalTranscript,
    addAiMessage,
    logEvent
  } = useConsultation();
  
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'suggestions' | 'analysis'
  const [suggestions, setSuggestions] = useState([]);
  const [clinicalAlerts, setClinicalAlerts] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);
  
  const generateClinicalAlerts = useCallback((transcript) => {
    const alerts = [];
    
    // Red flags detection
    const redFlags = [
      { keyword: 'dolor torácico intenso', alert: 'Considerar síndrome coronario agudo', severity: 'high' },
      { keyword: 'dificultad respiratoria severa', alert: 'Evaluar distress respiratorio', severity: 'high' },
      { keyword: 'pérdida de conciencia', alert: 'Investigar causas neurológicas', severity: 'high' },
      { keyword: 'sangrado abundante', alert: 'Controlar signos vitales', severity: 'high' }
    ];
    
    redFlags.forEach(flag => {
      if (transcript.toLowerCase().includes(flag.keyword.toLowerCase())) {
        alerts.push(flag);
      }
    });
    
    setClinicalAlerts(alerts);
    return alerts;
  }, []);
  
  const analyzeTranscriptForSuggestions = useCallback(async (transcript) => {
    // Mock AI analysis for medical suggestions
    const medicalKeywords = {
      'dolor': ['Escala de dolor', 'Localización específica', 'Factores agravantes'],
      'fiebre': ['Temperatura actual', 'Duración', 'Síntomas asociados'],
      'cefalea': ['Tipo de cefalea', 'Intensidad', 'Factores desencadenantes'],
      'tos': ['Tos seca/productiva', 'Duración', 'Hora del día'],
      'fatiga': ['Nivel de actividad', 'Sueño', 'Stress laboral']
    };
    
    const detectedSymptoms = [];
    const newSuggestions = [];
    
    Object.keys(medicalKeywords).forEach(keyword => {
      if (transcript.toLowerCase().includes(keyword)) {
        detectedSymptoms.push(keyword);
        newSuggestions.push(...medicalKeywords[keyword]);
      }
    });
    
    if (newSuggestions.length > 0) {
      setSuggestions(prev => [...new Set([...prev, ...newSuggestions])]);
      
      // Check for clinical alerts
      const alerts = generateClinicalAlerts(transcript);
      
      // Add contextual AI message
      addAiMessage({
        type: 'ai',
        content: `He detectado síntomas relacionados con: ${detectedSymptoms.join(', ')}. Te sugiero profundizar en los siguientes aspectos para un diagnóstico más preciso.`,
        suggestions: newSuggestions.slice(0, 3),
        context: 'symptom_analysis'
      });
      
      // Add clinical alerts if any
      if (alerts.length > 0) {
        addAiMessage({
          type: 'ai',
          content: `⚠️ Alertas clínicas detectadas: ${alerts.map(a => a.alert).join(', ')}`,
          context: 'alert'
        });
      }
      
      logEvent('ai_suggestion_generated', { 
        symptoms: detectedSymptoms,
        suggestions: newSuggestions.length,
        alerts: alerts.length
      });
    }
  }, [addAiMessage, logEvent, generateClinicalAlerts]);
  
  // Analyze transcript in real-time for suggestions
  useEffect(() => {
    if (finalTranscript.length > 50) {
      analyzeTranscriptForSuggestions(finalTranscript);
    }
  }, [finalTranscript, analyzeTranscriptForSuggestions]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: inputValue,
      context: 'user_query'
    };
    
    addAiMessage(userMessage);
    setInputValue('');
    
    logEvent('user_message_sent', { 
      message_length: inputValue.length,
      context: 'consultation'
    });
    
    // Generate AI response
    try {
      const aiResponse = await mockMedicalAI.generateResponse(
        inputValue,
        { 
          transcript: finalTranscript,
          context: 'medical_consultation'
        },
        'diagnosis'
      );
      
      addAiMessage({
        type: 'ai',
        content: aiResponse.response,
        suggestions: generateMedicalSuggestions(inputValue),
        confidence: aiResponse.confidence,
        context: 'ai_response'
      });
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      addAiMessage({
        type: 'error',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.',
        context: 'error'
      });
    }
  };
  
  const generateMedicalSuggestions = (query) => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('diagnóstico') || queryLower.includes('diagnosis')) {
      return [
        'Revisar diagnósticos diferenciales',
        'Solicitar estudios complementarios',
        'Evaluar criterios clínicos'
      ];
    }
    
    if (queryLower.includes('tratamiento') || queryLower.includes('medicación')) {
      return [
        'Verificar contraindicaciones',
        'Revisar interacciones medicamentosas',
        'Calcular dosis según peso'
      ];
    }
    
    if (queryLower.includes('síntomas')) {
      return [
        'Ampliar anamnesis',
        'Realizar examen físico dirigido',
        'Evaluar cronología de síntomas'
      ];
    }
    
    return [
      'Continuar con anamnesis',
      'Revisar antecedentes',
      'Realizar examen físico'
    ];
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="mb-1">
        {line.startsWith('•') ? (
          <div className="flex items-start ml-4">
            <span className="text-blue-500 mr-2">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        ) : line.startsWith('**') && line.endsWith('**') ? (
          <div className="font-semibold text-gray-900 mt-2">
            {line.replace(/\*\*/g, '')}
          </div>
        ) : (
          <span>{line}</span>
        )}
      </div>
    ));
  };
  
  const getMessageIcon = (message) => {
    switch (message.type) {
      case 'user':
        return UserIcon;
      case 'ai':
        return SparklesIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return DocumentTextIcon;
    }
  };
  
  return (
    <>
      {/* Header */}
      <div className="ai-header">
        <div className="ai-info">
          <div className="ai-avatar" />
          <div className="ai-details">
            <div className="ai-title">Asistente IA Médico</div>
            <div className="ai-subtitle">Análisis en tiempo real</div>
          </div>
          <div className="ai-status">
            <div className="status-indicator">
              {isAiThinking ? 'Analizando…' : 'Activo'}
            </div>
          </div>
        </div>
      </div>

      <div className="ai-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
        >
          Sugerencias
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
        >
          Análisis
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden chat-area">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col max-h-[calc(100vh-160px)]"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      Asistente IA Listo
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Te ayudo con análisis clínico, diagnósticos diferenciales y recomendaciones de tratamiento
                    </p>
                  </div>
                ) : (
                  aiMessages
                    .filter(msg => !msg.isInternal)
                    .map((message, index) => {
                      const Icon = getMessageIcon(message);
                      return (
                        <div
                          key={index}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start max-w-xs ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === 'user' 
                                ? 'bg-blue-500 ml-2' 
                                : 'bg-gradient-to-r from-purple-500 to-blue-500 mr-2'
                            }`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className={`px-4 py-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : message.type === 'error'
                                ? 'bg-red-50 text-red-900 border border-red-200'
                                : 'bg-gray-50 text-gray-900'
                            }`}>
                              <div className="text-sm">
                                {message.type === 'user' ? message.content : formatMessage(message.content)}
                              </div>
                              {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.suggestions.map((suggestion, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="block w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {message.confidence && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Confianza: {Math.round(message.confidence * 100)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
                
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-4 py-3 rounded-lg bg-gray-50">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div className="border-t border-gray-100 p-4 sticky bottom-0 bg-white shadow-md">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      aria-label="Escribe tu mensaje"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Pregunta sobre síntomas, diagnósticos o tratamientos..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm text-gray-900 placeholder-gray-600"
                    />
                  </div>
                  <button
                    aria-label="Enviar mensaje"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isAiThinking}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 flex flex-row flex-wrap gap-2 action-buttons">
                  <button
                    onClick={() => handleSuggestionClick('Analizar síntomas principales')}
                    className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <HeartIcon className="w-3 h-3 mr-1" />
                    Síntomas
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('Sugerir diagnósticos diferenciales')}
                    className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <BeakerIcon className="w-3 h-3 mr-1" />
                    Diagnóstico
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('Revisar tratamientos recomendados')}
                    className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <ClipboardDocumentListIcon className="w-3 h-3 mr-1" />
                    Tratamiento
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sugerencias Activas</h3>
              
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-start">
                        <LightBulbIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-900 text-sm">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LightBulbIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay sugerencias disponibles aún</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Las sugerencias aparecerán conforme se analice la transcripción
                  </p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full p-4 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Clínico</h3>
              
              {/* Clinical Alerts */}
              {clinicalAlerts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-red-700 mb-3">Alertas Clínicas</h4>
                  <div className="space-y-2">
                    {clinicalAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          alert.severity === 'high'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-900'
                        }`}
                      >
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className={`w-5 h-5 mr-2 mt-0.5 ${
                            alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div>
                            <div className="font-medium">{alert.alert}</div>
                            <div className="text-sm opacity-75">Detectado: {alert.keyword}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Transcript Analysis */}
              {finalTranscript && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Análisis de Transcripción</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Palabras totales: {finalTranscript.split(' ').length}</div>
                    <div>Duración estimada: {Math.ceil(finalTranscript.split(' ').length / 150)} min</div>
                    <div>Síntomas detectados: {suggestions.length}</div>
                  </div>
                </div>
              )}
              
              {!finalTranscript && clinicalAlerts.length === 0 && (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay análisis disponible aún</p>
                  <p className="text-gray-400 text-sm mt-2">
                    El análisis aparecerá conforme se desarrolle la consulta
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AIAssistantPanel;