/**
 * Custom hooks index
 * Exports all custom hooks for easy importing
 */

// Core hooks
export { useConfirmation } from './useConfirmation';
export { useForm, useFormArray, useFormField } from './useForm';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback, useThrottledCallback } from './useDebounce';
export { useDemoHighlight } from './useDemoHighlight';
export { useAppApi } from './useAppApi';
export { usePatients } from './usePatients';

// API hooks
export {
  useApi,
  useFetch,
  usePost,
  usePut,
  useDelete,
  useUpload,
  usePagination,
  useInfiniteScroll,
  type UseApiOptions,
} from './useApi';

// Additional utility hooks

import { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingState, Notification } from '@/types';

/**
 * Hook for managing loading states
 */
export function useLoading(): LoadingState & {
  setLoading: (loading: boolean, message?: string) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
} {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
  });

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setState({ isLoading: loading, message });
  }, []);

  const startLoading = useCallback((message?: string) => {
    setState({ isLoading: true, message });
  }, []);

  const stopLoading = useCallback(() => {
    setState({ isLoading: false, message: undefined });
  }, []);

  return {
    ...state,
    setLoading,
    startLoading,
    stopLoading,
  };
}

/**
 * Hook for managing notifications/toasts
 */
export function useNotifications(): {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
} {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}

/**
 * Hook for managing modal state
 */
export function useModal(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

/**
 * Hook for managing previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current ?? undefined;
}

/**
 * Hook for component mount status
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef<boolean>(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current ?? false, []);
}

/**
 * Hook for managing async operations with cleanup
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true
): {
  execute: () => Promise<void>;
  status: 'idle' | 'pending' | 'success' | 'error';
  value: T | null;
  error: E | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
} {
  const [state, setState] = useState<{
    status: 'idle' | 'pending' | 'success' | 'error';
    value: T | null;
    error: E | null;
  }>({
    status: 'idle',
    value: null,
    error: null,
  });

  const isMounted = useIsMounted();

  const execute = useCallback(async () => {
    setState({ status: 'pending', value: null, error: null });

    try {
      const response = await asyncFunction();
      
      if (isMounted()) {
        setState({ status: 'success', value: response, error: null });
      }
    } catch (error) {
      if (isMounted()) {
        setState({ status: 'error', value: null, error: error as E });
      }
    }
  }, [asyncFunction, isMounted]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status: state.status,
    value: state.value,
    error: state.error,
    isLoading: state.status === 'pending',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
  };
}

/**
 * Hook for managing copy to clipboard
 */
export function useClipboard(): {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
} {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard not supported'));
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      return true;
    } catch (err) {
      setError(err as Error);
      setCopied(false);
      return false;
    }
  }, []);

  return { copy, copied, error };
}

/**
 * Hook for managing window size
 */
export function useWindowSize(): {
  width: number | undefined;
  height: number | undefined;
} {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for detecting clicks outside element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: { preventDefault?: boolean } = {}
): void {
  const { preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys: string[] = [];
      
      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      if (event.metaKey) pressedKeys.push('meta');
      
      pressedKeys.push(event.key.toLowerCase());

      const isMatch = keys.every(key => pressedKeys.includes(key.toLowerCase()));
      
      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback, preventDefault]);
}

/**
 * Hook for managing intersection observer
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry ?? null);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return entry;
}