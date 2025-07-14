/**
 * Debug Toggle Component
 * Provides a UI control to enable/disable debug logging in development
 */

import React, { useState, useEffect } from 'react';
import ProductionLogger from '../../utils/logger/ProductionLogger';

const DebugToggle = () => {
  const [isDebugEnabled, setIsDebugEnabled] = useState(ProductionLogger.debugEnabled);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    // Listen for keyboard shortcut (Ctrl+Shift+D)
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = () => {
    const newState = !isDebugEnabled;
    setIsDebugEnabled(newState);
    ProductionLogger.setDebugEnabled(newState);
    
    // Log the state change
    if (newState) {
      ProductionLogger.debug('Debug logging enabled');
    } else {
      console.log('[SYMFARMIA] Debug logging disabled');
    }
  };

  const handleReset = () => {
    // Clear localStorage and reset to default
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('symfarmia-debug');
    }
    setIsDebugEnabled(false);
    ProductionLogger.setDebugEnabled(false);
    console.log('[SYMFARMIA] Debug settings reset');
  };

  const getLogConfig = () => {
    return ProductionLogger.getConfig();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Debug Console</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close debug panel"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Debug Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Debug Logging</span>
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDebugEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDebugEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Environment Info */}
          <div className="text-xs text-gray-300 space-y-1">
            <div>ENV: {process.env.NODE_ENV}</div>
            <div>Level: {getLogConfig().currentLevel}</div>
            <div>Debug: {isDebugEnabled ? 'ON' : 'OFF'}</div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => console.log('[SYMFARMIA] Debug Config:', getLogConfig())}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
            >
              Log Config
            </button>
          </div>

          {/* Test Logging */}
          <div className="border-t border-gray-700 pt-3">
            <div className="text-xs text-gray-400 mb-2">Test Logging:</div>
            <div className="flex space-x-1">
              <button
                onClick={() => ProductionLogger.debug('Test debug message')}
                className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors"
              >
                Debug
              </button>
              <button
                onClick={() => ProductionLogger.info('Test info message')}
                className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded transition-colors"
              >
                Info
              </button>
              <button
                onClick={() => ProductionLogger.warn('Test warning message')}
                className="text-xs bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded transition-colors"
              >
                Warn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugToggle;

// HOC to conditionally render DebugToggle
export const withDebugToggle = (Component) => {
  return function DebugToggleWrapper(props) {
    return (
      <>
        <Component {...props} />
        <DebugToggle />
      </>
    );
  };
};

// Hook for components that need debug state
export const useDebugToggle = () => {
  const [isDebugEnabled, setIsDebugEnabled] = useState(ProductionLogger.debugEnabled);

  useEffect(() => {
    // Update state when debug mode changes
    const checkDebugState = () => {
      setIsDebugEnabled(ProductionLogger.debugEnabled);
    };

    // Check periodically (simple approach)
    const interval = setInterval(checkDebugState, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isDebugEnabled,
    toggleDebug: () => {
      const newState = !isDebugEnabled;
      ProductionLogger.setDebugEnabled(newState);
      setIsDebugEnabled(newState);
    },
    enableDebug: () => {
      ProductionLogger.setDebugEnabled(true);
      setIsDebugEnabled(true);
    },
    disableDebug: () => {
      ProductionLogger.setDebugEnabled(false);
      setIsDebugEnabled(false);
    }
  };
};