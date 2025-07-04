import React, { Suspense, lazy } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { createScrollAnimation } from '../utils/animations';

// Lazy load framer-motion to avoid bundle bloat when animations are disabled
const MotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.div 
  })).catch(() => ({ 
    default: ({ children, ...props }) => <div {...props}>{children}</div>
  }))
);

/**
 * Error-safe animated wrapper component
 */
const AnimatedWrapper = ({
  children,
  animation = 'slideUp',
  delay = 0,
  className = '',
  fallbackComponent: Fallback = 'div',
  ...props
}) => {
  const { animationsEnabled, safeAnimate } = useAnimations();

  // If animations are disabled, return static component
  if (!animationsEnabled) {
    return (
      <Fallback className={className} {...props}>
        {children}
      </Fallback>
    );
  }

  const animationProps = safeAnimate(createScrollAnimation(animation, delay));

  return (
    <Suspense 
      fallback={
        <Fallback className={className} {...props}>
          {children}
        </Fallback>
      }
    >
      <MotionDiv
        className={className}
        {...animationProps}
        {...props}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
};

export default AnimatedWrapper;