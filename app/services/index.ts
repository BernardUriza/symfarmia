// Barrel export for all services
export { MedicalSpecialtyService } from './MedicalSpecialtyService';
export { default as MedicalAILogic } from './MedicalAILogic';
export { processMedicalQuery, getErrorMessage, getAvailableTypes } from './MedicalAILogic';

// Lazy imports for heavy services
export const getMedicalSpecialtyService = () => import('./MedicalSpecialtyService').then(m => m.MedicalSpecialtyService);
export const getMedicalAILogic = () => import('./MedicalAILogic').then(m => m.default);
export { queryWithFallback } from './openAIFallbackService';
export { CustomGPTService, customGPTService } from './customGPTService';
export * from './modelDiscoveryService';


