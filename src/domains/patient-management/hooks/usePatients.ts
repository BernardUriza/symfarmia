import Patient from '@/app/domain/entities/Patient';
import { useAppApi } from './useAppApi';

export function usePatients() {
  const api = useAppApi<any[]>('fetchPatients', [], { immediate: true });
  const patients = api.data ? api.data.map(p => new Patient(p as any)) : [];
  return { ...api, patients };
}
