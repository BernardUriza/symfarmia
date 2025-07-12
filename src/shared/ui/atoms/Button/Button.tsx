/**
 * Medical Button Component
 * 
 * Primary button component with medical theme support
 */

import React from 'react';

export interface ButtonProps {
  children?: any;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'medical' | 'emergency';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  loading?: boolean;
  icon?: any;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  medicalContext?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  urgency,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  medicalContext = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const getVariantStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
      
      case 'secondary':
        return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`;
      
      case 'outline':
        return `${baseStyles} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500`;
      
      case 'ghost':
        return `${baseStyles} text-gray-700 hover:bg-gray-100 focus:ring-blue-500`;
      
      case 'medical':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md`;
      
      case 'emergency':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg`;
      
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'xl':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getUrgencyStyles = () => {
    if (!urgency) return '';
    
    switch (urgency) {
      case 'critical':
        return 'animate-pulse shadow-lg border-2 border-red-500';
      case 'high':
        return 'shadow-md border border-red-300';
      case 'medium':
        return 'border border-yellow-300';
      case 'low':
        return 'border border-green-300';
      default:
        return '';
    }
  };

  const getMedicalStyles = () => {
    if (!medicalContext) return '';
    return 'font-medium tracking-wide';
  };

  const getLoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const buttonClasses = [
    getVariantStyles(),
    getSizeStyles(),
    getUrgencyStyles(),
    getMedicalStyles(),
    fullWidth ? 'w-full' : '',
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && getLoadingSpinner()}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;