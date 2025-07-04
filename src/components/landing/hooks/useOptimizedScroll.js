import { useScroll, useTransform } from 'framer-motion';
import { useMemo } from 'react';

export const useOptimizedScroll = () => {
  const { scrollYProgress } = useScroll();
  
  // Memoize transform values to prevent unnecessary recalculations
  const transforms = useMemo(() => ({
    textY: useTransform(scrollYProgress, [0, 1], ['0%', '30%']),
    particleY: useTransform(scrollYProgress, [0, 1], ['0%', '50%']),
    heroScale: useTransform(scrollYProgress, [0, 0.5], [1, 0.8]),
    heroOpacity: useTransform(scrollYProgress, [0, 0.3], [1, 0])
  }), [scrollYProgress]);
  
  return transforms;
};