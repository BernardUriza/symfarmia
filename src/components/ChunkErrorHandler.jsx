"use client";
import { useEffect } from 'react';

export default function ChunkErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors globally
    const handleChunkError = (event) => {
      if (event.error && (
        event.error.name === 'ChunkLoadError' || 
        event.error.message?.includes('Loading chunk') ||
        event.error.message?.includes('chunk')
      )) {
        console.warn('ChunkLoadError detected globally, reloading page...');
        // Clear any cached chunks
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('next-static')) {
                caches.delete(name);
              }
            });
          });
        }
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError);
    
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && (
        event.reason.name === 'ChunkLoadError' ||
        event.reason.message?.includes('Loading chunk') ||
        event.reason.message?.includes('chunk')
      )) {
        console.warn('ChunkLoadError in promise rejection, reloading page...');
        event.preventDefault(); // Prevent the default unhandled rejection behavior
        
        // Clear cache and reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('next-static')) {
                caches.delete(name);
              }
            });
          });
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return null; // This component doesn't render anything
}