import React from 'react';

const Card = ({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'medium',
  shadow = 'default'
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    dark: 'bg-slate-800 border border-slate-700',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
  };
  
  const paddings = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };
  
  const shadows = {
    none: '',
    default: 'shadow-lg',
    large: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  return (
    <div className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;