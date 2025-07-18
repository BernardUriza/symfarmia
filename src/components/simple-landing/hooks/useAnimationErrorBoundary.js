import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling animation errors with automatic fallbacks
 */
export const useAnimationErrorBoundary = () => {
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // Reset error state after successful operations
  const resetError = useCallback(() => {
    setHasError(false);
    setErrorCount(0);
    setIsRecovering(false);
  }, []);

  // Handle animation errors with progressive fallbacks
  const handleError = useCallback(
    (error, context = 'animation') => {
      console.warn(`Animation error in ${context}:`, error);

      setErrorCount((prev) => prev + 1);
      setHasError(true);

      // Progressive error handling
      if (errorCount >= 3) {
        // Disable animations completely after 3 errors
        console.warn(
          'Multiple animation errors detected, disabling animations',
        );
        localStorage.setItem('symfarmia_animations_disabled', 'true');
      } else if (errorCount >= 1) {
        // Try recovery after first error
        setIsRecovering(true);
        setTimeout(() => {
          setIsRecovering(false);
        }, 1000);
      }
    },
    [errorCount],
  );

  // Check if animations should be disabled
  const shouldDisableAnimations = useCallback(() => {
    try {
      const disabled = localStorage.getItem('symfarmia_animations_disabled');
      return disabled === 'true' || hasError || errorCount >= 3;
    } catch (_error) {
      return true; // Fallback to disabled if localStorage fails
    }
  }, [hasError, errorCount]);

  // Safe animation wrapper
  const wrapAnimation = useCallback(
    (animationFn, fallback = {}) => {
      if (shouldDisableAnimations()) {
        return fallback;
      }

      try {
        return animationFn();
      } catch (error) {
        handleError(error, 'animation wrapper');
        return fallback;
      }
    },
    [shouldDisableAnimations, handleError],
  );

  // Monitor performance and disable on poor performance
  useEffect(() => {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (frameCount % 60 === 0) {
        // Check every 60 frames
        const fps = 1000 / ((currentTime - lastTime) / 60);

        if (fps < 30) {
          // If FPS drops below 30
          console.warn(
            'Poor animation performance detected, reducing animations',
          );
          handleError(new Error('Poor performance'), 'performance monitor');
        }

        lastTime = currentTime;
      }

      requestAnimationFrame(checkPerformance);
    };

    const animationId = requestAnimationFrame(checkPerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [handleError]);

  return {
    hasError,
    isRecovering,
    errorCount,
    shouldDisableAnimations: shouldDisableAnimations(),
    handleError,
    resetError,
    wrapAnimation,
  };
};
