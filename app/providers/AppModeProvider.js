"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { DemoAPIProvider } from './DemoAPIProvider.js';
import { LiveAPIProvider } from './LiveAPIProvider.js';

const AppModeContext = createContext();

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}

export function AppModeProvider({ children }) {
  const [appMode, setAppMode] = useState('live');
  const [apiProvider, setApiProvider] = useState(null);

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

    const mode = detectMode();
    setAppMode(mode);
    
    if (mode === 'demo') {
      setApiProvider(new DemoAPIProvider());
    } else {
      setApiProvider(new LiveAPIProvider());
    }
  }, []);

  const toggleMode = () => {
    const newMode = appMode === 'live' ? 'demo' : 'live';
    setAppMode(newMode);
    
    if (newMode === 'demo') {
      setApiProvider(new DemoAPIProvider());
      const url = new URL(window.location);
      url.searchParams.set('demo', 'true');
      window.history.replaceState({}, '', url);
    } else {
      setApiProvider(new LiveAPIProvider());
      const url = new URL(window.location);
      url.searchParams.delete('demo');
      window.history.replaceState({}, '', url);
    }
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