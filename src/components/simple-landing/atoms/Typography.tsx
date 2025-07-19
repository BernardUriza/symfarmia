import React, { ReactNode } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  color?: 'default' | 'white' | 'teal' | 'gray';
  align?: 'left' | 'center' | 'right';
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  children,
  className = '',
  color = 'default',
  align = 'left',
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const colors: Record<NonNullable<HeadingProps['color']>, string> = {
    default: 'text-gray-900',
    white: 'text-white',
    teal: 'text-teal-600',
    gray: 'text-gray-600',
  };

  const sizes: Record<NonNullable<HeadingProps['level']>, string> = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    2: 'text-3xl md:text-4xl font-bold',
    3: 'text-2xl md:text-3xl font-bold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold',
  };

  const alignments: Record<NonNullable<HeadingProps['align']>, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Tag
      className={`${sizes[level!]} ${colors[color!]} ${alignments[align!]} ${className}`}
    >
      {children}
    </Tag>
  );
};

interface TextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  color?: 'default' | 'white' | 'teal' | 'gray' | 'light';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'base',
  color = 'default',
  weight = 'normal',
  className = '',
  as = 'p',
}) => {
  const Tag = as;

  const sizes: Record<NonNullable<TextProps['size']>, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const colors: Record<NonNullable<TextProps['color']>, string> = {
    default: 'text-gray-700',
    white: 'text-white',
    teal: 'text-teal-600',
    gray: 'text-gray-500',
    light: 'text-gray-300',
  };

  const weights: Record<NonNullable<TextProps['weight']>, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Tag
      className={`${sizes[size!]} ${colors[color!]} ${weights[weight!]} ${className}`}
    >
      {children}
    </Tag>
  );
};
