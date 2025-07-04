import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAnimationErrorBoundary } from '../hooks/useAnimationErrorBoundary';
import { useAnimations } from '../hooks/useAnimations';

// Lazy load framer-motion with error handling
const MotionDiv = lazy(() => 
  import('framer-motion')
    .then(module => ({ 
      default: module.motion.div 
    }))
    .catch(error => {
      console.warn('Failed to load framer-motion:', error);
      return { 
        default: ({ children, className, style, ...props }) => 
          React.createElement('div', { className, style, ...props }, children)
      };
    })
);

/**
 * Progressive enhancement animation component
 * Automatically falls back to CSS animations if framer-motion fails
 */
const ProgressiveAnimation = ({
  children,
  animation = 'slideUp',
  delay = 0,
  className = '',
  style = {},
  fallbackAnimation = true,
  ...props
}) => {
  const { animationsEnabled } = useAnimations();
  const { hasError, shouldDisableAnimations, wrapAnimation, handleError } = useAnimationErrorBoundary();
  const [useCSSFallback, setUseCSSFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // CSS fallback animations
  const cssAnimations = {
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down', 
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in'
  };

  // Determine which animation system to use
  useEffect(() => {
    if (shouldDisableAnimations || hasError) {
      setUseCSSFallback(true);
    }
  }, [shouldDisableAnimations, hasError]);

  // Framer Motion animation props
  const motionProps = wrapAnimation(() => {
    const animations = {
      slideUp: {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: "easeOut" }
      },
      slideDown: {
        initial: { opacity: 0, y: -30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: "easeOut" }
      },
      fadeIn: {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        transition: { duration: 0.6, delay, ease: "easeOut" }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        whileInView: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay, ease: "easeOut" }
      }
    };

    return {
      ...animations[animation],
      viewport: { once: true, margin: "-10%" },
      onAnimationComplete: () => setIsLoaded(true),
      onError: (error) => {
        handleError(error, 'ProgressiveAnimation');
        setUseCSSFallback(true);
      }
    };
  }, {});

  // CSS-only fallback
  const cssClassName = `${className} ${fallbackAnimation ? cssAnimations[animation] || '' : ''}`;
  const cssStyle = {
    ...style,
    animationDelay: `${delay}s`,
    animationFillMode: 'both'
  };

  // No animations - return static content
  if (!animationsEnabled && !fallbackAnimation) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  // CSS fallback mode
  if (useCSSFallback || !animationsEnabled) {
    return (
      <div 
        className={cssClassName} 
        style={cssStyle} 
        {...props}
      >
        {children}
      </div>
    );
  }

  // Framer Motion mode with error boundary
  return (
    <Suspense 
      fallback={
        <div className={cssClassName} style={cssStyle} {...props}>
          {children}
        </div>
      }
    >
      <MotionDiv
        className={className}
        style={style}
        {...motionProps}
        {...props}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
};

export default ProgressiveAnimation;