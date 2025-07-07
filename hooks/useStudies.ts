import { useAppApi } from './useAppApi';
import type { Study } from '@/types/providers';

export function useStudies(immediate = true) {
  const api = useAppApi<Study[]>('fetchStudies', [], { immediate });
  return { ...api, studies: api.data ?? [] };
}
