// Medical utilities for clinical decision support
export const medicalUtils = {
  // Drug interaction database (mock)
  drugInteractions: {
    'warfarin': {
      'aspirin': { severity: 'high', effect: 'Increased bleeding risk', monitoring: 'INR closely' },
      'ibuprofen': { severity: 'medium', effect: 'Increased bleeding risk', monitoring: 'Watch for bleeding' },
      'amoxicillin': { severity: 'medium', effect: 'Enhanced anticoagulation', monitoring: 'Monitor INR' }
    },
    'metformin': {
      'contrast': { severity: 'high', effect: 'Lactic acidosis risk', monitoring: 'Hold 48hrs post-contrast' },
      'furosemide': { severity: 'medium', effect: 'Increased lactic acidosis risk', monitoring: 'Monitor renal function' }
    },
    'digoxin': {
      'furosemide': { severity: 'medium', effect: 'Hypokalemia increases toxicity', monitoring: 'Monitor K+ and digoxin levels' },
      'amiodarone': { severity: 'high', effect: 'Increased digoxin levels', monitoring: 'Reduce digoxin dose by 50%' }
    }
  },

  // ICD-10 codes database (mock)
  icd10Codes: {
    'chest pain': [
      { code: 'R06.02', description: 'Shortness of breath', specificity: 'high' },
      { code: 'I20.9', description: 'Angina pectoris, unspecified', specificity: 'medium' },
      { code: 'I21.9', description: 'Acute myocardial infarction, unspecified', specificity: 'high' },
      { code: 'K21.9', description: 'Gastro-esophageal reflux disease', specificity: 'low' }
    ],
    'diabetes': [
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', specificity: 'high' },
      { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', specificity: 'high' },
      { code: 'E13.9', description: 'Other specified diabetes mellitus without complications', specificity: 'medium' }
    ],
    'hypertension': [
      { code: 'I10', description: 'Essential hypertension', specificity: 'high' },
      { code: 'I15.9', description: 'Secondary hypertension, unspecified', specificity: 'medium' }
    ]
  },

  // Vital signs reference ranges
  vitalRanges: {
    'systolic_bp': { min: 90, max: 140, unit: 'mmHg', critical_low: 80, critical_high: 180 },
    'diastolic_bp': { min: 60, max: 90, unit: 'mmHg', critical_low: 50, critical_high: 110 },
    'heart_rate': { min: 60, max: 100, unit: 'bpm', critical_low: 40, critical_high: 150 },
    'temperature': { min: 36.1, max: 37.2, unit: '°C', critical_low: 35, critical_high: 39 },
    'respiratory_rate': { min: 12, max: 20, unit: '/min', critical_low: 8, critical_high: 30 },
    'oxygen_saturation': { min: 95, max: 100, unit: '%', critical_low: 88, critical_high: 100 }
  },

  // Lab value reference ranges
  labRanges: {
    'hemoglobin': { 
      male: { min: 13.8, max: 17.2, unit: 'g/dL' },
      female: { min: 12.1, max: 15.1, unit: 'g/dL' }
    },
    'hematocrit': {
      male: { min: 40.7, max: 50.3, unit: '%' },
      female: { min: 36.1, max: 44.3, unit: '%' }
    },
    'glucose': { min: 70, max: 100, unit: 'mg/dL', critical_low: 50, critical_high: 400 },
    'creatinine': {
      male: { min: 0.74, max: 1.35, unit: 'mg/dL' },
      female: { min: 0.59, max: 1.04, unit: 'mg/dL' }
    },
    'bun': { min: 7, max: 20, unit: 'mg/dL' },
    'sodium': { min: 136, max: 145, unit: 'mEq/L', critical_low: 125, critical_high: 155 },
    'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', critical_low: 2.5, critical_high: 6.0 }
  },

  // Drug dosing guidelines (mock)
  drugDosing: {
    'metformin': {
      indication: 'Type 2 diabetes',
      starting_dose: '500mg BID',
      max_dose: '2000mg daily',
      contraindications: ['eGFR < 30', 'Lactic acidosis history'],
      monitoring: 'Renal function, B12 levels'
    },
    'lisinopril': {
      indication: 'Hypertension, Heart failure',
      starting_dose: '10mg daily',
      max_dose: '40mg daily',
      contraindications: ['Pregnancy', 'Angioedema history'],
      monitoring: 'BP, renal function, potassium'
    },
    'atorvastatin': {
      indication: 'Hyperlipidemia',
      starting_dose: '20mg daily',
      max_dose: '80mg daily',
      contraindications: ['Active liver disease', 'Pregnancy'],
      monitoring: 'Liver function, CK levels'
    }
  },

  // Clinical calculators
  calculators: {
    bmi: (weight, height) => {
      const bmi = weight / (height * height);
      let category = 'Normal';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi >= 25 && bmi < 30) category = 'Overweight';
      else if (bmi >= 30) category = 'Obese';
      
      return {
        value: bmi.toFixed(1),
        category,
        unit: 'kg/m²'
      };
    },

    creatinineClearance: (age, weight, creatinine, gender) => {
      const multiplier = gender === 'female' ? 0.85 : 1;
      const cc = (((140 - age) * weight) / (72 * creatinine)) * multiplier;
      
      let stage = 'Normal';
      if (cc < 15) stage = 'Stage 5 (Kidney failure)';
      else if (cc < 30) stage = 'Stage 4 (Severe)';
      else if (cc < 60) stage = 'Stage 3 (Moderate)';
      else if (cc < 90) stage = 'Stage 2 (Mild)';
      
      return {
        value: cc.toFixed(1),
        stage,
        unit: 'mL/min'
      };
    },

    chads2Score: (age, chf, hypertension, diabetes, stroke) => {
      let score = 0;
      if (age >= 75) score += 1;
      if (chf) score += 1;
      if (hypertension) score += 1;
      if (diabetes) score += 1;
      if (stroke) score += 2;
      
      let risk = 'Low';
      let recommendation = 'No anticoagulation';
      
      if (score === 1) {
        risk = 'Moderate';
        recommendation = 'Consider anticoagulation';
      } else if (score >= 2) {
        risk = 'High';
        recommendation = 'Anticoagulation recommended';
      }
      
      return {
        score,
        risk,
        recommendation
      };
    },

    wellsScore: (symptoms) => {
      // Simplified Wells score for PE
      let score = 0;
      if (symptoms.pe_likely) score += 3;
      if (symptoms.heart_rate > 100) score += 1.5;
      if (symptoms.immobilization) score += 1.5;
      if (symptoms.previous_pe) score += 1.5;
      if (symptoms.hemoptysis) score += 1;
      if (symptoms.malignancy) score += 1;
      
      let probability = 'Low';
      if (score > 6) probability = 'High';
      else if (score > 2) probability = 'Moderate';
      
      return {
        score: score.toFixed(1),
        probability,
        recommendation: probability === 'High' ? 'CTPA indicated' : 'Consider D-dimer'
      };
    }
  },

  // Differential diagnosis generator
  generateDifferentialDx: (symptoms, age, gender, riskFactors = []) => {
    const diagnoses = [];
    
    if (symptoms.includes('chest pain')) {
      if (age > 45 || riskFactors.includes('CAD')) {
        diagnoses.push({
          diagnosis: 'Acute Coronary Syndrome',
          probability: 0.35,
          urgency: 'high',
          workup: ['ECG', 'Troponin', 'CXR'],
          icd10: 'I20.9'
        });
      }
      
      diagnoses.push({
        diagnosis: 'Gastroesophageal Reflux',
        probability: 0.25,
        urgency: 'low',
        workup: ['Trial of PPI', 'Upper endoscopy if persistent'],
        icd10: 'K21.9'
      });
      
      if (riskFactors.includes('DVT') || symptoms.includes('shortness of breath')) {
        diagnoses.push({
          diagnosis: 'Pulmonary Embolism',
          probability: 0.15,
          urgency: 'high',
          workup: ['D-dimer', 'CTPA', 'Wells score'],
          icd10: 'I26.9'
        });
      }
    }
    
    return diagnoses.sort((a, b) => b.probability - a.probability);
  },

  // Clinical decision support rules
  clinicalRules: {
    checkVitalSigns: (vitals) => {
      const alerts = [];
      
      Object.entries(vitals).forEach(([vital, value]) => {
        const range = medicalUtils.vitalRanges[vital];
        if (range) {
          if (value < range.critical_low || value > range.critical_high) {
            alerts.push({
              type: 'critical',
              message: `${vital.replace('_', ' ')} is critically abnormal: ${value} ${range.unit}`,
              action: 'Immediate intervention required'
            });
          } else if (value < range.min || value > range.max) {
            alerts.push({
              type: 'warning',
              message: `${vital.replace('_', ' ')} is outside normal range: ${value} ${range.unit}`,
              action: 'Monitor closely'
            });
          }
        }
      });
      
      return alerts;
    },

    checkLabValues: (labs, patientGender) => {
      const alerts = [];
      
      Object.entries(labs).forEach(([lab, value]) => {
        const range = medicalUtils.labRanges[lab];
        if (range) {
          const normalRange = range.male && range.female ? range[patientGender] : range;
          
          if (normalRange.critical_low && (value < normalRange.critical_low || value > normalRange.critical_high)) {
            alerts.push({
              type: 'critical',
              message: `${lab} is critically abnormal: ${value} ${normalRange.unit}`,
              action: 'Immediate intervention required'
            });
          } else if (value < normalRange.min || value > normalRange.max) {
            alerts.push({
              type: 'warning',
              message: `${lab} is outside normal range: ${value} ${normalRange.unit}`,
              action: 'Review and consider follow-up'
            });
          }
        }
      });
      
      return alerts;
    },

    checkDrugInteractions: (medications) => {
      const interactions = [];
      
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const drug1 = medications[i].toLowerCase();
          const drug2 = medications[j].toLowerCase();
          
          if (medicalUtils.drugInteractions[drug1] && medicalUtils.drugInteractions[drug1][drug2]) {
            const interaction = medicalUtils.drugInteractions[drug1][drug2];
            interactions.push({
              drugs: [drug1, drug2],
              severity: interaction.severity,
              effect: interaction.effect,
              monitoring: interaction.monitoring
            });
          }
        }
      }
      
      return interactions;
    }
  }
};

