/**
 * MEDICAL KPI CALCULATOR
 * 
 * Calculates key performance indicators for Mexican private medical practice
 * Focuses on productivity, efficiency, and economic ROI metrics
 */

import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// 🏥 MEXICAN PRIVATE PRACTICE CONSTANTS
const MEXICAN_PRACTICE_CONSTANTS = {
  AVERAGE_CONSULTATION_FEE: 1000, // MXN - Average private consultation fee
  WORKING_HOURS_PER_DAY: 8,
  WORKING_DAYS_PER_WEEK: 5,
  MANUAL_DOCUMENTATION_TIME: 7, // minutes per patient
  AUTOMATED_DOCUMENTATION_TIME: 1.5, // minutes per patient
  TARGET_CONSULTATIONS_PER_DAY: 25,
  OPTIMAL_CONSULTATION_TIME: 15, // minutes
};

// 🔢 CORE KPI CALCULATIONS

/**
 * Calculate average consultation time
 */
export function calculateAverageConsultationTime(consultations) {
  if (!consultations || consultations.length === 0) return 0;
  
  const totalMinutes = consultations.reduce((sum, consultation) => {
    return sum + (consultation.duration || MEXICAN_PRACTICE_CONSTANTS.OPTIMAL_CONSULTATION_TIME);
  }, 0);
  
  return Math.round(totalMinutes / consultations.length * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate automatic notes ratio
 */
export function calculateAutomaticNotesRatio(notes) {
  if (!notes || notes.length === 0) return 0;
  
  const automaticNotes = notes.filter(note => note.isAutomatic).length;
  return Math.round((automaticNotes / notes.length) * 100);
}

/**
 * Calculate daily patient count
 */
export function calculateDailyPatientCount(consultations, targetDate = new Date()) {
  if (!consultations || consultations.length === 0) return 0;
  
  const targetDateStr = format(targetDate, 'yyyy-MM-dd');
  const todayConsultations = consultations.filter(consultation => {
    const consultationDate = format(new Date(consultation.date), 'yyyy-MM-dd');
    return consultationDate === targetDateStr;
  });
  
  return todayConsultations.length;
}

/**
 * Calculate documentation time saved
 */
export function calculateDocumentationTimeSaved(notes, _consultations) {
  if (!notes || notes.length === 0) return { hours: 0, minutes: 0 };
  
  const automaticNotes = notes.filter(note => note.isAutomatic).length;
  const manualNotes = notes.length - automaticNotes;
  
  const manualTime = manualNotes * MEXICAN_PRACTICE_CONSTANTS.MANUAL_DOCUMENTATION_TIME;
  const automaticTime = automaticNotes * MEXICAN_PRACTICE_CONSTANTS.AUTOMATED_DOCUMENTATION_TIME;
  const timeSaved = manualTime + automaticTime - (notes.length * MEXICAN_PRACTICE_CONSTANTS.AUTOMATED_DOCUMENTATION_TIME);
  
  return {
    totalMinutes: Math.round(timeSaved),
    hours: Math.round(timeSaved / 60 * 10) / 10,
    minutes: Math.round(timeSaved % 60)
  };
}

/**
 * Calculate additional consultations possible
 */
export function calculateAdditionalConsultationsPossible(timeSavedMinutes) {
  if (!timeSavedMinutes || timeSavedMinutes <= 0) return 0;
  
  return Math.floor(timeSavedMinutes / MEXICAN_PRACTICE_CONSTANTS.OPTIMAL_CONSULTATION_TIME);
}

/**
 * Calculate potential income increase
 */
export function calculatePotentialIncomeIncrease(additionalConsultations, consultationFee = MEXICAN_PRACTICE_CONSTANTS.AVERAGE_CONSULTATION_FEE) {
  return additionalConsultations * consultationFee;
}

/**
 * Calculate weekly trend data
 */
export function calculateWeeklyTrend(consultations, _startDate = subDays(new Date(), 28)) {
  if (!consultations || consultations.length === 0) return [];
  
  const weeklyData = [];
  const endDate = new Date();
  
  for (let week = 0; week < 4; week++) {
    const weekStart = startOfWeek(subDays(endDate, week * 7));
    const weekEnd = endOfWeek(subDays(endDate, week * 7));
    
    const weekConsultations = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate >= weekStart && consultationDate <= weekEnd;
    });
    
    const avgConsultationsPerDay = weekConsultations.length / 7;
    const weekRevenue = weekConsultations.length * MEXICAN_PRACTICE_CONSTANTS.AVERAGE_CONSULTATION_FEE;
    
    weeklyData.unshift({
      week: format(weekStart, 'dd MMM', { locale: es }),
      consultations: weekConsultations.length,
      avgPerDay: Math.round(avgConsultationsPerDay * 10) / 10,
      revenue: weekRevenue,
      efficiency: Math.round((avgConsultationsPerDay / MEXICAN_PRACTICE_CONSTANTS.TARGET_CONSULTATIONS_PER_DAY) * 100)
    });
  }
  
  return weeklyData;
}

/**
 * Calculate comprehensive Mexican private practice KPIs
 */
