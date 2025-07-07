// Lazy-loaded providers - heavy dependencies
export const getDemoAPIProvider = () => import('../DemoAPIProvider').then(m => m.DemoAPIProvider);
export const getLiveAPIProvider = () => import('../LiveAPIProvider').then(m => m.LiveAPIProvider);
export const getPatientContextProvider = () => import('../PatientContextProvider').then(m => m.PatientContextProvider);

// Export types for static analysis
export type { DemoData } from '@/types/providers';