/**
 * Centralized Logging Configuration
 * Defines what components can log and when
 */

// Log levels for different environments
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Environment-based logging configuration
export const ENV_LOG_CONFIG = {
  production: {
    level: LOG_LEVELS.ERROR,
    enabledComponents: ['MedicalErrors', 'CriticalSystems', 'AuthErrors'],
    enabledCategories: ['error', 'critical', 'security'],
    performanceThreshold: 2000, // Log performance issues over 2s
    apiErrorsOnly: true,
    userDataLogging: false
  },
  
  development: {
    level: LOG_LEVELS.DEBUG,
    enabledComponents: ['*'], // All components
    enabledCategories: ['*'], // All categories
    performanceThreshold: 100, // Log performance issues over 100ms
    apiErrorsOnly: false,
    userDataLogging: true
  },
  
  test: {
    level: LOG_LEVELS.WARN,
    enabledComponents: ['TestRunner', 'APITests', 'ComponentTests'],
    enabledCategories: ['test', 'error', 'warn'],
    performanceThreshold: 500,
    apiErrorsOnly: false,
    userDataLogging: false
  }
};

// Component-specific logging configuration
export const COMPONENT_LOG_CONFIG = {
  // Theme-related components
  'ThemeProvider': {
    enabled: true,
    level: LOG_LEVELS.WARN,
    categories: ['error', 'critical'],
    verboseInDev: false
  },
  
  'ThemeProviderBulletproof': {
    enabled: true,
    level: LOG_LEVELS.ERROR,
    categories: ['error', 'critical'],
    verboseInDev: false
  },
  
  // Cache-related components
  'BraveCacheBuster': {
    enabled: true,
    level: LOG_LEVELS.WARN,
    categories: ['warn', 'error'],
    verboseInDev: false
  },
  
  // Medical components
  'MedicalAI': {
    enabled: true,
    level: LOG_LEVELS.INFO,
    categories: ['error', 'warn', 'info'],
    verboseInDev: true
  },
  
  'PatientRecords': {
    enabled: true,
    level: LOG_LEVELS.ERROR,
    categories: ['error', 'critical', 'security'],
    verboseInDev: false
  },
  
  'MedicalReports': {
    enabled: true,
    level: LOG_LEVELS.WARN,
    categories: ['error', 'warn', 'performance'],
    verboseInDev: true
  },
  
  // Authentication components
  'AuthProvider': {
    enabled: true,
    level: LOG_LEVELS.ERROR,
    categories: ['error', 'critical', 'security'],
    verboseInDev: false
  },
  
  // API components
  'APIClient': {
    enabled: true,
    level: LOG_LEVELS.WARN,
    categories: ['error', 'warn', 'performance'],
    verboseInDev: true
  },
  
  // Debug components
  'DebugToggle': {
    enabled: true,
    level: LOG_LEVELS.DEBUG,
    categories: ['debug', 'info'],
    verboseInDev: true
  },
  
  // Landing page components
  'LandingPage': {
    enabled: true,
    level: LOG_LEVELS.WARN,
    categories: ['error', 'warn'],
    verboseInDev: false
  },
  
  // Demo components
  'DemoMode': {
    enabled: true,
    level: LOG_LEVELS.INFO,
    categories: ['info', 'warn', 'error'],
    verboseInDev: true
  }
};

// Category-based logging rules
export const CATEGORY_CONFIG = {
  error: {
    alwaysLog: true,
    storeInAuditTrail: true,
    sendToErrorTracking: true
  },
  
  critical: {
    alwaysLog: true,
    storeInAuditTrail: true,
    sendToErrorTracking: true,
    alertDevelopers: true
  },
  
  security: {
    alwaysLog: true,
    storeInAuditTrail: true,
    sendToErrorTracking: true,
    alertDevelopers: true,
    sanitizeData: true
  },
  
  performance: {
    alwaysLog: false,
    thresholdBased: true,
    storeInAuditTrail: false,
    sendToErrorTracking: false
  },
  
  debug: {
    alwaysLog: false,
    developmentOnly: true,
    storeInAuditTrail: false,
    sendToErrorTracking: false
  },
  
  info: {
    alwaysLog: false,
    storeInAuditTrail: false,
    sendToErrorTracking: false
  },
  
  warn: {
    alwaysLog: true,
    storeInAuditTrail: true,
    sendToErrorTracking: false
  }
};

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENV_LOG_CONFIG[env] || ENV_LOG_CONFIG.development;
};

