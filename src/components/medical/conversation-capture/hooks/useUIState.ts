import { useState, useCallback } from 'react';
import type { UIState } from '../types';

export const useUIState = () => {
  const [state, setState] = useState<UIState>({
    showPermissionDialog: false,
    showDenoisingDashboard: false,
    copySuccess: false,
    isManualMode: false
  });

  const setShowPermissionDialog = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPermissionDialog: show }));
  }, []);

  const toggleDenoisingDashboard = useCallback(() => {
    setState(prev => ({ ...prev, showDenoisingDashboard: !prev.showDenoisingDashboard }));
  }, []);

  const setCopySuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, copySuccess: success }));
  }, []);

  const toggleMode = useCallback(() => {
    setState(prev => ({ ...prev, isManualMode: !prev.isManualMode }));
  }, []);

  const showCopySuccessFeedback = useCallback(() => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [setCopySuccess]);

  return {
    ...state,
    setShowPermissionDialog,
    toggleDenoisingDashboard,
    setCopySuccess,
    toggleMode,
    showCopySuccessFeedback
  };
};