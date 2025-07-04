"use client";
import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const usePatientStore = create(
  subscribeWithSelector((set) => ({
    // Current active patient
    activePatient: null,
    
    // Patient medical data
    patientData: {
      vitals: null,
      allergies: [],
      medications: [],
      conditions: [],
      recentLabs: [],
      appointments: []
    },
    
    // Medical AI assistant state
    assistantOpen: false,
    assistantMode: 'general', // 'general' | 'patient-specific' | 'diagnosis' | 'prescription'
    
    // Clinical decision support
    clinicalAlerts: [],
    suggestedActions: [],
    
    // Chat history
    chatHistory: [],
    
    // Actions
    setActivePatient: (patient) => set({ 
      activePatient: patient,
      assistantMode: patient ? 'patient-specific' : 'general'
    }),
    
    setPatientData: (data) => set({ patientData: data }),
    
    toggleAssistant: () => set((state) => ({ assistantOpen: !state.assistantOpen })),
    
    setAssistantMode: (mode) => set({ assistantMode: mode }),
    
    addClinicalAlert: (alert) => set((state) => ({
      clinicalAlerts: [...state.clinicalAlerts, {
        id: Date.now(),
        timestamp: new Date(),
        ...alert
      }]
    })),
    
    removeClinicalAlert: (id) => set((state) => ({
      clinicalAlerts: state.clinicalAlerts.filter(alert => alert.id !== id)
    })),
    
    setSuggestedActions: (actions) => set({ suggestedActions: actions }),
    
    addChatMessage: (message) => set((state) => ({
      chatHistory: [...state.chatHistory, {
        id: Date.now(),
        timestamp: new Date(),
        ...message
      }]
    })),
    
    clearChatHistory: () => set({ chatHistory: [] }),
    
    // Medical utilities
    getDrugInteractions: (medications) => {
      // Mock drug interaction checking
      const interactions = [];
      if (medications.includes('warfarin') && medications.includes('aspirin')) {
        interactions.push({
          severity: 'high',
          drugs: ['warfarin', 'aspirin'],
          description: 'Increased bleeding risk',
          recommendation: 'Monitor INR closely'
        });
      }
      return interactions;
    },
    
    getICD10Suggestions: (symptoms) => {
      // Mock ICD-10 code suggestions
      const suggestions = [];
      if (symptoms.includes('chest pain')) {
        suggestions.push({
          code: 'R06.02',
          description: 'Shortness of breath',
          confidence: 0.85
        });
      }
      return suggestions;
    },
    
    generateDifferentialDiagnosis: (symptoms) => {
      // Mock differential diagnosis generator
      const diagnoses = [];
      if (symptoms.includes('chest pain')) {
        diagnoses.push(
          { diagnosis: 'Myocardial Infarction', probability: 0.25, urgency: 'high' },
          { diagnosis: 'Angina Pectoris', probability: 0.35, urgency: 'medium' },
          { diagnosis: 'Gastroesophageal Reflux', probability: 0.20, urgency: 'low' }
        );
      }
      return diagnoses;
    }
  }))
);

const PatientContext = createContext();

export function PatientContextProvider({ children }) {
  const store = usePatientStore();
  
  useEffect(() => {
    // Set up keyboard shortcuts
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        store.toggleAssistant();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [store]);
  
  useEffect(() => {
    // Subscribe to patient changes to generate clinical alerts
    const unsubscribe = usePatientStore.subscribe(
      (state) => state.activePatient,
      (activePatient) => {
        if (activePatient) {
          // Generate contextual alerts based on patient
          setTimeout(() => {
            store.addClinicalAlert({
              type: 'info',
              title: 'Patient Context Loaded',
              message: `Medical AI assistant is now optimized for ${activePatient.name}`,
              priority: 'low'
            });
          }, 1000);
        }
      }
    );
    
    return unsubscribe;
  }, [store]);
  
  return (
    <PatientContext.Provider value={store}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatientContext() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within PatientContextProvider');
  }
  return context;
}

// Hook for medical utilities
export function useMedicalUtils() {
  const store = usePatientStore();
  
  return {
    checkDrugInteractions: store.getDrugInteractions,
    getICD10Suggestions: store.getICD10Suggestions,
    generateDifferentialDiagnosis: store.generateDifferentialDiagnosis,
    
    // Clinical calculators
    calculateBMI: (weight, height) => {
      return (weight / (height * height)).toFixed(1);
    },
    
    calculateCreatinineClearance: (age, weight, creatinine, gender) => {
      const multiplier = gender === 'female' ? 0.85 : 1;
      return (((140 - age) * weight) / (72 * creatinine)) * multiplier;
    },
    
    calculateCHADS2Score: (age, chf, hypertension, diabetes, stroke) => {
      let score = 0;
      if (age >= 75) score += 1;
      if (chf) score += 1;
      if (hypertension) score += 1;
      if (diabetes) score += 1;
      if (stroke) score += 2;
      return score;
    }
  };
}