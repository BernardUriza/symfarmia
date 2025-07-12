/**
 * Pediatric Demo Strategy
 * 
 * Specialized strategy for pediatric medicine scenarios
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

export class PediatricStrategy implements DemoStrategy {
  id = 'pediatric';
  name = 'Pediatría';
  description = 'Medicina pediátrica con enfoque en desarrollo y crecimiento';
  specialty = 'pediatrics';
  difficulty = 'medium' as const;
  estimatedDuration = 1200; // 20 minutes

  medicalContext: DemoMedicalContext = {
    specialty: 'pediatrics',
    commonSymptoms: [
      'fiebre',
      'llanto inconsolable',
      'dificultad respiratoria',
      'vómitos',
      'diarrea',
      'exantema',
      'convulsiones febriles',
      'dificultad alimentación',
      'letargia',
      'irritabilidad'
    ],
    typicalDiagnoses: [
      'infección viral',
      'otitis media',
      'bronquiolitis',
      'gastroenteritis',
      'neumonía',
      'exantema viral',
      'convulsión febril simple',
      'reflujo gastroesofágico',
      'asma bronquial',
      'dermatitis atópica'
    ],
    standardProcedures: [
      'evaluación crecimiento',
      'desarrollo psicomotor',
      'vacunación',
      'examen físico pediátrico',
      'otoscopia',
      'auscultación cardiopulmonar',
      'palpación abdominal',
      'evaluación neurológica',
      'medición antropométrica',
      'tamizaje visual'
    ],
    criticalSigns: [
      'dificultad respiratoria severa',
      'cianosis',
      'convulsiones prolongadas',
      'deshidratación severa',
      'hipotermia en neonato',
      'apnea',
      'bradicardia',
      'hipoglucemia',
      'signos meníngeos',
      'shock'
    ],
    urgencyIndicators: [
      'tiraje intercostal',
      'estridor',
      'quejido respiratorio',
      'fontanela abombada',
      'petequias generalizadas',
      'palidez extrema',
      'somnolencia extrema',
      'rechazo alimentario',
      'llanto agudo'
    ]
  };

  private currentStep = 0;
  private patientProfile = {
    age: 18, // months
    weight: 10.5, // kg
    height: 75, // cm
    development: 'normal',
    vaccinations: 'al día',
    feeding: 'mixta',
    siblings: 1,
    daycare: true,
    chiefComplaint: 'fiebre y tos desde hace 3 días',
    vitals: {
      temperature: 38.8,
      heartRate: 140,
      respiratoryRate: 35,
      saturation: 96,
      weight: 10.5
    }
  };

  async execute(input: DemoInput): Promise<DemoResult> {
    const userInput = input.userInput.toLowerCase();
    const timestamp = new Date();
    
    // Analyze pediatric medical content
    const medicalAnalysis = this.analyzePediatricContent(userInput);
    
    // Generate age-appropriate response
    const response = this.generatePediatricResponse(userInput, input.context);
    
    // Calculate confidence with pediatric considerations
    const confidence = this.calculatePediatricConfidence(userInput, medicalAnalysis);
    
    // Determine developmental next steps
    const nextSteps = this.getPediatricSteps(userInput, this.currentStep);

    return {
      id: `pediatric-result-${timestamp.getTime()}`,
      response,
      confidence,
      medicalAnalysis,
      nextSteps,
      metadata: {
        strategyUsed: this.id,
        processingTime: 600 + Math.random() * 800,
        confidence,
        medicalTermsDetected: this.extractPediatricTerms(userInput).length,
        stepAccuracy: this.calculateDevelopmentalAccuracy(userInput),
        totalScore: this.calculatePediatricScore(medicalAnalysis, confidence)
      },
      timestamp
    };
  }

  validate(input: DemoInput): DemoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!input.userInput || input.userInput.trim().length === 0) {
      errors.push('Se requiere evaluación pediátrica completa');
    }

    if (input.userInput.length < 8) {
      warnings.push('Evaluación pediátrica requiere consideraciones especiales');
      suggestions.push('Incluya edad, peso, desarrollo, vacunas, y síntomas específicos');
    }

    const pediatricTerms = this.extractPediatricTerms(input.userInput);
    if (pediatricTerms.length === 0) {
      warnings.push('No se detectaron términos pediátricos específicos');
      suggestions.push('Considere crecimiento, desarrollo, vacunación, y alimentación');
    }

    // Check for age-appropriate considerations
    const ageConsiderations = this.checkAgeConsiderations(input.userInput);
    if (!ageConsiderations.appropriate) {
      warnings.push('Considere aspectos específicos de la edad pediátrica');
      suggestions.push(...ageConsiderations.suggestions);
    }

    const confidence = errors.length === 0 ? 0.8 : 0.3;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }

  getNextStep(currentState: DemoState): DemoStep {
    const pediatricSteps: DemoStep[] = [
      {
        id: 'pediatric-history',
        type: 'question',
        title: 'Historia Pediátrica',
        description: 'Historia completa incluyendo desarrollo y antecedentes',
        expectedInput: ['edad', 'peso', 'desarrollo', 'vacunas', 'alimentación'],
        validResponses: ['¿Qué edad tiene?', '¿Cómo ha sido su desarrollo?', '¿Vacunas al día?'],
        points: 20,
        isRequired: true,
        hints: ['La historia pediátrica incluye desarrollo psicomotor y antecedentes perinatales']
      },
      {
        id: 'growth-assessment',
        type: 'examination',
        title: 'Evaluación del Crecimiento',
        description: 'Medición antropométrica y curvas de crecimiento',
        expectedInput: ['peso', 'talla', 'perímetro cefálico', 'curvas', 'percentiles'],
        validResponses: ['Voy a pesarlo', 'Medimos la talla', 'Revisamos curvas de crecimiento'],
        points: 25,
        isRequired: true,
        hints: ['Las curvas de crecimiento son fundamentales en pediatría']
      },
      {
        id: 'developmental-assessment',
        type: 'examination',
        title: 'Evaluación del Desarrollo',
        description: 'Desarrollo psicomotor según edad',
        expectedInput: ['desarrollo', 'motor', 'lenguaje', 'social', 'cognitivo'],
        validResponses: ['¿Cómo se desarrolla?', '¿Qué palabras dice?', '¿Camina solo?'],
        points: 30,
        isRequired: true,
        hints: ['Evalúe hitos del desarrollo según la edad del niño']
      },
      {
        id: 'pediatric-examination',
        type: 'examination',
        title: 'Examen Físico Pediátrico',
        description: 'Examen físico adaptado a la edad pediátrica',
        expectedInput: ['examen', 'auscultación', 'otoscopia', 'abdomen', 'neurológico'],
        validResponses: ['Voy a examinarlo', 'Escucho sus pulmones', 'Reviso sus oídos'],
        points: 35,
        isRequired: true,
        hints: ['El examen pediátrico requiere técnicas específicas para la edad']
      },
      {
        id: 'family-counseling',
        type: 'treatment',
        title: 'Consejería Familiar',
        description: 'Educación y orientación a los padres',
        expectedInput: ['padres', 'educación', 'cuidados', 'signos alarma', 'seguimiento'],
        validResponses: ['Voy a explicar a los padres', 'Es importante que sepan', 'Signos de alarma'],
        points: 40,
        isRequired: true,
        hints: ['La educación a los padres es crucial en pediatría']
      }
    ];

    return pediatricSteps[Math.min(currentState.currentStep, pediatricSteps.length - 1)];
  }

  private analyzePediatricContent(input: string): DemoMedicalAnalysis {
    const symptoms = this.extractPediatricSymptoms(input);
    const possibleDiagnoses = this.generatePediatricDiagnoses(symptoms, input);
    const recommendedActions = this.generatePediatricActions(symptoms, input);
    const urgencyLevel = this.assessPediatricUrgency(symptoms, input);
    
    return {
      symptoms,
      possibleDiagnoses,
      recommendedActions,
      urgencyLevel,
      confidence: this.calculateMedicalConfidence(symptoms, possibleDiagnoses, input),
      medicalReasoning: this.generatePediatricReasoning(symptoms, possibleDiagnoses, input)
    };
  }

  private generatePediatricResponse(userInput: string, _context: any): string {
    const input = userInput.toLowerCase();
    
    // Age-specific greetings
    if (input.includes('hola') || input.includes('consulta')) {
      return `¡Hola! Soy la Dra. López, pediatra. Veo que trajeron a su pequeño de ${this.patientProfile.age} meses. ¿Qué los trae hoy por aquí?`;
    }
    
    // Growth and development
    if (input.includes('peso') || input.includes('crecimiento')) {
      return `Su bebé pesa ${this.patientProfile.weight} kg y mide ${this.patientProfile.height} cm. Esto lo coloca en percentil normal para su edad. ¿Han notado buen crecimiento en casa?`;
    }
    
    if (input.includes('desarrollo') || input.includes('hitos')) {
      return `A los ${this.patientProfile.age} meses, esperamos que camine solo, diga algunas palabras, y use pinza fina. ¿Cómo va su desarrollo? ¿Ya camina sin apoyo?`;
    }
    
    // Feeding concerns
    if (input.includes('alimentación') || input.includes('come')) {
      return `La alimentación es crucial a esta edad. ¿Qué come habitualmente? ¿Leche materna, fórmula, o ya alimentos sólidos? ¿Ha notado algún problema con la alimentación?`;
    }
    
    // Vaccinations
    if (input.includes('vacunas') || input.includes('inmunizaciones')) {
      return `Las vacunas están al día según me reportan. A los ${this.patientProfile.age} meses ya debe tener todas las vacunas del esquema básico. ¿Alguna reacción a vacunas previas?`;
    }
    
    // Common pediatric symptoms
    if (input.includes('fiebre')) {
      return `La fiebre en niños de esta edad requiere atención especial. Temperatura actual: ${this.patientProfile.vitals.temperature}°C. ¿Desde cuándo tiene fiebre? ¿Ha usado antipiréticos?`;
    }
    
    if (input.includes('tos') || input.includes('respiratorio')) {
      return `La tos en lactantes puede ser preocupante. Frecuencia respiratoria: ${this.patientProfile.vitals.respiratoryRate}/min. ¿Es tos seca o con flemas? ¿Ha notado dificultad para respirar?`;
    }
    
    if (input.includes('diarrea') || input.includes('vómitos')) {
      return `Los vómitos y diarrea en lactantes pueden causar deshidratación rápidamente. ¿Cuántas veces ha vomitado? ¿Orina normal? ¿Está decaído o activo?`;
    }
    
    // Behavioral concerns
    if (input.includes('llanto') || input.includes('irritable')) {
      return `El llanto en bebés puede tener muchas causas. ¿Es un llanto diferente al habitual? ¿Se calma con consolación? ¿Ha cambiado su comportamiento?`;
    }
    
    // Sleep patterns
    if (input.includes('sueño') || input.includes('duerme')) {
      return `Los patrones de sueño son importantes en el desarrollo. ¿Cómo duerme? ¿Cuántas horas por la noche? ¿Siestas regulares durante el día?`;
    }
    
    // Family dynamics
    if (input.includes('padres') || input.includes('familia')) {
      return `Es importante involucrar a toda la familia en el cuidado. ¿Cómo se sienten como padres? ¿Tienen dudas sobre el cuidado del bebé? ¿Apoyo familiar?`;
    }
    
    // Daycare/social
    if (input.includes('guardería') || input.includes('otros niños')) {
      return `Veo que va a guardería. Esto puede explicar infecciones frecuentes, es normal. ¿Cuándo comenzó? ¿Cómo se adapta? ¿Otros niños enfermos?`;
    }
    
    // Expert pediatric guidance
    const pediatricTerms = this.extractPediatricTerms(userInput);
    if (pediatricTerms.length > 0) {
      return `Excelente evaluación pediátrica de ${pediatricTerms.join(', ')}. Es importante considerar todos estos aspectos en el desarrollo infantil. ¿Qué más le preocupa?`;
    }
    
    return `Continuemos con la evaluación. En pediatría es importante ser integral: crecimiento, desarrollo, vacunas, alimentación, y el contexto familiar. ¿Qué aspecto le gustaría profundizar?`;
  }

  private extractPediatricSymptoms(input: string): string[] {
    const symptoms: string[] = [];
    const pediatricSymptoms = [
      ...this.medicalContext.commonSymptoms,
      'llanto excesivo',
      'rechazo alimentario',
      'somnolencia',
      'hipotermia',
      'fontanela abombada',
      'convulsiones',
      'exantema',
      'deshidratación'
    ];
    
    for (const symptom of pediatricSymptoms) {
      if (input.toLowerCase().includes(symptom)) {
        symptoms.push(symptom);
      }
    }
    
    return [...new Set(symptoms)];
  }

  private generatePediatricDiagnoses(symptoms: string[], input: string): string[] {
    const diagnoses: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Age-specific diagnoses
    if (this.patientProfile.age < 24) { // Under 2 years
      if (symptoms.includes('fiebre') && symptoms.includes('tos')) {
        diagnoses.push('bronquiolitis', 'neumonía', 'infección viral');
      }
      
      if (symptoms.includes('diarrea') && symptoms.includes('vómitos')) {
        diagnoses.push('gastroenteritis aguda', 'intolerancia alimentaria');
      }
      
      if (symptoms.includes('llanto inconsolable')) {
        diagnoses.push('cólico del lactante', 'reflujo gastroesofágico', 'otitis media');
      }
    }
    
    // Respiratory conditions
    if (symptoms.includes('dificultad respiratoria')) {
      diagnoses.push('bronquiolitis', 'asma bronquial', 'neumonía');
    }
    
    // Fever-related
    if (symptoms.includes('fiebre')) {
      if (this.patientProfile.age < 3) {
        diagnoses.push('infección viral', 'otitis media', 'infección urinaria');
      }
      
      if (symptoms.includes('convulsiones febriles')) {
        diagnoses.push('convulsión febril simple');
      }
    }
    
    // Skin conditions
    if (symptoms.includes('exantema')) {
      diagnoses.push('exantema viral', 'dermatitis atópica', 'alergia alimentaria');
    }
    
    // Developmental concerns
    if (inputLower.includes('desarrollo') || inputLower.includes('retraso')) {
      diagnoses.push('retraso del desarrollo', 'evaluación neurológica necesaria');
    }
    
    if (diagnoses.length === 0) {
      diagnoses.push('consulta pediátrica de rutina - evaluación integral necesaria');
    }
    
    return diagnoses;
  }

  private generatePediatricActions(symptoms: string[], input: string): string[] {
    const actions: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Always include pediatric basics
    actions.push('medición antropométrica', 'evaluación desarrollo psicomotor', 'revisión vacunas');
    
    // Age-specific actions
    if (this.patientProfile.age < 24) {
      actions.push('evaluación alimentación', 'consejería padres primerizos');
    }
    
    // Symptom-specific actions
    if (symptoms.includes('fiebre')) {
      actions.push('control temperatura', 'antipirético según peso', 'hidratación');
      
      if (this.patientProfile.age < 3) {
        actions.push('examen orina', 'hemograma si persiste');
      }
    }
    
    if (symptoms.includes('dificultad respiratoria')) {
      actions.push('saturación oxígeno', 'radiografía tórax', 'broncodilatadores');
    }
    
    if (symptoms.includes('diarrea') || symptoms.includes('vómitos')) {
      actions.push('evaluación hidratación', 'sales rehidratación oral', 'dieta astringente');
    }
    
    if (inputLower.includes('desarrollo')) {
      actions.push('test desarrollo (Denver II)', 'estimulación temprana', 'seguimiento neurológico');
    }
    
    // Always include family education
    actions.push('educación padres', 'signos alarma', 'control seguimiento');
    
    return actions;
  }

  private assessPediatricUrgency(symptoms: string[], _input: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical pediatric emergencies
    if (symptoms.includes('dificultad respiratoria severa') || symptoms.includes('cianosis')) {
      return 'critical';
    }
    
    if (symptoms.includes('convulsiones') && !symptoms.includes('febril')) {
      return 'critical';
    }
    
    if (symptoms.includes('deshidratación severa')) {
      return 'critical';
    }
    
    // High urgency
    if (symptoms.includes('fiebre') && this.patientProfile.age < 3) {
      return 'high';
    }
    
    if (symptoms.includes('convulsiones febriles')) {
      return 'high';
    }
    
    if (symptoms.includes('llanto inconsolable')) {
      return 'medium';
    }
    
    // Most pediatric consultations are routine
    return 'low';
  }

  private extractPediatricTerms(input: string): string[] {
    const pediatricTerms = [
      'lactante', 'preescolar', 'crecimiento', 'desarrollo', 'hitos',
      'percentiles', 'curvas', 'vacunas', 'inmunizaciones',
      'alimentación', 'lactancia', 'destete', 'ablactación',
      'fontanela', 'reflejo', 'desarrollo psicomotor',
      'guardería', 'maternal', 'padres', 'cuidadores'
    ];
    
    const foundTerms: string[] = [];
    const inputLower = input.toLowerCase();
    
    for (const term of pediatricTerms) {
      if (inputLower.includes(term)) {
        foundTerms.push(term);
      }
    }
    
    return [...new Set(foundTerms)];
  }

  private checkAgeConsiderations(input: string): { appropriate: boolean; suggestions: string[] } {
    const ageTerms = ['edad', 'meses', 'años', 'lactante', 'preescolar'];
    const developmentTerms = ['desarrollo', 'hitos', 'motor', 'lenguaje'];
    const nutritionTerms = ['alimentación', 'lactancia', 'fórmula', 'sólidos'];
    
    const hasAge = ageTerms.some(term => input.toLowerCase().includes(term));
    const hasDevelopment = developmentTerms.some(term => input.toLowerCase().includes(term));
    const hasNutrition = nutritionTerms.some(term => input.toLowerCase().includes(term));
    
    const appropriate = hasAge || hasDevelopment || hasNutrition;
    
    const suggestions: string[] = [];
    if (!hasAge) {
      suggestions.push('Considere la edad específica del paciente pediátrico');
    }
    if (!hasDevelopment) {
      suggestions.push('Evalúe el desarrollo psicomotor según la edad');
    }
    if (!hasNutrition) {
      suggestions.push('Pregunte sobre alimentación y nutrición');
    }
    
    return { appropriate, suggestions };
  }

  private calculatePediatricConfidence(input: string, _analysis: DemoMedicalAnalysis): number {
    let confidence = 0.5; // Base confidence for pediatrics
    
    const pediatricTerms = this.extractPediatricTerms(input);
    confidence += Math.min(pediatricTerms.length * 0.1, 0.3);
    
    // Boost for age-appropriate considerations
    const ageConsiderations = this.checkAgeConsiderations(input);
    if (ageConsiderations.appropriate) {
      confidence += 0.2;
    }
    
    // Boost for comprehensive evaluation
    if (input.includes('desarrollo') && input.includes('crecimiento')) {
      confidence += 0.15;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateMedicalConfidence(symptoms: string[], diagnoses: string[], input: string): number {
    if (symptoms.length === 0) return 0.4;
    
    let confidence = 0.6;
    
    // Pediatric evaluations are generally more complex
    confidence += Math.min(symptoms.length * 0.08, 0.25);
    confidence += Math.min(diagnoses.length * 0.06, 0.2);
    
    // Boost for developmental assessment
    if (input.includes('desarrollo') || input.includes('hitos')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.9);
  }

  private generatePediatricReasoning(symptoms: string[], diagnoses: string[], _input: string): string {
    let reasoning = `Paciente pediátrico de ${this.patientProfile.age} meses. `;
    
    if (symptoms.length > 0) {
      reasoning += `Presenta ${symptoms.join(', ')}. `;
    }
    
    reasoning += `Peso: ${this.patientProfile.weight} kg (percentil normal). `;
    
    if (this.patientProfile.daycare) {
      reasoning += 'Asiste a guardería (factor de riesgo para infecciones). ';
    }
    
    if (diagnoses.length > 0) {
      reasoning += `Diagnósticos probables: ${diagnoses.join(', ')}. `;
    }
    
    reasoning += 'Evaluación integral debe incluir crecimiento, desarrollo, vacunación y consejería familiar.';
    
    return reasoning;
  }

  private getPediatricSteps(input: string, currentStep: number): any[] {
    const developmentalSteps = [
      { type: 'anthropometry', description: 'Medición peso, talla, perímetro cefálico' },
      { type: 'development', description: 'Evaluación hitos del desarrollo' },
      { type: 'nutrition', description: 'Evaluación estado nutricional' },
      { type: 'immunization', description: 'Revisión esquema de vacunación' },
      { type: 'family', description: 'Consejería y educación familiar' }
    ];
    
    return developmentalSteps.slice(currentStep, currentStep + 2);
  }

  private calculateDevelopmentalAccuracy(input: string): number {
    const expectedAreas = ['crecimiento', 'desarrollo', 'vacunas', 'alimentación', 'familia'];
    const coveredAreas = expectedAreas.filter(area => 
      input.toLowerCase().includes(area)
    );
    
    return coveredAreas.length / expectedAreas.length;
  }

  private calculatePediatricScore(analysis: DemoMedicalAnalysis, confidence: number): number {
    let score = 0;
    
    // Standard scoring
    score += analysis.symptoms.length * 12;
    score += analysis.possibleDiagnoses.length * 18;
    score += confidence * 80;
    
    // Pediatric-specific bonuses
    if (analysis.medicalReasoning.includes('desarrollo') || analysis.medicalReasoning.includes('crecimiento')) {
      score += 40;
    }
    
    if (analysis.medicalReasoning.includes('vacunas') || analysis.medicalReasoning.includes('alimentación')) {
      score += 30;
    }
    
    // Family-centered care bonus
    if (analysis.medicalReasoning.includes('padres') || analysis.medicalReasoning.includes('familia')) {
      score += 25;
    }
    
    return Math.round(score);
  }
}