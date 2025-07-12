/**
 * TranscriptionErrorBoundary
 * 
 * Error boundary specifically for transcription components that captures
 * engine errors without crashing the medical interface
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { transcriptionEngineStateManager } from '../services/TranscriptionEngineStateManager';

export class TranscriptionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
      isRecovering: false
    };
    
    this.resetTimeout = null;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TranscriptionErrorBoundary caught error:', error, errorInfo);
    
    // Log error details
    this.logErrorDetails(error, errorInfo);
    
    // Update error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
      errorInfo
    }));
    
    // Report to transcription state manager
    if (this.props.engineId) {
      transcriptionEngineStateManager.reportEngineError(
        this.props.engineId,
        error
      );
    }
    
    // Attempt auto-recovery after delay
    this.scheduleAutoRecovery();
  }

  logErrorDetails(error, errorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      engineId: this.props.engineId,
      errorCount: this.state.errorCount + 1
    };
    
    // Log to console in structured format
    console.group('Transcription Error Details');
    console.error('Error:', errorDetails.message);
    console.error('Component Stack:', errorDetails.componentStack);
    console.error('Full Details:', errorDetails);
    console.groupEnd();
    
    // Call error callback if provided
    if (this.props.onError) {
      this.props.onError(errorDetails);
    }
  }

  scheduleAutoRecovery() {
    // Clear any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    // Don't auto-recover if too many errors
    if (this.state.errorCount >= 3) {
      console.warn('Too many errors, not attempting auto-recovery');
      return;
    }
    
    // Schedule recovery attempt
    const delay = Math.min(5000 * this.state.errorCount, 30000);
    console.log(`Scheduling auto-recovery in ${delay}ms`);
    
    this.resetTimeout = setTimeout(() => {
      this.attemptRecovery();
    }, delay);
  }

  attemptRecovery = async () => {
    this.setState({ isRecovering: true });
    
    try {
      console.log('Attempting automatic recovery...');
      
      // Call recovery callback if provided
      if (this.props.onRecovery) {
        await this.props.onRecovery();
      }
      
      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
      
      console.log('Recovery successful');
      
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  };

  handleManualRetry = () => {
    // Clear auto-recovery timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    this.attemptRecovery();
  };

  handleDismiss = () => {
    // User chose to dismiss error without retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
    
    // Call dismiss callback if provided
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  };

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorCount, isRecovering } = this.state;
      const isCriticalError = errorCount >= 3;
      
      return (
        <div className={`transcription-error-boundary ${this.props.className || ''}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg mx-auto">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${isCriticalError ? 'text-red-500' : 'text-yellow-500'}`}>
                <AlertCircle className="h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isCriticalError 
                    ? 'Transcription Service Unavailable'
                    : 'Transcription Error'}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {this.getErrorMessage(error, isCriticalError)}
                </p>
                
                {/* Error details for debugging (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mb-4">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                      {error?.stack || error?.message || 'Unknown error'}
                    </pre>
                  </details>
                )}
                
                {/* Action buttons */}
                <div className="flex space-x-3">
                  {!isCriticalError && (
                    <button
                      onClick={this.handleManualRetry}
                      disabled={isRecovering}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRecovering ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Recovering...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          <span>Retry</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={this.handleDismiss}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                
                {/* Fallback suggestion */}
                {isCriticalError && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> You can continue without transcription by manually 
                      documenting the conversation or using an external recording device.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Optional fallback UI */}
          {this.props.fallback && (
            <div className="mt-4">
              {this.props.fallback}
            </div>
          )}
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }

  getErrorMessage(error, isCritical) {
    // Check for specific error types
    const errorStr = error?.message?.toLowerCase() || '';
    
    if (errorStr.includes('permission') || errorStr.includes('microphone')) {
      return 'Microphone access was denied. Please check your browser permissions and try again.';
    }
    
    if (errorStr.includes('network') || errorStr.includes('offline')) {
      return 'Network connection issue detected. Transcription may be unavailable.';
    }
    
    if (errorStr.includes('audio') || errorStr.includes('context')) {
      return 'Audio system error. Please refresh the page and try again.';
    }
    
    if (errorStr.includes('engine') || errorStr.includes('initialize')) {
      return 'Transcription engine failed to start. Trying alternative methods...';
    }
    
    if (isCritical) {
      return 'The transcription service has encountered multiple errors and is currently unavailable.';
    }
    
    return 'An unexpected error occurred with the transcription service. Click retry to try again.';
  }
}

/**
 * Higher-order component to wrap any component with TranscriptionErrorBoundary
 */
export function withTranscriptionErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <TranscriptionErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </TranscriptionErrorBoundary>
    );
  };
}

/**
 * Hook to programmatically trigger error boundary
 */
export function useTranscriptionErrorHandler() {
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  const reportError = React.useCallback((error) => {
    setError(error);
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  return { reportError, clearError };
}

export default TranscriptionErrorBoundary;