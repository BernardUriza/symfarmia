/**
 * General Medicine Demo Strategy
 * 
 * Strategy for general medicine consultations and scenarios
 */

import {
  DemoStrategy,
  DemoInput,
  DemoResult,
  DemoValidationResult,
  DemoState,
  DemoStep,
  DemoMedicalContext,
  DemoMedicalAnalysis
} from '../types';

export class GeneralMedicineStrategy implements DemoStrategy {
  id = 'general-medicine';
  name = 'Medicina General';
  description = 'Consulta de medicina general con síntomas comunes';
  specialty = 'general';
  difficulty = 'easy' as const;
  estimatedDuration = 900; // 15 minutes

  medicalContext: DemoMedicalContext = {
    specialty: 'general',
    commonSymptoms: [
      'dolor de cabeza',
      'fiebre',
      'tos',
      'dolor de garganta',
      'fatiga',
      'náuseas',
      'dolor abdominal',
      'mareos',
      'dolor muscular',
      'congestión nasal'
    ],
    typicalDiagnoses: [
      'infección viral',
      'gripe',
      'resfriado común',
      'gastroenteritis',
      'cefalea tensional',
      'faringitis',
      'bronquitis',
      'sinusitis',
      'hipertensión',
      'diabetes'
    ],
    standardProcedures: [
      'toma de signos vitales',
      'examen físico general',
      'auscultación',
      'palpación abdominal',
      'revisión de garganta',
      'medición de presión arterial',
      'análisis de sangre básico',
      'prueba de glucosa',
      'radiografía de tórax'
    ],
    criticalSigns: [
      'fiebre alta (>38.5°C)',
      'dificultad respiratoria',
      'dolor torácico',
      'pérdida de conciencia',
      'sangrado abundante',
      'presión arterial muy alta',
      'glucosa muy elevada'
    ],
    urgencyIndicators: [
      'dolor intenso',
      'síntomas neurológicos',
      'signos de deshidratación',
      'alteración del estado mental',
      'signos vitales anormales'
    ]
  };

  private currentStep = 0;
  private patientProfile = {
    age: 35,
    gender: 'female' as const,
    chiefComplaint: 'dolor de cabeza y fiebre desde hace 2 días',
    symptoms: ['dolor de cabeza', 'fiebre', 'fatiga', 'dolor muscular'],
    vitalSigns: {
      temperature: 38.2,
      bloodPressure: '120/80',
      heartRate: 88,
      respiratoryRate: 16
    }
  };

  async execute(input: DemoInput): Promise<DemoResult> {
    const userInput = input.userInput.toLowerCase();
    const timestamp = new Date();
    
    // Analyze user input for medical content
    const medicalAnalysis = this.analyzeMedicalContent(userInput);
    
    // Generate appropriate response based on current step and input
    const response = this.generateResponse(userInput, input.context);
    
    // Calculate confidence based on medical relevance
    const confidence = this.calculateConfidence(userInput, medicalAnalysis);
    
    // Determine next steps
    const nextSteps = this.getNextSteps(userInput, this.currentStep);

    return {
      id: `result-${timestamp.getTime()}`,
      response,
      confidence,
      medicalAnalysis,
      nextSteps,
      metadata: {
        strategyUsed: this.id,
        processingTime: 500 + Math.random() * 1000,
        confidence,
        medicalTermsDetected: this.extractMedicalTerms(userInput).length,
        stepAccuracy: this.calculateStepAccuracy(userInput),
        totalScore: this.calculateTotalScore(medicalAnalysis, confidence)
      },
      timestamp
    };
  }

