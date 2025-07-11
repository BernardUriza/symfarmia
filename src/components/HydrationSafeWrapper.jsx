"use client";
/**
 * MEDICAL-GRADE HYDRATION SAFE WRAPPER
 * ====================================
 * 
 * 🏥 MEDICAL SOFTWARE RELIABILITY STANDARD
 * 🛡️ BULLETPROOF HYDRATION ERROR PREVENTION
 * ⚡ AUTOMATIC ERROR RECOVERY SYSTEM
 * 🔄 SEAMLESS MEDICAL WORKFLOW PROTECTION
 */

import { useMedicalHydrationSafe } from '../../src/hooks/useMedicalHydrationSafe';

/**
 * MEDICAL-GRADE HYDRATION SAFE WRAPPER
 * 
 * Wraps critical medical components to prevent hydration errors
 * Uses the existing useMedicalHydrationSafe hook for maximum reliability
 */
function HydrationSafeWrapper({ 
  children, 
  fallback = null,
  componentName = "HydrationSafeWrapper",
  className = "",
  style = {},
  criticalComponent = false,
  showLoadingState = false 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe(componentName);

  // Enhanced loading state for critical components
  const loadingFallback = showLoadingState ? (
    <div className={`medical-hydration-loading ${className}`} style={style}>
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {criticalComponent ? "Inicializando componente crítico..." : "Cargando componente..."}
        </span>
      </div>
    </div>
  ) : fallback;

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    loadingFallback
  );
}

/**
 * MEDICAL DASHBOARD SAFE WRAPPER
 * 
 * Specifically designed for dashboard components
 */
function MedicalDashboardSafeWrapper({ 
  children, 
  className = "",
  style = {} 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe("MedicalDashboard");

  const dashboardFallback = (
    <div className={`medical-dashboard-loading ${className}`} style={style}>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    dashboardFallback
  );
}

/**
 * MEDICAL TRANSCRIPTION SAFE WRAPPER
 * 
 * Specifically designed for transcription components
 */
function MedicalTranscriptionSafeWrapper({ 
  children, 
  className = "",
  style = {} 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe("MedicalTranscription");

  const transcriptionFallback = (
    <div className={`medical-transcription-loading ${className}`} style={style}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    transcriptionFallback
  );
}

/**
 * MEDICAL PATIENT DATA SAFE WRAPPER
 * 
 * Specifically designed for patient data components
 */
function MedicalPatientDataSafeWrapper({ 
  children, 
  className = "",
  style = {} 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe("MedicalPatientData");

  const patientDataFallback = (
    <div className={`medical-patient-data-loading ${className}`} style={style}>
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    patientDataFallback
  );
}

/**
 * MEDICAL FORM SAFE WRAPPER
 * 
 * Specifically designed for medical forms with validation
 */
function MedicalFormSafeWrapper({ 
  children, 
  formName = "Medical Form",
  className = "",
  style = {} 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe(`MedicalForm-${formName}`);

  const formFallback = (
    <div className={`medical-form-loading ${className}`} style={style}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    formFallback
  );
}

/**
 * MEDICAL CHART SAFE WRAPPER
 * 
 * Specifically designed for medical charts and graphs
 */
function MedicalChartSafeWrapper({ 
  children, 
  chartTitle = "Medical Chart",
  className = "",
  style = {} 
}) {
  const { renderWhenSafe } = useMedicalHydrationSafe(`MedicalChart-${chartTitle}`);

  const chartFallback = (
    <div className={`medical-chart-loading ${className}`} style={style}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  return renderWhenSafe(
    <div className={className} style={style}>
      {children}
    </div>,
    chartFallback
  );
}

export default HydrationSafeWrapper;
export { 
  MedicalDashboardSafeWrapper,
  MedicalTranscriptionSafeWrapper,
  MedicalPatientDataSafeWrapper,
  MedicalFormSafeWrapper,
  MedicalChartSafeWrapper
};