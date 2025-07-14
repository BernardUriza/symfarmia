import { useState, useEffect, useCallback, useMemo } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { isAnimationSupported } from '../../../../utils/animations';

/**
 * Safe hook for managing animation state with error handling
 */
export const useAnimations = (enabled = true) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      const supported = enabled && isAnimationSupported();
      setAnimationsEnabled(supported);
      
      // Listen for reduced motion preference changes
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = () => {
          setAnimationsEnabled(!mediaQuery.matches && enabled);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch (error) {
      console.warn('Animation initialization error:', error);
      setHasError(true);
      setAnimationsEnabled(false);
    }
  }, [enabled]);

  const safeAnimate = useCallback((animationConfig) => {
    if (!animationsEnabled || hasError) {
      return {};
    }
    
    try {
      return animationConfig;
    } catch (error) {
      console.warn('Animation configuration error:', error);
      setHasError(true);
      return {};
    }
  }, [animationsEnabled, hasError]);

  return {
    animationsEnabled,
    hasError,
    safeAnimate
  };
};

/**
 * Hook for safe mouse tracking with throttling
 */
export const useMouseTracking = (throttleMs = 100, enabled = true) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const { animationsEnabled } = useAnimations(enabled);

  const handleMouseMove = useCallback((e) => {
    if (!animationsEnabled) return;
    
    try {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    } catch (error) {
      console.warn('Mouse tracking error:', error);
    }
  }, [animationsEnabled]);

  useEffect(() => {
    if (!animationsEnabled) return;

    let timeoutId;
    
    const throttledMouseMove = (e) => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleMouseMove(e);
        timeoutId = null;
      }, throttleMs);
    };

    try {
      window.addEventListener('mousemove', throttledMouseMove, { passive: true });
      
      return () => {
        window.removeEventListener('mousemove', throttledMouseMove);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (error) {
      console.warn('Mouse tracking setup error:', error);
    }
  }, [handleMouseMove, throttleMs, animationsEnabled]);

  return animationsEnabled ? mousePosition : { x: 50, y: 50 };
};

/**
 * Hook for safe scroll-based transformations
 */
export const useScrollTransforms = (enabled = true) => {
  const { animationsEnabled } = useAnimations(enabled);
  const { scrollYProgress } = useScroll();

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  if (!animationsEnabled) {
    return { textY: 0, particleY: 0, heroScale: 1, heroOpacity: 1 };
  }

  return { textY, particleY, heroScale, heroOpacity };
};

/**
 * Hook for intersection observer based animations
 */
export const useInViewAnimation = (animationType = 'slideUp', options = {}) => {
  const { animationsEnabled } = useAnimations();
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const elementRef = useCallback((node) => {
    if (!animationsEnabled || !node) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsInView(true);
            setHasAnimated(true);
          }
        },
        {
          threshold: 0.3,
          rootMargin: '-10%',
          ...options
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    } catch (error) {
      console.warn('Intersection observer error:', error);
      setIsInView(true); // Fallback to visible
    }
  }, [animationsEnabled, hasAnimated, options]);

  const animationProps = useMemo(() => {
    if (!animationsEnabled) {
      return {};
    }

    const animations = {
      slideUp: {
        style: {
          opacity: isInView ? 1 : 0,
          transform: `translateY(${isInView ? 0 : 30}px)`,
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }
      },
      fadeIn: {
        style: {
          opacity: isInView ? 1 : 0,
          transition: 'opacity 0.6s ease-out'
        }
      },
      scaleIn: {
        style: {
          opacity: isInView ? 1 : 0,
          transform: `scale(${isInView ? 1 : 0.9})`,
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
        }
      }
    };

    return animations[animationType] || animations.slideUp;
  }, [animationsEnabled, isInView, animationType]);

  return {
    ref: elementRef,
    isInView,
    ...animationProps
  };
};