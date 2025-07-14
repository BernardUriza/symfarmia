// Core providers - lightweight, always loaded
export { APIProvider } from '../APIProvider';
export { AppModeProvider } from '../AppModeProvider';
export { I18nProvider } from '../I18nProvider';

// Type exports - no runtime cost
export type { Database } from '@/src/infrastructure/database';
export type {
  APIResponse,
  Category,
  EmailData,
  MedicalReport,
  Patient,
  Study,
  StudyType,
  MergePdfData,
  MergePdfResult
} from '@/types/providers';