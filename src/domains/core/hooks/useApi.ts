/**
 * API hook for data fetching and mutations
 * Provides a comprehensive interface for API operations with TypeScript support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, handleApiResponse, parseApiError } from '@/utils/api';
import { ApiResponse } from '@/types/api';
import Logger from '@/utils/logger';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
  refetch: () => Promise<void>;
}

/**
 * Generic API hook for any API operation
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
  dependencies: unknown[] = [],
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    retries = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);

  const execute = useCallback(async (...args: unknown[]) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    setState((prev: UseApiState<T>) => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
    }));

    const executeWithRetry = async (): Promise<void> => {
      try {
        const startTime = performance.now();
        const response = await apiFunction(...args);
        
        Logger.performance('API Call', startTime);

        if (response.success && response.data) {
          setState({
            data: response.data,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          
          onSuccess?.(response.data);
        } else {
          throw new Error(response.error || 'API request failed');
        }
      } catch (error) {
        const errorMessage = parseApiError(error).message;
        Logger.error('API Error', error);

        if (retryCountRef.current !== null && retryCountRef.current < retries) {
          retryCountRef.current++;
          setTimeout(executeWithRetry, retryDelay * (retryCountRef.current ?? 1));
          return;
        }

        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
          isError: true,
          isSuccess: false,
        });

        onError?.(errorMessage);
      }
    };

    await executeWithRetry();
  }, [apiFunction, retries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately on mount or dependency change
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}

/**
 * Hook for fetching data from API
 */
export function useFetch<T>(
  endpoint: string,
  options: UseApiOptions & { params?: Record<string, string> } = {}
): UseApiReturn<T> {
  const { params, ...apiOptions } = options;

  const fetchFunction = useCallback(async () => {
    return apiClient.get<T>(endpoint, params);
  }, [endpoint, params]);

  return useApi(fetchFunction, [endpoint, params], apiOptions);
}

/**
 * Hook for POST requests
 */
export function usePost<T, D = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & {
  post: (data: D) => Promise<void>;
} {
  const postFunction = useCallback(async (data: D) => {
    return apiClient.post<T>(endpoint, data);
  }, [endpoint]);

  const apiHook: UseApiReturn<T> = useApi(postFunction as (...args: unknown[]) => Promise<ApiResponse<T>>, [endpoint], options);

  const post = useCallback(async (data: D) => {
    await apiHook.execute(data);
  }, [apiHook.execute]);

  return {
    ...apiHook,
    post,
  };
}

/**
 * Hook for PUT requests
 */
export function usePut<T, D = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & {
  put: (data: D) => Promise<void>;
} {
  const putFunction = useCallback(async (data: D) => {
    return apiClient.put<T>(endpoint, data);
  }, [endpoint]);

  const apiHook: UseApiReturn<T> = useApi(putFunction as (...args: unknown[]) => Promise<ApiResponse<T>>, [endpoint], options);

  const put = useCallback(async (data: D) => {
    await apiHook.execute(data);
  }, [apiHook.execute]);

  return {
    ...apiHook,
    put,
  };
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & {
  deleteResource: () => Promise<void>;
} {
  const deleteFunction = useCallback(async () => {
    return apiClient.delete<T>(endpoint);
  }, [endpoint]);

  const apiHook: UseApiReturn<T> = useApi(deleteFunction, [endpoint], options);

  const deleteResource = useCallback(async () => {
    await apiHook.execute();
  }, [apiHook.execute]);

  return {
    ...apiHook,
    deleteResource,
  };
}

/**
 * Hook for file uploads
 */
export function useUpload<T>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> & {
  upload: (file: File, additionalData?: Record<string, string>) => Promise<void>;
} {
  const uploadFunction = useCallback(async (file: File, additionalData?: Record<string, string>) => {
    return apiClient.upload<T>(endpoint, file, additionalData);
  }, [endpoint]);

  const apiHook: UseApiReturn<T> = useApi(uploadFunction as (...args: unknown[]) => Promise<ApiResponse<T>>, [endpoint], options);

  const upload = useCallback(async (file: File, additionalData?: Record<string, string>) => {
    await apiHook.execute(file, additionalData);
  }, [apiHook.execute]);

  return {
    ...apiHook,
    upload,
  };
}

/**
 * Hook for paginated data
 */
export function usePagination<T>(
  endpoint: string,
  initialPage: number = 1,
  initialLimit: number = 10,
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const fetchFunction = useCallback(async () => {
    return apiClient.get<T>(endpoint, {
      page: String(page),
      limit: String(limit),
    });
  }, [endpoint, page, limit]);

  const apiHook: UseApiReturn<T> = useApi(fetchFunction, [endpoint, page, limit], {
    ...options,
    immediate: true,
  });

  const nextPage = useCallback(() => {
    setPage((prev: number) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev: number) => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    ...apiHook,
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  };
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll<T>(
  endpoint: string,
  options: UseApiOptions & { pageSize?: number } = {}
) {
  const { pageSize = 10 } = options;
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await apiClient.get<{ data: T[]; hasMore: boolean }>(endpoint, {
        page: String(page),
        limit: String(pageSize),
      });

      const result = handleApiResponse(response);

      if (result.data.length === 0) {
        setHasMore(false);
      } else {
        setData((prev: T[]) => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setPage((prev: number) => prev + 1);
      }
    } catch (error) {
      Logger.error('Infinite scroll error', error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  useEffect(() => {
    fetchMore();
  }, []);

  return {
    data,
    hasMore,
    isLoading,
    fetchMore,
    reset,
  };
}