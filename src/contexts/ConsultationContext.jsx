import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Consultation session state
const initialState = {
  // Session management
  sessionId: null,
  isActive: false,
  startTime: null,
  duration: 0,
  
  // Recording state
  isRecording: false,
  isPaused: false,
  audioBlob: null,
  
  // Transcription
  liveTranscript: '',
  finalTranscript: '',
  isTranscribing: false,
  confidence: 0,
  
  // AI Assistant
  aiMode: 'advanced', // 'basic' | 'advanced' | 'silent'
  aiMessages: [],
  aiSuggestions: [],
  isAiThinking: false,
  
  // Medical context
  patientContext: null,
  medicalHistory: [],
  currentSymptoms: [],
  vitalSigns: {},
  
  // SOAP Generation
  soapNotes: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  },
  isGeneratingSOAP: false,
  
  // Documentation
  exportFormat: 'pdf',
  documentReady: false,
  
  // Analytics
  interactionEvents: []
};

// Action types
const ACTIONS = {
  // Session
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  UPDATE_DURATION: 'UPDATE_DURATION',
  
  // Recording
  START_RECORDING: 'START_RECORDING',
  STOP_RECORDING: 'STOP_RECORDING',
  PAUSE_RECORDING: 'PAUSE_RECORDING',
  RESUME_RECORDING: 'RESUME_RECORDING',
  SET_AUDIO_BLOB: 'SET_AUDIO_BLOB',
  
  // Transcription
  UPDATE_LIVE_TRANSCRIPT: 'UPDATE_LIVE_TRANSCRIPT',
  FINALIZE_TRANSCRIPT: 'FINALIZE_TRANSCRIPT',
  SET_TRANSCRIBING: 'SET_TRANSCRIBING',
  SET_CONFIDENCE: 'SET_CONFIDENCE',
  
  // AI Assistant
  SET_AI_MODE: 'SET_AI_MODE',
  ADD_AI_MESSAGE: 'ADD_AI_MESSAGE',
  SET_AI_THINKING: 'SET_AI_THINKING',
  UPDATE_AI_SUGGESTIONS: 'UPDATE_AI_SUGGESTIONS',
  
  // Medical context
  SET_PATIENT_CONTEXT: 'SET_PATIENT_CONTEXT',
  ADD_SYMPTOM: 'ADD_SYMPTOM',
  UPDATE_VITAL_SIGNS: 'UPDATE_VITAL_SIGNS',
  
  // SOAP
  UPDATE_SOAP_SECTION: 'UPDATE_SOAP_SECTION',
  SET_GENERATING_SOAP: 'SET_GENERATING_SOAP',
  
  // Analytics
  LOG_EVENT: 'LOG_EVENT'
};

// Reducer
function consultationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        isActive: true,
        startTime: new Date(),
        interactionEvents: [{
          type: 'session_started',
          timestamp: new Date(),
          data: action.payload
        }]
      };
      
    case ACTIONS.END_SESSION:
      return {
        ...state,
        isActive: false,
        isRecording: false,
        interactionEvents: [...state.interactionEvents, {
          type: 'session_ended',
          timestamp: new Date(),
          duration: state.duration
        }]
      };
      
    case ACTIONS.UPDATE_DURATION:
      return {
        ...state,
        duration: action.payload
      };
      
    case ACTIONS.START_RECORDING:
      return {
        ...state,
        isRecording: true,
        isPaused: false,
        interactionEvents: [...state.interactionEvents, {
          type: 'recording_started',
          timestamp: new Date()
        }]
      };
      
    case ACTIONS.STOP_RECORDING:
      return {
        ...state,
        isRecording: false,
        isPaused: false,
        interactionEvents: [...state.interactionEvents, {
          type: 'recording_stopped',
          timestamp: new Date(),
          duration: action.payload?.duration
        }]
      };
      
    case ACTIONS.UPDATE_LIVE_TRANSCRIPT:
      return {
        ...state,
        liveTranscript: action.payload.text,
        confidence: action.payload.confidence || state.confidence
      };
      
    case ACTIONS.FINALIZE_TRANSCRIPT:
      return {
        ...state,
        finalTranscript: state.finalTranscript + ' ' + action.payload,
        liveTranscript: ''
      };
      
    case ACTIONS.SET_AI_MODE:
      return {
        ...state,
        aiMode: action.payload,
        interactionEvents: [...state.interactionEvents, {
          type: 'ai_mode_changed',
          timestamp: new Date(),
          mode: action.payload
        }]
      };
      
    case ACTIONS.ADD_AI_MESSAGE:
      return {
        ...state,
        aiMessages: [...state.aiMessages, {
          id: Date.now(),
          ...action.payload,
          timestamp: new Date()
        }]
      };
      
    case ACTIONS.SET_AI_THINKING:
      return {
        ...state,
        isAiThinking: action.payload
      };
      
    case ACTIONS.UPDATE_AI_SUGGESTIONS:
      return {
        ...state,
        aiSuggestions: action.payload
      };
      
    case ACTIONS.UPDATE_SOAP_SECTION:
      return {
        ...state,
        soapNotes: {
          ...state.soapNotes,
          [action.payload.section]: action.payload.content
        }
      };
      
    case ACTIONS.SET_GENERATING_SOAP:
      return {
        ...state,
        isGeneratingSOAP: action.payload
      };
      
    case ACTIONS.LOG_EVENT:
      return {
        ...state,
        interactionEvents: [...state.interactionEvents, {
          timestamp: new Date(),
          ...action.payload
        }]
      };
      
    default:
      return state;
  }
}

