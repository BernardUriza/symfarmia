// Core services - lightweight utilities
export * from '../../lib/config/MedicalAIConfig';

// Lazy loaders for heavy services
export const getMedicalSpecialtyService = () => import('../MedicalSpecialtyService').then(m => m.MedicalSpecialtyService);
export const getMedicalAILogic = () => import('../MedicalAILogic').then(m => m.default);