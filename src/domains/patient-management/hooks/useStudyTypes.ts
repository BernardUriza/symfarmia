import { useAppApi } from './useAppApi';
import type { StudyType } from '@/types/providers';

export function useStudyTypes(immediate = true) {
  const api = useAppApi<StudyType[]>('fetchStudyTypes', [], { immediate });
  return { ...api, studyTypes: api.data ?? [] };
}
