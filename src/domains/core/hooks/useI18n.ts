/**
 * REVOLUTIONARY I18N HOOK
 * 
 * Custom hook that works with both existing and revolutionary i18n systems
 * Provides seamless language switching functionality
 */

'use client';

import { useContext, useEffect, useState } from 'react';
import { I18nContext } from '@/src/providers/I18nProvider';

// TypeScript interfaces
export interface TranslationParams {
  [key: string]: string | number;
}

export interface I18nHookReturn {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: TranslationParams) => string;
  isLoading: boolean;
  translations?: Record<string, any>;
}

export interface DemoTranslations {
  [key: string]: string;
}

// 🔄 PARAMETER SUBSTITUTION
const substituteParameters = (text: string, params: TranslationParams = {}): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? String(params[param]) : match;
  });
};

// 🎯 MAIN I18N HOOK
export const useI18n = (): I18nHookReturn => {
  const context = useContext(I18nContext);
  const [demoTranslations, setDemoTranslations] = useState<DemoTranslations>({});
  
  // Always call useEffect before any conditional returns
  useEffect(() => {
    if (context?.locale) {
      import(`@/locales/${context.locale}/demo.json`)
        .then((mod: any) => {
          const data = mod.default?.demo || mod.default || {};
          setDemoTranslations(Object.keys(data).reduce((acc: DemoTranslations, key: string) => {
            acc[`demo.${key}`] = data[key];
            return acc;
          }, {}));
        })
        .catch(() => {
          setDemoTranslations({});
        });
    }
  }, [context?.locale]);
  
  // Early return setup for when there's no context
  const fallbackSetLocale = (locale: string): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('preferredLanguage', locale);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    }
  };
  
  if (!context) {
    // Fallback implementation when provider is not available
    return {
      locale: 'es',
      setLocale: fallbackSetLocale,
      t: (key: string, params: TranslationParams = {}): string => {
        return substituteParameters(key, params);
      },
      isLoading: false
    };
  }
  
  const { locale, setLocale, translations: ctxTranslations, isLoading } = context;

  // Remove the duplicate useEffect that was here
  // This useEffect has been moved to before the conditional return

  const translations = { ...demoTranslations, ...ctxTranslations };
  
  // Enhanced translation function
  const t = (key: string, params: TranslationParams = {}): string => {
    try {
      // Validate that translations are loaded
      if (!translations) {
        console.error('Translations not loaded');
        return key;
      }
      
      // Get translation from main translations
      let translation = translations[key];
      
      // If not found, log warning and return readable fallback
      if (!translation) {
        console.warn(`Missing translation key: ${key}`);
        // Return a readable fallback text for medical professionals
        const fallbackText = key.split('.').pop()?.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim() || key;
        return fallbackText.charAt(0).toUpperCase() + fallbackText.slice(1);
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

export default useI18n;
