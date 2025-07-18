import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';

const Logo = ({ size = 'medium', variant = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variants = {
    default: 'text-teal-500',
    white: 'text-white',
    dark: 'text-slate-800'
  };

  return (
    <div className="flex items-center space-x-2">
      <HeartIcon className={`${sizeClasses[size]} ${variants[variant]}`} />
      <span className={`font-bold ${variants[variant]} ${size === 'large' || size === 'xl' ? 'text-2xl' : 'text-lg'}`}>
        SYMFARMIA
      </span>
    </div>
  );
};

export default Logo;