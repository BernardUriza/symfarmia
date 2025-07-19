import React, { Suspense, lazy, HTMLAttributes, ReactNode } from 'react';
import { useAnimations } from '../hooks/useAnimations';
import { MotionProps } from 'framer-motion';

// Lazy load motion for performance
const MotionDiv = lazy(() =>
  import('framer-motion')
    .then((module) => ({
      default: module.motion.div as React.ComponentType<HTMLAttributes<HTMLDivElement> & MotionProps>,
    }))
    .catch(() => ({
      default: ({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) => <div {...props}>{children}</div>,
    })),
);

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'glass' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'default' | 'large' | 'xl';
  animated?: boolean;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  shadow = 'default',
  animated = true,
  hoverEffect = true,
}) => {
  const { animationsEnabled, safeAnimate } = useAnimations(animated);
  const variants: Record<NonNullable<CardProps['variant']>, string> = {
    default: 'bg-white border border-gray-200',
    dark: 'bg-slate-800 border border-slate-700',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
  };

  const paddings: Record<NonNullable<CardProps['padding']>, string> = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const shadows: Record<NonNullable<CardProps['shadow']>, string> = {
    none: '',
    default: 'shadow-lg',
    large: 'shadow-xl',
    xl: 'shadow-2xl',
  };

  const fullClassName = `rounded-lg ${variants[variant!]} ${paddings[padding!]} ${shadows[shadow!]} ${className}`;

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