// Mock AI responses for medical assistant
// HuggingFace-powered medical AI integration
export const mockMedicalAI = {
  /**
   * Query medical AI through Next.js backend API.
   * Falls back to mock replies on error.
   * @param {string} query - user question or transcript text
   * @param {object} context - additional patient context
   * @param {('diagnosis'|'prescription'|'soap'|'analytics')} type - response type
   * @returns {Promise<MedicalAIResponse>}
   */
    generateResponse: async (query, context = {}, type = 'diagnosis') => {
      const CACHE_TTL = 60 * 60 * 1000; // 1 hour
      const patientId = context?.patient?.id || 'global';
      const now = Date.now();

      // Rate limiting
      if (!mockMedicalAI._requestLog) mockMedicalAI._requestLog = new Map();
      const recent = (mockMedicalAI._requestLog.get(patientId) || []).filter(ts => now - ts < CACHE_TTL);
      if (recent.length >= 60) {
        return {
          response: 'Lo siento, se alcanzó el límite de consultas por hora.',
          confidence: 0,
          reasoning: ['Límite de uso superado'],
          suggestions: [],
          disclaimer: 'AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado. No reemplaza el criterio médico profesional.',
          sources: []
        };
      }
      recent.push(now);
      mockMedicalAI._requestLog.set(patientId, recent);

      // Cache management
      const cacheKey = JSON.stringify({ query, context, type });
      if (!mockMedicalAI._cache) mockMedicalAI._cache = new Map();
      const cached = mockMedicalAI._cache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }

      const disclaimer = 'AVISO MÉDICO: Esta información es generada por IA y debe ser validada por un médico certificado. No reemplaza el criterio médico profesional.';

      try {
        // Call internal Next.js API
        const response = await fetch('/api/medical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            context,
            type
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error types
          if (response.status === 401) {
            throw new Error('authentication_error');
          }
          
          if (response.status === 429) {
            throw new Error('rate_limit_error');
          }
          
          if (errorData.type === 'configuration_error') {
            throw new Error('configuration_error');
          }
          
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          mockMedicalAI._cache.set(cacheKey, { result, timestamp: now });
          return result;
        }

        throw new Error('Invalid API response');

      } catch (err) {
        console.error('Medical AI error:', err);
        
        // Generate appropriate fallback message based on error type
        let fallbackMessage = mockMedicalAI._fallbackResponse(query);
        let errorContext = '';
        
        if (err.message === 'authentication_error') {
          errorContext = '(Token de Hugging Face inválido. Contacta al administrador)';
        } else if (err.message === 'configuration_error') {
          errorContext = '(Token de Hugging Face no configurado. Contacta al administrador)';
        } else if (err.message === 'rate_limit_error') {
          errorContext = '(Límite de uso de Hugging Face excedido. Intenta más tarde)';
        } else {
          errorContext = '(Esta respuesta es simulada. Para análisis real con IA médica, verifica la conexión a Hugging Face o contacta al administrador)';
        }
        
        const fallback = {
          response: `${fallbackMessage}\n\n${errorContext}`,
          confidence: 0.4,
          reasoning: [],
          suggestions: [],
          disclaimer,
          sources: [],
          error: err.message
        };
        
        mockMedicalAI._cache.set(cacheKey, { result: fallback, timestamp: now });
        return fallback;
      }
    },

  _fallbackResponse: (_message) => {
    const defaultResponses = [
      "I understand you're looking for medical guidance. Could you provide more specific details about the patient's condition?",
      "Based on the information provided, I'd recommend a comprehensive evaluation. What specific aspect would you like me to focus on?",
      "For this clinical scenario, let me suggest some evidence-based approaches. Would you like me to elaborate on any particular aspect?",
      "Puedo ayudarle con soporte clínico. Comparta más detalles sobre la presentación del paciente.",
      "Este es un caso interesante. Permítame brindarle algunas ideas basadas en guías médicas actuales."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  },

  generateSuggestions: (patientData) => {
    const suggestions = [];
    
    if (patientData.medications && patientData.medications.length > 0) {
      suggestions.push({
        type: 'medication',
        title: 'Review Drug Interactions',
        description: 'Check for potential interactions between current medications',
        priority: 'high',
        action: 'check_interactions'
      });
    }
    
    if (patientData.age && patientData.age > 65) {
      suggestions.push({
        type: 'screening',
        title: 'Geriatric Assessment',
        description: 'Consider comprehensive geriatric evaluation',
        priority: 'medium',
        action: 'geriatric_assessment'
      });
    }
    
    if (patientData.conditions && patientData.conditions.includes('diabetes')) {
      suggestions.push({
        type: 'monitoring',
        title: 'Diabetes Monitoring',
        description: 'Review HbA1c and diabetic complications screening',
        priority: 'high',
        action: 'diabetes_monitoring'
      });
    }
    
    return suggestions;
  }
};