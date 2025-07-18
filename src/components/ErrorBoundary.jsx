"use client"
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Error details:', errorInfo)
    }

    // Handle ChunkLoadError specifically
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      console.warn('ChunkLoadError detected, attempting automatic reload...')
      // Small delay before reload to prevent infinite loops
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  We're sorry, but something unexpected happened. Please refresh the page and try again.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      Show error details (development mode)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                      <pre>{this.state.error.toString()}</pre>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </details>
                )}
                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh Page
                  </button>
                  <a
                    href="/"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary