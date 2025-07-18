'use client';
import React, { useMemo, Suspense, lazy } from 'react';
import { useAnimations } from '../hooks/useAnimations';

// Lazy load motion for performance
const MotionDiv = lazy(() =>
  import('framer-motion')
    .then((module) => ({
      default: module.motion.div,
    }))
    .catch(() => ({
      default: ({ children, ...props }) => <div {...props}>{children}</div>,
    })),
);

const SafeParticles = ({
  count = 15,
  className = 'bg-teal-400',
  enabled = true,
  intensity = 'low', // low, medium, high
}) => {
  const { animationsEnabled, safeAnimate } = useAnimations(enabled);

  // Adjust particle count based on performance settings
  const particleConfigs = {
    low: { count: Math.min(count, 10), opacity: 0.2 },
    medium: { count: Math.min(count, 20), opacity: 0.3 },
    high: { count: Math.min(count, 30), opacity: 0.4 },
  };

  const config = particleConfigs[intensity] || particleConfigs.low;

  const particles = useMemo(() => {
    if (!animationsEnabled) return [];

    return Array.from({ length: config.count }, (_, i) => ({
      id: `particle-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2,
      size: 0.5 + Math.random() * 0.5, // Random size between 0.5 and 1
    }));
  }, [config.count, animationsEnabled]);

  // Don't render anything if animations are disabled
  if (!animationsEnabled || particles.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => {
        const particleProps = safeAnimate({
          animate: {
            y: [0, -15, 0],
            opacity: [
              config.opacity * 0.5,
              config.opacity,
              config.opacity * 0.5,
            ],
          },
          transition: {
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          },
        });

        return (
          <Suspense key={particle.id} fallback={null}>
            <MotionDiv
              className={`absolute rounded-full ${className}`}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}rem`,
                height: `${particle.size}rem`,
              }}
              {...particleProps}
            />
          </Suspense>
        );
      })}
    </div>
  );
};

export default SafeParticles;
