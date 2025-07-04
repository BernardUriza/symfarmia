import { useScroll, useTransform } from 'framer-motion';

export const useOptimizedScroll = () => {
  const { scrollYProgress } = useScroll();

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return { textY, particleY, heroScale, heroOpacity };
};
