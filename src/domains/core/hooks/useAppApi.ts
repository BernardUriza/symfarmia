import { useCallback } from 'react';
import { useApi, UseApiOptions } from './useApi';
import { useAppMode } from '@/src/providers/AppModeProvider';
import { APIProvider } from '@/src/providers/APIProvider';

export function useAppApi<T>(
  method: keyof APIProvider,
  args: unknown[] = [],
  options: UseApiOptions = {}
) {
  const { apiProvider } = useAppMode();
  const apiFunction = useCallback(async () => {
    return apiProvider ? await (apiProvider as any)[method](...args) : { success: false };
  }, [apiProvider, method, ...args]);
  return useApi<T>(apiFunction, [apiProvider, method, ...args], options);
}
