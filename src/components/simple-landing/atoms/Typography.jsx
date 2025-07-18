import React from 'react';

export const Heading = ({
  level = 1,
  children,
  className = '',
  color = 'default',
  align = 'left',
}) => {
  const Tag = `h${level}`;

  const colors = {
    default: 'text-gray-900',
    white: 'text-white',
    teal: 'text-teal-600',
    gray: 'text-gray-600',
  };

  const sizes = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    2: 'text-3xl md:text-4xl font-bold',
    3: 'text-2xl md:text-3xl font-bold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold',
  };

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Tag
      className={`${sizes[level]} ${colors[color]} ${alignments[align]} ${className}`}
    >
      {children}
    </Tag>
  );
};

export const Text = ({
  children,
  size = 'base',
  color = 'default',
  weight = 'normal',
  className = '',
  as = 'p',
}) => {
  const Tag = as;

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const colors = {
    default: 'text-gray-700',
    white: 'text-white',
    teal: 'text-teal-600',
    gray: 'text-gray-500',
    light: 'text-gray-300',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Tag
      className={`${sizes[size]} ${colors[color]} ${weights[weight]} ${className}`}
    >
      {children}
    </Tag>
  );
};
