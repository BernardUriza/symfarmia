/**
 * Medical Badge Component
 * 
 * Badge component for medical status indicators
 */

import React from 'react';
import { getUrgencyColor } from '../../themes/medical.theme';

export interface BadgeProps {
  children: any;
  variant?: 'default' | 'medical' | 'urgency' | 'confidence' | 'specialty' | 'status';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  specialty?: 'general' | 'cardiology' | 'pediatrics' | 'emergency' | 'obstetrics' | 'neurology' | 'psychiatry' | 'dermatology' | 'orthopedics' | 'oncology';
  status?: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: any;
  pulse?: boolean;
}

export const Badge = ({
  children,
  variant = 'default',
  urgency,
  confidence,
  specialty,
  status,
  size = 'md',
  className = '',
  icon,
  pulse = false
}: BadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'medical':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      
      case 'urgency':
        if (!urgency) return 'bg-gray-100 text-gray-800 border border-gray-200';
        
        switch (urgency) {
          case 'critical':
            return 'bg-red-100 text-red-800 border border-red-200';
          case 'high':
            return 'bg-red-50 text-red-700 border border-red-100';
          case 'medium':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
          case 'low':
            return 'bg-green-100 text-green-800 border border-green-200';
          default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
      
      case 'confidence':
        if (confidence === undefined) return 'bg-gray-100 text-gray-800 border border-gray-200';
        
        if (confidence >= 0.8) {
          return 'bg-green-100 text-green-800 border border-green-200';
        } else if (confidence >= 0.6) {
          return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        } else {
          return 'bg-red-100 text-red-800 border border-red-200';
        }
      
      case 'specialty':
        if (!specialty) return 'bg-gray-100 text-gray-800 border border-gray-200';
        
        switch (specialty) {
          case 'cardiology':
            return 'bg-red-100 text-red-800 border border-red-200';
          case 'pediatrics':
            return 'bg-blue-100 text-blue-800 border border-blue-200';
          case 'emergency':
            return 'bg-red-200 text-red-900 border border-red-300';
          case 'obstetrics':
            return 'bg-pink-100 text-pink-800 border border-pink-200';
          case 'neurology':
            return 'bg-purple-100 text-purple-800 border border-purple-200';
          case 'psychiatry':
            return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
          case 'dermatology':
            return 'bg-amber-100 text-amber-800 border border-amber-200';
          case 'orthopedics':
            return 'bg-lime-100 text-lime-800 border border-lime-200';
          case 'oncology':
            return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
          default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
      
      case 'status':
        if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
        
        switch (status) {
          case 'online':
            return 'bg-green-100 text-green-800 border border-green-200';
          case 'offline':
            return 'bg-gray-100 text-gray-800 border border-gray-200';
          case 'busy':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
          case 'away':
            return 'bg-red-100 text-red-800 border border-red-200';
          default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
      
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  const getPulseStyles = () => {
    if (!pulse) return '';
    
    if (variant === 'urgency' && urgency === 'critical') {
      return 'animate-pulse';
    }
    
    if (variant === 'status' && status === 'busy') {
      return 'animate-pulse';
    }
    
    return pulse ? 'animate-pulse' : '';
  };

  const badgeClasses = [
    'inline-flex items-center font-medium rounded-full',
    getVariantStyles(),
    getSizeStyles(),
    getPulseStyles(),
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {icon && (
        <span className="mr-1 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;