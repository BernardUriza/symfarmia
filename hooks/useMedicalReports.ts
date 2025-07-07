import { useAppApi } from './useAppApi';
import type { MedicalReport } from '@/types/providers';

export function useMedicalReports(immediate = true) {
  const api = useAppApi<MedicalReport[]>('fetchMedicalReports', [], { immediate });
  return { ...api, medicalReports: api.data ?? [] };
}
