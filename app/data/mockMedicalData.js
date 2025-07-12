/**
 * MOCK MEDICAL DATA
 * 
 * Realistic data for Mexican private medical practice
 * Used for development, testing, and demonstrations
 */

import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

// 🏥 MEXICAN MEDICAL PRACTICE PATTERNS
const MEXICAN_PRACTICE_PATTERNS = {
  PEAK_HOURS: [9, 10, 11, 16, 17, 18], // Common consultation hours
  CONSULTATION_TYPES: [
    { type: 'general', weight: 50, duration: [12, 18], fee: [800, 1200] },
    { type: 'followup', weight: 30, duration: [8, 12], fee: [600, 900] },
    { type: 'urgent', weight: 15, duration: [15, 25], fee: [1200, 1800] },
    { type: 'specialist', weight: 5, duration: [20, 30], fee: [1500, 2500] }
  ],
  PATIENT_NAMES: [
    'María González López', 'José Luis Martínez', 'Ana Patricia Hernández',
    'Carlos Eduardo Ramírez', 'Lucia Fernández Torres', 'Roberto Sánchez Díaz',
    'Elena Morales Castro', 'Fernando Jiménez Ruiz', 'Claudia Reyes Mendoza',
    'Miguel Ángel Vázquez', 'Sofía Delgado Aguilar', 'Alejandro Cruz Moreno',
    'Gabriela Ortiz Flores', 'Ricardo Peña Castillo', 'Mónica Herrera Silva',
    'Daniel Guerrero Romero', 'Valeria Medina Vargas', 'Arturo Ramos Núñez',
    'Paola Contreras León', 'Javier Moreno Gutiérrez'
  ],
  MEDICAL_CONDITIONS: [
    'Hipertensión arterial', 'Diabetes mellitus tipo 2', 'Gastritis crónica',
    'Cefalea tensional', 'Lumbalgia', 'Artritis reumatoide', 'Asma bronquial',
    'Depresión leve', 'Ansiedad generalizada', 'Obesidad', 'Dislipidemia',
    'Reflujo gastroesofágico', 'Fibromialgia', 'Osteoartritis', 'Migraña'
  ],
  AUTOMATION_IMPROVEMENT_CURVE: [
    { week: 1, ratio: 45 },
    { week: 2, ratio: 62 },
    { week: 3, ratio: 78 },
    { week: 4, ratio: 85 }
  ]
};

/**
 * Generate realistic consultation data
 */
