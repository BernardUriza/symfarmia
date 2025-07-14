/**
 * Patient Domain - Public API
 * 
 * This domain handles all patient-related functionality including:
 * - Patient management
 * - Medical reports
 * - Studies and study types
 * - Categories
 */

// Entities
export { Patient } from './entities/Patient';
export { MedicalReport } from './entities/MedicalReport';
export { Study } from './entities/Study';
export { StudyType } from './entities/StudyType';
export { Category } from './entities/Category';

// Repositories
export { BaseRepository } from './repositories/BaseRepository';
export type { IPatientRepository } from './repositories/interfaces/IPatientRepository';
export type { IMedicalReportRepository } from './repositories/interfaces/IMedicalReportRepository';
export type { IStudyTypeRepository } from './repositories/interfaces/IStudyTypeRepository';

// Hooks
export { usePatients } from './hooks/usePatients';
export { useMedicalReports } from './hooks/useMedicalReports';
export { useStudies } from './hooks/useStudies';
export { useStudyTypes } from './hooks/useStudyTypes';
export { useCategories } from './hooks/useCategories';