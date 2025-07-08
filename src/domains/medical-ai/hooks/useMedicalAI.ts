/**
 * Medical AI Hook
 * 
 * React hook for medical AI functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { medicalAIService } from '../services/medicalAIService';
import {
  MedicalAnalysis,
  TranscriptionResult,
  MedicalSpecialty,
  MedicalContext,
  UrgencyLevel,
  ServiceResponse
} from '../types';

interface UseMedicalAIProps {
  specialty?: MedicalSpecialty;
  autoAnalysis?: boolean;
  realTimeValidation?: boolean;
}

interface UseMedicalAIReturn {
  // State
  analysis: MedicalAnalysis | null;
  loading: boolean;
  error: string | null;
  suggestions: string[];
  
  // Actions
  analyzeMedicalContent: (transcription: TranscriptionResult, context: MedicalContext) => Promise<void>;
  validateMedicalTerms: (text: string) => Promise<boolean>;
  generateSuggestions: (context: MedicalContext, text: string) => Promise<void>;
  triageAssessment: (context: MedicalContext, symptoms: string[]) => Promise<UrgencyLevel>;
  
  // Utilities
  resetAnalysis: () => void;
  setSpecialty: (specialty: MedicalSpecialty) => void;
}

export const useMedicalAI = (props: UseMedicalAIProps = {}): UseMedicalAIReturn => {
  const {
    specialty = MedicalSpecialty.GENERAL,
    autoAnalysis = false,
    realTimeValidation = false
  } = props;

  // State
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSpecialty, setCurrentSpecialty] = useState<MedicalSpecialty>(specialty);

  // Clear error when specialty changes
  useEffect(() => {
    setError(null);
  }, [currentSpecialty]);

  /**
   * Analyze medical content from transcription
   */
  const analyzeMedicalContent = useCallback(async (
    transcription: TranscriptionResult,
    context: MedicalContext
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalAIService.analyzeMedicalContent(
        transcription,
        { ...context, specialty: currentSpecialty }
      );

      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        setError(response.error || 'Medical analysis failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentSpecialty]);

  /**
   * Validate medical terms in real-time
   */
  const validateMedicalTerms = useCallback(async (text: string): Promise<boolean> => {
    try {
      const response = await medicalAIService.validateMedicalTerms(text, currentSpecialty);
      
      if (response.success && response.data) {
        return response.data.valid;
      }
      
      return false;
    } catch (err) {
      console.error('Medical term validation error:', err);
      return false;
    }
  }, [currentSpecialty]);

  /**
   * Generate contextual medical suggestions
   */
  const generateSuggestions = useCallback(async (
    context: MedicalContext,
    text: string
  ): Promise<void> => {
    try {
      const response = await medicalAIService.generateMedicalSuggestions(
        { ...context, specialty: currentSpecialty },
        text
      );

      if (response.success && response.data) {
        setSuggestions(response.data);
      }
    } catch (err) {
      console.error('Suggestion generation error:', err);
    }
  }, [currentSpecialty]);

  /**
   * Perform triage assessment
   */
  const triageAssessment = useCallback(async (
    context: MedicalContext,
    symptoms: string[]
  ): Promise<UrgencyLevel> => {
    try {
      const response = await medicalAIService.triageAssessment(
        { ...context, specialty: currentSpecialty },
        symptoms
      );

      if (response.success && response.data) {
        return response.data.urgency;
      }
      
      return UrgencyLevel.MEDIUM;
    } catch (err) {
      console.error('Triage assessment error:', err);
      return UrgencyLevel.MEDIUM;
    }
  }, [currentSpecialty]);

  /**
   * Reset analysis state
   */
  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setSuggestions([]);
  }, []);

  /**
   * Set medical specialty
   */
  const setSpecialty = useCallback((newSpecialty: MedicalSpecialty) => {
    setCurrentSpecialty(newSpecialty);
    resetAnalysis();
  }, [resetAnalysis]);

  return {
    // State
    analysis,
    loading,
    error,
    suggestions,
    
    // Actions
    analyzeMedicalContent,
    validateMedicalTerms,
    generateSuggestions,
    triageAssessment,
    
    // Utilities
    resetAnalysis,
    setSpecialty
  };
};

export default useMedicalAI;