function generateConsultationData() {
  const consultations = [];
  const now = new Date();
  
  // Generate 4 weeks of historical data
  for (let day = 0; day < 28; day++) {
    const date = subDays(now, day);
    const dayOfWeek = date.getDay();
    
    // Skip Sundays (Mexican private practice pattern)
    if (dayOfWeek === 0) continue;
    
    // Saturdays have fewer consultations
    const baseConsultations = dayOfWeek === 6 ? 15 : 25;
    const variation = Math.floor(Math.random() * 8) - 4; // ±4 consultations
    const dailyConsultations = Math.max(10, baseConsultations + variation);
    
    for (let i = 0; i < dailyConsultations; i++) {
      const consultationType = selectWeightedRandom(MEXICAN_PRACTICE_PATTERNS.CONSULTATION_TYPES);
      const duration = randomBetween(consultationType.duration[0], consultationType.duration[1]);
      const fee = randomBetween(consultationType.fee[0], consultationType.fee[1]);
      
      // Generate consultation time during peak hours
      const hour = selectWeightedRandom(MEXICAN_PRACTICE_PATTERNS.PEAK_HOURS.map(h => ({ type: h, weight: 1 })));
      const minute = Math.floor(Math.random() * 60);
      const consultationDateTime = new Date(date);
      consultationDateTime.setHours(hour.type || 10, minute, 0, 0);
      
      consultations.push({
        id: `consultation_${format(date, 'yyyy-MM-dd')}_${i}`,
        date: consultationDateTime.toISOString(),
        duration,
        fee,
        type: consultationType.type,
        patientId: `patient_${Math.floor(Math.random() * 500)}`,
        patientName: MEXICAN_PRACTICE_PATTERNS.PATIENT_NAMES[Math.floor(Math.random() * MEXICAN_PRACTICE_PATTERNS.PATIENT_NAMES.length)],
        condition: MEXICAN_PRACTICE_PATTERNS.MEDICAL_CONDITIONS[Math.floor(Math.random() * MEXICAN_PRACTICE_PATTERNS.MEDICAL_CONDITIONS.length)],
        status: 'completed'
      });
    }
  }
  
  return consultations.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Generate realistic notes data with automation progression
 */
function generateNotesData(consultations) {
  const notes = [];
  const now = new Date();
  
  consultations.forEach(consultation => {
    const consultationDate = new Date(consultation.date);
    const daysAgo = Math.floor((now - consultationDate) / (1000 * 60 * 60 * 24));
    const weekAgo = Math.floor(daysAgo / 7);
    
    // Automation improves over time (learning curve)
    const automationCurve = MEXICAN_PRACTICE_PATTERNS.AUTOMATION_IMPROVEMENT_CURVE[Math.min(weekAgo, 3)];
    const isAutomatic = Math.random() * 100 < automationCurve.ratio;
    
    const noteLength = isAutomatic ? 
      randomBetween(150, 300) : // Automated notes tend to be more comprehensive
      randomBetween(80, 200);   // Manual notes vary more
    
    notes.push({
      id: `note_${consultation.id}`,
      consultationId: consultation.id,
      date: consultation.date,
      isAutomatic,
      length: noteLength,
      type: isAutomatic ? 'ai_generated' : 'manual',
      content: generateNoteContent(consultation, isAutomatic),
      createdAt: consultation.date,
      modifiedAt: consultation.date
    });
  });
  
  return notes;
}

/**
 * Generate realistic note content
 */
function generateNoteContent(consultation, isAutomatic) {
  const condition = consultation.condition;
  const patientName = consultation.patientName;
  
  if (isAutomatic) {
    return `Consulta médica - ${patientName}
    
MOTIVO DE CONSULTA: ${condition}
EXPLORACIÓN FÍSICA: Signos vitales estables, paciente consciente y orientado.
DIAGNÓSTICO: ${condition}
TRATAMIENTO: Manejo conservador según protocolo establecido.
SEGUIMIENTO: Control en 15 días.

[Nota generada automáticamente - ${format(new Date(consultation.date), 'dd/MM/yyyy HH:mm')}]`;
  } else {
    return `Paciente ${patientName} - ${condition}
    
Evolución favorable. Continúa tratamiento.
Próxima cita programada.

[Nota manual - ${format(new Date(consultation.date), 'dd/MM/yyyy')}]`;
  }
}

/**
 * Generate productivity metrics over time
 */
function generateProductivityTrend() {
  const trend = [];
  const now = new Date();
  
  for (let week = 0; week < 4; week++) {
    const weekStart = subDays(now, (week + 1) * 7);
    const consultationsPerDay = 20 + week * 2 + Math.floor(Math.random() * 5);
    const automationRatio = MEXICAN_PRACTICE_PATTERNS.AUTOMATION_IMPROVEMENT_CURVE[week].ratio;
    const avgConsultationTime = 18 - week * 1.5; // Improving efficiency
    const timeSavedHours = (automationRatio / 100) * 2.5; // More automation = more time saved
    
    trend.unshift({
      week: format(weekStart, 'dd MMM', { locale: es }),
      weekNumber: week + 1,
      consultationsPerDay,
      automationRatio,
      avgConsultationTime: Math.round(avgConsultationTime * 10) / 10,
      timeSavedHours: Math.round(timeSavedHours * 10) / 10,
      additionalConsultations: Math.floor(timeSavedHours * 60 / avgConsultationTime),
      revenue: consultationsPerDay * 1000 * 5, // 5 working days
      efficiency: Math.round((consultationsPerDay / 25) * 100) // Target: 25 consultations/day
    });
  }
  
  return trend;
}

/**
 * Generate economic impact projections
 */
function generateEconomicProjections() {
  const currentMetrics = {
    dailyConsultations: 28,
    avgConsultationFee: 1000,
    timeSavedDaily: 2.3,
    additionalConsultationsPossible: 3
  };
  
  return {
    current: {
      dailyRevenue: currentMetrics.dailyConsultations * currentMetrics.avgConsultationFee,
      monthlyRevenue: currentMetrics.dailyConsultations * currentMetrics.avgConsultationFee * 22,
      yearlyRevenue: currentMetrics.dailyConsultations * currentMetrics.avgConsultationFee * 22 * 12
    },
    withSystemOptimization: {
      dailyRevenue: (currentMetrics.dailyConsultations + currentMetrics.additionalConsultationsPossible) * currentMetrics.avgConsultationFee,
      monthlyRevenue: (currentMetrics.dailyConsultations + currentMetrics.additionalConsultationsPossible) * currentMetrics.avgConsultationFee * 22,
      yearlyRevenue: (currentMetrics.dailyConsultations + currentMetrics.additionalConsultationsPossible) * currentMetrics.avgConsultationFee * 22 * 12
    },
    improvement: {
      dailyIncrease: currentMetrics.additionalConsultationsPossible * currentMetrics.avgConsultationFee,
      monthlyIncrease: currentMetrics.additionalConsultationsPossible * currentMetrics.avgConsultationFee * 22,
      yearlyIncrease: currentMetrics.additionalConsultationsPossible * currentMetrics.avgConsultationFee * 22 * 12,
      percentageIncrease: Math.round((currentMetrics.additionalConsultationsPossible / currentMetrics.dailyConsultations) * 100)
    }
  };
}

/**
 * Generate comparison data for previous periods
 */
function generateComparisonData() {
  return {
    previousMonth: {
      avgConsultationTime: 18.7,
      automaticNotesRatio: 70,
      dailyPatientCount: 24,
      timeSavedHours: 1.8
    },
    previousWeek: {
      avgConsultationTime: 15.8,
      automaticNotesRatio: 82,
      dailyPatientCount: 27,
      timeSavedHours: 2.1
    }
  };
}

// 🛠️ UTILITY FUNCTIONS

function selectWeightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  
  return items[0];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate complete mock dataset
 */
export function generateCompleteMockData() {
  const consultations = generateConsultationData();
  const notes = generateNotesData(consultations);
  const productivityTrend = generateProductivityTrend();
  const economicProjections = generateEconomicProjections();
  const comparisonData = generateComparisonData();
  
  return {
    consultations,
    notes,
    productivityTrend,
    economicProjections,
    comparisonData,
    generatedAt: new Date().toISOString(),
    totalConsultations: consultations.length,
    totalNotes: notes.length,
    dataRange: {
      from: consultations[consultations.length - 1]?.date,
      to: consultations[0]?.date
    }
  };
}

/**
 * Get current day metrics
 */
export function getCurrentDayMetrics() {
  const data = generateCompleteMockData();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayConsultations = data.consultations.filter(c => 
    format(new Date(c.date), 'yyyy-MM-dd') === today
  );
  
  const todayNotes = data.notes.filter(n => 
    format(new Date(n.date), 'yyyy-MM-dd') === today
  );
  
  return {
    consultations: todayConsultations,
    notes: todayNotes,
    totalRevenue: todayConsultations.reduce((sum, c) => sum + c.fee, 0),
    avgConsultationTime: todayConsultations.reduce((sum, c) => sum + c.duration, 0) / todayConsultations.length,
    automationRatio: Math.round((todayNotes.filter(n => n.isAutomatic).length / todayNotes.length) * 100)
  };
}

const mockMedicalData = {
  generateCompleteMockData,
  getCurrentDayMetrics,
  generateConsultationData,
  generateNotesData,
  generateProductivityTrend,
  generateEconomicProjections,
  generateComparisonData,
  MEXICAN_PRACTICE_PATTERNS
};

export default mockMedicalData;