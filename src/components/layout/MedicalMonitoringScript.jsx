'use client';

import { useEffect } from 'react';

export default function MedicalMonitoringScript() {
  useEffect(() => {
    // MEDICAL SYSTEM HEALTH CHECK
    try {
      const themeReady = document.documentElement.getAttribute('data-medical-theme-ready');
      const themeError = document.documentElement.getAttribute('data-medical-theme-error');
      
      if (themeError) {
        console.warn('🚨 MEDICAL ALERT: Theme system initialization failed');
      } else if (themeReady) {
        console.log('✅ MEDICAL SYSTEM: All systems operational');
      } else {
        console.warn('⚠️ MEDICAL WARNING: Theme system status unknown');
      }
      
      // Medical performance monitoring
      const perfData = {
        timestamp: new Date().toISOString(),
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        themeReady: themeReady ? 'success' : 'failed'
      };
      
      console.log('📊 MEDICAL PERFORMANCE:', perfData);
    } catch (error) {
      console.error('🚨 MEDICAL MONITORING ERROR:', error);
    }
    
    // MEDICAL ERROR LISTENER
    const errorHandler = (event) => {
      const errorData = {
        type: 'runtime',
        message: event.error ? event.error.message : event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      console.error('🚨 MEDICAL RUNTIME ERROR:', errorData);
      
      // Store for medical audit
      try {
        const errors = JSON.parse(localStorage.getItem('medical_runtime_errors') || '[]');
        errors.push(errorData);
        localStorage.setItem('medical_runtime_errors', JSON.stringify(errors.slice(-50)));
      } catch (e) {
        console.error('🚨 CRITICAL: Cannot store medical error');
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  return null;
}