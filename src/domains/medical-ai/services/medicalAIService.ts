/**
 * Medical AI Service
 * 
 * Core service for medical AI analysis and processing
 */

import {
  MedicalAnalysis,
  TranscriptionResult,
  MedicalSpecialty,
  MedicalContext,
  UrgencyLevel,
  ConfidenceLevel,
  ServiceResponse,
  MedicalAIServiceConfig,
  MedicalAIError
} from '../types';

export class MedicalAIService {
  private config: MedicalAIServiceConfig;
  private activeSpecialty: MedicalSpecialty = MedicalSpecialty.GENERAL;

  constructor(config: MedicalAIServiceConfig) {
    this.config = config;
  }

  /**
   * Analyze medical transcription for clinical insights
   */
  async analyzeMedicalContent(
    transcription: TranscriptionResult,
    context: MedicalContext
  ): Promise<ServiceResponse<MedicalAnalysis>> {
    try {
      // Set specialty context
      this.activeSpecialty = context.specialty;

      // Extract medical insights
      const analysis = await this.performMedicalAnalysis(transcription, context);
      
      // Calculate confidence levels
      const confidence = this.calculateConfidence(analysis, transcription);
      
      // Assess urgency level
      const urgencyLevel = this.assessUrgencyLevel(analysis);

      const medicalAnalysis: MedicalAnalysis = {
        patientId: context.patientId,
        consultationId: context.consultationId,
        analysis: {
          symptoms: analysis.symptoms,
          potentialDiagnoses: analysis.diagnoses,
          recommendedActions: analysis.actions,
          urgencyLevel,
          specialty: this.activeSpecialty
        },
        confidence,
        timestamp: new Date(),
        aiModel: this.config.medicalModel,
        medicalContext: context
      };

      return {
        success: true,
        data: medicalAnalysis,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Medical analysis failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Perform real-time medical validation
   */
  async validateMedicalTerms(
    text: string,
    specialty: MedicalSpecialty
  ): Promise<ServiceResponse<{ valid: boolean; suggestions: string[] }>> {
    try {
      const medicalTerms = this.extractMedicalTerms(text);
      const validationResults = await this.validateTerms(medicalTerms, specialty);
      
      return {
        success: true,
        data: validationResults,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Medical validation failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate medical suggestions based on context
   */
  async generateMedicalSuggestions(
    context: MedicalContext,
    currentText: string
  ): Promise<ServiceResponse<string[]>> {
    try {
      const suggestions = await this.generateContextualSuggestions(context, currentText);
      
      return {
        success: true,
        data: suggestions,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Suggestion generation failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Assess patient triage for emergency consultations
   */
  async triageAssessment(
    patientData: MedicalContext,
    symptoms: string[]
  ): Promise<ServiceResponse<{ urgency: UrgencyLevel; reasoning: string }>> {
    try {
      const urgencyLevel = this.calculateTriageUrgency(symptoms, patientData);
      const reasoning = this.generateTriageReasoning(symptoms, urgencyLevel);
      
      return {
        success: true,
        data: { urgency: urgencyLevel, reasoning },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Triage assessment failed',
        timestamp: new Date()
      };
    }
  }

  // Private methods
  private async performMedicalAnalysis(
    transcription: TranscriptionResult,
    context: MedicalContext
  ): Promise<{
    symptoms: string[];
    diagnoses: string[];
    actions: string[];
  }> {
    // Simulate medical AI analysis
    // In real implementation, this would call the actual AI service
    const text = transcription.text.toLowerCase();
    
    const symptoms = this.extractSymptoms(text);
    const diagnoses = this.suggestDiagnoses(symptoms, context);
    const actions = this.recommendActions(symptoms, diagnoses, context);

    return { symptoms, diagnoses, actions };
  }

  private calculateConfidence(
    analysis: any,
    transcription: TranscriptionResult
  ): ConfidenceLevel {
    return {
      overall: this.calculateOverallConfidence(analysis, transcription),
      transcription: transcription.confidence,
      medicalAnalysis: this.calculateAnalysisConfidence(analysis),
      termRecognition: this.calculateTermRecognitionConfidence(transcription),
      contextAccuracy: this.calculateContextAccuracy(analysis)
    };
  }

  private assessUrgencyLevel(analysis: any): UrgencyLevel {
    // Emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'critical', 'severe pain', 'bleeding'];
    const highUrgencyKeywords = ['pain', 'fever', 'difficulty breathing'];
    
    const text = JSON.stringify(analysis).toLowerCase();
    
    if (emergencyKeywords.some(keyword => text.includes(keyword))) {
      return UrgencyLevel.CRITICAL;
    }
    
    if (highUrgencyKeywords.some(keyword => text.includes(keyword))) {
      return UrgencyLevel.HIGH;
    }
    
    return UrgencyLevel.MEDIUM;
  }

  private extractMedicalTerms(text: string): string[] {
    // Medical term extraction logic
    const medicalTerms = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple medical term detection (expand with actual medical dictionary)
    const commonMedicalTerms = [
      'hypertension', 'diabetes', 'medication', 'symptoms', 'diagnosis',
      'treatment', 'fever', 'pain', 'nausea', 'headache', 'chest pain'
    ];
    
    for (const word of words) {
      if (commonMedicalTerms.includes(word)) {
        medicalTerms.push(word);
      }
    }
    
    return medicalTerms;
  }

  private async validateTerms(
    terms: string[],
    specialty: MedicalSpecialty
  ): Promise<{ valid: boolean; suggestions: string[] }> {
    // Medical term validation logic
    const validTerms = terms.filter(term => this.isValidMedicalTerm(term, specialty));
    const suggestions = this.generateTermSuggestions(terms, specialty);
    
    return {
      valid: validTerms.length === terms.length,
      suggestions
    };
  }

  private async generateContextualSuggestions(
    context: MedicalContext,
    currentText: string
  ): Promise<string[]> {
    // Generate suggestions based on medical context
    const suggestions = [];
    
    if (context.specialty === MedicalSpecialty.CARDIOLOGY) {
      suggestions.push('blood pressure', 'heart rate', 'chest pain', 'ECG');
    } else if (context.specialty === MedicalSpecialty.PEDIATRICS) {
      suggestions.push('growth chart', 'vaccination', 'development', 'fever');
    }
    
    return suggestions;
  }

  private calculateTriageUrgency(
    symptoms: string[],
    patientData: MedicalContext
  ): UrgencyLevel {
    // Triage calculation logic
    let urgencyScore = 0;
    
    const criticalSymptoms = ['chest pain', 'difficulty breathing', 'severe bleeding'];
    const highUrgencySymptoms = ['severe pain', 'high fever', 'vomiting'];
    
    for (const symptom of symptoms) {
      if (criticalSymptoms.some(critical => symptom.toLowerCase().includes(critical))) {
        urgencyScore += 3;
      } else if (highUrgencySymptoms.some(high => symptom.toLowerCase().includes(high))) {
        urgencyScore += 2;
      } else {
        urgencyScore += 1;
      }
    }
    
    if (urgencyScore >= 6) return UrgencyLevel.CRITICAL;
    if (urgencyScore >= 4) return UrgencyLevel.HIGH;
    if (urgencyScore >= 2) return UrgencyLevel.MEDIUM;
    return UrgencyLevel.LOW;
  }

  private generateTriageReasoning(symptoms: string[], urgency: UrgencyLevel): string {
    return `Based on reported symptoms: ${symptoms.join(', ')}. Urgency level: ${urgency}`;
  }

  private extractSymptoms(text: string): string[] {
    // Extract symptoms from text
    const symptoms = [];
    const commonSymptoms = [
      'fever', 'headache', 'nausea', 'vomiting', 'dizziness', 'fatigue',
      'chest pain', 'abdominal pain', 'back pain', 'difficulty breathing'
    ];
    
    for (const symptom of commonSymptoms) {
      if (text.includes(symptom)) {
        symptoms.push(symptom);
      }
    }
    
    return symptoms;
  }

  private suggestDiagnoses(symptoms: string[], context: MedicalContext): string[] {
    // Generate potential diagnoses
    const diagnoses = [];
    
    if (symptoms.includes('fever') && symptoms.includes('headache')) {
      diagnoses.push('viral infection', 'influenza');
    }
    
    if (symptoms.includes('chest pain')) {
      diagnoses.push('cardiac evaluation needed');
    }
    
    return diagnoses;
  }

  private recommendActions(
    symptoms: string[],
    diagnoses: string[],
    context: MedicalContext
  ): string[] {
    // Generate recommended actions
    const actions = [];
    
    if (symptoms.includes('fever')) {
      actions.push('monitor temperature', 'increase fluid intake');
    }
    
    if (symptoms.includes('chest pain')) {
      actions.push('immediate cardiac evaluation', 'ECG recommended');
    }
    
    return actions;
  }

  // Helper methods
  private calculateOverallConfidence(analysis: any, transcription: TranscriptionResult): number {
    return (transcription.confidence + 0.8) / 2; // Simplified calculation
  }

  private calculateAnalysisConfidence(analysis: any): number {
    return 0.85; // Simplified confidence calculation
  }

  private calculateTermRecognitionConfidence(transcription: TranscriptionResult): number {
    return transcription.medicalTerms.length > 0 ? 0.9 : 0.6;
  }

  private calculateContextAccuracy(analysis: any): number {
    return 0.8; // Simplified accuracy calculation
  }

  private isValidMedicalTerm(term: string, specialty: MedicalSpecialty): boolean {
    // Medical term validation logic
    return term.length > 3; // Simplified validation
  }

  private generateTermSuggestions(terms: string[], specialty: MedicalSpecialty): string[] {
    // Generate term suggestions
    return terms.map(term => `${term} (suggested correction)`);
  }
}

// Export singleton instance
export const medicalAIService = new MedicalAIService({
  apiKey: process.env.MEDICAL_AI_API_KEY || '',
  baseUrl: process.env.MEDICAL_AI_BASE_URL || '',
  timeout: 30000,
  retries: 3,
  medicalModel: 'medical-gpt-4',
  specialty: MedicalSpecialty.GENERAL
});