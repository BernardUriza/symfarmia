// Medical mock data for realistic scenarios
export const mockPatients = [
  {
    id: 'p001',
    name: 'Sarah Johnson',
    age: 45,
    gender: 'female',
    dateOfBirth: '1979-03-15',
    medicalRecordNumber: 'MRN-2024-001',
    primaryPhysician: 'Dr. Martinez',
    
    // Medical conditions
    conditions: [
      { code: 'E11.9', name: 'Type 2 Diabetes Mellitus', onset: '2020-01-15', status: 'active' },
      { code: 'I10', name: 'Essential Hypertension', onset: '2019-08-20', status: 'active' },
      { code: 'E78.5', name: 'Hyperlipidemia', onset: '2021-02-10', status: 'active' }
    ],
    
    // Current medications
    medications: [
      { name: 'Metformin', dose: '1000mg', frequency: 'BID', route: 'PO', prescriber: 'Dr. Martinez' },
      { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Martinez' },
      { name: 'Atorvastatin', dose: '20mg', frequency: 'HS', route: 'PO', prescriber: 'Dr. Martinez' },
      { name: 'Aspirin', dose: '81mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Martinez' }
    ],
    
    // Allergies
    allergies: [
      { allergen: 'Penicillin', reaction: 'Rash', severity: 'moderate' },
      { allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'severe' }
    ],
    
    // Recent vital signs
    vitals: [
      {
        date: '2024-07-02',
        systolic_bp: 138,
        diastolic_bp: 85,
        heart_rate: 78,
        temperature: 36.8,
        respiratory_rate: 16,
        oxygen_saturation: 98,
        weight: 72.5,
        height: 165,
        bmi: 26.6
      }
    ],
    
    // Recent lab results
    labs: [
      {
        date: '2024-06-28',
        hba1c: 7.2,
        glucose: 145,
        creatinine: 0.9,
        bun: 18,
        sodium: 140,
        potassium: 4.2,
        total_cholesterol: 195,
        ldl: 115,
        hdl: 48,
        triglycerides: 160
      }
    ],
    
    // Risk factors
    riskFactors: ['Family history of CAD', 'Obesity', 'Sedentary lifestyle'],
    
    // Recent visits
    visits: [
      {
        date: '2024-07-02',
        type: 'Follow-up',
        chiefComplaint: 'Diabetes management',
        notes: 'Patient reports good medication compliance. A1C improved from 7.8 to 7.2.',
        provider: 'Dr. Martinez'
      }
    ]
  },
  
  {
    id: 'p002',
    name: 'Robert Chen',
    age: 67,
    gender: 'male',
    dateOfBirth: '1957-11-22',
    medicalRecordNumber: 'MRN-2024-002',
    primaryPhysician: 'Dr. Williams',
    
    conditions: [
      { code: 'I25.10', name: 'Coronary Artery Disease', onset: '2022-05-15', status: 'active' },
      { code: 'I50.9', name: 'Heart Failure', onset: '2023-01-10', status: 'active' },
      { code: 'I48.91', name: 'Atrial Fibrillation', onset: '2023-03-20', status: 'active' },
      { code: 'N18.3', name: 'Chronic Kidney Disease Stage 3', onset: '2021-12-05', status: 'active' }
    ],
    
    medications: [
      { name: 'Warfarin', dose: '5mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Williams' },
      { name: 'Metoprolol', dose: '50mg', frequency: 'BID', route: 'PO', prescriber: 'Dr. Williams' },
      { name: 'Furosemide', dose: '40mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Williams' },
      { name: 'Lisinopril', dose: '5mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Williams' }
    ],
    
    allergies: [
      { allergen: 'Contrast dye', reaction: 'Nephrotoxicity', severity: 'severe' }
    ],
    
    vitals: [
      {
        date: '2024-07-01',
        systolic_bp: 125,
        diastolic_bp: 75,
        heart_rate: 88,
        temperature: 36.6,
        respiratory_rate: 18,
        oxygen_saturation: 96,
        weight: 85.2,
        height: 175,
        bmi: 27.8
      }
    ],
    
    labs: [
      {
        date: '2024-06-25',
        inr: 2.8,
        creatinine: 1.6,
        bun: 35,
        sodium: 138,
        potassium: 4.8,
        bnp: 450,
        egfr: 45
      }
    ],
    
    riskFactors: ['Age >65', 'Male gender', 'History of MI', 'CKD'],
    
    visits: [
      {
        date: '2024-07-01',
        type: 'Cardiology Follow-up',
        chiefComplaint: 'Heart failure management',
        notes: 'Patient stable on current regimen. INR therapeutic. Some peripheral edema noted.',
        provider: 'Dr. Williams'
      }
    ]
  },
  
  {
    id: 'p003',
    name: 'Maria Rodriguez',
    age: 32,
    gender: 'female',
    dateOfBirth: '1992-08-08',
    medicalRecordNumber: 'MRN-2024-003',
    primaryPhysician: 'Dr. Thompson',
    
    conditions: [
      { code: 'J45.9', name: 'Asthma', onset: '2010-05-12', status: 'active' },
      { code: 'K59.00', name: 'Constipation', onset: '2024-01-20', status: 'active' }
    ],
    
    medications: [
      { name: 'Albuterol', dose: '90mcg', frequency: 'PRN', route: 'Inhaled', prescriber: 'Dr. Thompson' },
      { name: 'Fluticasone', dose: '110mcg', frequency: 'BID', route: 'Inhaled', prescriber: 'Dr. Thompson' },
      { name: 'Docusate', dose: '100mg', frequency: 'Daily', route: 'PO', prescriber: 'Dr. Thompson' }
    ],
    
    allergies: [
      { allergen: 'Latex', reaction: 'Contact dermatitis', severity: 'mild' }
    ],
    
    vitals: [
      {
        date: '2024-07-03',
        systolic_bp: 118,
        diastolic_bp: 72,
        heart_rate: 72,
        temperature: 36.7,
        respiratory_rate: 14,
        oxygen_saturation: 99,
        weight: 58.5,
        height: 162,
        bmi: 22.3
      }
    ],
    
    labs: [
      {
        date: '2024-06-20',
        glucose: 88,
        creatinine: 0.7,
        bun: 12,
        sodium: 142,
        potassium: 3.9,
        hemoglobin: 13.2,
        hematocrit: 39.8
      }
    ],
    
    riskFactors: ['Family history of asthma'],
    
    visits: [
      {
        date: '2024-07-03',
        type: 'Annual Physical',
        chiefComplaint: 'Routine check-up',
        notes: 'Patient doing well. Asthma well-controlled. Discussed exercise routine.',
        provider: 'Dr. Thompson'
      }
    ]
  }
];

// Clinical scenarios for AI training
export const clinicalScenarios = [
  {
    id: 'scenario001',
    title: 'Chest Pain Evaluation',
    patient: {
      age: 58,
      gender: 'male',
      chiefComplaint: 'Chest pain for 2 hours',
      symptoms: ['chest pain', 'shortness of breath', 'diaphoresis'],
      vitals: { bp: '165/95', hr: 105, temp: '37.1', rr: 22, spo2: 96 },
      riskFactors: ['Hypertension', 'Smoking', 'Family history of CAD']
    },
    differentialDx: [
      { diagnosis: 'Acute MI', probability: 0.45, urgency: 'high' },
      { diagnosis: 'Unstable Angina', probability: 0.25, urgency: 'high' },
      { diagnosis: 'Pulmonary Embolism', probability: 0.15, urgency: 'high' },
      { diagnosis: 'Aortic Dissection', probability: 0.10, urgency: 'high' },
      { diagnosis: 'GERD', probability: 0.05, urgency: 'low' }
    ],
    workup: ['ECG', 'Troponin', 'CXR', 'D-dimer', 'CBC', 'BMP'],
    treatment: ['Aspirin', 'Clopidogrel', 'Heparin', 'Atorvastatin', 'Metoprolol']
  },
  
  {
    id: 'scenario002',
    title: 'Diabetic Ketoacidosis',
    patient: {
      age: 28,
      gender: 'female',
      chiefComplaint: 'Nausea, vomiting, and abdominal pain',
      symptoms: ['nausea', 'vomiting', 'abdominal pain', 'polydipsia', 'polyuria'],
      vitals: { bp: '105/65', hr: 125, temp: '37.8', rr: 28, spo2: 98 },
      riskFactors: ['Type 1 Diabetes', 'Recent illness']
    },
    differentialDx: [
      { diagnosis: 'Diabetic Ketoacidosis', probability: 0.80, urgency: 'high' },
      { diagnosis: 'Gastroenteritis', probability: 0.10, urgency: 'medium' },
      { diagnosis: 'Appendicitis', probability: 0.05, urgency: 'high' },
      { diagnosis: 'Pancreatitis', probability: 0.05, urgency: 'medium' }
    ],
    workup: ['Glucose', 'Ketones', 'ABG', 'BMP', 'Anion gap', 'Urinalysis'],
    treatment: ['IV fluids', 'Insulin', 'Electrolyte replacement', 'Antiemetics']
  },
  
  {
    id: 'scenario003',
    title: 'Hypertensive Emergency',
    patient: {
      age: 65,
      gender: 'male',
      chiefComplaint: 'Severe headache and blurred vision',
      symptoms: ['headache', 'blurred vision', 'nausea', 'confusion'],
      vitals: { bp: '220/120', hr: 95, temp: '36.9', rr: 18, spo2: 97 },
      riskFactors: ['History of hypertension', 'Medication non-compliance']
    },
    differentialDx: [
      { diagnosis: 'Hypertensive Emergency', probability: 0.85, urgency: 'high' },
      { diagnosis: 'Stroke', probability: 0.10, urgency: 'high' },
      { diagnosis: 'Hypertensive Urgency', probability: 0.05, urgency: 'medium' }
    ],
    workup: ['CT head', 'ECG', 'CXR', 'Urinalysis', 'BMP', 'Troponin'],
    treatment: ['Nicardipine', 'Labetalol', 'Hydralazine', 'Close monitoring']
  }
];

// Drug interaction database
export const drugInteractionDatabase = [
  {
    drug1: 'Warfarin',
    drug2: 'Aspirin',
    severity: 'high',
    mechanism: 'Additive anticoagulant effect',
    clinicalEffect: 'Increased bleeding risk',
    management: 'Monitor INR closely, consider PPI for GI protection',
    reference: 'Lexicomp Drug Interactions'
  },
  {
    drug1: 'Metformin',
    drug2: 'Contrast dye',
    severity: 'high',
    mechanism: 'Impaired renal clearance',
    clinicalEffect: 'Lactic acidosis risk',
    management: 'Hold metformin 48 hours before and after contrast',
    reference: 'FDA Guidelines'
  },
  {
    drug1: 'Digoxin',
    drug2: 'Furosemide',
    severity: 'medium',
    mechanism: 'Hypokalemia increases digoxin toxicity',
    clinicalEffect: 'Increased risk of arrhythmias',
    management: 'Monitor potassium and digoxin levels',
    reference: 'Clinical Pharmacology'
  },
  {
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    severity: 'medium',
    mechanism: 'Dual potassium retention',
    clinicalEffect: 'Hyperkalemia risk',
    management: 'Monitor serum potassium regularly',
    reference: 'Micromedex'
  }
];

// Clinical decision support rules
export const clinicalRules = [
  {
    id: 'rule001',
    name: 'Anticoagulation in Atrial Fibrillation',
    condition: 'Atrial Fibrillation',
    criteria: 'CHA2DS2-VASc score ≥ 2',
    recommendation: 'Anticoagulation with warfarin or DOAC',
    strength: 'Strong recommendation',
    evidence: 'Class I, Level A'
  },
  {
    id: 'rule002',
    name: 'Statin Therapy for Primary Prevention',
    condition: 'Cardiovascular Risk',
    criteria: 'ASCVD risk ≥ 7.5% over 10 years',
    recommendation: 'Moderate-intensity statin therapy',
    strength: 'Moderate recommendation',
    evidence: 'Class IIa, Level B'
  },
  {
    id: 'rule003',
    name: 'ACE Inhibitor in Heart Failure',
    condition: 'Heart Failure with Reduced EF',
    criteria: 'EF ≤ 40%',
    recommendation: 'ACE inhibitor or ARB therapy',
    strength: 'Strong recommendation',
    evidence: 'Class I, Level A'
  },
  {
    id: 'rule004',
    name: 'Diabetes Screening',
    condition: 'Diabetes Risk',
    criteria: 'Age ≥ 45 or BMI ≥ 25 with risk factors',
    recommendation: 'Screen with HbA1c, FPG, or OGTT',
    strength: 'Strong recommendation',
    evidence: 'Grade B'
  }
];

// Reference ranges for lab values
export const labReferenceRanges = {
  'Complete Blood Count': {
    hemoglobin: {
      male: { min: 13.8, max: 17.2, unit: 'g/dL', critical: { low: 7.0, high: 20.0 } },
      female: { min: 12.1, max: 15.1, unit: 'g/dL', critical: { low: 7.0, high: 20.0 } }
    },
    hematocrit: {
      male: { min: 40.7, max: 50.3, unit: '%', critical: { low: 20.0, high: 60.0 } },
      female: { min: 36.1, max: 44.3, unit: '%', critical: { low: 20.0, high: 60.0 } }
    },
    platelets: { min: 150, max: 450, unit: 'K/μL', critical: { low: 50, high: 1000 } },
    wbc: { min: 4.5, max: 11.0, unit: 'K/μL', critical: { low: 2.0, high: 30.0 } }
  },
  
  'Basic Metabolic Panel': {
    glucose: { min: 70, max: 99, unit: 'mg/dL', critical: { low: 40, high: 400 } },
    sodium: { min: 136, max: 145, unit: 'mEq/L', critical: { low: 120, high: 160 } },
    potassium: { min: 3.5, max: 5.0, unit: 'mEq/L', critical: { low: 2.5, high: 6.0 } },
    chloride: { min: 98, max: 107, unit: 'mEq/L', critical: { low: 80, high: 120 } },
    co2: { min: 22, max: 29, unit: 'mEq/L', critical: { low: 10, high: 40 } },
    bun: { min: 7, max: 20, unit: 'mg/dL', critical: { low: 2, high: 100 } },
    creatinine: {
      male: { min: 0.74, max: 1.35, unit: 'mg/dL', critical: { low: 0.3, high: 10.0 } },
      female: { min: 0.59, max: 1.04, unit: 'mg/dL', critical: { low: 0.3, high: 10.0 } }
    }
  },
  
  'Lipid Panel': {
    total_cholesterol: { min: 0, max: 200, unit: 'mg/dL', optimal: '<200' },
    ldl: { min: 0, max: 100, unit: 'mg/dL', optimal: '<100' },
    hdl: {
      male: { min: 40, max: 999, unit: 'mg/dL', optimal: '>40' },
      female: { min: 50, max: 999, unit: 'mg/dL', optimal: '>50' }
    },
    triglycerides: { min: 0, max: 150, unit: 'mg/dL', optimal: '<150' }
  }
};