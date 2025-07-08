/**
 * Medical Theme
 * 
 * Design system for medical applications with semantic colors
 */

export const medicalTheme = {
  colors: {
    primary: {
      50: '#eff6ff',   // Light medical blue
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Standard medical blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'   // Dark medical blue
    },
    medical: {
      emergency: '#ef4444',    // Red for emergencies
      warning: '#f59e0b',      // Amber for warnings
      success: '#10b981',      // Green for success
      info: '#3b82f6',         // Blue for information
      neutral: '#6b7280'       // Gray for neutral states
    },
    semantic: {
      transcriptionActive: '#10b981',     // Green when actively transcribing
      analysisProcessing: '#f59e0b',      // Amber during AI analysis
      criticalAlert: '#ef4444',           // Red for critical alerts
      patientSafe: '#10b981',             // Green for safe status
      confidenceHigh: '#10b981',          // Green for high confidence
      confidenceMedium: '#f59e0b',        // Amber for medium confidence
      confidenceLow: '#ef4444',           // Red for low confidence
      medicalTermDetected: '#3b82f6',     // Blue for medical terms
      urgencyLow: '#10b981',              // Green for low urgency
      urgencyMedium: '#f59e0b',           // Amber for medium urgency
      urgencyHigh: '#ef4444',             // Red for high urgency
      urgencyCritical: '#dc2626'          // Dark red for critical urgency
    },
    specialty: {
      general: '#6b7280',        // Gray for general medicine
      cardiology: '#ef4444',     // Red for cardiology
      pediatrics: '#3b82f6',     // Blue for pediatrics
      emergency: '#dc2626',      // Dark red for emergency
      obstetrics: '#ec4899',     // Pink for obstetrics
      neurology: '#8b5cf6',      // Purple for neurology
      psychiatry: '#06b6d4',     // Cyan for psychiatry
      dermatology: '#f59e0b',    // Amber for dermatology
      orthopedics: '#84cc16',    // Lime for orthopedics
      oncology: '#6366f1'        // Indigo for oncology
    },
    status: {
      online: '#10b981',
      offline: '#6b7280',
      busy: '#f59e0b',
      away: '#ef4444'
    }
  },
  spacing: {
    consultation: '2rem',    // Optimal for medical workflows
    emergency: '1rem',       // Compact for urgent scenarios
    comfortable: '3rem',     // Relaxed for routine work
    compact: '0.5rem',       // Very tight spacing
    loose: '4rem'            // Extra spacious
  },
  typography: {
    medical: {
      fontFamily: 'Inter, system-ui, sans-serif',
      sizes: {
        patientName: '1.5rem',     // 24px
        diagnosis: '1.125rem',      // 18px
        notes: '1rem',              // 16px
        metadata: '0.875rem',       // 14px
        label: '0.75rem',           // 12px
        caption: '0.625rem'         // 10px
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75'
      }
    }
  },
  shadows: {
    medical: {
      card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      alert: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      urgent: '0 0 0 3px rgba(239, 68, 68, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  borders: {
    medical: {
      default: '1px solid #e5e7eb',
      active: '2px solid #3b82f6',
      error: '2px solid #ef4444',
      success: '2px solid #10b981',
      warning: '2px solid #f59e0b'
    },
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    }
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },
  zIndex: {
    modal: 1000,
    alert: 1100,
    tooltip: 1200,
    emergency: 1300
  }
} as const;

// Medical theme utilities
export const getMedicalColor = (type: keyof typeof medicalTheme.colors.medical) => {
  return medicalTheme.colors.medical[type];
};

export const getSemanticColor = (type: keyof typeof medicalTheme.colors.semantic) => {
  return medicalTheme.colors.semantic[type];
};

export const getSpecialtyColor = (specialty: keyof typeof medicalTheme.colors.specialty) => {
  return medicalTheme.colors.specialty[specialty];
};

export const getUrgencyColor = (urgency: 'low' | 'medium' | 'high' | 'critical') => {
  switch (urgency) {
    case 'low':
      return medicalTheme.colors.semantic.urgencyLow;
    case 'medium':
      return medicalTheme.colors.semantic.urgencyMedium;
    case 'high':
      return medicalTheme.colors.semantic.urgencyHigh;
    case 'critical':
      return medicalTheme.colors.semantic.urgencyCritical;
    default:
      return medicalTheme.colors.medical.neutral;
  }
};

export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return medicalTheme.colors.semantic.confidenceHigh;
  if (confidence >= 0.6) return medicalTheme.colors.semantic.confidenceMedium;
  return medicalTheme.colors.semantic.confidenceLow;
};

// CSS variables for theme
export const medicalThemeCSSVariables = {
  '--medical-primary': medicalTheme.colors.primary[500],
  '--medical-emergency': medicalTheme.colors.medical.emergency,
  '--medical-warning': medicalTheme.colors.medical.warning,
  '--medical-success': medicalTheme.colors.medical.success,
  '--medical-info': medicalTheme.colors.medical.info,
  '--medical-spacing-consultation': medicalTheme.spacing.consultation,
  '--medical-spacing-emergency': medicalTheme.spacing.emergency,
  '--medical-font-family': medicalTheme.typography.medical.fontFamily,
  '--medical-patient-name-size': medicalTheme.typography.medical.sizes.patientName,
  '--medical-diagnosis-size': medicalTheme.typography.medical.sizes.diagnosis,
  '--medical-notes-size': medicalTheme.typography.medical.sizes.notes
};

export default medicalTheme;