import React, { Suspense, lazy } from 'react';
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

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  shadow = 'default',
  animated = true,
  hoverEffect = true,
}) => {
  const { animationsEnabled, safeAnimate } = useAnimations(animated);
  const variants = {
    default: 'bg-white border border-gray-200',
    dark: 'bg-slate-800 border border-slate-700',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
  };

  const paddings = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const shadows = {
    none: '',
    default: 'shadow-lg',
    large: 'shadow-xl',
    xl: 'shadow-2xl',
  };

  const fullClassName = `rounded-lg ${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${className}`;

  // Animation properties
  const animationProps = safeAnimate({
    whileHover: hoverEffect ? { scale: 1.02, y: -2 } : {},
    transition: { duration: 0.3, ease: 'easeOut' },
  });

  // Return static or animated card
  if (!animationsEnabled) {
    return <div className={fullClassName}>{children}</div>;
  }

  return (
    <Suspense fallback={<div className={fullClassName}>{children}</div>}>
      <MotionDiv className={fullClassName} {...animationProps}>
        {children}
      </MotionDiv>
    </Suspense>
  );
};

export default Card;
