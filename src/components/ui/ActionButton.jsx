/**
 * ActionButton - Modular and Reusable Action Button Component
 * 
 * A fully customizable button component designed for actions like "Add New Patient",
 * "Add Doctor", "Add Study", etc. with comprehensive theming and accessibility support.
 * 
 * @example
 * // Basic usage
 * <ActionButton 
 *   onClick={() => console.log('clicked')}
 *   text="Add New Patient"
 * />
 * 
 * @example
 * // Full customization
 * <ActionButton
 *   onClick={handleAddDoctor}
 *   text="Add Doctor"
 *   icon={UserPlusIcon}
 *   color="emerald"
 *   size="lg"
 *   disabled={isLoading}
 *   variant="filled"
 *   fullWidth={true}
 * />
 * 
 * @example
 * // Outline variant
 * <ActionButton
 *   onClick={handleAddStudy}
 *   text="Add Study"
 *   icon={PlusIcon}
 *   color="blue"
 *   variant="outline"
 *   size="sm"
 * />
 */

'use client';
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * ActionButton Component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler function
 * @param {string} [props.text="Add New"] - Button text
 * @param {React.ComponentType} [props.icon=PlusIcon] - Icon component (Heroicon)
 * @param {string} [props.color="blue"] - Color theme (blue, emerald, purple, orange, red, gray)
 * @param {string} [props.size="md"] - Size variant (xs, sm, md, lg, xl)
 * @param {string} [props.variant="filled"] - Style variant (filled, outline, ghost)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state
 * @param {boolean} [props.fullWidth=false] - Full width button
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {Object} [props.ariaLabel] - Accessibility label
 * @param {React.ReactNode} [props.children] - Children override text
 * @returns {JSX.Element} ActionButton component
 */
const ActionButton = ({
  onClick,
  text = "Add New",
  icon: Icon = PlusIcon,
  color = "blue",
  size = "md",
  variant = "filled",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  ariaLabel,
  children,
  ...props
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      filled: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-600 focus:ring-blue-500",
      outline: "border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900 dark:active:bg-blue-800",
      ghost: "text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 dark:active:bg-blue-800"
    },
    emerald: {
      filled: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-600 focus:ring-emerald-500",
      outline: "border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-900 dark:active:bg-emerald-800",
      ghost: "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:active:bg-emerald-800"
    },
    purple: {
      filled: "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white border-purple-600 focus:ring-purple-500",
      outline: "border-purple-600 text-purple-600 hover:bg-purple-50 active:bg-purple-100 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900 dark:active:bg-purple-800",
      ghost: "text-purple-600 hover:bg-purple-50 active:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900 dark:active:bg-purple-800"
    },
    orange: {
      filled: "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white border-orange-600 focus:ring-orange-500",
      outline: "border-orange-600 text-orange-600 hover:bg-orange-50 active:bg-orange-100 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900 dark:active:bg-orange-800",
      ghost: "text-orange-600 hover:bg-orange-50 active:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900 dark:active:bg-orange-800"
    },
    red: {
      filled: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-red-600 focus:ring-red-500",
      outline: "border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900 dark:active:bg-red-800",
      ghost: "text-red-600 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 dark:active:bg-red-800"
    },
    gray: {
      filled: "bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border-gray-600 focus:ring-gray-500",
      outline: "border-gray-600 text-gray-600 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-400 dark:border-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700",
      ghost: "text-gray-600 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700"
    }
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      button: "px-2 py-1 text-xs",
      icon: "h-3 w-3",
      gap: "gap-1"
    },
    sm: {
      button: "px-3 py-1.5 text-sm",
      icon: "h-4 w-4",
      gap: "gap-1.5"
    },
    md: {
      button: "px-4 py-2 text-sm",
      icon: "h-4 w-4",
      gap: "gap-2"
    },
    lg: {
      button: "px-5 py-2.5 text-base",
      icon: "h-5 w-5",
      gap: "gap-2.5"
    },
    xl: {
      button: "px-6 py-3 text-lg",
      icon: "h-6 w-6",
      gap: "gap-3"
    }
  };

  // Get current configurations
  const currentColor = colorConfig[color] || colorConfig.blue;
  const currentSize = sizeConfig[size] || sizeConfig.md;
  const currentVariant = currentColor[variant] || currentColor.filled;

  // Base classes
  const baseClasses = [
    "inline-flex items-center justify-center",
    "font-medium rounded-lg",
    "transform transition-all duration-200 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "select-none cursor-pointer",
    currentSize.button,
    currentSize.gap
  ];

  // Variant specific classes
  const variantClasses = variant === "outline" ? "border-2 bg-transparent" : variant === "ghost" ? "border-none bg-transparent" : "border border-transparent";

  // State classes
  const stateClasses = [
    currentVariant,
    disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
    loading ? "animate-pulse" : "",
    fullWidth ? "w-full" : ""
  ];

  // Hover and active effects
  const effectClasses = [
    "hover:scale-105 hover:shadow-lg",
    "active:scale-95 active:shadow-md",
    "hover:-translate-y-0.5",
    "active:translate-y-0"
  ];

  // Combine all classes
  const buttonClasses = [
    ...baseClasses,
    variantClasses,
    ...stateClasses,
    disabled || loading ? "" : effectClasses.join(" "),
    className
  ].filter(Boolean).join(" ");

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${currentSize.icon}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <button
      type="button"
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || text}
      aria-disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        Icon && <Icon className={currentSize.icon} aria-hidden="true" />
      )}
      
      {children || (
        <span className={loading ? "ml-2" : ""}>{text}</span>
      )}
    </button>
  );
};

export default ActionButton;