  validate(input: DemoInput): DemoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!input.userInput || input.userInput.trim().length === 0) {
      errors.push('Se requiere entrada de texto');
    }

    if (input.userInput.length < 5) {
      warnings.push('La entrada es muy corta para un análisis médico significativo');
      suggestions.push('Intente proporcionar más detalles sobre los síntomas');
    }

    const medicalTerms = this.extractMedicalTerms(input.userInput);
    if (medicalTerms.length === 0) {
      warnings.push('No se detectaron términos médicos relevantes');
      suggestions.push('Considere incluir síntomas, signos vitales o procedimientos médicos');
    }

    const confidence = errors.length === 0 ? 0.8 : 0.2;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }

  getNextStep(currentState: DemoState): DemoStep {
    const steps: DemoStep[] = [
      {
        id: 'chief-complaint',
        type: 'question',
        title: 'Motivo de consulta',
        description: 'Preguntar al paciente sobre el motivo principal de su visita',
        expectedInput: ['dolor', 'síntoma', 'molestia', 'problema'],
        validResponses: ['¿Cuál es el motivo de su consulta?', '¿Qué la trae por aquí hoy?'],
        points: 10,
        isRequired: true,
        hints: ['Comience con una pregunta abierta sobre el motivo de consulta']
      },
      {
        id: 'symptom-history',
        type: 'question',
        title: 'Historia de síntomas',
        description: 'Obtener detalles sobre los síntomas actuales',
        expectedInput: ['cuándo', 'tiempo', 'duración', 'intensidad'],
        validResponses: ['¿Cuándo comenzaron los síntomas?', '¿Cómo describiría el dolor?'],
        points: 15,
        isRequired: true,
        hints: ['Pregunte sobre inicio, duración, intensidad y factores que mejoran/empeoran']
      },
      {
        id: 'vital-signs',
        type: 'examination',
        title: 'Signos vitales',
        description: 'Tomar y evaluar los signos vitales del paciente',
        expectedInput: ['presión', 'temperatura', 'pulso', 'signos vitales'],
        validResponses: ['Voy a tomar sus signos vitales', 'Revisemos su presión arterial'],
        points: 20,
        isRequired: true,
        hints: ['Los signos vitales son fundamentales en cualquier evaluación médica']
      },
      {
        id: 'physical-exam',
        type: 'examination',
        title: 'Examen físico',
        description: 'Realizar examen físico dirigido',
        expectedInput: ['examen', 'auscultación', 'palpación', 'inspección'],
        validResponses: ['Voy a examinarla', 'Realizaré un examen físico'],
        points: 25,
        isRequired: true,
        hints: ['El examen físico debe ser dirigido según los síntomas reportados']
      },
      {
        id: 'diagnosis',
        type: 'diagnosis',
        title: 'Diagnóstico',
        description: 'Formular diagnóstico diferencial',
        expectedInput: ['diagnóstico', 'creo que', 'posible', 'probable'],
        validResponses: ['Basado en sus síntomas, creo que...', 'El diagnóstico más probable es...'],
        points: 30,
        isRequired: true,
        hints: ['Considere los diagnósticos más comunes que expliquen los síntomas']
      }
    ];

    return steps[Math.min(currentState.currentStep, steps.length - 1)];
  }

  private analyzeMedicalContent(input: string): DemoMedicalAnalysis {
    const symptoms = this.extractSymptoms(input);
    const possibleDiagnoses = this.generateDiagnoses(symptoms);
    const recommendedActions = this.generateActions(symptoms, possibleDiagnoses);
    const urgencyLevel = this.assessUrgency(symptoms);
    
    return {
      symptoms,
      possibleDiagnoses,
      recommendedActions,
      urgencyLevel,
      confidence: this.calculateMedicalConfidence(symptoms, possibleDiagnoses),
      medicalReasoning: this.generateMedicalReasoning(symptoms, possibleDiagnoses)
    };
  }

  private generateResponse(userInput: string, context: any): string {
    const input = userInput.toLowerCase();
    
    // Greetings and initial contact
    if (input.includes('hola') || input.includes('buenos días') || input.includes('buenas tardes')) {
      return 'Buenos días. Soy la doctora García. ¿En qué puedo ayudarla hoy?';
    }
    
    // Chief complaint responses
    if (input.includes('dolor de cabeza') || input.includes('cefalea')) {
      return 'Entiendo que tiene dolor de cabeza. ¿Cuándo comenzó? ¿Puede describir el tipo de dolor?';
    }
    
    if (input.includes('fiebre')) {
      return 'Veo que ha tenido fiebre. Voy a tomar su temperatura. También me gustaría saber desde cuándo tiene fiebre y si ha tomado algún medicamento.';
    }
    
    // Physical examination
    if (input.includes('examen') || input.includes('revisar')) {
      return `Sus signos vitales son: Temperatura: ${this.patientProfile.vitalSigns.temperature}°C, Presión arterial: ${this.patientProfile.vitalSigns.bloodPressure}, Pulso: ${this.patientProfile.vitalSigns.heartRate}. Procederé con el examen físico.`;
    }
    
    // Diagnosis discussion
    if (input.includes('diagnóstico') || input.includes('qué tiene')) {
      return 'Basándome en sus síntomas y el examen físico, creo que tiene un cuadro viral común. Sus síntomas son compatibles con una infección viral de vías respiratorias superiores.';
    }
    
    // Treatment
    if (input.includes('tratamiento') || input.includes('medicamento')) {
      return 'Para el tratamiento, le recomiendo reposo, hidratación abundante, y paracetamol para la fiebre y el dolor. Si los síntomas empeoran o no mejoran en 48 horas, regrese para reevaluación.';
    }
    
    // Default responses based on medical context
    const medicalTerms = this.extractMedicalTerms(userInput);
    if (medicalTerms.length > 0) {
      return `Perfecto, veo que está evaluando ${medicalTerms.join(', ')}. Eso es apropiado para este caso. ¿Qué más le gustaría investigar?`;
    }
    
    return 'Continúe con su evaluación. ¿Qué le gustaría hacer a continuación?';
  }

  private extractSymptoms(input: string): string[] {
    const symptoms: string[] = [];
    const symptomKeywords = this.medicalContext.commonSymptoms;
    
    for (const symptom of symptomKeywords) {
      if (input.toLowerCase().includes(symptom)) {
        symptoms.push(symptom);
      }
    }
    
    return [...new Set(symptoms)]; // Remove duplicates
  }

  private generateDiagnoses(symptoms: string[]): string[] {
    const diagnoses: string[] = [];
    
    if (symptoms.includes('dolor de cabeza') && symptoms.includes('fiebre')) {
      diagnoses.push('infección viral', 'gripe', 'sinusitis');
    }
    
    if (symptoms.includes('tos') && symptoms.includes('fiebre')) {
      diagnoses.push('bronquitis', 'neumonía', 'infección respiratoria');
    }
    
    if (symptoms.includes('dolor abdominal') && symptoms.includes('náuseas')) {
      diagnoses.push('gastroenteritis', 'intoxicación alimentaria');
    }
    
    if (diagnoses.length === 0) {
      diagnoses.push('requiere más evaluación');
    }
    
    return diagnoses;
  }

  private generateActions(symptoms: string[], diagnoses: string[]): string[] {
    const actions: string[] = [];
    
    if (symptoms.includes('fiebre')) {
      actions.push('tomar signos vitales', 'administrar antipirético');
    }
    
    if (symptoms.includes('dolor de cabeza')) {
      actions.push('evaluar signos neurológicos', 'considerar analgésicos');
    }
    
    if (symptoms.includes('tos')) {
      actions.push('auscultación pulmonar', 'considerar radiografía de tórax');
    }
    
    actions.push('monitoreo de síntomas', 'seguimiento en 48 horas');
    
    return actions;
  }

  private assessUrgency(symptoms: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalSymptoms = ['dificultad respiratoria', 'dolor torácico', 'pérdida de conciencia'];
    const highSymptoms = ['fiebre alta', 'dolor intenso', 'sangrado'];
    
    if (symptoms.some(s => criticalSymptoms.some(c => s.includes(c)))) {
      return 'critical';
    }
    
    if (symptoms.some(s => highSymptoms.some(h => s.includes(h)))) {
      return 'high';
    }
    
    if (symptoms.length > 2) {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateConfidence(input: string, analysis: DemoMedicalAnalysis): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for medical terms
    const medicalTerms = this.extractMedicalTerms(input);
    confidence += Math.min(medicalTerms.length * 0.1, 0.3);
    
    // Boost for appropriate symptoms
    confidence += Math.min(analysis.symptoms.length * 0.05, 0.2);
    
    // Ensure confidence is between 0 and 1
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateMedicalConfidence(symptoms: string[], diagnoses: string[]): number {
    if (symptoms.length === 0) return 0.3;
    if (diagnoses.length === 0) return 0.4;
    
    return Math.min(0.6 + (symptoms.length * 0.1) + (diagnoses.length * 0.1), 0.95);
  }

  private generateMedicalReasoning(symptoms: string[], diagnoses: string[]): string {
    if (symptoms.length === 0) {
      return 'Se requiere más información para establecer un diagnóstico.';
    }
    
    return `Paciente presenta ${symptoms.join(', ')}. Los diagnósticos diferenciales incluyen ${diagnoses.join(', ')}. Se recomienda evaluación clínica completa.`;
  }

  private extractMedicalTerms(input: string): string[] {
    const medicalTerms = [
      ...this.medicalContext.commonSymptoms,
      ...this.medicalContext.standardProcedures,
      'paciente', 'síntoma', 'diagnóstico', 'tratamiento', 'medicamento',
      'examen', 'historia clínica', 'signos vitales', 'presión arterial'
    ];
    
    const foundTerms: string[] = [];
    const inputLower = input.toLowerCase();
    
    for (const term of medicalTerms) {
      if (inputLower.includes(term)) {
        foundTerms.push(term);
      }
    }
    
    return [...new Set(foundTerms)];
  }

  private getNextSteps(input: string, currentStep: number): any[] {
    const steps = [
      { type: 'question', description: 'Continuar con la historia clínica' },
      { type: 'examination', description: 'Realizar examen físico' },
      { type: 'diagnosis', description: 'Formular diagnóstico' },
      { type: 'treatment', description: 'Planificar tratamiento' }
    ];
    
    return steps.slice(currentStep, currentStep + 2);
  }

  private calculateStepAccuracy(input: string): number {
    const relevantTerms = this.extractMedicalTerms(input);
    return Math.min(relevantTerms.length / 3, 1.0);
  }

  private calculateTotalScore(analysis: DemoMedicalAnalysis, confidence: number): number {
    return Math.round((analysis.symptoms.length * 10) + (analysis.possibleDiagnoses.length * 15) + (confidence * 50));
  }
}