export function calculateMexicanPrivatePracticeKPIs(data) {
  const {
    consultations = [],
    notes = [],
    targetDate = new Date(),
    previousPeriodData = null
  } = data;
  
  // Core metrics
  const avgConsultationTime = calculateAverageConsultationTime(consultations);
  const automaticNotesRatio = calculateAutomaticNotesRatio(notes);
  const dailyPatientCount = calculateDailyPatientCount(consultations, targetDate);
  const timeSaved = calculateDocumentationTimeSaved(notes, consultations);
  const additionalConsultations = calculateAdditionalConsultationsPossible(timeSaved.totalMinutes);
  const potentialIncome = calculatePotentialIncomeIncrease(additionalConsultations);
  const weeklyTrend = calculateWeeklyTrend(consultations);
  
  // Comparisons with previous period
  const comparisons = previousPeriodData ? {
    avgConsultationTime: avgConsultationTime - (previousPeriodData.avgConsultationTime || 0),
    automaticNotesRatio: automaticNotesRatio - (previousPeriodData.automaticNotesRatio || 0),
    dailyPatientCount: dailyPatientCount - (previousPeriodData.dailyPatientCount || 0),
    timeSavedHours: timeSaved.hours - (previousPeriodData.timeSavedHours || 0)
  } : null;
  
  // ROI calculations
  const monthlyAdditionalRevenue = potentialIncome * 22; // Working days per month
  const systemEfficiencyScore = Math.round((automaticNotesRatio + (timeSaved.hours * 10) + (additionalConsultations * 5)) / 3);
  
  return {
    coreMetrics: {
      avgConsultationTime,
      automaticNotesRatio,
      dailyPatientCount,
      timeSaved,
      additionalConsultations,
      potentialIncome
    },
    economicImpact: {
      dailyAdditionalRevenue: potentialIncome,
      monthlyAdditionalRevenue,
      annualPotentialIncrease: monthlyAdditionalRevenue * 12,
      systemEfficiencyScore
    },
    trends: {
      weeklyTrend,
      comparisons
    },
    insights: {
      productivityGain: Math.round((timeSaved.hours / MEXICAN_PRACTICE_CONSTANTS.WORKING_HOURS_PER_DAY) * 100),
      capacityIncrease: Math.round((additionalConsultations / MEXICAN_PRACTICE_CONSTANTS.TARGET_CONSULTATIONS_PER_DAY) * 100),
      automationLevel: automaticNotesRatio
    }
  };
}

/**
 * Generate formatted KPI summary for display
 */
export function generateKPISummary(kpis, locale = 'es') {
  const { coreMetrics, economicImpact, insights } = kpis;
  
  return {
    primaryMetrics: [
      {
        key: 'avgConsultationTime',
        value: coreMetrics.avgConsultationTime,
        unit: 'min',
        trend: kpis.trends.comparisons?.avgConsultationTime || 0,
        target: MEXICAN_PRACTICE_CONSTANTS.OPTIMAL_CONSULTATION_TIME
      },
      {
        key: 'automaticNotesRatio',
        value: coreMetrics.automaticNotesRatio,
        unit: '%',
        trend: kpis.trends.comparisons?.automaticNotesRatio || 0,
        target: 80
      },
      {
        key: 'dailyPatientCount',
        value: coreMetrics.dailyPatientCount,
        unit: 'patients',
        trend: kpis.trends.comparisons?.dailyPatientCount || 0,
        target: MEXICAN_PRACTICE_CONSTANTS.TARGET_CONSULTATIONS_PER_DAY
      },
      {
        key: 'timeSaved',
        value: coreMetrics.timeSaved.hours,
        unit: 'hrs',
        trend: kpis.trends.comparisons?.timeSavedHours || 0,
        target: 2
      }
    ],
    economicMetrics: [
      {
        key: 'dailyAdditionalRevenue',
        value: economicImpact.dailyAdditionalRevenue,
        unit: 'MXN',
        format: 'currency'
      },
      {
        key: 'monthlyAdditionalRevenue',
        value: economicImpact.monthlyAdditionalRevenue,
        unit: 'MXN',
        format: 'currency'
      },
      {
        key: 'additionalConsultations',
        value: coreMetrics.additionalConsultations,
        unit: 'consultations'
      }
    ],
    insights: {
      mainMessage: `productivity.insights.saved_time_${locale}`,
      secondaryMessage: `productivity.insights.additional_capacity_${locale}`,
      automationLevel: insights.automationLevel
    }
  };
}

/**
 * Mock data generator for development and testing
 */
export function generateMockMedicalData() {
  const now = new Date();
  const consultations = [];
  const notes = [];
  
  // Generate 4 weeks of mock data
  for (let day = 0; day < 28; day++) {
    const date = subDays(now, day);
    const dailyConsultations = Math.floor(Math.random() * 10) + 20; // 20-30 consultations per day
    
    for (let i = 0; i < dailyConsultations; i++) {
      const consultationId = `consultation_${day}_${i}`;
      const duration = Math.floor(Math.random() * 10) + 10; // 10-20 minutes
      const isAutomatic = Math.random() > 0.2; // 80% automatic
      
      consultations.push({
        id: consultationId,
        date: date.toISOString(),
        duration,
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        type: ['general', 'followup', 'urgent'][Math.floor(Math.random() * 3)]
      });
      
      notes.push({
        id: `note_${consultationId}`,
        consultationId,
        date: date.toISOString(),
        isAutomatic,
        length: Math.floor(Math.random() * 200) + 50, // 50-250 characters
        type: isAutomatic ? 'ai_generated' : 'manual'
      });
    }
  }
  
  return { consultations, notes };
}

const MedicalKPICalculator = {
  calculateAverageConsultationTime,
  calculateAutomaticNotesRatio,
  calculateDailyPatientCount,
  calculateDocumentationTimeSaved,
  calculateAdditionalConsultationsPossible,
  calculatePotentialIncomeIncrease,
  calculateWeeklyTrend,
  calculateMexicanPrivatePracticeKPIs,
  generateKPISummary,
  generateMockMedicalData,
  MEXICAN_PRACTICE_CONSTANTS
};

export default MedicalKPICalculator;