/**
 * Emergency Demo Strategy
 * 
 * High-intensity emergency medicine scenarios
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

export class EmergencyStrategy implements DemoStrategy {
  id = 'emergency';
  name = 'Medicina de Emergencia';
  description = 'Escenarios de urgencias médicas y trauma';
  specialty = 'emergency';
  difficulty = 'hard' as const;
  estimatedDuration = 1200; // 20 minutes

  medicalContext: DemoMedicalContext = {
    specialty: 'emergency',
    commonSymptoms: [
      'dolor torácico intenso',
      'dificultad respiratoria severa',
      'pérdida de conciencia',
      'sangrado abundante',
      'dolor abdominal agudo',
      'convulsiones',
      'shock',
      'trauma múltiple',
      'quemaduras extensas',
      'intoxicación'
    ],
    typicalDiagnoses: [
      'infarto agudo de miocardio',
      'embolia pulmonar',
      'neumotórax a tensión',
      'shock séptico',
      'abdomen agudo quirúrgico',
      'accidente cerebrovascular',
      'trauma craneoencefálico',
      'hemorragia digestiva',
      'cetoacidosis diabética',
      'anafilaxia'
    ],
    standardProcedures: [
      'reanimación cardiopulmonar',
      'intubación endotraqueal',
      'acceso vascular central',
      'toracostomía',
      'cardioversión',
      'desfibrilación',
      'lavado gástrico',
      'punción lumbar',
      'cricotiroidotomía',
      'pericardiocentesis'
    ],
    criticalSigns: [
      'paro cardiorespiratorio',
      'glasgow <8',
      'hipotensión severa (<80 sistólica)',
      'taquicardia extrema (>150)',
      'saturación O2 <85%',
      'temperatura >40°C o <32°C',
      'acidosis severa (pH <7.2)',
      'hiperkalemia (>6.5)',
      'hipoglucemia severa (<40)'
    ],
    urgencyIndicators: [
      'compromiso de vía aérea',
      'inestabilidad hemodinámica',
      'deterioro neurológico',
      'sangrado no controlado',
      'signos de shock',
      'arritmias malignas',
      'insuficiencia respiratoria',
      'intoxicación grave'
    ]
  };

  private currentStep = 0;
  private emergencyScenario = {
    type: 'cardiac_arrest',
    patientAge: 55,
    gender: 'male',
    presentation: 'Colapso súbito en la calle',
    vitalSigns: {
      conscious: false,
      breathing: false,
      pulse: false,
      bloodPressure: 'no detectable',
      saturation: 'no detectable'
    },
    witness: true,
    cprStarted: false,
    timeDown: 5 // minutes
  };

  async execute(input: DemoInput): Promise<DemoResult> {
    const userInput = input.userInput.toLowerCase();
    const timestamp = new Date();
    
    // Analyze emergency medical content
    const medicalAnalysis = this.analyzeEmergencyContent(userInput);
    
    // Generate time-critical response
    const response = this.generateEmergencyResponse(userInput, input.context);
    
    // Calculate confidence with urgency weighting
    const confidence = this.calculateEmergencyConfidence(userInput, medicalAnalysis);
    
    // Determine critical next steps
    const nextSteps = this.getEmergencySteps(userInput, this.currentStep);

    return {
      id: `emergency-result-${timestamp.getTime()}`,
      response,
      confidence,
      medicalAnalysis,
      nextSteps,
      metadata: {
        strategyUsed: this.id,
        processingTime: 200 + Math.random() * 300, // Fast processing for emergencies
        confidence,
        medicalTermsDetected: this.extractEmergencyTerms(userInput).length,
        stepAccuracy: this.calculateEmergencyAccuracy(userInput),
        totalScore: this.calculateEmergencyScore(medicalAnalysis, confidence, userInput)
      },
      timestamp
    };
  }

  validate(input: DemoInput): DemoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!input.userInput || input.userInput.trim().length === 0) {
      errors.push('⚠️ EMERGENCIA: Se requiere acción inmediata');
    }

    // Check for time-critical actions
    const criticalActions = this.checkCriticalActions(input.userInput);
    if (criticalActions.missing.length > 0) {
      warnings.push('⏰ TIEMPO CRÍTICO: Acciones faltantes');
      suggestions.push(...criticalActions.missing.map(action => `• ${action}`));
    }

    // Check for emergency protocols
    const protocolCompliance = this.checkEmergencyProtocols(input.userInput);
    if (!protocolCompliance.followingProtocol) {
      warnings.push('🚨 Considere protocolos de emergencia estándar');
      suggestions.push(...protocolCompliance.recommendations);
    }

    const confidence = errors.length === 0 ? 0.85 : 0.1;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence
    };
  }

  getNextStep(currentState: DemoState): DemoStep {
    const emergencySteps: DemoStep[] = [
      {
        id: 'primary-survey',
        type: 'examination',
        title: 'Evaluación Primaria (ABCDE)',
        description: 'Airway, Breathing, Circulation, Disability, Exposure',
        expectedInput: ['vía aérea', 'respiración', 'circulación', 'pulso', 'conciencia'],
        validResponses: ['Evalúo vía aérea', 'Verifico respiración', 'Busco pulso'],
        points: 50,
        isRequired: true,
        hints: ['⏰ CRÍTICO: Primeros 60 segundos son vitales']
      },
      {
        id: 'cpr-initiation',
        type: 'procedure',
        title: 'Inicio de RCP',
        description: 'Reanimación cardiopulmonar inmediata',
        expectedInput: ['rcp', 'masaje cardiaco', 'compresiones', 'ventilación'],
        validResponses: ['Inicio RCP', 'Comienzo compresiones', 'Pido desfibrilador'],
        points: 75,
        isRequired: true,
        hints: ['🚨 SIN PULSO = RCP INMEDIATA']
      },
      {
        id: 'advanced-life-support',
        type: 'procedure',
        title: 'Soporte Vital Avanzado',
        description: 'Intubación, accesos vasculares, medicamentos',
        expectedInput: ['intubación', 'acceso vascular', 'epinefrina', 'desfibrilación'],
        validResponses: ['Preparo intubación', 'Canalizo vena', 'Administro epinefrina'],
        points: 100,
        isRequired: true,
        hints: ['📊 ALGORITMO: Siga protocolos ACLS/PALS']
      },
      {
        id: 'stabilization',
        type: 'treatment',
        title: 'Estabilización',
        description: 'Monitoreo continuo y ajustes terapéuticos',
        expectedInput: ['monitoreo', 'gasometría', 'rayos x', 'laboratorios'],
        validResponses: ['Solicito gasometría', 'Rx de tórax', 'Monitoreo continuo'],
        points: 125,
        isRequired: true,
        hints: ['📈 POST-RCP: Evaluar función neurológica y hemodinámica']
      },
      {
        id: 'disposition',
        type: 'treatment',
        title: 'Disposición y Seguimiento',
        description: 'UCI, procedimientos adicionales, pronóstico',
        expectedInput: ['uci', 'pronóstico', 'familia', 'cateterismo'],
        validResponses: ['Solicito UCI', 'Hablo con familia', 'Evalúo cateterismo'],
        points: 150,
        isRequired: true,
        hints: ['🏥 DESTINO: Cuidados intensivos y pronóstico neurológico']
      }
    ];

    return emergencySteps[Math.min(currentState.currentStep, emergencySteps.length - 1)];
  }

  private analyzeEmergencyContent(input: string): DemoMedicalAnalysis {
    const symptoms = this.extractEmergencySymptoms(input);
    const possibleDiagnoses = this.generateEmergencyDiagnoses(symptoms, input);
    const recommendedActions = this.generateEmergencyActions(symptoms, input);
    const urgencyLevel = this.assessEmergencyUrgency(symptoms, input);
    
    return {
      symptoms,
      possibleDiagnoses,
      recommendedActions,
      urgencyLevel,
      confidence: this.calculateMedicalConfidence(symptoms, possibleDiagnoses, input),
      medicalReasoning: this.generateEmergencyReasoning(symptoms, possibleDiagnoses, input)
    };
  }

  private generateEmergencyResponse(userInput: string, _context: any): string {
    const input = userInput.toLowerCase();
    
    // Time-critical scenarios
    if (input.includes('sin pulso') || input.includes('paro cardiaco')) {
      return '🚨 PARO CARDÍACO CONFIRMADO. Iniciando RCP inmediatamente: 30 compresiones : 2 ventilaciones. Solicite desfibrilador y equipo de reanimación. ¿Cuánto tiempo lleva sin pulso?';
    }
    
    if (input.includes('rcp') || input.includes('compresiones')) {
      return '✅ RCP en curso. Compresiones a 100-120/min, profundidad 5-6cm. Minimice interrupciones. Epinefrina 1mg IV cada 3-5 min. ¿Ritmo desfibrilable en monitor?';
    }
    
    if (input.includes('desfibrilación') || input.includes('shock')) {
      return '⚡ DESCARGA: 200J bifásico. Asegure que nadie toque al paciente. "DESCARGA - TODOS ATRÁS". Reanude RCP inmediatamente post-shock por 2 minutos.';
    }
    
    // Airway management
    if (input.includes('vía aérea') || input.includes('intubación')) {
      return '🫁 VÍA AÉREA CRÍTICA. Pre-oxigenar 100%. Intubación rápida con cricoides. Tubo 7.5-8.0 en hombre. Confirme con capnografía. ¿Tiene predictores de vía aérea difícil?';
    }
    
    // Breathing issues
    if (input.includes('neumotórax') || input.includes('dificultad respiratoria')) {
      return '🫁 NEUMOTÓRAX SOSPECHADO. Descompresión inmediata: aguja 14G en 2° espacio intercostal línea medioclavicular. Prepare toracostomía. Oxígeno alto flujo.';
    }
    
    // Circulation problems
    if (input.includes('shock') || input.includes('hipotensión')) {
      return '💉 SHOCK IDENTIFICADO. Dos accesos venosos de gran calibre. Cristaloides 20ml/kg en bolo. Evalúe causa: cardiogénico, séptico, hipovolémico. Norepinefrina si refractario.';
    }
    
    // Neurological emergencies
    if (input.includes('stroke') || input.includes('ictus')) {
      return '🧠 STROKE AGUDO. Ventana terapéutica crítica. Glasgow, pupilas, déficits focales. TAC urgente. Considere tPA si <4.5h sin contraindicaciones. Glucosa, TA.';
    }
    
    // Trauma protocols
    if (input.includes('trauma') || input.includes('politraumatizado')) {
      return '🩸 TRAUMA MAYOR. ABCDE primario. Control cervical. Dos vías gruesas. Tipo y cruces. FAST abdominal. Si inestable → quirófano directo. Transfusión masiva si indicado.';
    }
    
    // Drug overdose
    if (input.includes('intoxicación') || input.includes('sobredosis')) {
      return '☠️ INTOXICACIÓN. ABC estabilizado. Antídoto específico si disponible: Naloxona (opioides), Flumazenil (benzos), N-acetilcisteína (paracetamol). Carbón activado si indicado.';
    }
    
    // General emergency response
    const emergencyTerms = this.extractEmergencyTerms(userInput);
    if (emergencyTerms.length > 0) {
      return `🚨 EMERGENCIA MÉDICA: Evaluación de ${emergencyTerms.join(', ')} en curso. Mantenga protococolos de seguridad. ¿Qué es su siguiente prioridad?`;
    }
    
    return '⏰ TIEMPO ES VIDA. Continúe con evaluación sistemática ABCDE. Priorice intervenciones que salvan vidas. ¿Cuál es su acción inmediata?';
  }

  private extractEmergencySymptoms(input: string): string[] {
    const symptoms: string[] = [];
    const emergencySymptoms = this.medicalContext.commonSymptoms;
    
    for (const symptom of emergencySymptoms) {
      if (input.toLowerCase().includes(symptom)) {
        symptoms.push(symptom);
      }
    }
    
    // Additional critical symptoms
    const criticalTerms = [
      'sin pulso', 'sin respiración', 'inconsciente', 'sangrado masivo',
      'shock', 'colapso', 'convulsiones', 'cianosis'
    ];
    
    for (const term of criticalTerms) {
      if (input.toLowerCase().includes(term)) {
        symptoms.push(term);
      }
    }
    
    return [...new Set(symptoms)];
  }

  private generateEmergencyDiagnoses(symptoms: string[], input: string): string[] {
    const diagnoses: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Cardiac emergencies
    if (inputLower.includes('sin pulso') || inputLower.includes('paro cardiaco')) {
      diagnoses.push('paro cardiorespiratorio', 'fibrilación ventricular', 'asistolia');
    }
    
    if (inputLower.includes('dolor torácico')) {
      diagnoses.push('infarto agudo miocardio', 'angina inestable', 'disección aórtica');
    }
    
    // Respiratory emergencies
    if (symptoms.includes('dificultad respiratoria severa')) {
      diagnoses.push('neumotórax a tensión', 'embolia pulmonar', 'edema agudo pulmón');
    }
    
    // Neurological emergencies
    if (symptoms.includes('pérdida de conciencia')) {
      diagnoses.push('accidente cerebrovascular', 'hipoglucemia severa', 'intoxicación');
    }
    
    // Shock states
    if (inputLower.includes('shock') || inputLower.includes('hipotensión')) {
      diagnoses.push('shock séptico', 'shock cardiogénico', 'shock hipovolémico');
    }
    
    // Trauma
    if (inputLower.includes('trauma')) {
      diagnoses.push('trauma craneoencefálico', 'hemotórax', 'hemoperitoneo');
    }
    
    if (diagnoses.length === 0) {
      diagnoses.push('emergencia médica - requiere evaluación inmediata');
    }
    
    return diagnoses;
  }

  private generateEmergencyActions(symptoms: string[], input: string): string[] {
    const actions: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Always start with ABCs
    actions.push('evaluar ABC (Airway, Breathing, Circulation)');
    
    // Specific emergency actions
    if (inputLower.includes('sin pulso')) {
      actions.push('RCP inmediato', 'desfibrilador', 'acceso vascular', 'epinefrina');
    }
    
    if (inputLower.includes('dificultad respiratoria')) {
      actions.push('oxígeno alto flujo', 'evaluar vía aérea', 'posible intubación');
    }
    
    if (inputLower.includes('sangrado')) {
      actions.push('control hemostático', 'acceso vascular grueso', 'tipo y cruces');
    }
    
    if (inputLower.includes('shock')) {
      actions.push('cristaloides en bolo', 'vasopresores', 'monitoreo invasivo');
    }
    
    if (inputLower.includes('convulsiones')) {
      actions.push('proteger vía aérea', 'lorazepam IV', 'glucosa si hipoglucemia');
    }
    
    // Always include monitoring and disposition
    actions.push('monitoreo continuo', 'reevaluación frecuente', 'considerar UCI');
    
    return actions;
  }

  private assessEmergencyUrgency(symptoms: string[], input: string): 'low' | 'medium' | 'high' | 'critical' {
    const inputLower = input.toLowerCase();
    
    // Critical - life-threatening
    if (inputLower.includes('sin pulso') || inputLower.includes('sin respiración') || inputLower.includes('paro')) {
      return 'critical';
    }
    
    // Critical - severe compromise
    if (symptoms.includes('shock') || symptoms.includes('sangrado abundante')) {
      return 'critical';
    }
    
    // High urgency
    if (symptoms.includes('dolor torácico intenso') || symptoms.includes('dificultad respiratoria severa')) {
      return 'high';
    }
    
    // All emergencies are at least high priority
    return 'high';
  }

  private extractEmergencyTerms(input: string): string[] {
    const emergencyTerms = [
      'rcp', 'desfibrilación', 'intubación', 'shock', 'trauma',
      'emergencia', 'crítico', 'urgente', 'resucitación',
      'epinefrina', 'atropina', 'cardioversión', 'toracostomía'
    ];
    
    const foundTerms: string[] = [];
    const inputLower = input.toLowerCase();
    
    for (const term of emergencyTerms) {
      if (inputLower.includes(term)) {
        foundTerms.push(term);
      }
    }
    
    return [...new Set(foundTerms)];
  }

  private checkCriticalActions(input: string): { missing: string[]; completed: string[] } {
    const criticalActions = [
      'evaluar pulso',
      'verificar respiración',
      'asegurar vía aérea',
      'iniciar rcp',
      'solicitar desfibrilador'
    ];
    
    const completed: string[] = [];
    const missing: string[] = [];
    
    for (const action of criticalActions) {
      if (input.toLowerCase().includes(action.replace(' ', ''))) {
        completed.push(action);
      } else {
        missing.push(action);
      }
    }
    
    return { missing, completed };
  }

  private checkEmergencyProtocols(input: string): { followingProtocol: boolean; recommendations: string[] } {
    const protocolKeywords = ['abcde', 'rcp', 'algoritmo', 'protocolo'];
    const followingProtocol = protocolKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    const recommendations: string[] = [];
    if (!followingProtocol) {
      recommendations.push('Siga algoritmo ABCDE para evaluación primaria');
      recommendations.push('Aplique protocolos BLS/ACLS según corresponda');
      recommendations.push('Mantenga aproximación sistemática bajo presión');
    }
    
    return { followingProtocol, recommendations };
  }

  private calculateEmergencyConfidence(input: string, _analysis: DemoMedicalAnalysis): number {
    let confidence = 0.3; // Lower base for high-stakes scenario
    
    // Boost for emergency terms
    const emergencyTerms = this.extractEmergencyTerms(input);
    confidence += Math.min(emergencyTerms.length * 0.12, 0.5);
    
    // Boost for systematic approach
    if (input.includes('abcde') || input.includes('evaluación primaria')) {
      confidence += 0.2;
    }
    
    // Boost for time-critical actions
    if (input.includes('rcp') || input.includes('inmediato')) {
      confidence += 0.15;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private calculateMedicalConfidence(symptoms: string[], diagnoses: string[], input: string): number {
    if (symptoms.length === 0) return 0.1;
    
    let confidence = 0.4;
    
    // Emergency scenarios have inherent uncertainty
    confidence += Math.min(symptoms.length * 0.1, 0.3);
    confidence += Math.min(diagnoses.length * 0.08, 0.25);
    
    // Boost for protocol adherence
    if (input.includes('protocolo') || input.includes('algoritmo')) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 0.85); // Cap at 85% for emergencies
  }

  private generateEmergencyReasoning(symptoms: string[], diagnoses: string[], _input: string): string {
    let reasoning = '🚨 EMERGENCIA MÉDICA: ';
    
    if (symptoms.length > 0) {
      reasoning += `Paciente presenta ${symptoms.join(', ')}. `;
    }
    
    if (this.emergencyScenario.type === 'cardiac_arrest') {
      reasoning += `Tiempo sin pulso: ${this.emergencyScenario.timeDown} minutos. `;
    }
    
    if (diagnoses.length > 0) {
      reasoning += `Diagnósticos de emergencia: ${diagnoses.join(', ')}. `;
    }
    
    reasoning += 'TIEMPO CRÍTICO - Intervención inmediata requerida para salvar la vida.';
    
    return reasoning;
  }

  private getEmergencySteps(input: string, currentStep: number): any[] {
    const timeSteps = [
      { type: 'immediate', description: '⏱️ 0-1 min: ABC y RCP si indicado', time: '0-1 min' },
      { type: 'urgent', description: '⏱️ 1-5 min: Desfibrilación y medicamentos', time: '1-5 min' },
      { type: 'critical', description: '⏱️ 5-15 min: Soporte vital avanzado', time: '5-15 min' },
      { type: 'stabilization', description: '⏱️ 15+ min: Estabilización y traslado', time: '15+ min' }
    ];
    
    return timeSteps.slice(currentStep, currentStep + 2);
  }

  private calculateEmergencyAccuracy(input: string): number {
    const criticalActions = this.checkCriticalActions(input);
    const protocolCompliance = this.checkEmergencyProtocols(input);
    
    let accuracy = criticalActions.completed.length / 5; // 5 critical actions
    
    if (protocolCompliance.followingProtocol) {
      accuracy += 0.3;
    }
    
    return Math.min(accuracy, 1.0);
  }

  private calculateEmergencyScore(analysis: DemoMedicalAnalysis, confidence: number, input: string): number {
    let score = 0;
    
    // Time-critical bonus
    if (input.includes('inmediato') || input.includes('urgente')) {
      score += 50;
    }
    
    // Protocol adherence bonus
    if (input.includes('abcde') || input.includes('rcp')) {
      score += 75;
    }
    
    // Standard scoring
    score += analysis.symptoms.length * 20;
    score += analysis.possibleDiagnoses.length * 30;
    score += confidence * 150;
    
    // Emergency bonus for life-saving actions
    if (input.includes('rcp') || input.includes('desfibrilación')) {
      score += 100;
    }
    
    return Math.round(score);
  }
}