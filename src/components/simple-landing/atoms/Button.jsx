"use client";
import React, { Suspense, lazy } from 'react';
import { useAnimations } from '../hooks/useAnimations';

// Lazy load motion for performance
const MotionButton = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.button 
  })).catch(() => ({ 
    default: ({ children, ...props }) => <button {...props}>{children}</button>
  }))
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  className = '',
  animated = true,
  ...props 
}) => {
  const { animationsEnabled, safeAnimate } = useAnimations(animated);
  const baseClasses = 'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    secondary: 'bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 focus:ring-teal-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const fullClassName = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  // Animation properties
  const animationProps = safeAnimate({
    whileHover: disabled ? {} : { scale: 1.05, y: -2 },
    whileTap: disabled ? {} : { scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  });

  // Return animated or static button based on support
  if (!animationsEnabled) {
    return (
      <button
        className={fullClassName}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <Suspense 
      fallback={
        <button
          className={fullClassName}
          onClick={onClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      }
    >
      <MotionButton
        className={fullClassName}
        onClick={onClick}
        disabled={disabled}
        {...animationProps}
        {...props}
      >
        {children}
      </MotionButton>
    </Suspense>
  );
};

export default Button;