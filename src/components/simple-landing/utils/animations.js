// Error-safe animation utilities with fallbacks

/**
 * Safely checks if animations are supported and enabled
 */
export const isAnimationSupported = () => {
  try {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        return false;
      }
    }
    
    // Check for framer-motion availability
    return typeof window !== 'undefined' && 
           window.requestAnimationFrame !== undefined;
  } catch (error) {
    console.warn('Animation support check failed:', error);
    return false;
  }
};

/**
 * Safe animation configuration with fallbacks
 */
export const createSafeAnimation = (animationConfig, fallbackConfig = {}) => {
  if (!isAnimationSupported()) {
    return fallbackConfig;
  }
  
  try {
    return {
      ...animationConfig,
      // Add error recovery
      onError: (error) => {
        console.warn('Animation error:', error);
        return fallbackConfig;
      }
    };
  } catch (error) {
    console.warn('Animation creation failed:', error);
    return fallbackConfig;
  }
};

/**
 * Safe viewport animation configurations
 */
export const SAFE_VIEWPORT_CONFIG = {
  once: true,
  margin: "-10%",
  amount: 0.3
};

/**
 * Performance-optimized animation presets
 */
export const ANIMATION_PRESETS = {
  // Entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  
  // Hover animations
  hover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },
  
  hoverButton: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  // Subtle animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  float: {
    animate: {
      y: [0, -10, 0]
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Safe stagger animation for lists
 */
export const createStaggerAnimation = (children, delayBetween = 0.1) => {
  if (!isAnimationSupported()) {
    return {
      initial: {},
      animate: {},
      transition: {}
    };
  }
  
  return {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delayBetween,
          delayChildren: 0.2
        }
      }
    }
  };
};

/**
 * Safe scroll-triggered animations
 */
export const createScrollAnimation = (animationType = 'slideUp', delay = 0) => {
  const preset = ANIMATION_PRESETS[animationType] || ANIMATION_PRESETS.slideUp;
  
  if (!isAnimationSupported()) {
    return {
      initial: {},
      whileInView: {},
      viewport: {}
    };
  }
  
  return createSafeAnimation({
    ...preset,
    whileInView: preset.animate,
    viewport: SAFE_VIEWPORT_CONFIG,
    transition: { 
      ...preset.transition, 
      delay 
    }
  });
};

/**
 * Error boundary wrapper for animated components
 */
export const withAnimationErrorBoundary = (Component) => {
  return function SafeAnimatedComponent(props) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.warn('Animation component error:', error);
      // Return static version
      return React.createElement(
        'div',
        { className: props.className },
        props.children
      );
    }
  };
};

/**
 * Performance monitoring for animations
 */
export const monitorAnimationPerformance = () => {
  if (!isAnimationSupported() || typeof performance === 'undefined') {
    return;
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 16.67) { // > 60fps
          console.warn('Slow animation detected:', entry.name, entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  } catch (error) {
    console.warn('Animation performance monitoring failed:', error);
  }
};