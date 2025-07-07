// Core services - lightweight utilities
export * from '../../config/MedicalAIConfig.js';

// Lazy loaders for heavy services
export const getMedicalSpecialtyService = () => import('../MedicalSpecialtyService.js').then(m => m.MedicalSpecialtyService);
export const getMedicalAILogic = () => import('../MedicalAILogic.js').then(m => m.default);