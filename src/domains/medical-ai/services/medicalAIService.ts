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
  SOAPNotes
} from '../types';

export class MedicalAIService {
  private config: MedicalAIServiceConfig;
  private activeSpecialty: MedicalSpecialty = 'general';

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
      const confidenceLevel = this.calculateConfidence(analysis, transcription);
      const confidence = this.calculateOverallConfidence(analysis, transcription);
      
      // Assess urgency level
      const urgencyLevel = this.assessUrgencyLevel(analysis);

      const medicalAnalysis: MedicalAnalysis = {
        id: `analysis-${Date.now()}`,
        patientId: context.patientId,
        transcriptionId: transcription.id || `trans-${Date.now()}`,
        consultationId: context.consultationId,
        chiefComplaint: analysis.chiefComplaint || 'Not specified',
        symptoms: analysis.symptoms?.map((s: string) => ({
          name: s,
          severity: 'moderate' as const,
          duration: 'unknown',
          onset: 'unknown'
        })) || [],
        diagnoses: analysis.diagnoses?.map((d: string) => ({
          code: `D-${Date.now()}`,
          description: d,
          confidence: ConfidenceLevel.MEDIUM,
          icd10Code: undefined
        })) || [],
        recommendations: analysis.actions || [],
        urgencyLevel,
        confidenceLevel,
        confidence,
        analysis: {
          symptoms: analysis.symptoms,
          potentialDiagnoses: analysis.diagnoses,
          recommendedActions: analysis.actions,
          urgencyLevel,
          specialty: this.activeSpecialty
        },
        createdAt: new Date(),
        createdBy: 'system',
        isVerified: false,
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
    chiefComplaint: string;
  }> {
    // Simulate medical AI analysis
    // In real implementation, this would call the actual AI service
    const text = transcription.text.toLowerCase();
    
    const symptoms = this.extractSymptoms(text);
    const diagnoses = this.suggestDiagnoses(symptoms, context);
    const actions = this.recommendActions(symptoms, diagnoses, context);

    const chiefComplaint = this.extractChiefComplaint(text) || 'General consultation';
    
    return { symptoms, diagnoses, actions, chiefComplaint };
  }

  private calculateConfidence(
    analysis: any,
    transcription: TranscriptionResult
  ): ConfidenceLevel {
    const overall = this.calculateOverallConfidence(analysis, transcription);
    
    if (overall >= 0.8) return ConfidenceLevel.HIGH;
    if (overall >= 0.6) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.LOW;
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
      return UrgencyLevel.URGENT;
    }
    
    return UrgencyLevel.URGENT;
  }

  private extractChiefComplaint(text: string): string {
    // Extract the main complaint from the text
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.trim() || 'General consultation';
  }

  private extractMedicalTerms(text: string): string[] {
    // Medical term extraction logic
    const medicalTerms: string[] = [];
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
    _currentText: string
  ): Promise<string[]> {
    // Generate suggestions based on medical context
    const suggestions: string[] = [];
    
    if (context.specialty === 'cardiology') {
      suggestions.push('blood pressure', 'heart rate', 'chest pain', 'ECG');
    } else if (context.specialty === 'pediatrics') {
      suggestions.push('growth chart', 'vaccination', 'development', 'fever');
    }
    
    return suggestions;
  }

  private calculateTriageUrgency(
    symptoms: string[],
    _patientData: MedicalContext
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
    if (urgencyScore >= 4) return UrgencyLevel.EMERGENCY;
    if (urgencyScore >= 2) return UrgencyLevel.URGENT;
    return UrgencyLevel.ROUTINE;
  }

  private generateTriageReasoning(symptoms: string[], urgency: UrgencyLevel): string {
    return `Based on reported symptoms: ${symptoms.join(', ')}. Urgency level: ${urgency}`;
  }

  private extractSymptoms(text: string): string[] {
    // Extract symptoms from text
    const symptoms: string[] = [];
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

  private suggestDiagnoses(symptoms: string[], _context: MedicalContext): string[] {
    // Generate potential diagnoses
    const diagnoses: string[] = [];
    
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
    _diagnoses: string[],
    _context: MedicalContext
  ): string[] {
    // Generate recommended actions
    const actions: string[] = [];
    
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

  private calculateAnalysisConfidence(_analysis: any): number {
    return 0.85; // Simplified confidence calculation
  }

  private calculateTermRecognitionConfidence(transcription: TranscriptionResult): number {
    return transcription.medicalTerms.length > 0 ? 0.9 : 0.6;
  }

  private calculateContextAccuracy(_analysis: any): number {
    return 0.8; // Simplified accuracy calculation
  }

  private isValidMedicalTerm(term: string, _specialty: MedicalSpecialty): boolean {
    // Medical term validation logic
    return term.length > 3; // Simplified validation
  }

  private generateTermSuggestions(terms: string[], _specialty: MedicalSpecialty): string[] {
    // Generate term suggestions
    return terms.map(term => `${term} (suggested correction)`);
  }

  /**
   * Generate SOAP notes from transcript text using existing OpenAI endpoint
   */
  async generateSOAPNotes(text: string): Promise<ServiceResponse<SOAPNotes>> {
    try {
      const response = await fetch('/api/medical-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, type: 'soap' })
      });

      if (!response.ok) {
        throw new Error('SOAP generation failed');
      }

      const data = await response.json();
      const notes = this.parseSOAP(data.response);
      return { success: true, data: notes, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SOAP generation failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Basic SOAP text parser
   */
  private parseSOAP(text: string): SOAPNotes {
    const sections: SOAPNotes = { subjective: '', objective: '', assessment: '', plan: '' };

    const subj = text.match(/(?:SUBJETIVO|Subjective)[:\-]\s*(.+?)(?=\n\s*(?:OBJETIVO|Objective|An[aá]lisis|Assessment|PLAN|Plan|$))/is);
    const obj = text.match(/(?:OBJETIVO|Objective)[:\-]\s*(.+?)(?=\n\s*(?:An[aá]lisis|Assessment|PLAN|Plan|$))/is);
    const ass = text.match(/(?:An[aá]lisis|Assessment)[:\-]\s*(.+?)(?=\n\s*(?:PLAN|Plan|$))/is);
    const plan = text.match(/(?:PLAN|Plan)[:\-]\s*(.+)/is);

    if (subj) sections.subjective = subj[1].trim();
    if (obj) sections.objective = obj[1].trim();
    if (ass) sections.assessment = ass[1].trim();
    if (plan) sections.plan = plan[1].trim();

    return sections;
  }
}

// Export singleton instance
export const medicalAIService = new MedicalAIService({
  apiKey: process.env.MEDICAL_AI_API_KEY || '',
  baseUrl: process.env.MEDICAL_AI_BASE_URL || '',
  model: 'gpt-4',
  language: 'es',
  medicalMode: true,
  medicalModel: 'medical-gpt-4',
  maxRetries: 3,
  retries: 3,
  timeout: 30000,
  enableCache: true,
  hipaaCompliant: true,
  encryptionEnabled: true,
  auditLogging: true,
  specialty: 'general'
});