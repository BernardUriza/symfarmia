import { useAppApi } from './useAppApi';
import type { Category } from '@/types/providers';

export function useCategories(immediate = true) {
  const api = useAppApi<Category[]>('fetchCategories', [], { immediate });
  return { ...api, categories: api.data ?? [] };
}