// Check if component should log
export const shouldComponentLog = (componentName, level, category) => {
  const envConfig = getCurrentEnvConfig();
  const componentConfig = COMPONENT_LOG_CONFIG[componentName];
  
  // Check if component is enabled
  if (!envConfig.enabledComponents.includes('*') && 
      !envConfig.enabledComponents.includes(componentName)) {
    return false;
  }
  
  // Check component-specific configuration
  if (componentConfig && !componentConfig.enabled) {
    return false;
  }
  
  // Check log level
  if (level < envConfig.level) {
    return false;
  }
  
  // Check category
  if (!envConfig.enabledCategories.includes('*') && 
      !envConfig.enabledCategories.includes(category)) {
    return false;
  }
  
  // Check component-specific categories
  if (componentConfig && componentConfig.categories && 
      !componentConfig.categories.includes(category)) {
    return false;
  }
  
  return true;
};

// Get logging configuration for a component
export const getComponentLogConfig = (componentName) => {
  const envConfig = getCurrentEnvConfig();
  const componentConfig = COMPONENT_LOG_CONFIG[componentName] || {};
  
  return {
    enabled: componentConfig.enabled !== false,
    level: componentConfig.level || envConfig.level,
    categories: componentConfig.categories || envConfig.enabledCategories,
    verboseInDev: componentConfig.verboseInDev !== false && envConfig.level >= LOG_LEVELS.DEBUG,
    performanceThreshold: envConfig.performanceThreshold,
    apiErrorsOnly: envConfig.apiErrorsOnly,
    userDataLogging: envConfig.userDataLogging
  };
};

// Check if category should always log
export const shouldCategoryAlwaysLog = (category) => {
  const categoryConfig = CATEGORY_CONFIG[category];
  return categoryConfig?.alwaysLog || false;
};

// Get category configuration
export const getCategoryConfig = (category) => {
  return CATEGORY_CONFIG[category] || {
    alwaysLog: false,
    storeInAuditTrail: false,
    sendToErrorTracking: false
  };
};

// Runtime configuration updates
export const updateComponentLogConfig = (componentName, config) => {
  if (process.env.NODE_ENV === 'development') {
    COMPONENT_LOG_CONFIG[componentName] = {
      ...COMPONENT_LOG_CONFIG[componentName],
      ...config
    };
  }
};

// Enable/disable logging for a component
export const setComponentLogging = (componentName, enabled) => {
  if (process.env.NODE_ENV === 'development') {
    updateComponentLogConfig(componentName, { enabled });
  }
};

// Bulk enable/disable components
export const setComponentsLogging = (componentNames, enabled) => {
  if (process.env.NODE_ENV === 'development') {
    componentNames.forEach(name => {
      setComponentLogging(name, enabled);
    });
  }
};

// Get all component names
export const getComponentNames = () => {
  return Object.keys(COMPONENT_LOG_CONFIG);
};

// Get logging statistics
export const getLoggingStats = () => {
  const envConfig = getCurrentEnvConfig();
  const components = getComponentNames();
  const enabledComponents = components.filter(name => 
    shouldComponentLog(name, envConfig.level, 'info')
  );
  
  return {
    environment: process.env.NODE_ENV,
    totalComponents: components.length,
    enabledComponents: enabledComponents.length,
    currentLevel: envConfig.level,
    enabledCategories: envConfig.enabledCategories,
    performanceThreshold: envConfig.performanceThreshold
  };
};

// Export configuration presets
export const LOG_PRESETS = {
  MINIMAL: {
    level: LOG_LEVELS.ERROR,
    categories: ['error', 'critical'],
    components: ['MedicalErrors', 'CriticalSystems', 'AuthErrors']
  },
  
  STANDARD: {
    level: LOG_LEVELS.WARN,
    categories: ['error', 'warn', 'critical'],
    components: ['*']
  },
  
  VERBOSE: {
    level: LOG_LEVELS.DEBUG,
    categories: ['*'],
    components: ['*']
  },
  
  PRODUCTION_SAFE: {
    level: LOG_LEVELS.ERROR,
    categories: ['error', 'critical', 'security'],
    components: ['MedicalErrors', 'CriticalSystems', 'AuthErrors', 'PatientRecords']
  }
};

// Apply a preset configuration
export const applyLogPreset = (presetName) => {
  const preset = LOG_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown log preset: ${presetName}`);
  }
  
  if (process.env.NODE_ENV === 'development') {
    // Update runtime configuration
    const envConfig = getCurrentEnvConfig();
    envConfig.level = preset.level;
    envConfig.enabledCategories = preset.categories;
    envConfig.enabledComponents = preset.components;
  }
};

export default {
  LOG_LEVELS,
  ENV_LOG_CONFIG,
  COMPONENT_LOG_CONFIG,
  CATEGORY_CONFIG,
  getCurrentEnvConfig,
  shouldComponentLog,
  getComponentLogConfig,
  shouldCategoryAlwaysLog,
  getCategoryConfig,
  updateComponentLogConfig,
  setComponentLogging,
  setComponentsLogging,
  getComponentNames,
  getLoggingStats,
  LOG_PRESETS,
  applyLogPreset
};