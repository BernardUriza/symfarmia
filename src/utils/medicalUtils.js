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
export const mockMedicalAI = {
  generateResponse: async (message) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      'chest pain': [
        "Based on the patient's presentation of chest pain, I recommend immediate evaluation for acute coronary syndrome. Consider obtaining an ECG, troponin levels, and chest X-ray.",
        "The differential diagnosis for chest pain includes ACS, PE, aortic dissection, and GERD. Given the patient's age and risk factors, prioritize cardiac workup.",
        "For chest pain evaluation, consider the HEART score to risk stratify. High-risk patients need immediate cardiology consultation."
      ],
      'drug interaction': [
        "I've identified a potential drug interaction between the patient's current medications. The combination of warfarin and aspirin increases bleeding risk significantly.",
        "This drug interaction requires close monitoring. Consider reducing the warfarin dose and monitoring INR more frequently.",
        "Alternative medications should be considered to avoid this interaction. Would you like me to suggest safer alternatives?"
      ],
      'diagnosis': [
        "Based on the clinical presentation, the most likely diagnosis is Type 2 Diabetes Mellitus. I recommend confirming with HbA1c and fasting glucose.",
        "The symptoms and findings suggest hypertension. Consider 24-hour ambulatory blood pressure monitoring for confirmation.",
        "This constellation of symptoms is consistent with chronic kidney disease. Recommend comprehensive metabolic panel and urinalysis."
      ],
      'medication': [
        "For this patient's condition, I recommend starting with metformin 500mg twice daily, titrating based on tolerance and glycemic control.",
        "The appropriate starting dose for lisinopril in this patient would be 10mg daily, with monitoring of renal function and potassium.",
        "Consider prescribing atorvastatin 20mg daily for cardiovascular risk reduction, with baseline liver function tests."
      ],
      'lab results': [
        "The lab results show elevated creatinine at 2.1 mg/dL, suggesting acute kidney injury. Recommend nephrology consultation and medication review.",
        "The HbA1c of 9.2% indicates poor glycemic control. Consider intensifying diabetes management with additional medications.",
        "The potassium level of 5.8 mEq/L is dangerously high. Consider immediate treatment with calcium, insulin, and glucose."
      ]
    };
    
    // Simple keyword matching for demo
    const keywords = Object.keys(responses);
    const matchedKeyword = keywords.find(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (matchedKeyword) {
      const responseOptions = responses[matchedKeyword];
      return responseOptions[Math.floor(Math.random() * responseOptions.length)];
    }
    
    // Default responses
    const defaultResponses = [
      "I understand you're looking for medical guidance. Could you provide more specific details about the patient's condition?",
      "Based on the information provided, I'd recommend a comprehensive evaluation. What specific aspect would you like me to focus on?",
      "For this clinical scenario, let me suggest some evidence-based approaches. Would you like me to elaborate on any particular aspect?",
      "I can help you with clinical decision support. Please share more details about the patient's presentation or your specific question.",
      "This is an interesting case. Let me provide some clinical insights based on current medical guidelines."
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