// Context
const ConsultationContext = createContext();

// Provider component
export function ConsultationProvider({ children }) {
  const [state, dispatch] = useReducer(consultationReducer, initialState);
  
  // Session management
  const startSession = useCallback((patientContext = null) => {
    const sessionId = `session_${Date.now()}`;
    dispatch({
      type: ACTIONS.START_SESSION,
      payload: { sessionId, patientContext }
    });
    
    if (patientContext) {
      dispatch({
        type: ACTIONS.SET_PATIENT_CONTEXT,
        payload: patientContext
      });
    }
  }, []);
  
  const endSession = useCallback(() => {
    dispatch({ type: ACTIONS.END_SESSION });
  }, []);
  
  // Recording controls
  const startRecording = useCallback(() => {
    dispatch({ type: ACTIONS.START_RECORDING });
  }, []);
  
  const stopRecording = useCallback((duration) => {
    dispatch({ 
      type: ACTIONS.STOP_RECORDING,
      payload: { duration }
    });
  }, []);
  
  // Transcription updates
  const updateLiveTranscript = useCallback((text, confidence) => {
    dispatch({
      type: ACTIONS.UPDATE_LIVE_TRANSCRIPT,
      payload: { text, confidence }
    });
  }, []);
  
  const finalizeTranscript = useCallback((text) => {
    dispatch({
      type: ACTIONS.FINALIZE_TRANSCRIPT,
      payload: text
    });
  }, []);
  
  // AI Assistant
  const setAiMode = useCallback((mode) => {
    dispatch({
      type: ACTIONS.SET_AI_MODE,
      payload: mode
    });
  }, []);
  
  const addAiMessage = useCallback((message) => {
    dispatch({
      type: ACTIONS.ADD_AI_MESSAGE,
      payload: message
    });
  }, []);
  
  const updateSoapSection = useCallback((section, content) => {
    dispatch({
      type: ACTIONS.UPDATE_SOAP_SECTION,
      payload: { section, content }
    });
  }, []);
  
  // Analytics
  const logEvent = useCallback((eventType, data = {}) => {
    dispatch({
      type: ACTIONS.LOG_EVENT,
      payload: { type: eventType, data }
    });
  }, []);
  
  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    startSession,
    endSession,
    startRecording,
    stopRecording,
    updateLiveTranscript,
    finalizeTranscript,
    setAiMode,
    addAiMessage,
    updateSoapSection,
    logEvent,
    
    // Computed values
    hasTranscript: state.finalTranscript.length > 0 || state.liveTranscript.length > 0,
    sessionDuration: state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0,
    isAdvancedMode: state.aiMode === 'advanced',
    canExport: state.documentReady || state.finalTranscript.length > 0
  };
  
  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

// Hook
export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
}

export { ACTIONS };