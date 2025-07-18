import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ParticleField = React.memo(
  ({ count = 15, className = 'bg-teal-400' }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const particles = useMemo(() => {
      if (!isClient) return [];

      return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 2,
      }));
    }, [count, isClient]);

    if (!isClient) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" />
      );
    }

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-1 h-1 ${className} rounded-full opacity-20`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  },
);

ParticleField.displayName = 'ParticleField';

export default ParticleField;
