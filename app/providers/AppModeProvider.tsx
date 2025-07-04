"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { DemoAPIProvider } from './DemoAPIProvider';
import { LiveAPIProvider } from './LiveAPIProvider';
import { createDatabase } from '../infrastructure/database';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [appMode, setAppMode] = useLocalStorage<'live' | 'demo'>('appMode', 'live');
  const [apiProvider, setApiProvider] = useState<DemoAPIProvider | LiveAPIProvider | null>(null);

  useEffect(() => {
    const detectMode = () => {
      if (typeof window === 'undefined') return 'live';
      const urlParams = new URLSearchParams(window.location.search);
      const demoParam = urlParams.get('demo');
      const envMode = process.env.NEXT_PUBLIC_APP_MODE;
      if (demoParam === 'true' || envMode === 'demo') {
        return 'demo';
      }
      return 'live';
    };
    setAppMode(detectMode());
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('AppModeProvider: appMode changed to:', appMode);
    const db = typeof window === 'undefined' ? createDatabase() : undefined;
    if (appMode === 'demo') {
      setApiProvider(new DemoAPIProvider(db));
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.toString());
        url.searchParams.set('demo', 'true');
        console.log('AppModeProvider: Setting demo=true in URL');
        window.history.replaceState({}, '', url);
      }
    } else {
      setApiProvider(new LiveAPIProvider(db));
      if (typeof window !== 'undefined') {
        // TEMPORARY: Comment out URL parameter removal to fix dashboard redirect
        // const url = new URL(window.location.toString());
        // url.searchParams.delete('demo');
        // console.log('AppModeProvider: Removing demo parameter from URL');
        // window.history.replaceState({}, '', url);
        console.log('AppModeProvider: Would remove demo parameter, but disabled for dashboard fix');
      }
    }
  }, [appMode]);

  const toggleMode = () => {
    const newMode = appMode === 'live' ? 'demo' : 'live';
    setAppMode(newMode);
  };

  const value = {
    appMode,
    apiProvider,
    isDemoMode: appMode === 'demo',
    isLiveMode: appMode === 'live',
    toggleMode
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
}
