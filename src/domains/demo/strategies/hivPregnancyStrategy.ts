/**
 * HIV Pregnancy Demo Strategy
 * 
 * Specialized strategy for HIV management during pregnancy scenarios
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

export class HIVPregnancyStrategy implements DemoStrategy {
  id = 'hiv-pregnancy';
  name = 'VIH y Embarazo';
  description = 'Manejo médico especializado de VIH durante el embarazo';
  specialty = 'obstetrics';
  difficulty = 'expert' as const;
  estimatedDuration = 1800; // 30 minutes

  medicalContext: DemoMedicalContext = {
    specialty: 'obstetrics',
    commonSymptoms: [
      'fatiga',
      'náuseas matutinas',
      'dolor abdominal',
      'sangrado vaginal',
      'fiebre',
      'infecciones recurrentes',
      'pérdida de peso',
      'ganglios inflamados',
      'erupciones cutáneas',
      'dificultad respiratoria'
    ],
    typicalDiagnoses: [
      'VIH en embarazo',
      'infecciones oportunistas',
      'anemia gestacional',
      'preeclampsia',
      'parto prematuro',
      'restricción del crecimiento fetal',
      'corioamnionitis',
      'diabetes gestacional'
    ],
    standardProcedures: [
      'carga viral VIH',
      'conteo CD4',
      'ultrasonido obstétrico',
      'monitoreo fetal',
      'pruebas de función hepática',
      'hemograma completo',
      'perfil metabólico',
      'pruebas de infecciones oportunistas',
      'evaluación nutricional',
      'consejería adherencia'
    ],
    criticalSigns: [
      'carga viral elevada (>1000 copias/ml)',
      'CD4 <200 células/μL',
      'fiebre persistente',
      'pérdida de peso significativa',
      'sangrado vaginal abundante',
      'contracciones prematuras',
      'hipertensión severa',
      'proteinuria significativa'
    ],
    urgencyIndicators: [
      'trabajo de parto prematuro',
      'ruptura prematura de membranas',
      'infección activa',
      'deterioro inmunológico',
      'efectos adversos medicamentos',
      'signos de preeclampsia',
      'disminución movimientos fetales'
    ]
  };

  private currentStep = 0;
  private patientProfile = {
    age: 28,
    gestationalAge: 24, // 24 weeks
    hivStatus: 'positive',
    cd4Count: 350,
    viralLoad: 2500,
    artRegimen: 'Efavirenz/Tenofovir/Emtricitabine',
    adherence: 'suboptimal',
    complications: ['anemia leve', 'candidiasis oral'],
    previousPregnancies: 1,
    riskFactors: ['bajo peso', 'tabaquismo previo']
  };

  async execute(input: DemoInput): Promise<DemoResult> {
    const userInput = input.userInput.toLowerCase();
    const timestamp = new Date();
    
    // Analyze medical content with HIV/pregnancy focus
    const medicalAnalysis = this.analyzeMedicalContent(userInput);
    
    // Generate specialized response
    const response = this.generateResponse(userInput, input.context);
    
    // Calculate confidence with expertise weighting
    const confidence = this.calculateConfidence(userInput, medicalAnalysis);
    
    // Determine next clinical steps
    const nextSteps = this.getNextSteps(userInput, this.currentStep);

    return {
      id: `hiv-preg-result-${timestamp.getTime()}`,
      response,
      confidence,
      medicalAnalysis,
      nextSteps,
      metadata: {
        strategyUsed: this.id,
        processingTime: 800 + Math.random() * 1200, // Longer processing for complex case
        confidence,
        medicalTermsDetected: this.extractSpecializedTerms(userInput).length,
        stepAccuracy: this.calculateClinicalAccuracy(userInput),
        totalScore: this.calculateExpertScore(medicalAnalysis, confidence)
      },
      timestamp
    };
  }

  validate(input: DemoInput): DemoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!input.userInput || input.userInput.trim().length === 0) {
      errors.push('Se requiere entrada para casos complejos de VIH y embarazo');
    }

    if (input.userInput.length < 10) {
      warnings.push('Casos de VIH requieren evaluación detallada');
      suggestions.push('Considere aspectos virológicos, inmunológicos y obstétricos');
    }

    const specializedTerms = this.extractSpecializedTerms(input.userInput);
    if (specializedTerms.length === 0) {
      warnings.push('No se detectaron términos especializados en VIH/embarazo');
      suggestions.push('Incluya evaluación de carga viral, CD4, y bienestar fetal');
    }

    // Check for critical safety considerations
    const safetyConcerns = this.checkSafetyConcerns(input.userInput);
    if (safetyConcerns.length > 0) {
      warnings.push('Considere las siguientes precauciones de seguridad');
      suggestions.push(...safetyConcerns);
    }

    const confidence = errors.length === 0 ? 0.9 : 0.3;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }

  getNextStep(currentState: DemoState): DemoStep {
    const expertSteps: DemoStep[] = [
      {
        id: 'hiv-status-review',
        type: 'question',
        title: 'Revisión del estado de VIH',
        description: 'Evaluar estado actual del VIH y adherencia al tratamiento',
        expectedInput: ['carga viral', 'cd4', 'adherencia', 'antirretrovirales'],
        validResponses: ['¿Cuándo fue su última carga viral?', '¿Ha estado tomando sus medicamentos?'],
        points: 25,
        isRequired: true,
        hints: ['La carga viral debe ser indetectable para prevenir transmisión vertical']
      },
      {
        id: 'obstetric-assessment',
        type: 'examination',
        title: 'Evaluación obstétrica',
        description: 'Evaluación completa del embarazo y bienestar fetal',
        expectedInput: ['ultrasonido', 'movimientos fetales', 'crecimiento', 'doppler'],
        validResponses: ['Vamos a revisar cómo está el bebé', 'Necesitamos un ultrasonido'],
        points: 30,
        isRequired: true,
        hints: ['El VIH puede afectar el crecimiento fetal y aumentar riesgo de parto prematuro']
      },
      {
        id: 'opportunistic-screening',
        type: 'procedure',
        title: 'Tamizaje infecciones oportunistas',
        description: 'Descartar infecciones oportunistas en embarazo',
        expectedInput: ['infecciones', 'tuberculosis', 'toxoplasmosis', 'citomegalovirus'],
        validResponses: ['Necesitamos descartar infecciones', 'Haremos pruebas adicionales'],
        points: 35,
        isRequired: true,
        hints: ['El embarazo puede alterar la inmunidad y predisponer a infecciones']
      },
      {
        id: 'art-optimization',
        type: 'treatment',
        title: 'Optimización del tratamiento',
        description: 'Ajustar terapia antirretroviral para embarazo',
        expectedInput: ['medicamentos', 'cambio', 'tratamiento', 'seguridad fetal'],
        validResponses: ['Podríamos necesitar ajustar medicamentos', 'Discutamos su tratamiento'],
        points: 40,
        isRequired: true,
        hints: ['Algunos antirretrovirales están contraindicados en embarazo']
      },
      {
        id: 'delivery-planning',
        type: 'treatment',
        title: 'Planificación del parto',
        description: 'Planificar estrategia de parto para minimizar transmisión',
        expectedInput: ['parto', 'cesárea', 'transmisión', 'profilaxis'],
        validResponses: ['Planeemos su parto', 'Discutamos las opciones de parto'],
        points: 45,
        isRequired: true,
        hints: ['Cesárea electiva si carga viral >1000 copias/ml cerca del parto']
      }
    ];

    return expertSteps[Math.min(currentState.currentStep, expertSteps.length - 1)];
  }

  private analyzeMedicalContent(input: string): DemoMedicalAnalysis {
    const symptoms = this.extractSpecializedSymptoms(input);
    const possibleDiagnoses = this.generateSpecializedDiagnoses(symptoms, input);
    const recommendedActions = this.generateSpecializedActions(symptoms, input);
    const urgencyLevel = this.assessComplexUrgency(symptoms, input);
    
    return {
      symptoms,
      possibleDiagnoses,
      recommendedActions,
      urgencyLevel,
      confidence: this.calculateMedicalConfidence(symptoms, possibleDiagnoses, input),
      medicalReasoning: this.generateExpertReasoning(symptoms, possibleDiagnoses, input)
    };
  }

  private generateResponse(userInput: string, _context: any): string {
    const input = userInput.toLowerCase();
    
    // Initial assessment
    if (input.includes('hola') || input.includes('consulta')) {
      return `Buenos días. Soy la Dra. Ramírez, especialista en medicina materno-fetal. Veo que está embarazada de ${this.patientProfile.gestationalAge} semanas y tiene VIH. ¿Cómo se ha sentido últimamente?`;
    }
    
    // HIV status and treatment
    if (input.includes('carga viral') || input.includes('cd4')) {
      return `Su última carga viral fue de ${this.patientProfile.viralLoad} copias/ml y CD4 de ${this.patientProfile.cd4Count} células/μL. Necesitamos trabajar en mejorar estos números. ¿Ha tenido problemas tomando sus medicamentos?`;
    }
    
    if (input.includes('medicamentos') || input.includes('adherencia')) {
      return `Veo que está con ${this.patientProfile.artRegimen}. La adherencia es crucial durante el embarazo. ¿Ha experimentado efectos secundarios? Podríamos necesitar ajustar su esquema.`;
    }
    
    // Obstetric concerns
    if (input.includes('bebé') || input.includes('ultrasonido') || input.includes('fetal')) {
      return 'Es importante monitorear el crecimiento del bebé regularmente. El VIH controlado no debe afectar significativamente el desarrollo fetal, pero necesitamos seguimiento estrecho. ¿Ha sentido movimientos normalmente?';
    }
    
    // Delivery planning
    if (input.includes('parto') || input.includes('cesárea')) {
      return 'Para la planificación del parto, si su carga viral está por debajo de 1000 copias/ml, puede considerar parto vaginal. Si está más alta, recomendamos cesárea electiva para reducir el riesgo de transmisión al bebé.';
    }
    
    // Complications
    if (input.includes('infección') || input.includes('fiebre')) {
      return 'Las infecciones durante el embarazo con VIH requieren atención inmediata. Su sistema inmune puede estar comprometido. Necesitamos descartar infecciones oportunistas y tratar agresivamente cualquier infección.';
    }
    
    // Nutritional concerns
    if (input.includes('nutrición') || input.includes('peso')) {
      return 'La nutrición es especialmente importante. Necesita ganar peso adecuado para el embarazo mientras mantenemos su sistema inmune fuerte. ¿Está tomando vitaminas prenatales y folato?';
    }
    
    // Expert guidance
    const specializedTerms = this.extractSpecializedTerms(userInput);
    if (specializedTerms.length > 0) {
      return `Excelente evaluación de ${specializedTerms.join(', ')}. Es crucial en el manejo de VIH durante embarazo. ¿Qué otros aspectos considera importantes evaluar?`;
    }
    
    return 'Continúe con su evaluación especializada. Recuerde que el manejo de VIH en embarazo requiere enfoque multidisciplinario. ¿Qué aspecto le gustaría profundizar?';
  }

  private extractSpecializedSymptoms(input: string): string[] {
    const symptoms: string[] = [];
    const hivSpecificSymptoms = [
      ...this.medicalContext.commonSymptoms,
      'linfadenopatía',
      'sudores nocturnos',
      'diarrea crónica',
      'candidiasis recurrente',
      'herpes zoster',
      'neuropatía periférica'
    ];
    
    for (const symptom of hivSpecificSymptoms) {
      if (input.toLowerCase().includes(symptom)) {
        symptoms.push(symptom);
      }
    }
    
    return [...new Set(symptoms)];
  }

  private generateSpecializedDiagnoses(symptoms: string[], input: string): string[] {
    const diagnoses: string[] = [];
    const inputLower = input.toLowerCase();
    
    // HIV-related diagnoses
    if (inputLower.includes('carga viral') || inputLower.includes('cd4')) {
      if (this.patientProfile.viralLoad > 1000) {
        diagnoses.push('VIH no controlado', 'riesgo transmisión vertical');
      }
      if (this.patientProfile.cd4Count < 350) {
        diagnoses.push('inmunosupresión moderada');
      }
    }
    
    // Pregnancy-related diagnoses
    if (symptoms.includes('sangrado vaginal')) {
      diagnoses.push('amenaza de aborto', 'desprendimiento placenta');
    }
    
    if (symptoms.includes('fiebre') || symptoms.includes('infecciones recurrentes')) {
      diagnoses.push('infección oportunista', 'sepsis', 'corioamnionitis');
    }
    
    // Medication-related
    if (inputLower.includes('efectos') || inputLower.includes('náuseas')) {
      diagnoses.push('efectos adversos antirretrovirales', 'intolerancia medicamentosa');
    }
    
    if (diagnoses.length === 0) {
      diagnoses.push('embarazo con VIH - requiere evaluación especializada');
    }
    
    return diagnoses;
  }

  private generateSpecializedActions(symptoms: string[], input: string): string[] {
    const actions: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Always include basic monitoring
    actions.push('monitoreo carga viral', 'seguimiento CD4', 'ultrasonido fetal');
    
    if (inputLower.includes('carga viral')) {
      actions.push('optimizar terapia antirretroviral', 'consejería adherencia');
    }
    
    if (symptoms.includes('fiebre') || symptoms.includes('infección')) {
      actions.push('cultivos microbiológicos', 'inicio antibióticos', 'aislamiento si necesario');
    }
    
    if (inputLower.includes('parto')) {
      actions.push('planificación modo de parto', 'profilaxis intraparto', 'evitar procedimientos invasivos');
    }
    
    // Always include multidisciplinary care
    actions.push('consulta infectología', 'seguimiento materno-fetal', 'consejería genética');
    
    return actions;
  }

  private assessComplexUrgency(symptoms: string[], input: string): 'low' | 'medium' | 'high' | 'critical' {
    const inputLower = input.toLowerCase();
    
    // Critical scenarios
    if (symptoms.includes('sangrado vaginal') && symptoms.includes('dolor abdominal')) {
      return 'critical';
    }
    
    if (inputLower.includes('trabajo de parto') && this.patientProfile.gestationalAge < 37) {
      return 'critical';
    }
    
    if (this.patientProfile.cd4Count < 200) {
      return 'high';
    }
    
    // High urgency
    if (symptoms.includes('fiebre') || this.patientProfile.viralLoad > 10000) {
      return 'high';
    }
    
    // Medium urgency - routine monitoring
    if (this.patientProfile.viralLoad > 1000) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractSpecializedTerms(input: string): string[] {
    const hivTerms = [
      'vih', 'carga viral', 'cd4', 'antirretrovirales', 'art', 'haart',
      'adherencia', 'resistencia', 'genotipo', 'fenotipo',
      'profilaxis', 'transmisión vertical', 'mtct'
    ];
    
    const obstetricsTerms = [
      'ultrasonido', 'doppler', 'movimientos fetales', 'crecimiento fetal',
      'edad gestacional', 'biometría', 'líquido amniótico',
      'placenta', 'cordón umbilical', 'parto', 'cesárea'
    ];
    
    const allTerms = [...hivTerms, ...obstetricsTerms, ...this.medicalContext.standardProcedures];
    const foundTerms: string[] = [];
    const inputLower = input.toLowerCase();
    
    for (const term of allTerms) {
      if (inputLower.includes(term)) {
        foundTerms.push(term);
      }
    }
    
    return [...new Set(foundTerms)];
  }

  private checkSafetyConcerns(input: string): string[] {
    const concerns: string[] = [];
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('efavirenz') && this.patientProfile.gestationalAge < 12) {
      concerns.push('Efavirenz no recomendado en primer trimestre - considerar cambio');
    }
    
    if (inputLower.includes('procedimiento invasivo')) {
      concerns.push('Minimizar procedimientos invasivos para reducir transmisión');
    }
    
    if (this.patientProfile.viralLoad > 1000) {
      concerns.push('Carga viral elevada - riesgo transmisión vertical');
    }
    
    return concerns;
  }

  private calculateConfidence(input: string, _analysis: DemoMedicalAnalysis): number {
    let confidence = 0.4; // Lower base for complex case
    
    const specializedTerms = this.extractSpecializedTerms(input);
    confidence += Math.min(specializedTerms.length * 0.08, 0.4);
    
    // Boost for comprehensive evaluation
    if (input.includes('carga viral') && input.includes('cd4')) {
      confidence += 0.2;
    }
    
    if (input.includes('fetal') || input.includes('bebé')) {
      confidence += 0.15;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateMedicalConfidence(symptoms: string[], diagnoses: string[], input: string): number {
    if (symptoms.length === 0) return 0.2;
    
    let confidence = 0.5;
    
    // Boost for HIV-specific evaluation
    if (input.includes('carga viral') || input.includes('cd4')) {
      confidence += 0.2;
    }
    
    // Boost for obstetric evaluation
    if (input.includes('ultrasonido') || input.includes('fetal')) {
      confidence += 0.15;
    }
    
    return Math.min(confidence + (diagnoses.length * 0.05), 0.95);
  }

  private generateExpertReasoning(symptoms: string[], diagnoses: string[], _input: string): string {
    let reasoning = `Paciente embarazada de ${this.patientProfile.gestationalAge} semanas con VIH. `;
    
    if (symptoms.length > 0) {
      reasoning += `Presenta ${symptoms.join(', ')}. `;
    }
    
    if (this.patientProfile.viralLoad > 1000) {
      reasoning += `Carga viral elevada (${this.patientProfile.viralLoad} copias/ml) requiere optimización del tratamiento. `;
    }
    
    if (diagnoses.length > 0) {
      reasoning += `Consideraciones diagnósticas incluyen ${diagnoses.join(', ')}. `;
    }
    
    reasoning += 'Manejo multidisciplinario esencial para optimizar resultados materno-fetales.';
    
    return reasoning;
  }

  private getNextSteps(input: string, currentStep: number): any[] {
    const expertSteps = [
      { type: 'laboratory', description: 'Laboratorios especializados (carga viral, CD4)' },
      { type: 'imaging', description: 'Ultrasonido obstétrico detallado' },
      { type: 'consultation', description: 'Interconsulta infectología/perinatología' },
      { type: 'counseling', description: 'Consejería adherencia y planificación parto' }
    ];
    
    return expertSteps.slice(currentStep, currentStep + 2);
  }

  private calculateClinicalAccuracy(input: string): number {
    const specializedTerms = this.extractSpecializedTerms(input);
    const safetyConcerns = this.checkSafetyConcerns(input);
    
    let accuracy = specializedTerms.length / 5; // Expect more specialized terms
    
    if (safetyConcerns.length === 0) {
      accuracy += 0.2; // Bonus for safety awareness
    }
    
    return Math.min(accuracy, 1.0);
  }

  private calculateExpertScore(analysis: DemoMedicalAnalysis, confidence: number): number {
    let score = 0;
    
    score += analysis.symptoms.length * 15; // Higher weight for symptoms
    score += analysis.possibleDiagnoses.length * 25; // Higher weight for diagnoses
    score += confidence * 100; // Confidence component
    
    // Bonus for addressing HIV-specific concerns
    if (analysis.medicalReasoning.includes('carga viral') || analysis.medicalReasoning.includes('transmisión')) {
      score += 50;
    }
    
    return Math.round(score);
  }
}