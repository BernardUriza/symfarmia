"use client";
import { usePatientContext } from '../../app/providers/PatientContextProvider';
import { mockPatients } from '../data/medicalMockData';

// Hook to load mock patient data for demo purposes
export const useMockPatient = () => {
  const { setActivePatient, setPatientData, setSuggestedActions } = usePatientContext();
  
  const loadMockPatient = (patientId = 'p001') => {
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) return;
    
    // Set active patient
    setActivePatient(patient);
    
    // Set patient medical data
    setPatientData({
      vitals: patient.vitals[0],
      allergies: patient.allergies,
      medications: patient.medications,
      conditions: patient.conditions,
      recentLabs: patient.labs,
      appointments: patient.visits
    });
    
    // Generate contextual suggestions
    const suggestions = [];
    
    // Check for drug interactions
    if (patient.medications.length > 1) {
      suggestions.push({
        title: 'Check Drug Interactions',
        command: '/check interactions',
        priority: 'high'
      });
    }
    
    // Check for diabetes management
    if (patient.conditions.some(c => c.name.includes('Diabetes'))) {
      suggestions.push({
        title: 'Review Diabetes Management',
        command: '/diabetes review',
        priority: 'medium'
      });
    }
    
    // Check for hypertension management
    if (patient.conditions.some(c => c.name.includes('Hypertension'))) {
      suggestions.push({
        title: 'Assess Blood Pressure Control',
        command: '/analyze vitals',
        priority: 'medium'
      });
    }
    
    // Check for recent labs
    if (patient.labs && patient.labs.length > 0) {
      suggestions.push({
        title: 'Review Recent Lab Results',
        command: '/review labs',
        priority: 'low'
      });
    }
    
    setSuggestedActions(suggestions);
  };
  
  const clearMockPatient = () => {
    setActivePatient(null);
    setPatientData({
      vitals: null,
      allergies: [],
      medications: [],
      conditions: [],
      recentLabs: [],
      appointments: []
    });
    setSuggestedActions([]);
  };
  
  return {
    loadMockPatient,
    clearMockPatient,
    mockPatients
  };
};