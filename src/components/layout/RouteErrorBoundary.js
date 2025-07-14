'use client'

import React from 'react';
import Link from 'next/link';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in production
    console.error('Route Error Boundary caught an error:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo
    });

    // Log to medical error tracking (if available)
    if (typeof window !== 'undefined' && window.medicalErrorLogger) {
      window.medicalErrorLogger.logError({
        type: 'ROUTE_ERROR',
        error: error.toString(),
        stack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🏥</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Error de Navegación
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Ocurrió un error al cargar esta página. 
                {process.env.NODE_ENV === 'production' 
                  ? ' Por favor, intente nuevamente.'
                  : ` Error: ${this.state.error?.toString()}`}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar de Nuevo
              </button>
              
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Ir al Inicio
              </Link>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Detalles del Error (Solo Desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-64">
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;