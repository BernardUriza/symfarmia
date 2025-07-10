/**
 * REVOLUTIONARY I18N HOOK
 * 
 * Custom hook that works with both existing and revolutionary i18n systems
 * Provides seamless language switching functionality
 */

'use client';

import { useContext } from 'react';
import { I18nContext } from '../app/providers/I18nProvider';


// 🔄 PARAMETER SUBSTITUTION
const substituteParameters = (text, params = {}) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? params[param] : match;
  });
};

// 🎯 MAIN I18N HOOK
export const useI18n = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    // Fallback implementation when provider is not available
    const fallbackSetLocale = (locale) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('preferredLanguage', locale);
        } catch (error) {
          console.warn('Could not save language preference:', error);
        }
      }
    };
    
    return {
      locale: 'es',
      setLocale: fallbackSetLocale,
      t: (key, params = {}) => {
        return substituteParameters(key, params);
      },
      isLoading: false
    };
  }
  
  const { locale, setLocale, translations, isLoading } = context;
  
  // Enhanced translation function
  const t = (key, params = {}) => {
    try {
      // Get translation from main translations
      let translation = translations[key];
      
      // If not found, use intelligent fallback
      if (!translation) {
        translation = getIntelligentFallback(key, locale);
      }
      
      // Apply parameter substitution
      if (params && typeof translation === 'string') {
        translation = substituteParameters(translation, params);
      }
      
      return translation;
      
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key; // Return key as fallback
    }
  };
  
  return {
    locale,
    setLocale,
    t,
    isLoading,
    translations
  };
};

// 🧠 INTELLIGENT FALLBACK
const getIntelligentFallback = (key, locale) => {
  // Extract meaningful text from the key
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase/snake_case to human readable
  const humanReadable = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
  
  // Medical context intelligent fallbacks
  const medicalFallbacks = {
    'es': {
      'language': 'Idioma',
      'medical': 'Médico',
      'clinical': 'Clínico',
      'patient': 'Paciente',
      'doctor': 'Médico',
      'consultation': 'Consulta',
      'diagnosis': 'Diagnóstico',
      'treatment': 'Tratamiento',
      'medication': 'Medicamento',
      'prescription': 'Receta',
      'current': 'actual',
      'change': 'cambiar',
      'select': 'seleccionar',
      'certified': 'certificado',
      'validated': 'validado',
      'grade': 'calidad'
    },
    'en': {
      'language': 'Language',
      'medical': 'Medical',
      'clinical': 'Clinical',
      'patient': 'Patient',
      'doctor': 'Doctor',
      'consultation': 'Consultation',
      'diagnosis': 'Diagnosis',
      'treatment': 'Treatment',
      'medication': 'Medication',
      'prescription': 'Prescription',
      'current': 'current',
      'change': 'change',
      'select': 'select',
      'certified': 'certified',
      'validated': 'validated',
      'grade': 'grade'
    }
  };
  
  // Check for medical context fallbacks
  const lowerKey = key.toLowerCase();
  const localeFallbacks = medicalFallbacks[locale] || medicalFallbacks['en'];
  
  for (const [term, fallback] of Object.entries(localeFallbacks)) {
    if (lowerKey.includes(term)) {
      return fallback;
    }
  }
  
  // Return human readable version
  return humanReadable || key;
};

export default useI18n;