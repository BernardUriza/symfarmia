// Barrel export for all services
export { MedicalSpecialtyService } from './MedicalSpecialtyService.js';
export { default as MedicalAILogic } from './MedicalAILogic.js';
export { processMedicalQuery, getErrorMessage, getAvailableTypes } from './MedicalAILogic.js';

// Lazy imports for heavy services
export const getMedicalSpecialtyService = () => import('./MedicalSpecialtyService.js').then(m => m.MedicalSpecialtyService);
export const getMedicalAILogic = () => import('./MedicalAILogic.js').then(m => m.default);