import { useState, useEffect } from 'react';

export interface DemoModeConfig {
  isEnabled: boolean;
  mockDelay: number;
  showIndicator: boolean;
}

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [config, setConfig] = useState<DemoModeConfig>({
    isEnabled: false,
    mockDelay: 1000,
    showIndicator: true
  });

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
    setConfig(prev => ({ ...prev, isEnabled: demoMode }));
  }, []);

  const toggleDemoMode = () => {
    const newState = !isDemoMode;
    setIsDemoMode(newState);
    localStorage.setItem('demoMode', newState.toString());
    setConfig(prev => ({ ...prev, isEnabled: newState }));
  };

  return {
    isDemoMode,
    config,
    toggleDemoMode
  };
};