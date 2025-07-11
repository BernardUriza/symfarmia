"use client"
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DemoAPIProvider } from './DemoAPIProvider';
import { LiveAPIProvider } from './LiveAPIProvider';
import { createDatabase } from '../infrastructure/database';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRouter, useSearchParams } from 'next/navigation';

interface AppModeContextValue {
  appMode: 'live' | 'demo';
  apiProvider: DemoAPIProvider | LiveAPIProvider | null;
  isDemoMode: boolean;
  isLiveMode: boolean;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextValue | undefined>(undefined);

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    // Return default values for SSR compatibility
    return {
      appMode: 'live' as const,
      apiProvider: null,
      isDemoMode: false,
      isLiveMode: true,
      toggleMode: () => {}
    };
  }
  return context;
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appMode, setAppMode] = useLocalStorage<'live' | 'demo'>('appMode', 'live');
  const [apiProvider, setApiProvider] = useState<DemoAPIProvider | LiveAPIProvider | null>(null);
  const [mounted, setMounted] = useState(false);

  // Detect mode from URL parameters or environment
  const detectMode = useCallback(() => {
    // Check URL parameters first
    const demoParam = searchParams?.get('demo');
    if (demoParam === 'true') {
      return 'demo';
    }
    
    // Check environment variable
    const envMode = process.env.NEXT_PUBLIC_APP_MODE;
    if (envMode === 'demo') {
      return 'demo';
    }
    
    // Check localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('appMode');
      if (storedMode) {
        try {
          const parsedMode = JSON.parse(storedMode);
          if (parsedMode === 'demo' || parsedMode === 'live') {
            return parsedMode;
          }
        } catch (e) {
          console.error('Error parsing stored app mode:', e);
        }
      }
    }
    
    return 'live';
  }, [searchParams]);

  // Initial setup
  useEffect(() => {
    setMounted(true);
    const initialMode = detectMode();
    setAppMode(initialMode);
  }, [detectMode, setAppMode]);

  // Handle URL parameter changes
  useEffect(() => {
    if (!mounted) return;
    
    const currentMode = detectMode();
    if (currentMode !== appMode) {
      setAppMode(currentMode);
    }
  }, [searchParams, detectMode, appMode, setAppMode, mounted]);

  // Update API provider and URL when mode changes
  useEffect(() => {
    if (!mounted) return;
    
    console.log('AppModeProvider: appMode changed to:', appMode);
    const db = typeof window === 'undefined' ? createDatabase() : undefined;
    
    if (appMode === 'demo') {
      setApiProvider(new DemoAPIProvider(db));
      
      // In production, preserve demo parameter in URL
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        const currentUrl = new URL(window.location.toString());
        const currentDemo = currentUrl.searchParams.get('demo');
        
        // Only update URL if demo parameter is not already set
        if (currentDemo !== 'true') {
          currentUrl.searchParams.set('demo', 'true');
          console.log('AppModeProvider: Setting demo=true in URL');
          window.history.replaceState({}, '', currentUrl.toString());
        }
      }
    } else {
      setApiProvider(new LiveAPIProvider(db));
      
      // In production, remove demo parameter from URL when switching to live mode
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        const currentUrl = new URL(window.location.toString());
        const hasDemo = currentUrl.searchParams.has('demo');
        
        // Only update URL if demo parameter exists
        if (hasDemo) {
          currentUrl.searchParams.delete('demo');
          console.log('AppModeProvider: Removing demo parameter from URL');
          window.history.replaceState({}, '', currentUrl.toString());
        }
      }
    }
  }, [appMode, mounted]);

  const toggleMode = useCallback(() => {
    const newMode = appMode === 'live' ? 'demo' : 'live';
    setAppMode(newMode);
    
    // Update URL to reflect new mode
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.toString());
      if (newMode === 'demo') {
        url.searchParams.set('demo', 'true');
      } else {
        url.searchParams.delete('demo');
      }
      
      // Use router.push for better Next.js integration in production
      if (process.env.NODE_ENV === 'production') {
        router.push(url.pathname + url.search);
      } else {
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [appMode, setAppMode, router]);

  const value = {
    appMode,
    apiProvider,
    isDemoMode: mounted && appMode === 'demo',
    isLiveMode: mounted && appMode === 'live',
    toggleMode
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}